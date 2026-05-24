// ============================================
// DEPARTMENT MANAGEMENT MODULE
// Complete CRUD Operations with Supabase
// ============================================

// Global State
let departments = [];
let staffMembers = [];
let lastSupabaseError = null;

// ============================================
// SUPABASE HELPER FUNCTIONS
// ============================================
function getLastSupabaseError() { return lastSupabaseError; }
function clearSupabaseErrorState() { lastSupabaseError = null; }

async function getAllDepartments() {
    try {
        const { data, error } = await window.supabaseClient.from('department').select('*');
        if (error) throw error;
        return data || [];
    } catch(e) { lastSupabaseError = e; return []; }
}

async function getAllStaff() {
    try {
        const { data, error } = await window.supabaseClient.from('staff').select('staff_id, first_name, last_name, position, phone');
        if (error) throw error;
        return data || [];
    } catch(e) { lastSupabaseError = e; return []; }
}

async function addDepartment(deptData) {
    try {
        const payload = {
            dept_name: deptData.name,
            dept_location: deptData.location || null,
            staff_id: deptData.head ? parseInt(deptData.head) : null,
            dept_phone: deptData.phone || null,
            budget: deptData.budget ? parseFloat(deptData.budget) : null,
            description: deptData.description || null,
            established_date: deptData.established || null
        };
        
        const { data, error } = await window.supabaseClient
            .from('department')
            .insert([payload])
            .select();
        if (error) throw error;
        return data?.[0] || null;
    } catch(e) { lastSupabaseError = e; return null; }
}

async function updateDepartment(id, deptData) {
    try {
        const payload = {
            dept_name: deptData.name,
            dept_location: deptData.location || null,
            staff_id: deptData.head ? parseInt(deptData.head) : null,
            dept_phone: deptData.phone || null,
            budget: deptData.budget ? parseFloat(deptData.budget) : null,
            description: deptData.description || null,
            established_date: deptData.established || null
        };
        
        const { data, error } = await window.supabaseClient
            .from('department')
            .update(payload)
            .eq('dept_id', id)
            .select();
        if (error) throw error;
        return data?.[0] || null;
    } catch(e) { lastSupabaseError = e; return null; }
}

async function deleteDepartment(id) {
    try {
        const { error } = await window.supabaseClient
            .from('department')
            .delete()
            .eq('dept_id', id);
        if (error) throw error;
        return true;
    } catch(e) { lastSupabaseError = e; return false; }
}

// ============================================
// RENDER FUNCTIONS
// ============================================
function renderDepartmentsTable() {
    const tbody = document.getElementById('deptTable');
    if (departments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No departments found</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    departments.forEach(dept => {
        const row = tbody.insertRow();
        row.insertCell(0).innerText = dept.dept_id || '-';
        row.insertCell(1).innerText = dept.dept_name || '-';
        row.insertCell(2).innerText = dept.dept_location || '-';
        row.insertCell(3).innerText = dept.staff_id || '-';
        row.insertCell(4).innerText = dept.dept_phone || '-';
        
        const actionsCell = row.insertCell(5);
        actionsCell.className = 'action-buttons';
        actionsCell.innerHTML = `
            <span class="action-edit" data-id="${dept.dept_id}">Edit</span>
            <span class="action-delete" data-id="${dept.dept_id}">Delete</span>
        `;
    });
    
    // Attach event listeners
    document.querySelectorAll('#deptTable .action-edit').forEach(btn => {
        btn.addEventListener('click', () => editDepartment(parseInt(btn.dataset.id)));
    });
    document.querySelectorAll('#deptTable .action-delete').forEach(btn => {
        btn.addEventListener('click', () => deleteDepartmentRecord(parseInt(btn.dataset.id)));
    });
}

function renderStaffReference() {
    const tbody = document.getElementById('staffReferenceTable');
    if (staffMembers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No staff members found</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    staffMembers.slice(0, 10).forEach(staff => {
        const row = tbody.insertRow();
        row.insertCell(0).innerText = staff.staff_id || '-';
        row.insertCell(1).innerText = `${staff.first_name || ''} ${staff.last_name || ''}`.trim();
        row.insertCell(2).innerText = staff.position || '-';
        row.insertCell(3).innerText = staff.phone || '-';
    });
    
    if (staffMembers.length > 10) {
        const row = tbody.insertRow();
        const cell = row.insertCell(0);
        cell.colSpan = 4;
        cell.className = 'empty-state';
        cell.innerText = `+ ${staffMembers.length - 10} more staff members`;
        cell.style.textAlign = 'center';
    }
}

function editDepartment(deptId) {
    const dept = departments.find(d => d.dept_id === deptId);
    if (!dept) return;
    
    document.getElementById('deptId').value = dept.dept_id;
    document.getElementById('deptIdInput').value = dept.dept_id;
    document.getElementById('deptName').value = dept.dept_name || '';
    document.getElementById('deptLocation').value = dept.dept_location || '';
    document.getElementById('deptHead').value = dept.staff_id || '';
    document.getElementById('deptPhone').value = dept.dept_phone || '';
    document.getElementById('deptBudget').value = dept.budget || '';
    document.getElementById('deptDesc').value = dept.description || '';
    document.getElementById('deptEstablished').value = dept.established_date || '';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteDepartmentRecord(deptId) {
    if (!confirm('Are you sure you want to delete this department? This action cannot be undone.')) return;
    
    const success = await deleteDepartment(deptId);
    if (success) {
        departments = departments.filter(d => d.dept_id !== deptId);
        renderDepartmentsTable();
        alert('Department deleted successfully');
    } else {
        const err = getLastSupabaseError();
        alert('Could not delete department: ' + (err?.message || 'Unknown error'));
    }
}

// ============================================
// DATA LOADING
// ============================================
async function loadDepartments() {
    // Wait for Supabase client
    let retries = 0;
    while (!window.supabaseClient && retries < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
    }
    
    if (!window.supabaseClient) {
        alert('Error: Could not connect to Supabase');
        return;
    }
    
    try {
        clearSupabaseErrorState();
        const data = await getAllDepartments();
        if (getLastSupabaseError()) throw getLastSupabaseError();
        departments = data || [];
        renderDepartmentsTable();
    } catch (error) {
        console.error('Error loading departments:', error);
        alert('Could not load departments from Supabase: ' + (error.message || error));
    }
}

async function loadStaffReference() {
    // Wait for Supabase client
    let retries = 0;
    while (!window.supabaseClient && retries < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
    }
    
    if (!window.supabaseClient) {
        return;
    }
    
    try {
        const data = await getAllStaff();
        staffMembers = data || [];
        renderStaffReference();
    } catch (error) {
        console.error('Error loading staff:', error);
    }
}

// ============================================
// FORM HANDLERS
// ============================================
document.getElementById('deptForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const editingId = document.getElementById('deptId').value;
    const deptData = {
        name: document.getElementById('deptName').value.trim(),
        location: document.getElementById('deptLocation').value.trim(),
        head: document.getElementById('deptHead').value.trim(),
        phone: document.getElementById('deptPhone').value.trim(),
        budget: document.getElementById('deptBudget').value,
        description: document.getElementById('deptDesc').value.trim(),
        established: document.getElementById('deptEstablished').value
    };
    
    if (!deptData.name) {
        alert('Please enter department name');
        return;
    }
    
    clearSupabaseErrorState();
    
    try {
        if (editingId) {
            const updated = await updateDepartment(parseInt(editingId), deptData);
            if (updated) {
                const index = departments.findIndex(d => d.dept_id === updated.dept_id);
                if (index !== -1) departments[index] = updated;
                alert('Department updated successfully');
            } else {
                const err = getLastSupabaseError();
                alert('Could not update department: ' + (err?.message || 'Unknown error'));
                return;
            }
        } else {
            const created = await addDepartment(deptData);
            if (created) {
                departments.push(created);
                alert('Department added successfully');
            } else {
                const err = getLastSupabaseError();
                alert('Could not add department: ' + (err?.message || 'Unknown error'));
                return;
            }
        }
        
        // Reset form and refresh
        document.getElementById('deptForm').reset();
        document.getElementById('deptId').value = '';
        document.getElementById('deptIdInput').value = '';
        renderDepartmentsTable();
        
    } catch (error) {
        console.error('Error saving department:', error);
        alert('Error saving department: ' + error.message);
    }
});

document.getElementById('clearBtn').addEventListener('click', () => {
    document.getElementById('deptForm').reset();
    document.getElementById('deptId').value = '';
    document.getElementById('deptIdInput').value = '';
});

// ============================================
// INITIALIZATION
// ============================================
window.addEventListener('DOMContentLoaded', async () => {
    await loadDepartments();
    await loadStaffReference();
});

console.log('Department Management Module Initialized');