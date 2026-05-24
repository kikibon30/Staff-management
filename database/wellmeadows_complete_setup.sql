-- ============================================================================
-- WELLMEADOWS HOSPITAL - COMPLETE DATABASE SETUP FOR SUPABASE
-- ============================================================================
-- This script creates ALL tables and sets up RLS for frontend anon access
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/_/sql

-- ============================================================================
-- DROP EXISTING TABLES (if needed) - UNCOMMENT IF REBUILDING
-- ============================================================================
-- drop table if exists bed_occupancy_history cascade;
-- drop table if exists bed cascade;
-- drop table if exists staff_role_history cascade;
-- drop table if exists staff_department_assignment cascade;
-- drop table if exists shift cascade;
-- drop table if exists work_experience cascade;
-- drop table if exists qualification cascade;
-- drop table if exists staff cascade;
-- drop table if exists department cascade;
-- drop table if exists patient_visit_history cascade;
-- drop table if exists patient_medical_record cascade;
-- drop table if exists next_of_kin cascade;
-- drop table if exists ward cascade;
-- drop table if exists patient cascade;

-- ============================================================================
-- TABLE 1: PATIENT
-- ============================================================================
create table if not exists patient (
    patient_id int primary key,
    first_name varchar(50) not null,
    last_name varchar(50) not null,
    address varchar(255),
    phone varchar(20),
    dob date,
    sex varchar(10),
    marital_status varchar(20),
    date_registered date,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp
);

-- ============================================================================
-- TABLE 2: NEXT_OF_KIN
-- ============================================================================
create table if not exists next_of_kin (
    kin_id int primary key,
    patient_id int not null,
    name varchar(100),
    relationship varchar(50),
    address varchar(255),
    phone varchar(20),
    created_at timestamp default current_timestamp,
    foreign key (patient_id) references patient(patient_id) on delete cascade
);

-- ============================================================================
-- TABLE 3: PATIENT_MEDICAL_RECORD
-- ============================================================================
create table if not exists patient_medical_record (
    record_id int primary key,
    patient_id int not null,
    diagnosis varchar(255),
    allergies varchar(255),
    chronic_conditions varchar(255),
    blood_type varchar(10),
    created_date date,
    created_at timestamp default current_timestamp,
    foreign key (patient_id) references patient(patient_id) on delete cascade
);

-- ============================================================================
-- TABLE 4: PATIENT_VISIT_HISTORY
-- ============================================================================
create table if not exists patient_visit_history (
    visit_id int primary key,
    patient_id int not null,
    admission_date timestamp,
    discharge_date timestamp,
    visit_reason text,
    ward_id int,
    created_at timestamp default current_timestamp,
    foreign key (patient_id) references patient(patient_id) on delete cascade
);

-- ============================================================================
-- TABLE 5: WARD
-- ============================================================================
create table if not exists ward (
    ward_id int primary key,
    ward_name varchar(100) not null,
    location varchar(100),
    total_beds int,
    tel_extension varchar(20),
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp
);

-- Update foreign key in patient_visit_history
alter table patient_visit_history
add constraint fk_patient_visit_history_ward 
foreign key (ward_id) references ward(ward_id) on delete set null;

-- ============================================================================
-- TABLE 6: DEPARTMENT
-- ============================================================================
create table if not exists department (
    dept_id int primary key,
    dept_name varchar(100) not null,
    budget decimal(12, 2),
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp
);

-- ============================================================================
-- TABLE 7: STAFF
-- ============================================================================
create table if not exists staff (
    staff_id int primary key,
    ward_id int,
    first_name varchar(50) not null,
    last_name varchar(50) not null,
    address varchar(255),
    phone varchar(20),
    dob date,
    nin varchar(20),
    position varchar(100),
    salary decimal(10, 2),
    salary_scale varchar(50),
    hours_per_week int,
    contract_type varchar(50),
    salary_payment_type varchar(50),
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp,
    foreign key (ward_id) references ward(ward_id) on delete set null
);

-- ============================================================================
-- TABLE 8: QUALIFICATION
-- ============================================================================
create table if not exists qualification (
    qualification_id int primary key,
    staff_id int not null,
    type varchar(100),
    date_qualified date,
    institution varchar(150),
    created_at timestamp default current_timestamp,
    foreign key (staff_id) references staff(staff_id) on delete cascade
);

-- ============================================================================
-- TABLE 9: WORK_EXPERIENCE
-- ============================================================================
create table if not exists work_experience (
    experience_id int primary key,
    staff_id int not null,
    position varchar(100),
    organization varchar(150),
    start_date date,
    end_date date,
    created_at timestamp default current_timestamp,
    foreign key (staff_id) references staff(staff_id) on delete cascade
);

-- ============================================================================
-- TABLE 10: SHIFT
-- ============================================================================
create table if not exists shift (
    shift_id int primary key,
    staff_id int not null,
    ward_id int not null,
    week_commencing date,
    shift_type varchar(50),
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp,
    foreign key (staff_id) references staff(staff_id) on delete cascade,
    foreign key (ward_id) references ward(ward_id) on delete cascade
);

-- ============================================================================
-- TABLE 11: STAFF_DEPARTMENT_ASSIGNMENT
-- ============================================================================
create table if not exists staff_department_assignment (
    assignment_id int primary key,
    staff_id int not null,
    dept_id int not null,
    start_date date,
    end_date date,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp,
    foreign key (staff_id) references staff(staff_id) on delete cascade,
    foreign key (dept_id) references department(dept_id) on delete cascade
);

-- ============================================================================
-- TABLE 12: STAFF_ROLE_HISTORY
-- ============================================================================
create table if not exists staff_role_history (
    role_history_id int primary key,
    staff_id int not null,
    role varchar(100),
    start_date date,
    end_date date,
    created_at timestamp default current_timestamp,
    foreign key (staff_id) references staff(staff_id) on delete cascade
);

-- ============================================================================
-- TABLE 13: BED
-- ============================================================================
create table if not exists bed (
    bed_id int primary key,
    bed_name varchar(20) not null,
    ward_id int not null,
    bed_type varchar(50),
    is_available boolean default true,
    last_cleaned timestamp,
    maintenance_status varchar(50),
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp,
    foreign key (ward_id) references ward(ward_id) on delete cascade
);

-- ============================================================================
-- TABLE 14: BED_OCCUPANCY_HISTORY
-- ============================================================================
create table if not exists bed_occupancy_history (
    occupancy_id int primary key,
    bed_id int not null,
    patient_id int not null,
    start_date timestamp,
    end_date timestamp,
    created_at timestamp default current_timestamp,
    foreign key (bed_id) references bed(bed_id) on delete cascade,
    foreign key (patient_id) references patient(patient_id) on delete cascade
);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================================
alter table patient enable row level security;
alter table next_of_kin enable row level security;
alter table patient_medical_record enable row level security;
alter table patient_visit_history enable row level security;
alter table ward enable row level security;
alter table department enable row level security;
alter table staff enable row level security;
alter table qualification enable row level security;
alter table work_experience enable row level security;
alter table shift enable row level security;
alter table staff_department_assignment enable row level security;
alter table staff_role_history enable row level security;
alter table bed enable row level security;
alter table bed_occupancy_history enable row level security;

-- ============================================================================
-- GRANT PERMISSIONS TO ANON ROLE
-- ============================================================================
grant usage on schema public to anon;

grant select, insert, update, delete on table patient to anon;
grant select, insert, update, delete on table next_of_kin to anon;
grant select, insert, update, delete on table patient_medical_record to anon;
grant select, insert, update, delete on table patient_visit_history to anon;
grant select, insert, update, delete on table ward to anon;
grant select, insert, update, delete on table department to anon;
grant select, insert, update, delete on table staff to anon;
grant select, insert, update, delete on table qualification to anon;
grant select, insert, update, delete on table work_experience to anon;
grant select, insert, update, delete on table shift to anon;
grant select, insert, update, delete on table staff_department_assignment to anon;
grant select, insert, update, delete on table staff_role_history to anon;
grant select, insert, update, delete on table bed to anon;
grant select, insert, update, delete on table bed_occupancy_history to anon;

-- ============================================================================
-- CREATE RLS POLICIES FOR ALL TABLES
-- ============================================================================

-- PATIENT
drop policy if exists patient_anon_all on patient;
create policy patient_anon_all on patient
for all to anon
using (true)
with check (true);

-- NEXT_OF_KIN
drop policy if exists next_of_kin_anon_all on next_of_kin;
create policy next_of_kin_anon_all on next_of_kin
for all to anon
using (true)
with check (true);

-- PATIENT_MEDICAL_RECORD
drop policy if exists patient_medical_record_anon_all on patient_medical_record;
create policy patient_medical_record_anon_all on patient_medical_record
for all to anon
using (true)
with check (true);

-- PATIENT_VISIT_HISTORY
drop policy if exists patient_visit_history_anon_all on patient_visit_history;
create policy patient_visit_history_anon_all on patient_visit_history
for all to anon
using (true)
with check (true);

-- WARD
drop policy if exists ward_anon_all on ward;
create policy ward_anon_all on ward
for all to anon
using (true)
with check (true);

-- DEPARTMENT
drop policy if exists department_anon_all on department;
create policy department_anon_all on department
for all to anon
using (true)
with check (true);

-- STAFF
drop policy if exists staff_anon_all on staff;
create policy staff_anon_all on staff
for all to anon
using (true)
with check (true);

-- QUALIFICATION
drop policy if exists qualification_anon_all on qualification;
create policy qualification_anon_all on qualification
for all to anon
using (true)
with check (true);

-- WORK_EXPERIENCE
drop policy if exists work_experience_anon_all on work_experience;
create policy work_experience_anon_all on work_experience
for all to anon
using (true)
with check (true);

-- SHIFT
drop policy if exists shift_anon_all on shift;
create policy shift_anon_all on shift
for all to anon
using (true)
with check (true);

-- STAFF_DEPARTMENT_ASSIGNMENT
drop policy if exists staff_department_assignment_anon_all on staff_department_assignment;
create policy staff_department_assignment_anon_all on staff_department_assignment
for all to anon
using (true)
with check (true);

-- STAFF_ROLE_HISTORY
drop policy if exists staff_role_history_anon_all on staff_role_history;
create policy staff_role_history_anon_all on staff_role_history
for all to anon
using (true)
with check (true);

-- BED
drop policy if exists bed_anon_all on bed;
create policy bed_anon_all on bed
for all to anon
using (true)
with check (true);

-- BED_OCCUPANCY_HISTORY
drop policy if exists bed_occupancy_history_anon_all on bed_occupancy_history;
create policy bed_occupancy_history_anon_all on bed_occupancy_history
for all to anon
using (true)
with check (true);

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================
-- Your database is now configured for the frontend to access!
-- Reload your web application to test.
