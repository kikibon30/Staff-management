-- Wellmeadows Hospital Database Schema
-- 32 Tables for Hospital Management System
-- Created for Supabase

-- ============================================================================
-- PATIENT MANAGEMENT TABLES (1-4)
-- ============================================================================

-- Table 1: PATIENT
CREATE TABLE PATIENT (
    patient_ID INT PRIMARY KEY,
    patient_name VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    city VARCHAR(50),
    state VARCHAR(50),
    postal_code VARCHAR(10),
    telephone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10),
    marital_status VARCHAR(20),
    emergency_contact VARCHAR(100),
    emergency_phone VARCHAR(20),
    insurance_company VARCHAR(100),
    insurance_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 2: NEXT_OF_KIN
CREATE TABLE NEXT_OF_KIN (
    patient_ID INT PRIMARY KEY,
    next_of_kin_name VARCHAR(100),
    relationship VARCHAR(50),
    address VARCHAR(255),
    telephone VARCHAR(20),
    FOREIGN KEY (patient_ID) REFERENCES PATIENT(patient_ID) ON DELETE CASCADE
);

-- Table 3: PATIENT_MEDICAL_RECORD
CREATE TABLE PATIENT_MEDICAL_RECORD (
    record_id INT PRIMARY KEY,
    patient_ID INT NOT NULL,
    record_type VARCHAR(50),
    description TEXT,
    record_date DATE NOT NULL,
    recorded_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_ID) REFERENCES PATIENT(patient_ID) ON DELETE CASCADE
);

-- Table 4: PATIENT_VISIT_HISTORY
CREATE TABLE PATIENT_VISIT_HISTORY (
    visit_id INT PRIMARY KEY,
    patient_ID INT NOT NULL,
    visit_date TIMESTAMP NOT NULL,
    visit_type VARCHAR(50),
    visit_reason TEXT,
    ward_ID INT,
    duration_minutes INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_ID) REFERENCES PATIENT(patient_ID) ON DELETE CASCADE
);

-- ============================================================================
-- WARD & BED MANAGEMENT TABLES (5, 13, 14)
-- ============================================================================

-- Table 5: WARD
CREATE TABLE WARD (
    ward_ID INT PRIMARY KEY,
    ward_name VARCHAR(100) NOT NULL,
    ward_type VARCHAR(50),
    location VARCHAR(100),
    total_beds INT,
    available_beds INT,
    dept_ID INT,
    ward_phone VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 13: BED
CREATE TABLE BED (
    bed_ID INT PRIMARY KEY,
    bed_name VARCHAR(20) NOT NULL,
    ward_ID INT NOT NULL,
    bed_type VARCHAR(50),
    is_available BOOLEAN DEFAULT TRUE,
    last_cleaned TIMESTAMP,
    maintenance_status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ward_ID) REFERENCES WARD(ward_ID) ON DELETE CASCADE
);

-- Table 14: BED_OCCUPANCY_HISTORY
CREATE TABLE BED_OCCUPANCY_HISTORY (
    occupancy_id INT PRIMARY KEY,
    bed_ID INT NOT NULL,
    inpatient_id INT,
    check_in_date TIMESTAMP NOT NULL,
    check_out_date TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bed_ID) REFERENCES BED(bed_ID) ON DELETE CASCADE
);

-- ============================================================================
-- STAFF & DEPARTMENT TABLES (6, 7, 8, 9, 10, 11, 12)
-- ============================================================================

-- Table 6: STAFF
CREATE TABLE STAFF (
    staff_ID INT PRIMARY KEY,
    staff_name VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    telephone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10),
    position VARCHAR(100),
    employment_type VARCHAR(50),
    salary DECIMAL(10, 2),
    date_employed DATE,
    date_left DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 7: QUALIFICATION
CREATE TABLE QUALIFICATION (
    qualification_id INT PRIMARY KEY,
    staff_ID INT NOT NULL,
    qualification_type VARCHAR(100),
    qualification_name VARCHAR(150),
    issuing_institution VARCHAR(150),
    date_obtained DATE,
    expiry_date DATE,
    certification_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_ID) REFERENCES STAFF(staff_ID) ON DELETE CASCADE
);

-- Table 8: WORK_EXPERIENCE
CREATE TABLE WORK_EXPERIENCE (
    experience_id INT PRIMARY KEY,
    staff_ID INT NOT NULL,
    position_title VARCHAR(100),
    employer_name VARCHAR(150),
    start_date DATE,
    end_date DATE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_ID) REFERENCES STAFF(staff_ID) ON DELETE CASCADE
);

-- Table 9: SHIFT
CREATE TABLE SHIFT (
    shift_id INT PRIMARY KEY,
    shift_name VARCHAR(50) NOT NULL,
    start_time TIME,
    end_time TIME,
    shift_type VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 10: DEPARTMENT
CREATE TABLE DEPARTMENT (
    dept_ID INT PRIMARY KEY,
    dept_name VARCHAR(100) NOT NULL,
    dept_location VARCHAR(100),
    dept_phone VARCHAR(20),
    manager_staff_ID INT,
    budget DECIMAL(12, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (manager_staff_ID) REFERENCES STAFF(staff_ID) ON DELETE SET NULL
);

-- Table 11: STAFF_DEPARTMENT_ASSIGNMENT
CREATE TABLE STAFF_DEPARTMENT_ASSIGNMENT (
    assignment_id INT PRIMARY KEY,
    staff_ID INT NOT NULL,
    dept_ID INT NOT NULL,
    assignment_date DATE NOT NULL,
    end_date DATE,
    role VARCHAR(100),
    shift_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_ID) REFERENCES STAFF(staff_ID) ON DELETE CASCADE,
    FOREIGN KEY (dept_ID) REFERENCES DEPARTMENT(dept_ID) ON DELETE CASCADE,
    FOREIGN KEY (shift_id) REFERENCES SHIFT(shift_id) ON DELETE SET NULL
);

-- Table 12: STAFF_ROLE_HISTORY
CREATE TABLE STAFF_ROLE_HISTORY (
    role_history_id INT PRIMARY KEY,
    staff_ID INT NOT NULL,
    previous_role VARCHAR(100),
    new_role VARCHAR(100),
    change_date DATE NOT NULL,
    reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_ID) REFERENCES STAFF(staff_ID) ON DELETE CASCADE
);

-- ============================================================================
-- PATIENT ADMISSION & TYPE TABLES (15, 16, 18)
-- ============================================================================

-- Table 15: WAITING_LIST
CREATE TABLE WAITING_LIST (
    waiting_list_id INT PRIMARY KEY,
    patient_ID INT NOT NULL,
    admission_date_requested DATE,
    ward_type_requested VARCHAR(50),
    reason_for_admission TEXT,
    priority_level VARCHAR(20),
    status VARCHAR(50),
    date_admitted TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_ID) REFERENCES PATIENT(patient_ID) ON DELETE CASCADE
);

-- Table 16: INPATIENT
CREATE TABLE INPATIENT (
    inpatient_id INT PRIMARY KEY,
    patient_ID INT NOT NULL,
    admission_date TIMESTAMP NOT NULL,
    discharge_date TIMESTAMP,
    ward_ID INT NOT NULL,
    bed_ID INT NOT NULL,
    admission_reason TEXT,
    discharge_notes TEXT,
    primary_diagnosis VARCHAR(100),
    admission_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_ID) REFERENCES PATIENT(patient_ID) ON DELETE CASCADE,
    FOREIGN KEY (ward_ID) REFERENCES WARD(ward_ID) ON DELETE RESTRICT,
    FOREIGN KEY (bed_ID) REFERENCES BED(bed_ID) ON DELETE RESTRICT
);

-- Table 18: OUTPATIENT
CREATE TABLE OUTPATIENT (
    patient_ID INT PRIMARY KEY,
    outpatient_id VARCHAR(50),
    visit_frequency VARCHAR(50),
    primary_department INT,
    insurance_validated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_ID) REFERENCES PATIENT(patient_ID) ON DELETE CASCADE,
    FOREIGN KEY (primary_department) REFERENCES DEPARTMENT(dept_ID) ON DELETE SET NULL
);

-- ============================================================================
-- APPOINTMENT & TREATMENT TABLES (17, 19, 20, 21, 22, 23)
-- ============================================================================

-- Table 17: APPOINTMENT
CREATE TABLE APPOINTMENT (
    appointment_ID INT PRIMARY KEY,
    patient_ID INT NOT NULL,
    appointment_date TIMESTAMP NOT NULL,
    appointment_time TIME,
    department_ID INT,
    staff_ID INT,
    appointment_type VARCHAR(50),
    status VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_ID) REFERENCES PATIENT(patient_ID) ON DELETE CASCADE,
    FOREIGN KEY (department_ID) REFERENCES DEPARTMENT(dept_ID) ON DELETE SET NULL,
    FOREIGN KEY (staff_ID) REFERENCES STAFF(staff_ID) ON DELETE SET NULL
);

-- Table 19: TREATMENT
CREATE TABLE TREATMENT (
    treatment_id INT PRIMARY KEY,
    patient_ID INT NOT NULL,
    treatment_date TIMESTAMP NOT NULL,
    treatment_type VARCHAR(100),
    treatment_description TEXT,
    duration_minutes INT,
    status VARCHAR(50),
    outcome VARCHAR(255),
    cost DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_ID) REFERENCES PATIENT(patient_ID) ON DELETE CASCADE
);

-- Table 20: TREATMENT_PROVIDER
CREATE TABLE TREATMENT_PROVIDER (
    treatment_provider_id INT PRIMARY KEY,
    treatment_id INT NOT NULL,
    staff_ID INT NOT NULL,
    role_in_treatment VARCHAR(100),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (treatment_id) REFERENCES TREATMENT(treatment_id) ON DELETE CASCADE,
    FOREIGN KEY (staff_ID) REFERENCES STAFF(staff_ID) ON DELETE RESTRICT
);

-- Table 21: DIAGNOSIS
CREATE TABLE DIAGNOSIS (
    diagnosis_id INT PRIMARY KEY,
    patient_ID INT NOT NULL,
    inpatient_id INT,
    diagnosis_code VARCHAR(20),
    diagnosis_description VARCHAR(255) NOT NULL,
    diagnosis_date DATE NOT NULL,
    severity VARCHAR(50),
    status VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_ID) REFERENCES PATIENT(patient_ID) ON DELETE CASCADE,
    FOREIGN KEY (inpatient_id) REFERENCES INPATIENT(inpatient_id) ON DELETE SET NULL
);

-- Table 22: PRESCRIPTION
CREATE TABLE PRESCRIPTION (
    prescription_id INT PRIMARY KEY,
    patient_ID INT NOT NULL,
    prescribing_staff_ID INT,
    prescription_date DATE NOT NULL,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_ID) REFERENCES PATIENT(patient_ID) ON DELETE CASCADE,
    FOREIGN KEY (prescribing_staff_ID) REFERENCES STAFF(staff_ID) ON DELETE SET NULL
);

-- Table 23: PATIENT_MEDICATION
CREATE TABLE PATIENT_MEDICATION (
    medication_id INT PRIMARY KEY,
    prescription_id INT NOT NULL,
    medication_name VARCHAR(150) NOT NULL,
    medication_code VARCHAR(50),
    dosage VARCHAR(50),
    frequency VARCHAR(50),
    route_of_administration VARCHAR(50),
    quantity INT,
    unit VARCHAR(20),
    side_effects TEXT,
    contraindications TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prescription_id) REFERENCES PRESCRIPTION(prescription_id) ON DELETE CASCADE
);

-- ============================================================================
-- PHARMACY & SUPPLIES TABLES (24, 25, 26, 27)
-- ============================================================================

-- Table 26: SUPPLIER (Created first as it's referenced by other tables)
CREATE TABLE SUPPLIER (
    supplier_ID INT PRIMARY KEY,
    supplier_name VARCHAR(150) NOT NULL,
    address VARCHAR(255),
    city VARCHAR(50),
    state VARCHAR(50),
    postal_code VARCHAR(10),
    telephone VARCHAR(20),
    fax VARCHAR(20),
    email VARCHAR(100),
    contact_person VARCHAR(100),
    payment_terms VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 24: PHARMACEUTICAL_SUPPLY
CREATE TABLE PHARMACEUTICAL_SUPPLY (
    drug_ID INT PRIMARY KEY,
    drug_name VARCHAR(150) NOT NULL,
    drug_code VARCHAR(50),
    drug_type VARCHAR(50),
    dosage_form VARCHAR(50),
    strength VARCHAR(50),
    supplier_ID INT,
    quantity_in_stock INT,
    reorder_level INT,
    unit_cost DECIMAL(10, 2),
    expiry_date DATE,
    storage_location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_ID) REFERENCES SUPPLIER(supplier_ID) ON DELETE SET NULL
);

-- Table 25: SURGICAL_NONSURGICAL_SUPPLY
CREATE TABLE SURGICAL_NONSURGICAL_SUPPLY (
    item_ID INT PRIMARY KEY,
    item_name VARCHAR(150) NOT NULL,
    item_code VARCHAR(50),
    item_type VARCHAR(50),
    category VARCHAR(50),
    supplier_ID INT,
    quantity_in_stock INT,
    reorder_level INT,
    unit_cost DECIMAL(10, 2),
    expiry_date DATE,
    storage_location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_ID) REFERENCES SUPPLIER(supplier_ID) ON DELETE SET NULL
);

-- Table 27: SUPPLIES_SUPPLIER
CREATE TABLE SUPPLIES_SUPPLIER (
    supplies_supplier_id INT PRIMARY KEY,
    supplier_ID INT NOT NULL,
    item_type VARCHAR(50),
    drug_ID INT,
    supply_item_ID INT,
    lead_time_days INT,
    minimum_order_quantity INT,
    contract_start_date DATE,
    contract_end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_ID) REFERENCES SUPPLIER(supplier_ID) ON DELETE CASCADE
);

-- ============================================================================
-- WARD REQUISITION TABLES (28, 29)
-- ============================================================================

-- Table 28: WARD_REQUISITION
CREATE TABLE WARD_REQUISITION (
    requisition_ID INT PRIMARY KEY,
    ward_ID INT NOT NULL,
    requisition_date DATE NOT NULL,
    requested_by INT,
    approved_by INT,
    approval_date DATE,
    status VARCHAR(50),
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ward_ID) REFERENCES WARD(ward_ID) ON DELETE CASCADE,
    FOREIGN KEY (requested_by) REFERENCES STAFF(staff_ID) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES STAFF(staff_ID) ON DELETE SET NULL
);

-- Table 29: REQUISITION_ITEM
CREATE TABLE REQUISITION_ITEM (
    requisition_item_id INT PRIMARY KEY,
    requisition_ID INT NOT NULL,
    item_ID INT,
    drug_ID INT,
    quantity_requested INT NOT NULL,
    quantity_received INT,
    unit_price DECIMAL(10, 2),
    line_total DECIMAL(12, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requisition_ID) REFERENCES WARD_REQUISITION(requisition_ID) ON DELETE CASCADE
);

-- ============================================================================
-- BILLING & PAYMENT TABLES (30, 31, 32)
-- ============================================================================

-- Table 30: BILL
CREATE TABLE BILL (
    bill_id INT PRIMARY KEY,
    patient_ID INT NOT NULL,
    inpatient_id INT,
    bill_date DATE NOT NULL,
    bill_period_start DATE,
    bill_period_end DATE,
    total_amount DECIMAL(12, 2),
    amount_paid DECIMAL(12, 2),
    outstanding_balance DECIMAL(12, 2),
    status VARCHAR(50),
    due_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_ID) REFERENCES PATIENT(patient_ID) ON DELETE CASCADE,
    FOREIGN KEY (inpatient_id) REFERENCES INPATIENT(inpatient_id) ON DELETE SET NULL
);

-- Table 31: BILL_ITEM
CREATE TABLE BILL_ITEM (
    bill_item_id INT PRIMARY KEY,
    bill_id INT NOT NULL,
    item_description VARCHAR(255),
    item_type VARCHAR(50),
    quantity INT,
    unit_price DECIMAL(10, 2),
    line_amount DECIMAL(12, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bill_id) REFERENCES BILL(bill_id) ON DELETE CASCADE
);

-- Table 32: PAYMENT
CREATE TABLE PAYMENT (
    payment_id INT PRIMARY KEY,
    bill_id INT NOT NULL,
    payment_date DATE NOT NULL,
    amount_paid DECIMAL(12, 2),
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    notes TEXT,
    received_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bill_id) REFERENCES BILL(bill_id) ON DELETE RESTRICT,
    FOREIGN KEY (received_by) REFERENCES STAFF(staff_ID) ON DELETE SET NULL
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_patient_name ON PATIENT(patient_name);
CREATE INDEX idx_staff_name ON STAFF(staff_name);
CREATE INDEX idx_ward_ID ON WARD(ward_ID);
CREATE INDEX idx_inpatient_patient ON INPATIENT(patient_ID);
CREATE INDEX idx_inpatient_admission ON INPATIENT(admission_date);
CREATE INDEX idx_bill_patient ON BILL(patient_ID);
CREATE INDEX idx_bill_date ON BILL(bill_date);
CREATE INDEX idx_appointment_date ON APPOINTMENT(appointment_date);
CREATE INDEX idx_treatment_date ON TREATMENT(treatment_date);
CREATE INDEX idx_prescription_date ON PRESCRIPTION(prescription_date);
CREATE INDEX idx_requisition_date ON WARD_REQUISITION(requisition_date);
CREATE INDEX idx_payment_date ON PAYMENT(payment_date);

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
