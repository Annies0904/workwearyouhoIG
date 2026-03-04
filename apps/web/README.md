# Admin Templates (MVP)

## Current status
- /admin uses Basic Auth (middleware)
- /admin/templates + /admin/templates/new UI done
- API: /api/admin/templates uses Supabase (GET/POST)
- Supabase table: public.templates (id, title, content, created_at, updated_at)

## Env vars (Vercel Production)
- ADMIN_USER / ADMIN_PASS
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY

## Next steps
- Update middleware matcher to include /api/admin/:path* (so API also protected)
- Verify create template works on Vercel and persists after refresh
- Add edit/delete endpoints and UI
