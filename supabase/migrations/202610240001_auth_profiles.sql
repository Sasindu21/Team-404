create type public.app_role as enum ('user','admin');
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 80),
  display_name text not null default '' check (char_length(display_name) <= 50),
  avatar_url text,
  role public.app_role not null default 'user',
  preferred_language text not null default 'en' check (preferred_language in ('en','si','ta')),
  theme_preference text not null default 'system' check (theme_preference in ('system','light','dark')),
  bulletin_notifications boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
revoke all on table public.profiles from anon,authenticated;
grant select on table public.profiles to authenticated;
grant update (full_name,display_name,avatar_url,preferred_language,theme_preference,bulletin_notifications,updated_at) on table public.profiles to authenticated;
create policy "users read own profile" on public.profiles for select to authenticated using ((select auth.uid())=id);
create policy "users update own safe fields" on public.profiles for update to authenticated using ((select auth.uid())=id) with check ((select auth.uid())=id);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$
begin insert into public.profiles(id,full_name,display_name,avatar_url) values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''),coalesce(new.raw_user_meta_data->>'name',''),new.raw_user_meta_data->>'avatar_url');return new;end;$$;
revoke execute on function public.handle_new_user() from public,anon,authenticated;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create schema if not exists private;
create or replace function private.is_admin() returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.profiles where id=(select auth.uid()) and role='admin')$$;
revoke all on function private.is_admin() from public,anon,authenticated;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;

-- Provision the first administrator only from the SQL editor after verifying the UUID:
-- update public.profiles set role='admin' where id='VERIFIED-AUTH-USER-UUID';
