import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Member, Medicine, Dose, Checkup, Report, FamilyInfo } from '@/types/health';
import { useAuth } from './use-auth';

// --- Family Info ---
export const useFamilyInfo = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['family-info', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      // 1. Find the family ID this user belongs to
      // We use .order() and .limit(1) to handle multiple family memberships gracefully
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select('family_id')
        .eq('user_id', user.id)
        .order('id', { ascending: false })
        .limit(1);

      if (memberError) throw memberError;
      const member = memberData?.[0];

      // 2. If user is not in a family, check if they created one that hasn't linked them yet
      let familyId = member?.family_id;
      if (!familyId) {
        // If no member record, check for families created by this user
        // We use .order() and .limit(1) instead of maybeSingle() to handle multiple results gracefully
        const { data: createdFamilies, error: createdError } = await supabase
          .from('family_info')
          .select('id')
          .eq('created_by', user.id)
          .order('id', { ascending: false })
          .limit(1);
          
        if (createdError) throw createdError;
        familyId = createdFamilies?.[0]?.id;
      }

      if (!familyId) return null;

      // 3. Fetch full family info
      const { data, error } = await supabase
        .from('family_info')
        .select('*')
        .eq('id', familyId)
        .maybeSingle(); // We use maybeSingle() instead of single() to handle missing records gracefully
        
      if (error) throw error;
      return data as FamilyInfo;
    },
    enabled: !!user,
  });
};

export const useCreateFamily = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (info: { name: string; invite_code: string }) => {
      if (!user) throw new Error("Not authenticated");
      
      // 1. Create the family
      const { data: family, error: familyError } = await supabase
        .from('family_info')
        .insert([{ ...info, created_by: user.id }])
        .select()
        .single();
      
      if (familyError) throw familyError;

      // 2. Add the creator as the first member (Head)
      const gmailName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Head';
      const { error: memberError } = await supabase
        .from('members')
        .insert([{
          family_id: family.id,
          user_id: user.id,
          name: gmailName,
          age: 0,
          gender: 'other',
          conditions: [],
          status: 'connected'
        }]);

      if (memberError) throw memberError;

      return family as FamilyInfo;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['family-info', user?.id], data);
      queryClient.invalidateQueries({ queryKey: ['family-info'] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
};

export const useUpdateFamilyInfo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name, invite_code }: { id: string; name?: string; invite_code?: string }) => {
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (invite_code !== undefined) updateData.invite_code = invite_code;
      
      const { data, error } = await supabase
        .from('family_info')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-info'] });
    },
  });
};

// --- Members ---
export const useMembers = () => {
  const { data: family } = useFamilyInfo();
  return useQuery({
    queryKey: ['members', family?.id],
    queryFn: async () => {
      if (!family) return [];
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('family_id', family.id)
        .order('name');
      if (error) throw error;
      return data as Member[];
    },
    enabled: !!family,
  });
};

export const useAddMember = () => {
  const { data: family } = useFamilyInfo();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (member: Omit<Member, 'id' | 'family_id' | 'invite_token'>) => {
      if (!family) throw new Error("No family found");
      
      const inviteToken = member.status === 'invited' 
        ? Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        : null;

      const { data, error } = await supabase
        .from('members')
        .insert([{ 
          ...member, 
          family_id: family.id,
          invite_token: inviteToken 
        }])
        .select()
        .single();
      if (error) throw error;
      return data as Member;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
};

export const useDeleteMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['doses'] });
    },
  });
};

// --- Medicines ---
export const useMedicines = () => {
  const { data: family } = useFamilyInfo();
  return useQuery({
    queryKey: ['medicines', family?.id],
    queryFn: async () => {
      if (!family) return [];
      const { data, error } = await supabase
        .from('medicines')
        .select('*, members(name)')
        .eq('family_id', family.id)
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: !!family,
  });
};

export const useAddMedicine = () => {
  const { data: family } = useFamilyInfo();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (medicine: Omit<Medicine, 'id' | 'family_id'>) => {
      if (!family) throw new Error("No family found");
      
      // 1. Insert medicine
      const { data: medData, error: medError } = await supabase
        .from('medicines')
        .insert([{ ...medicine, family_id: family.id }])
        .select()
        .single();
      if (medError) throw medError;

      // 2. Create initial doses for today
      const today = new Date().toISOString().split('T')[0];
      const doses = medicine.timings.map(timing => ({
        family_id: family.id,
        medicine_id: medData.id,
        scheduled_time: timing,
        status: 'pending',
        date: today
      }));

      await supabase.from('doses').insert(doses);
      return medData as Medicine;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['doses'] });
    },
  });
};

export const useDeleteMedicine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('medicines')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['doses'] });
    },
  });
};

// --- Doses ---
export const useDoses = (date: string) => {
  const { data: family } = useFamilyInfo();
  return useQuery({
    queryKey: ['doses', date, family?.id],
    queryFn: async () => {
      if (!family) return [];
      const { data, error } = await supabase
        .from('doses')
        .select('*, medicines(*, members(name))')
        .eq('family_id', family.id)
        .eq('date', date)
        .order('scheduled_time', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!family,
  });
};

export const useUpdateDoseStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Dose['status'] }) => {
      const { data, error } = await supabase
        .from('doses')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doses'] });
    },
  });
};

// --- Checkups ---
export const useCheckups = () => {
  const { data: family } = useFamilyInfo();
  return useQuery({
    queryKey: ['checkups', family?.id],
    queryFn: async () => {
      if (!family) return [];
      const { data, error } = await supabase
        .from('checkups')
        .select('*, members(name)')
        .eq('family_id', family.id)
        .order('scheduled_date', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!family,
  });
};

export const useAddCheckup = () => {
  const { data: family } = useFamilyInfo();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (checkup: Omit<Checkup, 'id' | 'family_id'>) => {
      if (!family) throw new Error("No family found");
      const { data, error } = await supabase
        .from('checkups')
        .insert([{ ...checkup, family_id: family.id }])
        .select()
        .single();
      if (error) throw error;
      return data as Checkup;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkups'] });
    },
  });
};

export const useUpdateCheckupStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Checkup['status'] }) => {
      const { data, error } = await supabase
        .from('checkups')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkups'] });
    },
  });
};

export const useDeleteCheckup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('checkups')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkups'] });
    },
  });
};

// --- Reports ---
export const useReports = () => {
  const { data: family } = useFamilyInfo();
  return useQuery({
    queryKey: ['reports', family?.id],
    queryFn: async () => {
      if (!family) return [];
      const { data, error } = await supabase
        .from('reports')
        .select('*, members(name)')
        .eq('family_id', family.id)
        .order('uploaded_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!family,
  });
};

export const useAddReport = () => {
  const { data: family } = useFamilyInfo();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (report: Omit<Report, 'id' | 'family_id'>) => {
      if (!family) throw new Error("No family found");
      const { data, error } = await supabase
        .from('reports')
        .insert([{ ...report, family_id: family.id }])
        .select()
        .single();
      if (error) throw error;
      return data as Report;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

export const useDeleteReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

// --- Emergency Alerts ---
export const useAddEmergencyAlert = () => {
  const { data: family } = useFamilyInfo();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (alert: { message: string; type: string }) => {
      if (!family || !user) throw new Error("No family or user found");
      
      // 1. Log the emergency alert
      const { data, error } = await supabase
        .from('emergency_alerts')
        .insert([{ ...alert, family_id: family.id, created_at: new Date().toISOString() }])
        .select()
        .single();
      if (error) throw error;

      // 2. Create notifications for EVERYONE in the family except the sender
      const { data: members } = await supabase
        .from('members')
        .select('user_id')
        .eq('family_id', family.id)
        .not('user_id', 'is', null);

      if (members && members.length > 0) {
        const notifications = members
          .filter(m => m.user_id !== user.id)
          .map(m => ({
            family_id: family.id,
            user_id: m.user_id,
            title: '🚨 EMERGENCY ALERT',
            message: alert.message,
            type: 'alert'
          }));

        if (notifications.length > 0) {
          await supabase.from('notifications').insert(notifications);
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

// --- Invitation Support ---
export const useMemberByToken = (token: string) => {
  return useQuery({
    queryKey: ['member-invite', token],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('members')
        .select('*, family_info(name)')
        .eq('invite_token', token)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!token,
  });
};

export const useJoinFamilyByToken = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (token: string) => {
      if (!user) throw new Error("Not authenticated");
      
      // 1. Get the member details and the family head (created_by)
      const { data: member, error: memberError } = await supabase
        .from('members')
        .select('name, family_id, family_info(created_by)')
        .eq('invite_token', token)
        .single();
      
      if (memberError) throw memberError;
      const headId = (member.family_info as any)?.created_by;

      // 2. Update the member status to connected
      const { data, error } = await supabase
        .from('members')
        .update({ user_id: user.id, status: 'connected' })
        .eq('invite_token', token)
        .select()
        .single();
      
      if (error) throw error;

      // 3. Create a notification EXCLUSIVELY for the family head
      if (headId) {
        await supabase.from('notifications').insert([{
          family_id: member.family_id,
          user_id: headId, // Target ONLY the Head
          title: 'New Family Member',
          message: `${member.name} has successfully joined your Family Hub!`,
          type: 'info'
        }]);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-info'] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useJoinFamilyByCode = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      if (!user) throw new Error("Not authenticated");

      // 1. Find the family by code and get the head (created_by)
      const { data: family, error: familyError } = await supabase
        .from('family_info')
        .select('id, created_by')
        .eq('invite_code', code.toUpperCase())
        .maybeSingle();

      if (familyError) throw familyError;
      if (!family) throw new Error("Invalid invite code");

      // 2. Add the user as a new member
      const gmailName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Member';
      const { data, error } = await supabase
        .from('members')
        .insert([{
          family_id: family.id,
          user_id: user.id,
          name: gmailName,
          age: 0,
          gender: 'other',
          conditions: [],
          status: 'connected'
        }])
        .select()
        .single();

      if (error) throw error;

      // 3. Create a notification EXCLUSIVELY for the family head
      await supabase.from('notifications').insert([{
        family_id: family.id,
        user_id: family.created_by, // Target ONLY the Head
        title: 'New Family Member',
        message: `${gmailName} has joined using your invite code!`,
        type: 'info'
      }]);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-info'] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

// --- Notifications ---
export const useNotifications = () => {
  const { data: family } = useFamilyInfo();
  const { user } = useAuth();
  return useQuery({
    queryKey: ['notifications', family?.id, user?.id],
    queryFn: async () => {
      if (!family || !user) return [];
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('family_id', family.id)
        .eq('user_id', user.id) // ONLY fetch notifications for the current user
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: !!family && !!user,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useClearNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useDeleteFamily = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // 1. Delete all associated data for this family (Manual cleanup for reliability)
      // This is safer than relying on DB cascade if it's not perfectly configured
      await supabase.from('notifications').delete().eq('family_id', id);
      await supabase.from('emergency_alerts').delete().eq('family_id', id);
      await supabase.from('doses').delete().eq('family_id', id);
      await supabase.from('medicines').delete().eq('family_id', id);
      await supabase.from('reports').delete().eq('family_id', id);
      await supabase.from('checkups').delete().eq('family_id', id);
      
      // 2. Delete all members of this family
      const { error: membersError } = await supabase
        .from('members')
        .delete()
        .eq('family_id', id);
      
      if (membersError) throw membersError;

      // 3. Finally delete the family info record
      const { error: familyError } = await supabase
        .from('family_info')
        .delete()
        .eq('id', id);
      
      if (familyError) throw familyError;
    },
    onSuccess: () => {
      // Clear ALL query cache to ensure no stale data remains
      queryClient.clear();
      // Force refresh family-info state
      queryClient.setQueryData(['family-info', user?.id], null);
    },
  });
};
