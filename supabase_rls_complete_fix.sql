-- COMPLETE RLS FIX FOR ALL WELLMEADOWS TABLES
-- Run this in Supabase SQL Editor to allow frontend anon access

grant usage on schema public to anon;

-- Grant permissions for ALL tables
grant select, insert, update, delete on table public.patient to anon;
grant select, insert, update, delete on table public.next_of_kin to anon;
grant select, insert, update, delete on table public.patient_medical_record to anon;
grant select, insert, update, delete on table public.patient_visit_history to anon;
grant select, insert, update, delete on table public.ward to anon;
grant select, insert, update, delete on table public.staff to anon;
grant select, insert, update, delete on table public.qualification to anon;
grant select, insert, update, delete on table public.work_experience to anon;
grant select, insert, update, delete on table public.shift to anon;
grant select, insert, update, delete on table public.department to anon;
grant select, insert, update, delete on table public.staff_department_assignment to anon;
grant select, insert, update, delete on table public.staff_role_history to anon;
grant select, insert, update, delete on table public.bed to anon;
grant select, insert, update, delete on table public.bed_occupancy_history to anon;

-- Enable RLS on all tables
alter table public.patient enable row level security;
alter table public.next_of_kin enable row level security;
alter table public.patient_medical_record enable row level security;
alter table public.patient_visit_history enable row level security;
alter table public.ward enable row level security;
alter table public.staff enable row level security;
alter table public.qualification enable row level security;
alter table public.work_experience enable row level security;
alter table public.shift enable row level security;
alter table public.department enable row level security;
alter table public.staff_department_assignment enable row level security;
alter table public.staff_role_history enable row level security;
alter table public.bed enable row level security;
alter table public.bed_occupancy_history enable row level security;

-- CREATE POLICIES FOR ALL TABLES

-- PATIENT
drop policy if exists patient_anon_all on public.patient;
create policy patient_anon_all on public.patient
for all to anon
using (true)
with check (true);

-- NEXT_OF_KIN
drop policy if exists next_of_kin_anon_all on public.next_of_kin;
create policy next_of_kin_anon_all on public.next_of_kin
for all to anon
using (true)
with check (true);

-- PATIENT_MEDICAL_RECORD
drop policy if exists patient_medical_record_anon_all on public.patient_medical_record;
create policy patient_medical_record_anon_all on public.patient_medical_record
for all to anon
using (true)
with check (true);

-- PATIENT_VISIT_HISTORY
drop policy if exists patient_visit_history_anon_all on public.patient_visit_history;
create policy patient_visit_history_anon_all on public.patient_visit_history
for all to anon
using (true)
with check (true);

-- WARD
drop policy if exists ward_anon_all on public.ward;
create policy ward_anon_all on public.ward
for all to anon
using (true)
with check (true);

-- STAFF
drop policy if exists staff_anon_all on public.staff;
create policy staff_anon_all on public.staff
for all to anon
using (true)
with check (true);

-- QUALIFICATION
drop policy if exists qualification_anon_all on public.qualification;
create policy qualification_anon_all on public.qualification
for all to anon
using (true)
with check (true);

-- WORK_EXPERIENCE
drop policy if exists work_experience_anon_all on public.work_experience;
create policy work_experience_anon_all on public.work_experience
for all to anon
using (true)
with check (true);

-- SHIFT
drop policy if exists shift_anon_all on public.shift;
create policy shift_anon_all on public.shift
for all to anon
using (true)
with check (true);

-- DEPARTMENT
drop policy if exists department_anon_all on public.department;
create policy department_anon_all on public.department
for all to anon
using (true)
with check (true);

-- STAFF_DEPARTMENT_ASSIGNMENT
drop policy if exists staff_department_assignment_anon_all on public.staff_department_assignment;
create policy staff_department_assignment_anon_all on public.staff_department_assignment
for all to anon
using (true)
with check (true);

-- STAFF_ROLE_HISTORY
drop policy if exists staff_role_history_anon_all on public.staff_role_history;
create policy staff_role_history_anon_all on public.staff_role_history
for all to anon
using (true)
with check (true);

-- BED
drop policy if exists bed_anon_all on public.bed;
create policy bed_anon_all on public.bed
for all to anon
using (true)
with check (true);

-- BED_OCCUPANCY_HISTORY
drop policy if exists bed_occupancy_history_anon_all on public.bed_occupancy_history;
create policy bed_occupancy_history_anon_all on public.bed_occupancy_history
for all to anon
using (true)
with check (true);
