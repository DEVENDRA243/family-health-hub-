export type Member = {
  id: string;
  family_id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  conditions: string[];
  email?: string | null;
  invite_token?: string;
  status: 'manual' | 'invited' | 'connected';
  user_id?: string | null;
  photo_url?: string | null;
};

export type Medicine = {
  id: string;
  family_id: string;
  member_id: string;
  name: string;
  dosage: string;
  instructions: string;
  timings: string[];
  is_active: boolean;
};

export type DoseStatus = 'taken' | 'missed' | 'pending';

export type Dose = {
  id: string;
  family_id: string;
  medicine_id: string;
  scheduled_time: string;
  status: DoseStatus;
  date: string;
};

export type CheckupType = 'doctor visit' | 'lab test' | 'vaccination' | 'scan';
export type CheckupStatus = 'upcoming' | 'completed' | 'missed';

export type Checkup = {
  id: string;
  family_id: string;
  member_id: string;
  type: CheckupType;
  title: string;
  scheduled_date: string;
  status: CheckupStatus;
};

export type ReportType = 'PDF' | 'JPG' | 'PNG';

export type Report = {
  id: string;
  family_id: string;
  member_id: string;
  title: string;
  uploaded_at: string;
  type: ReportType;
  file_url?: string;
  members?: { name: string };
  user_id?: string;
};

export type FamilyInfo = {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
};

export type DietLog = {
  id: string;
  family_id: string;
  member_id: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food_item: string;
  calories?: number;
  recorded_at: string;
  members?: { name: string };
};

export type HydrationLog = {
  id: string;
  family_id: string;
  member_id: string;
  amount_ml: number;
  recorded_at: string;
  members?: { name: string };
};
