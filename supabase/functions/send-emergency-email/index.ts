import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

Deno.serve(async (req) => {
  try {
    const { record } = await req.json()
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // 1. Get all family members with an email address
    const { data: members, error: memberError } = await supabase
      .from('members')
      .select('email, name')
      .eq('family_id', record.family_id)
      .not('email', 'is', null)

    if (memberError || !members || members.length === 0) {
      console.log('No members with emails found for family:', record.family_id)
      return new Response(JSON.stringify({ error: 'No members with emails found' }), { status: 400 })
    }

    const emailList = members.map(m => m.email)

    // 2. Send the emergency email via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'FamilyHealth Hub <onboarding@resend.dev>',
        to: emailList,
        subject: '🚨 CRITICAL EMERGENCY ALERT',
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 2px solid #ef4444; border-radius: 8px;">
            <h1 style="color: #ef4444; margin-top: 0;">CRITICAL EMERGENCY ALERT</h1>
            <p style="font-size: 16px;">A family member has triggered an emergency alert on <strong>FamilyHealth Hub</strong>.</p>
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p><strong>Message:</strong> ${record.message}</p>
            <p><strong>Sent at:</strong> ${new Date(record.created_at).toLocaleString()}</p>
            <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">Please check your dashboard immediately for updates.</p>
          </div>
        `,
      }),
    })

    const data = await res.json()
    console.log('Resend API response:', data)
    
    if (!res.ok) {
      console.error('Resend API error:', data)
      throw new Error(`Resend API error: ${data.message || 'Unknown error'}`)
    }

    console.log('Emergency email sent successfully to:', emailList)
    return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error('Edge Function overall error:', err)
    return new Response(JSON.stringify({ error: err.message, stack: err.stack }), { status: 500 })
  }
})
