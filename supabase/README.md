# Database

- `migrations/` holds versioned SQL applied with `supabase db push` (or pasted into the SQL editor).
- Row-level security is the real access boundary. The web app never uses a service-role key.
- See `docs/SUPABASE_SETUP.md` for project, auth email and redirect configuration,
  and `docs/BACKUP_RECOVERY.md` for the tested backup and restore procedure.
