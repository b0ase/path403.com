-- Create videos table
create table if not exists videos (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  filename text not null,
  url text not null,
  size_bytes bigint,
  metadata jsonb
);

-- Enable RLS
alter table videos enable row level security;

-- Create policies for videos table
create policy "Videos are viewable by everyone" on videos
  for select using (true);

create policy "Videos are insertable by authenticated users" on videos
  for insert with check (auth.role() = 'authenticated' or auth.role() = 'service_role');

-- Create storage bucket if not exists
insert into storage.buckets (id, name, public) 
values ('studio-assets', 'studio-assets', true)
on conflict (id) do nothing;

-- Create policies for storage bucket
-- Note: 'storage.objects' policies might need careful handling if conflicting.
-- We use 'do nothing' logic or specific names to avoid errors if they exist.

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'objects' and policyname = 'Studio Assets are viewable by everyone') then
    create policy "Studio Assets are viewable by everyone" on storage.objects
      for select using ( bucket_id = 'studio-assets' );
  end if;
  
  if not exists (select 1 from pg_policies where tablename = 'objects' and policyname = 'Studio Assets are insertable by authenticated users') then
    create policy "Studio Assets are insertable by authenticated users" on storage.objects
      for insert with check ( bucket_id = 'studio-assets' AND (auth.role() = 'authenticated' or auth.role() = 'service_role') );
  end if;
end
$$;
