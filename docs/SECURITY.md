# Security and privacy checklist

- Never commit real member details, phone lists, passwords, access tokens or exports.
- Never expose a Supabase service-role key in browser code or a NEXT_PUBLIC_ variable.
- Enable and test Row Level Security on every table before connecting real data.
- Implement staff roles on the server and verify permissions for every write operation.
- Keep child and health-related data to the absolute minimum. This starter intentionally has no health-record table.
- Restrict any future health/vaccination workflow to explicitly authorized personnel and obtain appropriate consent.
- Configure encrypted backups, retention rules and an incident response process.
- Use HTTPS, strong authentication and periodic access reviews.
- Public pages must show only information approved for public release.
