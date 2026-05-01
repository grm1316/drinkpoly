-- RLS 활성화
alter table rooms enable row level security;
alter table players enable row level security;
alter table cells enable row level security;

-- rooms: 전체 허용
create policy "rooms_all" on rooms for all using (true) with check (true);

-- players: 전체 허용
create policy "players_all" on players for all using (true) with check (true);

-- cells: 읽기만 허용 (고정 데이터)
create policy "cells_read" on cells for select using (true);
