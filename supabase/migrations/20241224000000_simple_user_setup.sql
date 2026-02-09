-- Simple user setup for b0ase.com
-- Create a simple users table for basic authentication

-- Enable auth schema
create extension if not exists "uuid-ossp";

-- Simple user profiles table
create table if not exists public.user_profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  email text not null,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row level security
alter table public.user_profiles enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone."
  on user_profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on user_profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on user_profiles for update
  using ( auth.uid() = id );

-- Function to handle new user
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, email, display_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();