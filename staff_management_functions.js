// ============================================================================
// WELLMEADOWS STAFF MANAGEMENT - FRONTEND JAVASCRIPT FUNCTIONS
// ============================================================================
// Add these functions to your staff management pages

// ============================================================================
// 1. FUNCTION: Assign Staff to Department
// ============================================================================
// PURPOSE: Assign selected staff member to department with validation
// CALLS: Backend procedure

async function assignStaffToDepartment(staffId, deptId, startDate) {
    try {
        if (!staffId || !deptId || !startDate) {
            alert('❌ Please provide staff ID, department, and start date');
            return false;
        }
        
        // Call Supabase stored procedure
        const { data, error } = await supabaseClient.rpc('assign_staff_to_department', {
            p_staff_id: parseInt(staffId),
            p_dept_id: parseInt(deptId),
            p_start_date: startDate
        });
        
        if (error) {
            alert('❌ Error assigning staff: ' + error.message);
            return false;
        }
        
        alert('✅ Staff assigned to department successfully');
        return true;
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error: ' + error.message);
        return false;
    }
}

// ============================================================================
// 2. FUNCTION: Get All Staff in a Department
// ============================================================================
// PURPOSE: Retrieve list of staff currently assigned to a department
// CALLS: Backend function

async function getStaffByDepartment(deptId) {
    try {
        if (!deptId) {
            console.error('Department ID required');
            return [];
        }
        
        const { data, error } = await supabaseClient.rpc('get_staff_by_department', {
            p_dept_id: parseInt(deptId)
        });
        
        if (error) {
            console.error('Error fetching staff:', error);
            return [];
        }
        
        console.log(`Found ${data.length} staff in department ${deptId}`);
        return data || [];
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

// ============================================================================
// 3. FUNCTION: Get Staff Count by Position
// ============================================================================
// PURPOSE: Get statistics showing how many staff in each position (for dashboard)
// CALLS: Backend function

async function getStaffByPosition() {
    try {
        const { data, error } = await supabaseClient.rpc('count_staff_by_position');
        
        if (error) {
            console.error('Error fetching staff by position:', error);
            return [];
        }
        
        return data || [];
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

// ============================================================================
// 4. FUNCTION: Record Staff Role Change
// ============================================================================
// PURPOSE: Log when staff member's role/position is updated
// CALLS: Backend procedure

async function recordRoleChange(staffId, newPosition, changeDate) {
    try {
        if (!staffId || !newPosition || !changeDate) {
            alert('❌ Please provide staff ID, new position, and change date');
            return false;
        }
        
        const { data, error } = await supabaseClient.rpc('record_role_change', {
            p_staff_id: parseInt(staffId),
            p_new_position: newPosition,
            p_change_date: changeDate
        });
        
        if (error) {
            alert('❌ Error recording role change: ' + error.message);
            return false;
        }
        
        alert('✅ Role change recorded successfully');
        return true;
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error: ' + error.message);
        return false;
    }
}

// ============================================================================
// 5. FUNCTION: Check Staff Availability
// ============================================================================
// PURPOSE: Verify if a staff member is available for assignment
// RETURNS: true if available, false if already assigned

async function checkStaffAvailability(staffId) {
    try {
        const { data, error } = await supabaseClient.rpc('check_staff_availability', {
            p_staff_id: parseInt(staffId)
        });
        
        if (error) {
            console.error('Error checking availability:', error);
            return false;
        }
        
        return data;
    } catch (error) {
        console.error('Error:', error);
        return false;
    }
}

// ============================================================================
// 6. FUNCTION: Schedule Staff Shift
// ============================================================================
// PURPOSE: Schedule a staff member to work a specific shift in a ward
// CALLS: Backend procedure

async function scheduleStaffShift(staffId, wardId, shiftType, weekCommencing) {
    try {
        if (!staffId || !wardId || !shiftType || !weekCommencing) {
            alert('❌ Please provide all shift details');
            return false;
        }
        
        // Validate shift type
        const validShifts = ['Morning', 'Afternoon', 'Night', 'On-call'];
        if (!validShifts.includes(shiftType)) {
            alert('❌ Invalid shift type. Must be: ' + validShifts.join(', '));
            return false;
        }
        
        const { data, error } = await supabaseClient.rpc('schedule_staff_shift', {
            p_staff_id: parseInt(staffId),
            p_ward_id: parseInt(wardId),
            p_shift_type: shiftType,
            p_week_commencing: weekCommencing
        });
        
        if (error) {
            alert('❌ Error scheduling shift: ' + error.message);
            return false;
        }
        
        alert('✅ Shift scheduled successfully');
        return true;
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error: ' + error.message);
        return false;
    }
}

// ============================================================================
// 7. FUNCTION: Get Staff Workload for Week
// ============================================================================
// PURPOSE: Display all shifts scheduled for a staff member in a specific week
// CALLS: Backend function

async function getStaffWorkload(staffId, weekDate) {
    try {
        if (!staffId || !weekDate) {
            console.error('Staff ID and week date required');
            return [];
        }
        
        const { data, error } = await supabaseClient.rpc('get_staff_workload', {
            p_staff_id: parseInt(staffId),
            p_week_date: weekDate
        });
        
        if (error) {
            console.error('Error fetching workload:', error);
            return [];
        }
        
        return data || [];
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

// ============================================================================
// 8. FUNCTION: Validate Staff Can Work
// ============================================================================
// PURPOSE: Check if staff member is eligible to work (contract, status, etc)
// RETURNS: true if can work, false if restricted

async function validateStaffCanWork(staffId) {
    try {
        const { data, error } = await supabaseClient.rpc('validate_staff_can_work', {
            p_staff_id: parseInt(staffId)
        });
        
        if (error) {
            console.error('Error validating staff:', error);
            return false;
        }
        
        return data;
    } catch (error) {
        console.error('Error:', error);
        return false;
    }
}

// ============================================================================
// 9. FUNCTION: Get Staff Role History
// ============================================================================
// PURPOSE: Display all role changes for a staff member (audit trail)

async function getStaffRoleHistory(staffId) {
    try {
        const { data, error } = await supabaseClient
            .from('staff_role_history')
            .select('*')
            .eq('staff_id', staffId)
            .order('change_date', { ascending: false });
        
        if (error) {
            console.error('Error fetching role history:', error);
            return [];
        }
        
        return data || [];
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

// ============================================================================
// 10. FUNCTION: Get Active Assignments
// ============================================================================
// PURPOSE: List all current staff-department assignments

async function getActiveAssignments() {
    try {
        const { data, error } = await supabaseClient
            .from('staff_department_assignment')
            .select(`
                assignment_id,
                staff_id,
                dept_id,
                start_date,
                staff (first_name, last_name, position),
                department (dept_name)
            `)
            .is('end_date', null)
            .order('start_date', { ascending: false });
        
        if (error) {
            console.error('Error fetching assignments:', error);
            return [];
        }
        
        return data || [];
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

// ============================================================================
// 11. FUNCTION: End Staff Assignment
// ============================================================================
// PURPOSE: Terminate a staff member's assignment to a department
// USAGE: Call when staff is transferred or leaves department

async function endStaffAssignment(assignmentId, endDate) {
    try {
        if (!assignmentId || !endDate) {
            alert('❌ Please provide assignment ID and end date');
            return false;
        }
        
        const { data, error } = await supabaseClient
            .from('staff_department_assignment')
            .update({ end_date: endDate, updated_at: new Date().toISOString() })
            .eq('assignment_id', assignmentId);
        
        if (error) {
            alert('❌ Error ending assignment: ' + error.message);
            return false;
        }
        
        alert('✅ Assignment ended successfully');
        return true;
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error: ' + error.message);
        return false;
    }
}

// ============================================================================
// 12. FUNCTION: Generate Staff Report
// ============================================================================
// PURPOSE: Create summary report of staff distribution and workload
// RETURNS: Formatted report data

async function generateStaffReport() {
    try {
        const staffByPosition = await getStaffByPosition();
        const allStaff = await getAllStaff();
        const assignments = await getActiveAssignments();
        
        const report = {
            totalStaff: allStaff.length,
            staffByPosition: staffByPosition,
            activeAssignments: assignments.length,
            averageAssignmentsPerStaff: (assignments.length / allStaff.length).toFixed(2),
            generatedAt: new Date().toISOString()
        };
        
        return report;
    } catch (error) {
        console.error('Error generating report:', error);
        return null;
    }
}

// Initialize Supabase client reference
// Assumes supabase-config.js has already loaded and initialized the client
// If not available, you may need to initialize it:
// const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
