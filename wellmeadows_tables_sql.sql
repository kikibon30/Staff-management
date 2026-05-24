-- WELLMEADOWS HOSPITAL - TABLE DEFINITIONS FOR DRAW.IO ERD
-- Copy and paste these table definitions into draw.io to create your ERD

-- ============================================================================
-- TABLE 1: PATIENT
-- ============================================================================
CREATE TABLE PATIENT (
    patient_ID INT PRIMARY KEY,
    First_Name VARCHAR(50) NOT NULL,
    Last_Name VARCHAR(50) NOT NULL,
    Address VARCHAR(255),
    Phone VARCHAR(20),
    DOB DATE,
    Sex VARCHAR(10),
    Marital_Status VARCHAR(20),
    Date_Registered DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLE 2: NEXT_OF_KIN
-- ============================================================================
CREATE TABLE NEXT_OF_KIN (
    Kin_ID INT PRIMARY KEY,
    Patient_ID INT NOT NULL,
    Name VARCHAR(100),
    Relationship VARCHAR(50),
    Address VARCHAR(255),
    Phone VARCHAR(20),
    FOREIGN KEY (Patient_ID) REFERENCES PATIENT(patient_ID) ON DELETE CASCADE
);

-- ============================================================================
-- TABLE 3: PATIENT_MEDICAL_RECORD
-- ============================================================================
CREATE TABLE PATIENT_MEDICAL_RECORD (
    Record_ID INT PRIMARY KEY,
    Patient_ID INT NOT NULL,
    Diagnosis VARCHAR(255),
    Allergies VARCHAR(255),
    Chronic_conditions VARCHAR(255),
    Blood_type VARCHAR(10),
    Created_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Patient_ID) REFERENCES PATIENT(patient_ID) ON DELETE CASCADE
);

-- ============================================================================
-- TABLE 4: PATIENT_VISIT_HISTORY
-- ============================================================================
CREATE TABLE PATIENT_VISIT_HISTORY (
    Visit_ID INT PRIMARY KEY,
    Patient_ID INT NOT NULL,
    Admission_date TIMESTAMP,
    Discharge_date TIMESTAMP,
    Visit_reason TEXT,
    Ward_ID INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Patient_ID) REFERENCES PATIENT(patient_ID) ON DELETE CASCADE
);

-- ============================================================================
-- TABLE 5: WARD
-- ============================================================================
CREATE TABLE WARD (
    Ward_ID INT PRIMARY KEY,
    Ward_Name VARCHAR(100) NOT NULL,
    Location VARCHAR(100),
    Total_Beds INT,
    Tel_Extension VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLE 6: STAFF
-- ============================================================================
CREATE TABLE STAFF (
    Staff_ID INT PRIMARY KEY,
    Ward_ID INT,
    First_Name VARCHAR(50) NOT NULL,
    Last_Name VARCHAR(50) NOT NULL,
    Address VARCHAR(255),
    Phone VARCHAR(20),
    DOB DATE,
    NIN VARCHAR(20),
    Position VARCHAR(100),
    Salary DECIMAL(10, 2),
    Salary_scale VARCHAR(50),
    Hours_per_week INT,
    Contract_type VARCHAR(50),
    Salary_payment_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Ward_ID) REFERENCES WARD(Ward_ID) ON DELETE SET NULL
);

-- ============================================================================
-- TABLE 7: QUALIFICATION
-- ============================================================================
CREATE TABLE QUALIFICATION (
    Qualification_ID INT PRIMARY KEY,
    Staff_ID INT NOT NULL,
    Type VARCHAR(100),
    Date_Qualified DATE,
    Institution VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Staff_ID) REFERENCES STAFF(Staff_ID) ON DELETE CASCADE
);

-- ============================================================================
-- TABLE 8: WORK_EXPERIENCE
-- ============================================================================
CREATE TABLE WORK_EXPERIENCE (
    Experience_ID INT PRIMARY KEY,
    Staff_ID INT NOT NULL,
    Position VARCHAR(100),
    Organization VARCHAR(150),
    Start_Date DATE,
    End_Date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Staff_ID) REFERENCES STAFF(Staff_ID) ON DELETE CASCADE
);

-- ============================================================================
-- TABLE 9: SHIFT
-- ============================================================================
CREATE TABLE SHIFT (
    Shift_ID INT PRIMARY KEY,
    Staff_ID INT NOT NULL,
    Ward_ID INT NOT NULL,
    Week_commencing DATE,
    Shift_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Staff_ID) REFERENCES STAFF(Staff_ID) ON DELETE CASCADE,
    FOREIGN KEY (Ward_ID) REFERENCES WARD(Ward_ID) ON DELETE CASCADE
);

-- ============================================================================
-- TABLE 10: DEPARTMENT
-- ============================================================================
CREATE TABLE DEPARTMENT (
    Dept_ID INT PRIMARY KEY,
    Dept_name VARCHAR(100) NOT NULL,
    Staff_ID INT,
    Budget DECIMAL(12, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Staff_ID) REFERENCES STAFF(Staff_ID) ON DELETE SET NULL
);

-- ============================================================================
-- TABLE 11: STAFF_DEPARTMENT_ASSIGNMENT
-- ============================================================================
CREATE TABLE STAFF_DEPARTMENT_ASSIGNMENT (
    Assignment_ID INT PRIMARY KEY,
    Staff_ID INT NOT NULL,
    Dept_ID INT NOT NULL,
    Start_date DATE NOT NULL,
    End_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Staff_ID) REFERENCES STAFF(Staff_ID) ON DELETE CASCADE,
    FOREIGN KEY (Dept_ID) REFERENCES DEPARTMENT(Dept_ID) ON DELETE CASCADE
);

-- ============================================================================
-- TABLE 12: STAFF_ROLE_HISTORY
-- ============================================================================
CREATE TABLE STAFF_ROLE_HISTORY (
    Role_history_ID INT PRIMARY KEY,
    Staff_ID INT NOT NULL,
    Previous_position VARCHAR(100),
    New_position VARCHAR(100),
    Change_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Staff_ID) REFERENCES STAFF(Staff_ID) ON DELETE CASCADE
);

-- ============================================================================
-- TABLE 13: BED
-- ============================================================================
CREATE TABLE BED (
    Bed_ID INT PRIMARY KEY,
    Bed_number VARCHAR(20) NOT NULL,
    Ward_ID INT NOT NULL,
    Bed_type VARCHAR(50),
    Is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Ward_ID) REFERENCES WARD(Ward_ID) ON DELETE CASCADE
);

-- ============================================================================
-- TABLE 14: BED_OCCUPANCY_HISTORY
-- ============================================================================
CREATE TABLE BED_OCCUPANCY_HISTORY (
    Occupancy_ID INT PRIMARY KEY,
    Bed_ID INT NOT NULL,
    Patient_ID INT NOT NULL,
    Assigned_date TIMESTAMP NOT NULL,
    Vacated_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Bed_ID) REFERENCES BED(Bed_ID) ON DELETE CASCADE,
    FOREIGN KEY (Patient_ID) REFERENCES PATIENT(patient_ID) ON DELETE CASCADE
);

-- ============================================================================
-- TABLE 15: WAITING_LIST
-- ============================================================================
CREATE TABLE WAITING_LIST (
    Waiting_list_ID INT PRIMARY KEY,
    Patient_ID INT NOT NULL,
    Ward_ID INT NOT NULL,
    Date_placed_on_waiting_list DATE,
    Expected_duration_of_stay_days INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Patient_ID) REFERENCES PATIENT(patient_ID) ON DELETE CASCADE,
    FOREIGN KEY (Ward_ID) REFERENCES WARD(Ward_ID) ON DELETE CASCADE
);

-- ============================================================================
-- TABLE 16: IN_PATIENT
-- ============================================================================
CREATE TABLE IN_PATIENT (
    InPatient_ID INT PRIMARY KEY,
    Patient_ID INT NOT NULL,
    Ward_ID INT NOT NULL,
    Bed_ID INT NOT NULL,
    Date_Admitted TIMESTAMP NOT NULL,
    Expected_Leave DATE,
    Actual_Leave DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Patient_ID) REFERENCES PATIENT(patient_ID) ON DELETE CASCADE,
    FOREIGN KEY (Ward_ID) REFERENCES WARD(Ward_ID) ON DELETE RESTRICT,
    FOREIGN KEY (Bed_ID) REFERENCES BED(Bed_ID) ON DELETE RESTRICT
);

-- ============================================================================
-- TABLE 17: OUT_PATIENT
-- ============================================================================
CREATE TABLE OUT_PATIENT (
    OutPatient_ID INT PRIMARY KEY,
    Patient_ID INT NOT NULL,
    Date TIMESTAMP,
    Time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Patient_ID) REFERENCES PATIENT(patient_ID) ON DELETE CASCADE
);

-- ============================================================================
-- TABLE 18: APPOINTMENT
-- ============================================================================
CREATE TABLE APPOINTMENT (
    Appointment_ID INT PRIMARY KEY,
    Patient_ID INT NOT NULL,
    Staff_ID INT NOT NULL,
    Consultant_staff_ID INT,
    Date DATE NOT NULL,
    Time TIME,
    Room VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Patient_ID) REFERENCES PATIENT(patient_ID) ON DELETE CASCADE,
    FOREIGN KEY (Staff_ID) REFERENCES STAFF(Staff_ID) ON DELETE CASCADE,
    FOREIGN KEY (Consultant_staff_ID) REFERENCES STAFF(Staff_ID) ON DELETE SET NULL
);

-- ============================================================================
-- TABLE 19: DIAGNOSES
-- ============================================================================
CREATE TABLE DIAGNOSES (
    Diagnoses_ID INT PRIMARY KEY,
    Patient_ID INT NOT NULL,
    Visit_ID INT,
    Diagnoses_code VARCHAR(20),
    Description VARCHAR(255),
    Diagnosed_by_staff_ID INT,
    date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Patient_ID) REFERENCES PATIENT(patient_ID) ON DELETE CASCADE,
    FOREIGN KEY (Diagnosed_by_staff_ID) REFERENCES STAFF(Staff_ID) ON DELETE SET NULL
);

-- ============================================================================
-- TABLE 20: PATIENT_MEDICATION
-- ============================================================================
CREATE TABLE PATIENT_MEDICATION (
    Medication_ID INT PRIMARY KEY,
    Patient_ID INT NOT NULL,
    Drug_ID INT NOT NULL,
    Units_Per_Day INT,
    Start_Date DATE,
    End_Date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Patient_ID) REFERENCES PATIENT(patient_ID) ON DELETE CASCADE,
    FOREIGN KEY (Drug_ID) REFERENCES PHARMACEUTICAL_SUPPLY(Drug_ID) ON DELETE RESTRICT
);

-- ============================================================================
-- TABLE 21: PRESCRIPTION
-- ============================================================================
CREATE TABLE PRESCRIPTION (
    Prescription_ID INT PRIMARY KEY,
    Patient_ID INT NOT NULL,
    Drug_ID INT NOT NULL,
    Contract_type VARCHAR(50),
    Payment_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Patient_ID) REFERENCES PATIENT(patient_ID) ON DELETE CASCADE,
    FOREIGN KEY (Drug_ID) REFERENCES PHARMACEUTICAL_SUPPLY(Drug_ID) ON DELETE RESTRICT
);

-- ============================================================================
-- TABLE 22: TREATMENT
-- ============================================================================
CREATE TABLE TREATMENT (
    Treatment_ID INT PRIMARY KEY,
    Treatment_name VARCHAR(150) NOT NULL,
    Treatment_description TEXT,
    Standard_cost DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLE 23: TREATMENT_PROVIDER
-- ============================================================================
CREATE TABLE TREATMENT_PROVIDER (
    Treatment_provider_ID INT PRIMARY KEY,
    Treatment_ID INT NOT NULL,
    Patient_ID INT NOT NULL,
    Treatment_date TIMESTAMP NOT NULL,
    Notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Treatment_ID) REFERENCES TREATMENT(Treatment_ID) ON DELETE CASCADE,
    FOREIGN KEY (Patient_ID) REFERENCES PATIENT(patient_ID) ON DELETE CASCADE
);

-- ============================================================================
-- TABLE 24: SUPPLIER
-- ============================================================================
CREATE TABLE SUPPLIER (
    Supplier_ID INT PRIMARY KEY,
    Supplier_name VARCHAR(150) NOT NULL,
    Address VARCHAR(255),
    Phone VARCHAR(20),
    Fax_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLE 25: PHARMACEUTICAL_SUPPLY
-- ============================================================================
CREATE TABLE PHARMACEUTICAL_SUPPLY (
    Drug_ID INT PRIMARY KEY,
    Drug_name VARCHAR(150) NOT NULL,
    Description TEXT,
    Dosage VARCHAR(50),
    Method_of_administration VARCHAR(100),
    Quantity_of_stock INT,
    Reorder_level INT,
    Cost_per_unit DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLE 26: SURGICAL_NONSURGICAL_SUPPLY
-- ============================================================================
CREATE TABLE SURGICAL_NONSURGICAL_SUPPLY (
    Item_ID INT PRIMARY KEY,
    Item_name VARCHAR(150) NOT NULL,
    Description TEXT,
    Quantity_in_stock INT,
    Reorder_level INT,
    Cost_per_unit DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLE 27: SUPPLIES_SUPPLIER
-- ============================================================================
CREATE TABLE SUPPLIES_SUPPLIER (
    Supplies_supplier_ID INT PRIMARY KEY,
    Supplier_ID INT NOT NULL,
    Item_or_drug_number INT,
    Item_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Supplier_ID) REFERENCES SUPPLIER(Supplier_ID) ON DELETE CASCADE
);

-- ============================================================================
-- TABLE 28: WARD_REQUISITION
-- ============================================================================
CREATE TABLE WARD_REQUISITION (
    Requisition_ID INT PRIMARY KEY,
    Ward_ID INT NOT NULL,
    Staff_ID INT NOT NULL,
    Requisition_date DATE NOT NULL,
    Signature_date DATE,
    Signed_by_staff_ID INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Ward_ID) REFERENCES WARD(Ward_ID) ON DELETE CASCADE,
    FOREIGN KEY (Staff_ID) REFERENCES STAFF(Staff_ID) ON DELETE CASCADE,
    FOREIGN KEY (Signed_by_staff_ID) REFERENCES STAFF(Staff_ID) ON DELETE SET NULL
);

-- ============================================================================
-- TABLE 29: REQUISITION_ITEM
-- ============================================================================
CREATE TABLE REQUISITION_ITEM (
    Requisition_item_ID INT PRIMARY KEY,
    Requisition_ID INT NOT NULL,
    Item_or_drug_number INT,
    Item_type VARCHAR(50),
    Quantity_required INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Requisition_ID) REFERENCES WARD_REQUISITION(Requisition_ID) ON DELETE CASCADE
);

-- ============================================================================
-- TABLE 30: BILL
-- ============================================================================
CREATE TABLE BILL (
    Bill_ID INT PRIMARY KEY,
    Patient_ID INT NOT NULL,
    Visit_ID INT,
    Bill_date DATE NOT NULL,
    Due_date DATE,
    Total_amount DECIMAL(12, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Patient_ID) REFERENCES PATIENT(patient_ID) ON DELETE CASCADE
);

-- ============================================================================
-- TABLE 31: BILL_ITEM
-- ============================================================================
CREATE TABLE BILL_ITEM (
    Bill_item_ID INT PRIMARY KEY,
    Bill_ID INT NOT NULL,
    Description VARCHAR(255),
    Quantity INT,
    Unit_price DECIMAL(10, 2),
    Line_total DECIMAL(12, 2),
    Reference_ID VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Bill_ID) REFERENCES BILL(Bill_ID) ON DELETE CASCADE
);

-- ============================================================================
-- TABLE 32: PAYMENT
-- ============================================================================
CREATE TABLE PAYMENT (
    Payment_ID INT PRIMARY KEY,
    Bill_ID INT NOT NULL,
    Payment_date DATE NOT NULL,
    Payment_amount DECIMAL(12, 2),
    Payment_method VARCHAR(50),
    Transaction_reference VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Bill_ID) REFERENCES BILL(Bill_ID) ON DELETE RESTRICT
);

-- ============================================================================
-- END OF TABLE DEFINITIONS
-- ============================================================================
