# Godawari Community Library
## Library & Resource Center Management System

A bilingual (Nepali/English), responsive web platform for **Godawari Community Library Resource Center**, Godawari-4, Badikhel, Lalitpur, Nepal. The center follows the READ Model and brings library services together with community learning, information, wellbeing and resource spaces.

> Project status: foundation scaffold / MVP in active development. Do not use with real member or health data until authentication, authorization, backups and deployment security have been reviewed.

### 12 resource spaces
1. पुस्तकालय कक्ष — Library Room
2. महिला कक्ष — Women’s Room
3. बाल कक्ष — Children’s Room
4. युवा कक्ष — Youth Room
5. सूचना प्रविधि कक्ष — Information Technology Room
6. श्रव्य दृश्य तथा संगीत कक्ष — Audio-Visual & Music Room
7. विपद जोखिम न्यूनीकरण कक्ष — Disaster Risk Reduction Room
8. स्वास्थ्य कक्ष/खोप केन्द्र — Health Room / Vaccination Center
9. स्तनपान कक्ष — Breastfeeding Room
10. कार्यालय कक्ष — Office Room
11. तालिम हल — Training Hall
12. दीयो सूचना कर्नर — Diyo Information Corner

### Implemented foundation
- Public library landing page and 12 resource-space directory
- Supabase browser/server clients and session-refresh middleware
- Staff email/password login and logout
- Protected admin dashboard with active staff-role checks
- Profile creation trigger and initial role-based Row Level Security policies

### Planned capabilities
- Overview dashboard and operational reports
- Book catalogue, copies, circulation, returns and overdue tracking
- Member registration and membership status
- Resource-room directory, activities, equipment and room bookings
- Programs, training registrations and attendance
- Staff accounts, roles and permission boundaries
- Public notices and searchable public catalogue
- Income/expense registers and audit trail (future phase)
- Nepali and English interface

### Technology
- Next.js App Router + TypeScript
- Tailwind CSS
- Supabase (PostgreSQL, Auth, Storage)
- Vercel deployment — optional

### Quick start
Requirements: Node.js 20.9+ and npm.

```bash
npm install
# Create .env.local using the values from your Supabase project
npm run dev
```

Open http://localhost:3000.

### Supabase setup and first administrator
1. In Supabase, open Project Settings → API and copy the Project URL and publishable key.
2. Put them in the local .env.local file (never commit this file):

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

3. Restart the development server after changing environment variables.
4. In Supabase SQL Editor, run supabase/migrations/0001_initial_schema.sql, then supabase/migrations/0002_auth_roles_and_policies.sql, in that order.
5. In Authentication → Users, create the first staff user with the intended email and a strong password. Keep public signups disabled for this staff-only portal.
6. Run the following in SQL Editor, replacing the email with the account you just created:

```sql
update public.profiles p
set role = 'super_admin', is_active = true
from auth.users u
where p.id = u.id and u.email = 'your-admin-email@example.com';
```

7. Visit http://localhost:3000/admin/login and sign in with that user.

New Auth users receive the least-privileged member role automatically. Administrative roles must be assigned by a trusted administrator in the Supabase SQL Editor; users cannot grant roles to themselves through the app.

### Database
The SQL schema, policies and seed data are in supabase/migrations and supabase/seed.sql. Apply migrations only in a development Supabase project first. Health/vaccination information must be minimized and restricted to specifically authorized staff; this starter does not implement clinical recordkeeping.

### Security and privacy
- Public repository means source code is public; it must never contain private library records.
- Supabase Row Level Security (RLS) is enabled for the application tables and policies are role-scoped.
- Member and circulation records are not public.
- Keep health and child-related information out of public pages and general reports.
- Never expose a service-role key in browser code or commit .env.local.
- Do not store passwords in application tables.

### Development roadmap
1. Foundation, layout, navigation, authentication and roles
2. Catalogue, members and circulation
3. Management of all 12 resource spaces
4. Programs, training, finance and administration
5. Public information portal, reports and notifications
6. Accessibility, security review, testing and deployment

### Contributing
Please open an issue describing the feature or bug. Keep changes small and avoid committing real personal data.

### License
No license has been selected yet. All rights reserved unless a license is added by the repository owner.
