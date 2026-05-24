-- ============================================================================
-- WELLMEADOWS HOSPITAL - STAFF MANAGEMENT FUNCTIONS, TRIGGERS & PROCEDURES
-- ============================================================================
-- Copy and paste these into Supabase SQL Editor for database-level operations

-- ============================================================================
-- 1. FUNCTION: Check Staff Availability
-- ============================================================================
-- PURPOSE: Check if a staff member can be assigned to a department/ward
-- USAGE: SELECT check_staff_availability(staff_id)
-- RETURNS: TRUE if available, FALSE if already assigned

CREATE OR REPLACE FUNCTION check_staff_availability(p_staff_id INT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if staff exists and is active
    IF NOT EXISTS (SELECT 1 FROM staff WHERE staff_id = p_staff_id) THEN
        RETURN FALSE;
    END IF;
    
    -- Check if staff already has an active assignment
    IF EXISTS (
        SELECT 1 FROM staff_department_assignment 
        WHERE staff_id = p_staff_id AND end_date IS NULL
    ) THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. FUNCTION: Get Staff by Department
-- ============================================================================
-- PURPOSE: Get all staff members assigned to a specific department
-- USAGE: SELECT * FROM get_staff_by_department(dept_id)
-- RETURNS: List of staff with their assignments

CREATE OR REPLACE FUNCTION get_staff_by_department(p_dept_id INT)
RETURNS TABLE(staff_id INT, first_name VARCHAR, last_name VARCHAR, "position" VARCHAR, start_date DATE) AS $$
BEGIN
    RETURN QUERY
    SELECT s.staff_id, s.first_name, s.last_name, s."position", sda.start_date
    FROM staff s
    JOIN staff_department_assignment sda ON s.staff_id = sda.staff_id
    WHERE sda.dept_id = p_dept_id AND sda.end_date IS NULL
    ORDER BY s.last_name, s.first_name;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 3. FUNCTION: Count Staff by Position
-- ============================================================================
-- PURPOSE: Count how many staff members are in each position (for reporting)
-- USAGE: SELECT * FROM count_staff_by_position()
-- RETURNS: Position and count

CREATE OR REPLACE FUNCTION count_staff_by_position()
RETURNS TABLE("position" VARCHAR, staff_count INT) AS $$
BEGIN
    RETURN QUERY
    SELECT s."position", COUNT(*) as staff_count
    FROM staff s
    GROUP BY s."position"
    ORDER BY staff_count DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. PROCEDURE: Assign Staff to Department
-- ============================================================================
-- PURPOSE: Assign a staff member to a department with validation
-- USAGE: CALL assign_staff_to_department(staff_id, dept_id, start_date)

CREATE OR REPLACE PROCEDURE assign_staff_to_department(
    p_staff_id INT,
    p_dept_id INT,
    p_start_date DATE
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Validate staff exists
    IF NOT EXISTS (SELECT 1 FROM staff WHERE staff_id = p_staff_id) THEN
        RAISE EXCEPTION 'Staff member not found';
    END IF;
    
    -- Validate department exists
    IF NOT EXISTS (SELECT 1 FROM department WHERE dept_id = p_dept_id) THEN
        RAISE EXCEPTION 'Department not found';
    END IF;
    
    -- End any previous active assignments
    UPDATE staff_department_assignment 
    SET end_date = p_start_date - INTERVAL '1 day'
    WHERE staff_id = p_staff_id AND end_date IS NULL;
    
    -- Create new assignment
    INSERT INTO staff_department_assignment (staff_id, dept_id, start_date, created_at, updated_at)
    VALUES (p_staff_id, p_dept_id, p_start_date, NOW(), NOW());
END;
$$;

-- ============================================================================
-- 5. PROCEDURE: Record Staff Role Change
-- ============================================================================
-- PURPOSE: Track when a staff member's role/position changes
-- USAGE: CALL record_role_change(staff_id, new_position, change_date)

CREATE OR REPLACE PROCEDURE record_role_change(
    p_staff_id INT,
    p_new_position VARCHAR,
    p_change_date DATE
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_previous_position VARCHAR;
BEGIN
    -- Get current position
    SELECT "position" INTO v_previous_position FROM staff WHERE staff_id = p_staff_id;
    
    IF v_previous_position IS NULL THEN
        RAISE EXCEPTION 'Staff member not found';
    END IF;
    
    -- Record the change
    INSERT INTO staff_role_history (staff_id, previous_position, new_position, change_date, created_at)
    VALUES (p_staff_id, v_previous_position, p_new_position, p_change_date, NOW());
    
    -- Update staff position
    UPDATE staff SET "position" = p_new_position WHERE staff_id = p_staff_id;
END;
$$;

-- ============================================================================
-- 6. TRIGGER: Prevent duplicate assignments
-- ============================================================================
-- PURPOSE: Prevent assigning a staff member to multiple departments at once
-- TRIGGERED: Before inserting into staff_department_assignment

CREATE OR REPLACE FUNCTION prevent_duplicate_assignments()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM staff_department_assignment 
        WHERE staff_id = NEW.staff_id 
        AND end_date IS NULL 
        AND dept_id != NEW.dept_id
    ) THEN
        RAISE EXCEPTION 'Staff member already assigned to another department';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_duplicate_assignments_trigger ON staff_department_assignment;
CREATE TRIGGER prevent_duplicate_assignments_trigger
BEFORE INSERT ON staff_department_assignment
FOR EACH ROW
EXECUTE FUNCTION prevent_duplicate_assignments();

-- ============================================================================
-- 7. TRIGGER: Update staff modified_at timestamp
-- ============================================================================
-- PURPOSE: Automatically update the 'updated_at' column when staff record is modified

CREATE OR REPLACE FUNCTION update_staff_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_staff_timestamp_trigger ON staff;
CREATE TRIGGER update_staff_timestamp_trigger
BEFORE UPDATE ON staff
FOR EACH ROW
EXECUTE FUNCTION update_staff_timestamp();

-- ============================================================================
-- 8. FUNCTION: Get Staff Workload (shifts assigned)
-- ============================================================================
-- PURPOSE: Get list of shifts assigned to a staff member for a specific week
-- USAGE: SELECT * FROM get_staff_workload(staff_id, week_date)

CREATE OR REPLACE FUNCTION get_staff_workload(p_staff_id INT, p_week_date DATE)
RETURNS TABLE(shift_id INT, ward_id INT, shift_type VARCHAR, week_commencing DATE) AS $$
BEGIN
    RETURN QUERY
    SELECT s.shift_id, s.ward_id, s.shift_type, s.week_commencing
    FROM shift s
    WHERE s.staff_id = p_staff_id 
    AND s.week_commencing = p_week_date
    ORDER BY s.week_commencing;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 9. PROCEDURE: Schedule Staff Shift
-- ============================================================================
-- PURPOSE: Assign a staff member to a shift in a ward
-- USAGE: CALL schedule_staff_shift(staff_id, ward_id, shift_type, week_commencing)

CREATE OR REPLACE PROCEDURE schedule_staff_shift(
    p_staff_id INT,
    p_ward_id INT,
    p_shift_type VARCHAR,
    p_week_commencing DATE
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Validate staff exists
    IF NOT EXISTS (SELECT 1 FROM staff WHERE staff_id = p_staff_id) THEN
        RAISE EXCEPTION 'Staff member not found';
    END IF;
    
    -- Validate ward exists
    IF NOT EXISTS (SELECT 1 FROM ward WHERE ward_id = p_ward_id) THEN
        RAISE EXCEPTION 'Ward not found';
    END IF;
    
    -- Insert shift
    INSERT INTO shift (staff_id, ward_id, shift_type, week_commencing, created_at, updated_at)
    VALUES (p_staff_id, p_ward_id, p_shift_type, p_week_commencing, NOW(), NOW());
END;
$$;

-- ============================================================================
-- 10. FUNCTION: Check if Staff Can Work (Validation)
-- ============================================================================
-- PURPOSE: Validate if staff can work based on employment status and qualifications
-- USAGE: SELECT validate_staff_can_work(staff_id)

CREATE OR REPLACE FUNCTION validate_staff_can_work(p_staff_id INT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if staff exists and has valid contract
    IF EXISTS (
        SELECT 1 FROM staff 
        WHERE staff_id = p_staff_id 
        AND contract_type IS NOT NULL
    ) THEN
        RETURN TRUE;
    END IF;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;
