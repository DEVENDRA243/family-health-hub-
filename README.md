# 🏥 Family Health Hub - System Architecture & Supabase Backend Documentation

Family Health Hub is a full-stack family caregiving and health management platform built using **React**, **TypeScript**, **Vite**, **TanStack Query**, **Tailwind CSS**, and **Supabase (PostgreSQL, Auth, Storage, Edge Functions)**.

---

## 📐 System Architecture Diagram

```text
========================================================================================
                              SYSTEM ARCHITECTURE DIAGRAM
========================================================================================

    +-----------------------------------------------------------------------+
    |                         REACT FRONTEND CLIENT                         |
    | - Initialized Supabase JS SDK Client with Anon Key                    |
    | - Hooks trigger SQL queries and mutations using TanStack Query        |
    +-----------------------------------------------------------------------+
            |                              |                             |
            | (Authentication)             | (PostgREST DB Queries)      | (Trigger Edge Function)
            v                              v                             v
  +--------------------+         +--------------------+        +--------------------+
  |   SUPABASE AUTH    |         | SUPABASE DATABASE  |        |   SUPABASE EDGE    |
  |  - Google OAuth    |         |  - PostgreSQL      |        |     FUNCTIONS      |
  |  - JWT User tokens |         |  - RLS Policies    |        |  - Deno serverless |
  +--------------------+         |  - 8 Tables        |        |  - SMTP & Twilio   |
            |                    +--------------------+        +--------------------+
            v                              ^                              |
      Saves Session                        | Service Role Key             |
      & attaches JWT                       | (RLS Bypass)                 | Sends Alert
      in headers                           +------------------------------+
            |                                                             v
            +----------------------------------------------------> +--------------------+
                                                                   |  EXTERNAL SERVICE  |
                                                                   | - Gmail SMTP       |
                                                                   | - Twilio (SMS)     |
                                                                   +--------------------+
```

---

## 🗄️ Relational Database Schema (8 Tables)

### 1. `family_info`
* `id` (UUID, Primary Key)
* `name` (TEXT)
* `invite_code` (TEXT, Unique) - 6-character code for family joining
* `created_by` (UUID) - User ID of creator / family head

### 2. `members`
* `id` (UUID, Primary Key)
* `family_id` (UUID, FK -> `family_info.id`)
* `user_id` (UUID, Nullable, FK -> `auth.users.id`)
* `name` (TEXT)
* `age` (INTEGER)
* `gender` (TEXT)
* `conditions` (TEXT[]) - Pre-existing conditions
* `email` (TEXT, Nullable)
* `invite_token` (TEXT, Nullable)
* `status` (TEXT) - 'manual' | 'invited' | 'connected'

### 3. `medicines`
* `id` (UUID, Primary Key)
* `family_id` (UUID, FK -> `family_info.id`)
* `member_id` (UUID, FK -> `members.id`)
* `name` (TEXT)
* `dosage` (TEXT)
* `instructions` (TEXT)
* `timings` (TEXT[]) - e.g. `["08:00 AM", "08:00 PM"]`
* `is_active` (BOOLEAN)

### 4. `doses`
* `id` (UUID, Primary Key)
* `family_id` (UUID, FK -> `family_info.id`)
* `medicine_id` (UUID, FK -> `medicines.id`)
* `scheduled_time` (TEXT)
* `date` (DATE / TEXT) - e.g. "2026-08-18"
* `status` (TEXT) - 'taken' | 'missed' | 'pending'

### 5. `checkups`
* `id` (UUID, Primary Key)
* `family_id` (UUID, FK -> `family_info.id`)
* `member_id` (UUID, FK -> `members.id`)
* `type` (TEXT) - 'doctor visit' | 'lab test' | 'vaccination' | 'scan'
* `title` (TEXT)
* `scheduled_date` (TIMESTAMP)
* `status` (TEXT) - 'upcoming' | 'completed' | 'missed'

### 6. `reports`
* `id` (UUID, Primary Key)
* `family_id` (UUID, FK -> `family_info.id`)
* `member_id` (UUID, FK -> `members.id`)
* `user_id` (UUID, FK -> `auth.users.id`)
* `title` (TEXT)
* `uploaded_at` (TIMESTAMP)
* `type` (TEXT) - 'PDF' | 'JPG' | 'PNG'
* `file_url` (TEXT) - Public URL from Supabase Storage

### 7. `notifications`
* `id` (UUID, Primary Key)
* `family_id` (UUID, FK -> `family_info.id`)
* `user_id` (UUID, FK -> `auth.users.id`)
* `title` (TEXT)
* `message` (TEXT)
* `type` (TEXT) - 'alert' | 'info'
* `is_read` (BOOLEAN)
* `created_at` (TIMESTAMP)

### 8. `emergency_alerts`
* `id` (UUID, Primary Key)
* `family_id` (UUID, FK -> `family_info.id`)
* `message` (TEXT)
* `type` (TEXT) - 'emergency'
* `created_at` (TIMESTAMP)

---

## ⚡ Core Integration Code Snippets

### 🔌 Client Connection initialization
`src/lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 📩 Email Edge Function SMTP Alerts
`supabase/functions/send-emergency-email/index.ts`:
```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts"

Deno.serve(async (req) => {
  const body = await req.json();
  const record = body.record;
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!, 
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  const { data: members } = await supabase
    .from('members')
    .select('email, name, user_id')
    .eq('family_id', record.family_id)
    .not('email', 'is', null);

  const emailList = members?.map(m => m.email) || [];

  const client = new SMTPClient({
    connection: {
      hostname: "smtp.gmail.com",
      port: 465,
      tls: true,
      auth: {
        username: Deno.env.get('GMAIL_USER')!,
        password: Deno.env.get('GMAIL_APP_PASSWORD')!,
      },
    },
  });

  await client.send({
    from: Deno.env.get('GMAIL_USER')!,
    to: emailList,
    subject: "🚨 EMERGENCY SOS ALERT",
    html: `<h1>SOS EMERGENCY</h1><p>${record.message}</p>`,
  });

  await client.close();
  return new Response("Sent", { status: 200 });
});
```

### 💬 Twilio SMS Gateway Integration (Conceptual)
```typescript
// Conceptual SMS trigger using Twilio REST API inside Edge Function
const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
const TWILIO_FROM_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER');

async function sendTwilioSMS(toPhoneNumber: string, messageBody: string) {
  await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        To: toPhoneNumber,
        From: TWILIO_FROM_NUMBER!,
        Body: messageBody
      })
    }
  );
}
```

---

## 🛠️ Project Setup & Local Development

```bash
# Navigate to family-health-hub
cd family-health-hub

# Install dependencies
npm install

# Start development server
npm run dev
```
