-- Run this in Supabase SQL Editor to allow frontend anon access
-- for the tables used by this app.

grant usage on schema public to anon;

grant select, insert, update, delete on table public.patient to anon;
grant select, insert, update, delete on table public.staff to anon;
grant select, insert, update, delete on table public.department to anon;
grant select, insert, update, delete on table public.ward to anon;
grant select, insert, update, delete on table public.shift to anon;
grant select, insert, update, delete on table public.staff_department_assignment to anon;
grant select, insert, update, delete on table public.staff_role_history to anon;

alter table public.patient enable row level security;
alter table public.staff enable row level security;
alter table public.department enable row level security;
alter table public.ward enable row level security;
alter table public.shift enable row level security;
alter table public.staff_department_assignment enable row level security;
alter table public.staff_role_history enable row level security;

drop policy if exists patient_anon_all on public.patient;
create policy patient_anon_all on public.patient
for all to anon
using (true)
with check (true);

drop policy if exists staff_anon_all on public.staff;
create policy staff_anon_all on public.staff
for all to anon
using (true)
with check (true);

drop policy if exists department_anon_all on public.department;
create policy department_anon_all on public.department
for all to anon
using (true)
with check (true);

drop policy if exists ward_anon_all on public.ward;
create policy ward_anon_all on public.ward
for all to anon
using (true)
with check (true);

drop policy if exists shift_anon_all on public.shift;
create policy shift_anon_all on public.shift
for all to anon
using (true)
with check (true);

drop policy if exists staff_department_assignment_anon_all on public.staff_department_assignment;
create policy staff_department_assignment_anon_all on public.staff_department_assignment
for all to anon
using (true)
with check (true);

drop policy if exists staff_role_history_anon_all on public.staff_role_history;
create policy staff_role_history_anon_all on public.staff_role_history
for all to anon
using (true)
with check (true);
