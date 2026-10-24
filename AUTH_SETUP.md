# SafeRoute authentication setup

Authentication uses Supabase Auth with `@supabase/ssr`, PKCE callbacks, server-readable cookies, middleware session refresh, and PostgreSQL row-level security. Without configuration, public guest tools continue working and auth pages display a configuration notice; no login is simulated.

## Supabase project

1. Create a Supabase project and apply `supabase/migrations/202610240001_auth_profiles.sql` in the SQL editor or migration workflow.
2. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Never use a service-role or secret key in a `NEXT_PUBLIC_` variable.
3. Set `NEXT_PUBLIC_SITE_URL=http://localhost:3000` locally and the exact HTTPS origin in production.
4. In Authentication → URL Configuration, set the Site URL and allow `http://localhost:3000/auth/callback` plus the production callback URL.
5. Enable email/password authentication and email confirmation. Configure custom SMTP before production; the default email service is rate-limited.

## Google OAuth

Create a Google OAuth web client, configure the Supabase callback URL displayed in Authentication → Providers → Google, then enable Google in Supabase. Add the application `/auth/callback` URLs to Supabase redirect URLs. The application button reports an error if the provider is unavailable; it never simulates success.

## Administrator provisioning

Users cannot update the `role` column: authenticated users receive update grants only for safe profile columns. After registering and verifying the intended administrator, copy that user's UUID from Supabase Authentication and run the commented `update public.profiles ...` statement in the migration using the trusted SQL editor. Never accept a role from a registration form or browser request.

## Verification

Run `npm test`, `npm run lint`, and `npm run build`. Full registration, email, OAuth, recovery, and session verification additionally requires a configured Supabase staging project and mail delivery.
