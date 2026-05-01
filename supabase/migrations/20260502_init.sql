-- 방 테이블
create table rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  status text not null default 'waiting',  -- waiting | playing | finished
  current_turn uuid,                        -- 현재 차례 player id
  created_at timestamptz default now()
);

-- 플레이어 테이블
create table players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete cascade,
  name text not null,
  position int not null default 0,
  turn_order int not null,
  is_host boolean not null default false,
  created_at timestamptz default now()
);

-- 칸 테이블 (고정 데이터)
create table cells (
  id int primary key,
  position int not null unique,
  type text not null,
  description text not null
);

-- Realtime 활성화
alter publication supabase_realtime add table rooms;
alter publication supabase_realtime add table players;
