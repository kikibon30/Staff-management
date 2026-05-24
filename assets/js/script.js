// ============================================
// WELLMEADOWS HOSPITAL MANAGEMENT SYSTEM
// Main Application Logic
// ============================================

// Global State
let staffRecords = [];
let departments = [];
let wards = [];
let staffAssignments = [];
let staffSchedules = [];
let staffRoles = [];
let patientResponsibilities = [];
let lastSupabaseError = null;

// Supabase Helper Functions
function getLastSupabaseError() { return lastSupabaseError; }
function clearSupabaseErrorState() { lastSupabaseError = null; }

async function getAllStaff() {
    try {
        const { data, error } = await window.supabaseClient.from('STAFF').select('*');
        if (error) throw error;
        return data || [];
    } catch(e) { lastSupabaseError = e; return []; }
}

async function getAllDepartments() {
    try {
        const { data, error } = await window.supabaseClient.from('DEPARTMENT').select('*');
        if (error) throw error;
        return data || [];
    } catch(e) { lastSupabaseError = e; return []; }
}

async function getAllRecords(table) {
    try {
        const { data, error } = await window.supabaseClient.from(table.toUpperCase()).select('*');
        if (error) throw error;
        return data || [];
    } catch(e) { lastSupabaseError = e; return []; }
}

async function getActiveAssignments() {
    try {
        const { data, error } = await window.supabaseClient.from('STAFF_DEPARTMENT').select('*');
        if (error) throw error;
        return data || [];
    } catch(e) { lastSupabaseError = e; return []; }
}

async function addStaff(staff) {
    try {
        const { data, error } = await window.supabaseClient.from('STAFF').insert([{
            first_name: staff.firstName,
            last_name: staff.lastName,
            position: staff.position,
            phone: staff.phone || null
        }]).select();
        if (error) throw error;
        return data?.[0] || null;
    } catch(e) { lastSupabaseError = e; return null; }
}

async function updateStaff(id, updates) {
    try {
        const { data, error } = await window.supabaseClient.from('STAFF').update({
            first_name: updates.firstName,
            last_name: updates.lastName,
            position: updates.position,
            phone: updates.phone
        }).eq('staff_id', id).select();
        if (error) throw error;
        return data?.[0] || null;
    } catch(e) { lastSupabaseError = e; return null; }
}

async function deleteStaff(id) {
    try {
        const { error } = await window.supabaseClient.from('STAFF').delete().eq('staff_id', id);
        if (error) throw error;
        return true;
    } catch(e) { lastSupabaseError = e; return false; }
}

async function addAssignment(assign) {
    try {
        const payload = { staff_id: assign.staffId, dept_id: assign.deptId };
        if (assign.wardId) payload.ward_id = assign.wardId;
        const { data, error } = await window.supabaseClient.from('STAFF_DEPARTMENT').insert([payload]).select();
        if (error) throw error;
        return data?.[0] || null;
    } catch(e) { lastSupabaseError = e; return null; }
}

async function addShift(shift) {
    try {
        const { data, error } = await window.supabaseClient.from('STAFF_SCHEDULE').insert([{
            staff_id: shift.staffId,
            shift_type: shift.shiftType,
            week_date: shift.weekDate
        }]).select();
        if (error) throw error;
        return data?.[0];
    } catch(e) { lastSupabaseError = e; return null; }
}

async function insertRecord(table, record) {
    try {
        const { data, error } = await window.supabaseClient.from(table).insert([record]).select();
        if (error) throw error;
        return data?.[0];
    } catch(e) { lastSupabaseError = e; return null; }
}

// Data Loading
async function loadDataFromSupabase() {
    console.log('Loading data from Supabase...');
    try {
        clearSupabaseErrorState();
        const [staff, depts, wardData, assignments, schedules, roles] = await Promise.all([
            getAllStaff(),
            getAllDepartments(),
            getAllRecords('ward'),
            getActiveAssignments(),
            getAllRecords('staff_schedule'),
            getAllRecords('staff_role_history')
        ]);
        
        if (getLastSupabaseError()) throw getLastSupabaseError();
        
        staffRecords = staff || [];
        departments = depts || [];
        wards = wardData || [];
        staffAssignments = assignments || [];
        staffSchedules = schedules || [];
        staffRoles = roles || [];
        
        console.log('Data loaded successfully');
        refreshUI();
    } catch(e) {
        console.error('Error loading data:', e);
        alert('Could not load data from Supabase. Please check your connection and credentials.');
    }
}

// UI Rendering Functions
function refreshUI() {
    renderStaffTable();
    renderAssignments();
    renderSchedulesAndRoles();
    renderPatientCareList();
    populateDropdowns();
}

function renderStaffTable() {
    const tbody = document.getElementById('staffTable');
    if (staffRecords.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No staff records found</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    staffRecords.forEach(staff => {
        const row = tbody.insertRow();
        const name = `${staff.first_name || ''} ${staff.last_name || ''}`.trim();
        row.insertCell(0).innerText = name || 'Unnamed';
        row.insertCell(1).innerText = staff.position || '-';
        row.insertCell(2).innerText = staff.phone || '-';
        
        const actionsCell = row.insertCell(3);
        actionsCell.className = 'action-icons';
        actionsCell.innerHTML = `
            <i class="fas fa-edit" onclick="editStaff(${staff.staff_id})"></i>
            <i class="fas fa-trash-alt" onclick="deleteStaffRecord(${staff.staff_id})"></i>
        `;
    });
}

window.editStaff = function(id) {
    const staff = staffRecords.find(s => s.staff_id === id);
    if (staff) {
        document.getElementById('staffId').value = staff.staff_id;
        document.getElementById('staffName').value = `${staff.first_name} ${staff.last_name}`;
        document.getElementById('staffType').value = staff.position || 'Doctor';
        document.getElementById('staffContact').value = staff.phone || '';
    }
};

window.deleteStaffRecord = async function(id) {
    if (confirm('Delete this staff member? This action cannot be undone.')) {
        const success = await deleteStaff(id);
        if (success) {
            staffRecords = staffRecords.filter(s => s.staff_id !== id);
            refreshUI();
            alert('Staff member deleted successfully');
        } else {
            alert('Error deleting staff member');
        }
    }
};

function renderAssignments() {
    const container = document.getElementById('assignmentList');
    if (staffAssignments.length === 0) {
        container.innerHTML = '<div class="empty-state">No assignments yet</div>';
        return;
    }
    
    let html = '';
    staffAssignments.forEach(ass => {
        const staff = staffRecords.find(s => s.staff_id === ass.staff_id);
        const dept = departments.find(d => d.dept_id === ass.dept_id);
        const staffName = staff ? `${staff.first_name} ${staff.last_name}` : 'Unknown';
        const deptName = dept ? dept.dept_name : 'None';
        html += `
            <div class="assignment-item">
                <div class="assignment-info">
                    <strong>${escapeHtml(staffName)}</strong>
                    <div class="assignment-dept">Department: ${escapeHtml(deptName)}</div>
                </div>
                <i class="fas fa-trash-alt delete-icon" onclick="deleteAssignmentRecord(${ass.assignment_id})"></i>
            </div>
        `;
    });
    container.innerHTML = html;
}

window.deleteAssignmentRecord = function(id) {
    staffAssignments = staffAssignments.filter(a => a.assignment_id !== id);
    refreshUI();
};

function renderSchedulesAndRoles() {
    const container = document.getElementById('scheduleList');
    if (staffSchedules.length === 0 && staffRoles.length === 0) {
        container.innerHTML = '<div class="empty-state">No schedules or role history yet</div>';
        return;
    }
    
    let html = '';
    if (staffSchedules.length > 0) {
        html += '<strong style="display:block; margin-bottom:8px;">Current Shifts</strong>';
        staffSchedules.slice(-5).forEach(s => {
            const staff = staffRecords.find(st => st.staff_id === s.staff_id);
            const staffName = staff ? `${staff.first_name} ${staff.last_name}` : 'Staff';
            html += `<div class="assignment-item"><span>${escapeHtml(staffName)} → ${escapeHtml(s.shift_type)}</span></div>`;
        });
    }
    
    if (staffRoles.length > 0) {
        if (html) html += '<hr class="divider">';
        html += '<strong style="display:block; margin-bottom:8px;">Recent Role Changes</strong>';
        staffRoles.slice(-5).forEach(r => {
            const staff = staffRecords.find(st => st.staff_id === r.staff_id);
            const staffName = staff ? `${staff.first_name} ${staff.last_name}` : 'Staff';
            html += `<div class="assignment-item"><span>${escapeHtml(staffName)} → "${escapeHtml(r.new_position)}"</span></div>`;
        });
    }
    
    container.innerHTML = html;
}

function renderPatientCareList() {
    const container = document.getElementById('careList');
    if (patientResponsibilities.length === 0) {
        container.innerHTML = '<div class="empty-state">No patient care responsibilities assigned</div>';
        return;
    }
    
    let html = '';
    patientResponsibilities.slice().reverse().forEach(resp => {
        const staff = staffRecords.find(s => s.staff_id === resp.staffId);
        const staffName = staff ? `${staff.first_name} ${staff.last_name}` : 'Staff';
        const staffType = staff ? staff.position : '';
        html += `
            <div class="resp-item">
                <div class="resp-staff">
                    <i class="fas fa-user-circle"></i> ${escapeHtml(staffName)} (${escapeHtml(staffType)})
                </div>
                <div class="resp-patient"><i class="fas fa-user-injured"></i> Patient: ${escapeHtml(resp.patientName)}</div>
                <div class="resp-task"><i class="fas fa-clipboard-list"></i> ${escapeHtml(resp.task)}</div>
                <div class="resp-date">Assigned: ${resp.date}</div>
                <span class="resp-remove" onclick="deleteResponsibility(${resp.id})">Remove</span>
            </div>
        `;
    });
    container.innerHTML = html;
}

window.deleteResponsibility = function(id) {
    patientResponsibilities = patientResponsibilities.filter(p => p.id !== id);
    refreshUI();
};

function populateDropdowns() {
    const staffSelects = ['assignStaff', 'scheduleStaff', 'careStaff'];
    staffSelects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            let options = '<option value="">-- Select Staff --</option>';
            staffRecords.forEach(s => {
                const name = `${s.first_name} ${s.last_name}`;
                options += `<option value="${s.staff_id}">${escapeHtml(name)} (${escapeHtml(s.position || '')})</option>`;
            });
            select.innerHTML = options;
        }
    });
    
    const deptSelect = document.getElementById('assignDept');
    if (deptSelect) {
        let options = '<option value="">-- Select Department --</option>';
        departments.forEach(d => {
            options += `<option value="${d.dept_id}">${escapeHtml(d.dept_name)}</option>`;
        });
        deptSelect.innerHTML = options;
    }
    
    const wardSelect = document.getElementById('assignWard');
    if (wardSelect) {
        let options = '<option value="">-- None --</option>';
        wards.forEach(w => {
            options += `<option value="${w.ward_id}">${escapeHtml(w.ward_name)}</option>`;
        });
        wardSelect.innerHTML = options;
    }
}

// Helper function to escape HTML
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Event Handlers
document.getElementById('staffForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('staffId').value;
    const fullName = document.getElementById('staffName').value.trim();
    const nameParts = fullName.split(' ').filter(Boolean);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '-';
    const position = document.getElementById('staffType').value;
    const phone = document.getElementById('staffContact').value.trim();
    
    if (!fullName) return alert('Please enter staff name');
    
    try {
        if (id) {
            const updated = await updateStaff(parseInt(id), { firstName, lastName, position, phone });
            if (updated) {
                const index = staffRecords.findIndex(s => s.staff_id === parseInt(id));
                if (index !== -1) staffRecords[index] = updated;
                alert('Staff updated successfully');
            }
        } else {
            const newStaff = await addStaff({ firstName, lastName, position, phone });
            if (newStaff) {
                staffRecords.push(newStaff);
                alert('Staff added successfully');
            } else {
                alert('Could not add staff');
                return;
            }
        }
        
        document.getElementById('staffForm').reset();
        document.getElementById('staffId').value = '';
        refreshUI();
    } catch (error) {
        console.error('Error:', error);
        alert('Error saving staff: ' + error.message);
    }
});

document.getElementById('clearBtn').addEventListener('click', () => {
    document.getElementById('staffForm').reset();
    document.getElementById('staffId').value = '';
});

document.getElementById('assignBtn').addEventListener('click', async () => {
    const staffId = parseInt(document.getElementById('assignStaff').value);
    const deptId = parseInt(document.getElementById('assignDept').value);
    const wardId = parseInt(document.getElementById('assignWard').value);
    
    if (!staffId || !deptId) return alert('Please select staff and department');
    
    try {
        const newAssignment = await addAssignment({ staffId, deptId, wardId: Number.isFinite(wardId) ? wardId : null });
        if (newAssignment) {
            staffAssignments.push(newAssignment);
            alert('Assignment created successfully');
            refreshUI();
        } else {
            alert('Could not create assignment');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error creating assignment');
    }
});

document.getElementById('scheduleBtn').addEventListener('click', async () => {
    const staffId = parseInt(document.getElementById('scheduleStaff').value);
    const shiftType = document.getElementById('shiftSelect').value;
    const newRole = document.getElementById('newRole').value.trim();
    
    if (!staffId) return alert('Please select a staff member');
    
    try {
        const shift = await addShift({ staffId, shiftType, weekDate: new Date().toISOString().split('T')[0] });
        if (shift) staffSchedules.push(shift);
        
        if (newRole) {
            const roleData = {
                staff_id: staffId,
                new_position: newRole,
                previous_position: 'Unknown',
                change_date: new Date().toISOString().split('T')[0]
            };
            const role = await insertRecord('STAFF_ROLE_HISTORY', roleData);
            if (role) staffRoles.push(role);
        }
        
        document.getElementById('newRole').value = '';
        alert('Schedule saved successfully');
        refreshUI();
    } catch (error) {
        console.error('Error:', error);
        alert('Error saving schedule');
    }
});

document.getElementById('trackCareBtn').addEventListener('click', () => {
    const staffId = parseInt(document.getElementById('careStaff').value);
    const patientName = document.getElementById('patientName').value.trim();
    const task = document.getElementById('careTask').value.trim();
    
    if (!staffId || !patientName || !task) {
        return alert('Please select staff, enter patient name, and describe the responsibility');
    }
    
    const newId = patientResponsibilities.length ? Math.max(...patientResponsibilities.map(p => p.id)) + 1 : 1;
    patientResponsibilities.push({
        id: newId,
        staffId: staffId,
        patientName: patientName,
        task: task,
        date: new Date().toLocaleString()
    });
    
    document.getElementById('patientName').value = '';
    document.getElementById('careTask').value = '';
    alert('Responsibility assigned');
    refreshUI();
});

// Initialize application
window.addEventListener('DOMContentLoaded', loadDataFromSupabase);
console.log('Wellmeadows Hospital Management System initialized');