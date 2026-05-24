// ============================================================================
// SUPABASE CONFIGURATION
// ============================================================================
// Replace YOUR_SUPABASE_URL and YOUR_SUPABASE_ANON_KEY with your actual credentials

const SUPABASE_URL = 'https://cgczzowbxhjpncngmhrb.supabase.co'; // e.g., https://yourproject.supabase.co
const SUPABASE_ANON_KEY = 'sb_publishable_gEQEaxJLcptRV-IA1Qlq8g_yBdknQwT'; // Your public anon key

const SUPABASE_REST_URL = `${SUPABASE_URL}/rest/v1`;
let lastSupabaseError = null;

// Supabase/PostgREST resolves unquoted identifiers to lowercase.
// Normalize incoming table names so calls like "WARD" still work.
function normalizeTableName(tableName) {
    return String(tableName || '').trim().toLowerCase();
}

// Table primary key mapping for update/delete helpers.
const TABLE_PRIMARY_KEYS = {
    staff: 'staff_id',
    department: 'dept_id',
    patient: 'patient_id',
    ward: 'ward_id',
    staff_department_assignment: 'assignment_id',
    staff_role_history: 'role_history_id',
    shift: 'shift_id'
};

function getPrimaryKeyColumn(tableName, fallback = 'id') {
    const normalizedTableName = normalizeTableName(tableName);
    return TABLE_PRIMARY_KEYS[normalizedTableName] || fallback;
}

function recordSupabaseError(error) {
    lastSupabaseError = error;
}

function clearSupabaseErrorState() {
    lastSupabaseError = null;
}

function getLastSupabaseError() {
    return lastSupabaseError;
}

async function getNextNumericId(tableName, idColumn) {
    const normalizedTableName = normalizeTableName(tableName);
    const encodedColumn = encodeURIComponent(idColumn);
    const data = await supabaseRestRequest(
        `${normalizedTableName}?select=${encodedColumn}&order=${encodedColumn}.desc&limit=1`
    );

    if (!Array.isArray(data) || data.length === 0) {
        return 1;
    }

    const maxId = Number(data[0][idColumn]);
    return Number.isFinite(maxId) ? maxId + 1 : 1;
}

function buildSupabaseRestHeaders(preferRepresentation = false) {
    const headers = {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
    };

    if (preferRepresentation) {
        headers.Prefer = 'return=representation';
    }

    return headers;
}

async function supabaseRestRequest(path, options = {}) {
    const { method = 'GET', body = null, preferRepresentation = false } = options;
    const response = await fetch(`${SUPABASE_REST_URL}/${path}`, {
        method,
        headers: buildSupabaseRestHeaders(preferRepresentation),
        body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
        let details = {};
        try {
            details = await response.json();
        } catch (_parseError) {
            details = { message: await response.text() };
        }

        const enrichedError = new Error(
            details.message || `Supabase request failed (${response.status})`
        );
        enrichedError.status = response.status;
        enrichedError.details = details;
        throw enrichedError;
    }

    if (response.status === 204) return null;
    return response.json();
}

// ============================================================================
// HELPER FUNCTIONS FOR COMMON OPERATIONS
// ============================================================================

// Get all records from a table
async function getAllRecords(tableName) {
    try {
        const normalizedTableName = normalizeTableName(tableName);
        const data = await supabaseRestRequest(`${normalizedTableName}?select=*`);
        return data || [];
    } catch (error) {
        recordSupabaseError(error);
        console.error(`Error fetching from ${tableName}:`, error, error.details || '');
        return [];
    }
}

// Insert a record
async function insertRecord(tableName, record) {
    try {
        const normalizedTableName = normalizeTableName(tableName);
        const data = await supabaseRestRequest(`${normalizedTableName}`, {
            method: 'POST',
            body: [record],
            preferRepresentation: true
        });

        console.log(`Record inserted into ${tableName}:`, data);
        return data ? data[0] : null;
    } catch (error) {
        recordSupabaseError(error);
        console.error(`Error inserting into ${tableName}:`, error, error.details || '');
        return null;
    }
}

// Update a record
async function updateRecord(tableName, id, updates) {
    try {
        const normalizedTableName = normalizeTableName(tableName);
        const idColumn = getPrimaryKeyColumn(normalizedTableName);
        const encodedFilter = `${encodeURIComponent(idColumn)}=eq.${encodeURIComponent(id)}`;
        const data = await supabaseRestRequest(`${normalizedTableName}?${encodedFilter}`, {
            method: 'PATCH',
            body: updates,
            preferRepresentation: true
        });

        console.log(`Record updated in ${tableName}:`, data);
        return data ? data[0] : null;
    } catch (error) {
        recordSupabaseError(error);
        console.error(`Error updating ${tableName}:`, error, error.details || '');
        return null;
    }
}

// Delete a record
async function deleteRecord(tableName, id) {
    try {
        const normalizedTableName = normalizeTableName(tableName);
        const idColumn = getPrimaryKeyColumn(normalizedTableName);
        const encodedFilter = `${encodeURIComponent(idColumn)}=eq.${encodeURIComponent(id)}`;
        await supabaseRestRequest(`${normalizedTableName}?${encodedFilter}`, {
            method: 'DELETE'
        });

        console.log(`Record deleted from ${tableName}`);
        return true;
    } catch (error) {
        recordSupabaseError(error);
        console.error(`Error deleting from ${tableName}:`, error, error.details || '');
        return false;
    }
}

// Get specific columns only
async function getRecords(tableName, columns = '*') {
    try {
        const normalizedTableName = normalizeTableName(tableName);
        const encodedColumns = encodeURIComponent(columns);
        const data = await supabaseRestRequest(`${normalizedTableName}?select=${encodedColumns}`);
        return data || [];
    } catch (error) {
        recordSupabaseError(error);
        console.error(`Error fetching from ${tableName}:`, error, error.details || '');
        return [];
    }
}

// Get records with where condition
async function getRecordsByCondition(tableName, column, value) {
    try {
        const normalizedTableName = normalizeTableName(tableName);
        const encodedFilter = `${encodeURIComponent(column)}=eq.${encodeURIComponent(value)}`;
        const data = await supabaseRestRequest(`${normalizedTableName}?select=*&${encodedFilter}`);
        return data || [];
    } catch (error) {
        recordSupabaseError(error);
        console.error(`Error fetching from ${tableName}:`, error, error.details || '');
        return [];
    }
}

// ============================================================================
// TABLE-SPECIFIC FUNCTIONS
// ============================================================================

// STAFF Operations
async function getAllStaff() {
    return await getAllRecords('staff');
}

async function addStaff(staffData) {
    const nextStaffId = await getNextNumericId('staff', 'staff_id');
    const recordPayload = {
        staff_id: nextStaffId,
        ward_id: staffData.ward_id || null,
        first_name: staffData.first_name,
        last_name: staffData.last_name,
        address: staffData.address || null,
        phone: staffData.phone || null,
        dob: staffData.dob || null,
        nin: staffData.nin || null,
        position: staffData.position,
        salary: staffData.salary || null,
        salary_scale: staffData.salary_scale || null,
        hours_per_week: staffData.hours_per_week || null,
        contract_type: staffData.contract_type || null,
        salary_payment_type: staffData.salary_payment_type || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    const inserted = await insertRecord('staff', recordPayload);
    if (inserted) return inserted;

    // Fallback: if INSERT succeeded but representation is empty, fetch by ID.
    const checkInserted = await getRecordsByCondition('staff', 'staff_id', nextStaffId);
    return checkInserted && checkInserted.length > 0 ? checkInserted[0] : null;
}

async function updateStaff(staffId, staffData) {
    return await updateRecord('staff', staffId, {
        first_name: staffData.first_name,
        last_name: staffData.last_name,
        address: staffData.address,
        phone: staffData.phone,
        dob: staffData.dob,
        nin: staffData.nin,
        position: staffData.position,
        salary: staffData.salary,
        salary_scale: staffData.salary_scale,
        hours_per_week: staffData.hours_per_week,
        contract_type: staffData.contract_type,
        salary_payment_type: staffData.salary_payment_type,
        ward_id: staffData.ward_id,
        updated_at: new Date().toISOString()
    });
}

async function deleteStaff(staffId) {
    return await deleteRecord('staff', staffId);
}

// DEPARTMENT Operations
async function getAllDepartments() {
    return await getAllRecords('department');
}

function parseDepartmentHeadStaffId(headValue) {
    if (headValue == null) return null;
    const s = String(headValue).trim();
    if (!s || !/^\d+$/.test(s)) return null;
    const n = parseInt(s, 10);
    return Number.isFinite(n) ? n : null;
}

function parseDepartmentBudget(budgetValue) {
    if (budgetValue === '' || budgetValue == null) return null;
    const n = parseFloat(budgetValue);
    return Number.isFinite(n) ? n : null;
}

async function addDepartment(deptData) {
    const rawId = deptData.dept_id;
    const deptId =
        rawId != null && String(rawId).trim() !== ''
            ? parseInt(String(rawId).trim(), 10)
            : await getNextNumericId('department', 'dept_id');
    if (!Number.isFinite(deptId)) {
        recordSupabaseError(new Error('Invalid department ID'));
        return null;
    }

    const staffId = parseDepartmentHeadStaffId(deptData.head);
    const budgetVal = parseDepartmentBudget(deptData.budget);
    const now = new Date().toISOString();

    // Matches wellmeadows_tables_sql_FIXED.sql (dept_id, dept_name, staff_id, budget, timestamps).
    const recordPayload = {
        dept_id: deptId,
        dept_name: deptData.name,
        staff_id: staffId,
        budget: budgetVal,
        created_at: now,
        updated_at: now
    };

    const inserted = await insertRecord('department', recordPayload);
    if (inserted) return inserted;

    const checkInserted = await getRecordsByCondition('department', 'dept_id', deptId);
    return checkInserted && checkInserted.length > 0 ? checkInserted[0] : null;
}

async function updateDepartment(deptId, deptData) {
    const staffId = parseDepartmentHeadStaffId(deptData.head);
    const budgetVal = parseDepartmentBudget(deptData.budget);
    return await updateRecord('department', deptId, {
        dept_name: deptData.name,
        staff_id: staffId,
        budget: budgetVal,
        updated_at: new Date().toISOString()
    });
}

async function deleteDepartment(deptId) {
    return await deleteRecord('department', deptId);
}

// PATIENT Operations
async function getAllPatients() {
    return await getAllRecords('patient');
}

async function addPatient(patientData) {
    const nextPatientId = await getNextNumericId('patient', 'patient_id');
    const recordPayload = {
        patient_id: nextPatientId,
        first_name: patientData.first_name,
        last_name: patientData.last_name,
        address: patientData.address || null,
        phone: patientData.phone || null,
        dob: patientData.dob,
        sex: patientData.sex || null,
        marital_status: patientData.marital_status || null,
        date_registered: patientData.date_registered || new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    const inserted = await insertRecord('patient', recordPayload);
    if (inserted) return inserted;

    // Fallback: if INSERT succeeded but representation is empty, fetch by ID
    const checkInserted = await getRecordsByCondition('patient', 'patient_id', nextPatientId);
    return checkInserted && checkInserted.length > 0 ? checkInserted[0] : null;
}

async function updatePatient(patientId, patientData) {
    return await updateRecord('patient', patientId, {
        first_name: patientData.first_name,
        last_name: patientData.last_name,
        address: patientData.address,
        phone: patientData.phone,
        dob: patientData.dob,
        sex: patientData.sex,
        marital_status: patientData.marital_status,
        date_registered: patientData.date_registered,
        updated_at: new Date().toISOString()
    });
}

async function deletePatient(patientId) {
    return await deleteRecord('patient', patientId);
}

// STAFF_DEPARTMENT_ASSIGNMENT Operations
async function getAllAssignments() {
    return await getAllRecords('staff_department_assignment');
}

async function addAssignment(assignmentData) {
    const nextAssignmentId = await getNextNumericId('staff_department_assignment', 'assignment_id');
    const timestamp = new Date().toISOString();
    return await insertRecord('staff_department_assignment', {
        assignment_id: nextAssignmentId,
        staff_id: assignmentData.staffId,
        dept_id: assignmentData.deptId,
        start_date: timestamp.split('T')[0],
        end_date: null,
        created_at: timestamp,
        updated_at: timestamp
    });
}

// SHIFT Operations
async function getAllShifts() {
    return await getAllRecords('shift');
}

async function addShift(shiftData) {
    return await insertRecord('shift', {
        shift_id: null,
        staff_id: shiftData.staffId,
        shift_type: shiftData.shiftType,
        week_commencing: shiftData.weekDate,
        created_at: new Date().toISOString()
    });
}

// ============================================================================
// STAFF DEPARTMENT ASSIGNMENT Operations
// ============================================================================

async function getActiveAssignments() {
    try {
        const data = await supabaseRestRequest('staff_department_assignment?select=assignment_id,staff_id,dept_id,start_date,end_date&end_date=is.null&order=start_date.desc');
        
        // Enrich with staff and department details
        if (data && Array.isArray(data)) {
            const enriched = await Promise.all(data.map(async (assignment) => {
                const staff = await getRecordsByCondition('staff', 'staff_id', assignment.staff_id);
                const dept = await getRecordsByCondition('department', 'dept_id', assignment.dept_id);
                return {
                    ...assignment,
                    staff: staff && staff.length > 0 ? staff[0] : null,
                    department: dept && dept.length > 0 ? dept[0] : null
                };
            }));
            return enriched;
        }
        return [];
    } catch (error) {
        console.error('Error fetching assignments:', error);
        recordSupabaseError(error);
        return [];
    }
}

async function assignStaffToDepartment(staffId, deptId, startDate) {
    try {
        // Check if staff is already assigned (currently active)
        const existing = await supabaseRestRequest(
            `staff_department_assignment?select=assignment_id&staff_id=eq.${staffId}&end_date=is.null`
        );
        
        if (existing && existing.length > 0) {
            // End previous assignment
            const previousId = existing[0].assignment_id;
            await supabaseRestRequest(
                `staff_department_assignment?assignment_id=eq.${previousId}`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({
                        end_date: new Date().toISOString()
                    }),
                    headers: buildSupabaseRestHeaders()
                }
            );
        }
        
        // Create new assignment
        const result = await insertRecord('staff_department_assignment', {
            staff_id: staffId,
            dept_id: deptId,
            start_date: startDate,
            end_date: null,
            created_at: new Date().toISOString()
        });
        
        return result;
    } catch (error) {
        console.error('Error assigning staff:', error);
        recordSupabaseError(error);
        return null;
    }
}

async function endStaffAssignment(assignmentId, endDate) {
    try {
        const result = await updateRecord('staff_department_assignment', assignmentId, {
            end_date: endDate
        });
        return result;
    } catch (error) {
        console.error('Error ending assignment:', error);
        recordSupabaseError(error);
        return null;
    }
}

// ============================================================================
// TEST CONNECTION FUNCTION
// ============================================================================

async function testConnection() {
    try {
        console.log('Testing Supabase connection...');
        await supabaseRestRequest('staff?select=staff_id&limit=1');
        console.log('✅ Supabase connection successful!');
        return true;
    } catch (error) {
        console.error('Connection test error:', error, error.details || '');
        if (error.status === 401) {
            console.warn('Supabase returned 401. Check API key and RLS policies for anon access.');
        }
        return false;
    }
}

// Run connection test on load
window.addEventListener('load', async () => {
    await testConnection();
});

// ============================================================================
// INITIALIZE SUPABASE CLIENT
// ============================================================================
// This creates the window.supabaseClient instance that other scripts depend on
// With retry logic to ensure the library is loaded

function initializeSupabaseClient() {
    if (window.supabaseClient) {
        return true; // Already initialized
    }
    
    if (window.supabase && window.supabase.createClient) {
        try {
            window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('✓ Supabase client initialized successfully');
            console.log('URL:', SUPABASE_URL);
            return true;
        } catch (e) {
            console.error('✗ Error creating Supabase client:', e);
            return false;
        }
    }
    return false;
}

// Try to initialize immediately
if (!initializeSupabaseClient()) {
    // If not available immediately, wait for it with retries
    let retries = 0;
    const maxRetries = 20; // Try for up to 2 seconds (20 * 100ms)
    
    const retryInit = setInterval(() => {
        retries++;
        if (initializeSupabaseClient()) {
            clearInterval(retryInit);
        } else if (retries >= maxRetries) {
            clearInterval(retryInit);
            console.error('✗ Failed to initialize Supabase client after retries');
            console.error('  Window.supabase:', window.supabase);
            console.error('  Make sure the Supabase CDN script loaded before this config file');
        }
    }, 100);
}
