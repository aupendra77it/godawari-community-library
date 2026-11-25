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
- Supabase (PostgreSQL, Auth, Storage) — planned backend
- Vercel deployment — optional

### Quick start
Requirements: Node.js 20.9+ and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

The initial scaffold works without Supabase credentials and uses clearly labelled demo data. Configure Supabase before enabling persistent records or staff login.

### Environment variables
See `.env.example`. Never commit `.env.local`, service-role keys, passwords, member exports or health records.

### Database
The initial SQL schema and seed data are in `supabase/migrations` and `supabase/seed.sql`. Review policies and apply migrations only in a development Supabase project first. Health/vaccination information must be minimized and restricted to specifically authorized staff; this starter does not implement clinical recordkeeping.

### Security and privacy
- Public repository means source code is public; it must never contain private library records.
- Use Supabase Row Level Security (RLS) for every table before production.
- Keep health and child-related information out of public pages and general reports.
- Use least-privilege roles, strong staff authentication, backups and audit logging.
- Do not store passwords in application tables.

### Development roadmap
1. Foundation, layout, navigation and dashboard
2. Catalogue, members and circulation
3. Management of all 12 resource spaces
4. Programs, training, finance and administration
5. Public information portal, reports and notifications
6. Accessibility, security review, testing and deployment

### Contributing
Please open an issue describing the feature or bug. Keep changes small and avoid committing real personal data.

### License
No license has been selected yet. All rights reserved unless a license is added by the repository owner.
