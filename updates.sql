-- Table: stage_content (Videos and Resources)
create table stage_content (
  id uuid default uuid_generate_v4() primary key,
  stage_name text not null check (stage_name in ('Empathise', 'Define', 'Ideate', 'Prototype', 'Test')),
  type text not null check (type in ('video', 'pdf', 'link')),
  title text not null,
  url text not null,
  description text,
  sequence_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: video_progress (Tracks which videos a user has watched)
create table video_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  content_id uuid references stage_content(id) on delete cascade not null,
  is_completed boolean default false,
  watched_percentage integer default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, content_id)
);

-- Table: user_notes (One massive note per stage for simplicity, or we could do per video. User asked for "Notes section")
create table user_notes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  stage_name text not null check (stage_name in ('Empathise', 'Define', 'Ideate', 'Prototype', 'Test')),
  content text default '',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, stage_name)
);

-- RLS Policies

-- Public Read for Content (or Authenticated Read)
alter table stage_content enable row level security;
create policy "Authenticated users can view content" on stage_content for select to authenticated using (true);
create policy "Instructors can insert content" on stage_content for insert to authenticated with check (true); -- Ideally customized

-- Video Progress
alter table video_progress enable row level security;
create policy "Users manage own video progress" on video_progress for all using (auth.uid() = user_id);

-- User Notes
alter table user_notes enable row level security;
create policy "Users manage own notes" on user_notes for all using (auth.uid() = user_id);
