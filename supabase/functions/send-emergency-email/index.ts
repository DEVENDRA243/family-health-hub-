import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts"

const GMAIL_USER = Deno.env.get('GMAIL_USER')
const GMAIL_APP_PASSWORD = Deno.env.get('GMAIL_APP_PASSWORD')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  try {
    const body = await req.json()
    console.log("Received request body:", JSON.stringify(body))
    
    const record = body.record
    const member_id = body.member_id
    const tableName = body.table // For webhooks
    
    // Determine the type:
    // 1. If it's a webhook from emergency_alerts table
    // 2. If record.type says emergency
    // 3. If body.type is manually set to emergency
    let type = 'emergency'
    
    const rawType = (body.type || record?.type || '').toLowerCase()
    
    if (tableName === 'emergency_alerts' || rawType === 'emergency') {
      type = 'emergency'
    } else if (rawType === 'medicine' || rawType === 'checkup') {
      type = rawType
    } else if (rawType === 'insert' || rawType === 'update') {
      // It's a webhook but not from emergency_alerts, check record for hints
      type = record?.type?.toLowerCase() || 'emergency'
    }
    
    if (!record?.family_id && !member_id) {
      console.error("Missing family_id or member_id in request body")
      return new Response(JSON.stringify({ error: 'Missing family_id or member_id' }), { status: 400 })
    }

    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
      console.error("Missing GMAIL_USER or GMAIL_APP_PASSWORD secrets")
      return new Response(JSON.stringify({ error: 'Email configuration missing on server' }), { status: 500 })
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
    let emailList: string[] = []
    let subject = ""
    let htmlContent = ""

    console.log(`Processing type: ${type}`)

    if (type === 'emergency') {
      // 1. Emergency Alert: Send to EVERYONE in the family except the sender
      const familyId = record.family_id
      const senderUserId = body.sender_id || record.user_id // Use passed ID or ID in table
      
      const { data: members, error: memberError } = await supabase
        .from('members')
        .select('email, name, user_id')
        .eq('family_id', familyId)
        .not('email', 'is', null)

      if (memberError) {
        console.error("Error fetching family members:", memberError)
        throw memberError
      }
      
      console.log(`Found ${members?.length || 0} total members for family ${familyId}`)
      
      // Exclude the sender by their user_id
      emailList = [...new Set(
        members
          ?.filter(m => m.user_id !== senderUserId) // Filter out the person who triggered it
          .map(m => m.email?.trim())
          .filter(e => e && e.length > 0)
        || []
      )]
      
      console.log(`Recipient emails (excluding sender ${senderUserId}): ${emailList.join(', ')}`)

      subject = "🚨 CRITICAL EMERGENCY ALERT"
      htmlContent = `
        <div style="font-family: sans-serif; padding: 20px; border: 2px solid #ef4444; border-radius: 8px;">
          <h1 style="color: #ef4444; margin-top: 0;">CRITICAL EMERGENCY ALERT</h1>
          <p style="font-size: 16px;">An emergency alert has been triggered on <strong>FamilyHealth Hub</strong>.</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p><strong>Message:</strong> ${record.message || "An emergency was triggered."}</p>
          <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
          <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">Please check your dashboard immediately.</p>
        </div>
      `
    } else {
      // 2. Medicine or Checkup: Send ONLY to the specific member
      const targetId = member_id || record.member_id
      const { data: member, error: memberError } = await supabase
        .from('members')
        .select('email, name')
        .eq('id', targetId)
        .single()

      if (memberError) throw memberError
      if (!member?.email) return new Response(JSON.stringify({ message: 'Member has no email' }), { status: 200 })
      
      emailList = [member.email.trim()]
      const isMedicine = type === 'medicine'
      
      subject = isMedicine ? "💊 New Medicine Added" : "📅 New Checkup Scheduled"
      htmlContent = `
        <div style="font-family: sans-serif; padding: 20px; border: 2px solid #3b82f6; border-radius: 8px;">
          <h1 style="color: #3b82f6; margin-top: 0;">${isMedicine ? 'New Medicine' : 'New Checkup'}</h1>
          <p style="font-size: 16px;">Hi ${member.name}, a new ${isMedicine ? 'medicine' : 'checkup'} has been added to your schedule.</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p><strong>Details:</strong> ${record.name || record.title}</p>
          ${isMedicine ? `<p><strong>Dosage:</strong> ${record.dosage}</p>` : `<p><strong>Date:</strong> ${new Date(record.scheduled_date).toLocaleDateString()}</p>`}
          <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">Login to your dashboard to see more details.</p>
        </div>
      `
    }

    if (emailList.length === 0) {
      return new Response(JSON.stringify({ message: 'No recipients found' }), { status: 200 })
    }

    // Initialize SMTP client
    const client = new SMTPClient({
      connection: {
        hostname: "smtp.gmail.com",
        port: 465,
        tls: true,
        auth: {
          username: GMAIL_USER!,
          password: GMAIL_APP_PASSWORD!,
        },
      },
    })

    await client.send({
      from: GMAIL_USER!,
      to: emailList,
      subject: subject,
      content: subject,
      html: htmlContent,
    })

    await client.close()

    return new Response(JSON.stringify({ success: true, type, recipients: emailList.length }), { 
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
    })

  } catch (err) {
    console.error('Error:', err.message)
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
})
