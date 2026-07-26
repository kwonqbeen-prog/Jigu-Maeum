-- climatemood ("지구 마음"): Supabase 스키마
-- Supabase 대시보드 > SQL Editor 에서 그대로 실행하세요. (재실행해도 안전 — idempotent)
--
-- 2026-07-26 화면설계서/기능명세서 기반 재설계로 스키마 전면 확장.
-- 기존 사용자가 있을 수 있어 missions는 DROP 대신 ALTER로 컬럼만 추가한다.
-- sessions/chat_messages는 자유대화(freechat) 폐기(D1)로 더 이상 쓰지 않지만,
-- 과거 데이터 보존을 위해 삭제하지 않고 주석으로만 표시한다. 필요 시 수동으로 DROP할 것.

-- =========================================================
-- 1. user_profiles — 사용자 프로필 최초 설정 (명세 2.3 / 2.4 / 7.3)
-- =========================================================
create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  coping_style text check (coping_style in ('reflect', 'move', 'talk', 'learn')),
  social_preference text check (social_preference in ('like', 'neutral', 'avoid')),
  interests text[] not null default '{}',
  onboarding_completed_at timestamptz,
  coachmark_seen_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

drop policy if exists "user_profiles_select_own" on public.user_profiles;
create policy "user_profiles_select_own" on public.user_profiles
  for select using (auth.uid() = user_id);

drop policy if exists "user_profiles_insert_own" on public.user_profiles;
create policy "user_profiles_insert_own" on public.user_profiles
  for insert with check (auth.uid() = user_id);

drop policy if exists "user_profiles_update_own" on public.user_profiles;
create policy "user_profiles_update_own" on public.user_profiles
  for update using (auth.uid() = user_id);

-- =========================================================
-- 2. checkins — 체크인 4스텝 + 당일 이어보기 (명세 3.1~3.4, 3.6)
-- =========================================================
create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  emotion_type text check (emotion_type in ('anxiety', 'helplessness', 'guilt', 'info_fatigue', 'okay')),
  energy_level text check (energy_level in ('low', 'mid', 'high')),
  context_place text check (context_place in ('home', 'work', 'outside', 'nature', 'unsure')),
  free_text text,
  status text not null default 'draft' check (status in ('draft', 'completed')),
  step int not null default 1,
  retry_count int not null default 0,
  date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists checkins_user_date_idx on public.checkins(user_id, date);

alter table public.checkins enable row level security;

drop policy if exists "checkins_select_own" on public.checkins;
create policy "checkins_select_own" on public.checkins
  for select using (auth.uid() = user_id);

drop policy if exists "checkins_insert_own" on public.checkins;
create policy "checkins_insert_own" on public.checkins
  for insert with check (auth.uid() = user_id);

drop policy if exists "checkins_update_own" on public.checkins;
create policy "checkins_update_own" on public.checkins
  for update using (auth.uid() = user_id);

-- =========================================================
-- 3. missions — 기존 테이블에 신규 컬럼만 추가 (명세 4.x, 6.4)
-- =========================================================
create table if not exists public.missions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null,
  created_date date not null default current_date,
  is_completed boolean not null default false,
  difficulty_feedback text,
  created_at timestamptz not null default now()
);

alter table public.missions add column if not exists checkin_id uuid references public.checkins(id) on delete set null;
alter table public.missions add column if not exists why text;
alter table public.missions add column if not exists type text check (type in ('carbon', 'nature', 'social'));
alter table public.missions add column if not exists difficulty text check (difficulty in ('light', 'normal', 'challenge'));
alter table public.missions add column if not exists est_minutes int;
alter table public.missions add column if not exists source text not null default 'checkin' check (source in ('checkin', 'retry'));
alter table public.missions add column if not exists completed_at timestamptz;
alter table public.missions add column if not exists liked boolean not null default false;

create index if not exists missions_user_id_idx on public.missions(user_id);
create index if not exists missions_user_created_date_idx on public.missions(user_id, created_date);
create index if not exists missions_user_completed_idx on public.missions(user_id, is_completed, completed_at);

alter table public.missions enable row level security;

drop policy if exists "missions_select_own" on public.missions;
create policy "missions_select_own" on public.missions
  for select using (auth.uid() = user_id);

drop policy if exists "missions_insert_own" on public.missions;
create policy "missions_insert_own" on public.missions
  for insert with check (auth.uid() = user_id);

drop policy if exists "missions_update_own" on public.missions;
create policy "missions_update_own" on public.missions
  for update using (auth.uid() = user_id);

drop policy if exists "missions_delete_own" on public.missions;
create policy "missions_delete_own" on public.missions
  for delete using (auth.uid() = user_id);

-- =========================================================
-- 4. reflections — 하루 마무리 회고 (명세 6.5)
-- =========================================================
create table if not exists public.reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  content text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

-- 2026-07-27 IA 개편: 미션 탭 상시 "미션 후 기분" 3단 선택 추가
alter table public.reflections add column if not exists mood text check (mood in ('bad', 'ok', 'great'));

create index if not exists reflections_user_date_idx on public.reflections(user_id, date);

alter table public.reflections enable row level security;

drop policy if exists "reflections_select_own" on public.reflections;
create policy "reflections_select_own" on public.reflections
  for select using (auth.uid() = user_id);

drop policy if exists "reflections_insert_own" on public.reflections;
create policy "reflections_insert_own" on public.reflections
  for insert with check (auth.uid() = user_id);

drop policy if exists "reflections_update_own" on public.reflections;
create policy "reflections_update_own" on public.reflections
  for update using (auth.uid() = user_id);

-- =========================================================
-- 5. achievements — 업적 (명세 5.2)
-- =========================================================
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code text not null,
  achieved_at timestamptz not null default now(),
  unique (user_id, code)
);

alter table public.achievements enable row level security;

drop policy if exists "achievements_select_own" on public.achievements;
create policy "achievements_select_own" on public.achievements
  for select using (auth.uid() = user_id);

drop policy if exists "achievements_insert_own" on public.achievements;
create policy "achievements_insert_own" on public.achievements
  for insert with check (auth.uid() = user_id);

-- =========================================================
-- 6. user_memories — 장기 기억 (명세 3.5) — 기존 테이블 그대로 유지
-- =========================================================
create table if not exists public.user_memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists user_memories_user_id_idx on public.user_memories(user_id, created_at);

alter table public.user_memories enable row level security;

drop policy if exists "user_memories_select_own" on public.user_memories;
create policy "user_memories_select_own" on public.user_memories
  for select using (auth.uid() = user_id);

drop policy if exists "user_memories_insert_own" on public.user_memories;
create policy "user_memories_insert_own" on public.user_memories
  for insert with check (auth.uid() = user_id);

drop policy if exists "user_memories_delete_own" on public.user_memories;
create policy "user_memories_delete_own" on public.user_memories
  for delete using (auth.uid() = user_id);

-- =========================================================
-- 폐기 테이블 (자유대화 D1 확정으로 미사용, 데이터 보존을 위해 DROP은 보류)
-- =========================================================
-- public.sessions — checkins로 대체됨
-- public.chat_messages — 자유대화 폐기로 미사용
