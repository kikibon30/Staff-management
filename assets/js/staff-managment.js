// ============================================
// STAFF MANAGEMENT MODULE
// Complete CRUD Operations with Supabase
// ============================================

// Global State
let staffRecords = [];
let departments = [];
let staffAssignments = [];
let editingStaffId = null;

// ============================================
// SUPABASE HELPER FUNCTIONS
// ============================================

async function getAllStaff() {
    try {
        const { data, error } = await window.supabaseClient
            .from('staff')
            .select('*')
            .order('staff_id', { ascending: true });
        if (error) throw error;
        return data || [];
    } catch(e) { 
        console.error('Error fetching staff:', e); 
        alert('Error loading staff: ' + (e.message || e));
        return []; 
    }
}

async function getAllDepartments() {
    try {
        const { data, error } = await window.supabaseClient
            .from('department')
            .select('*')
            .order('dept_id', { ascending: true });
        if (error) throw error;
        return data || [];
    } catch(e) { 
        console.error('Error fetching departments:', e); 
        return []; 
    }
}

async function getStaffAssignments() {
    try {
        const { data, error } = await window.supabaseClient
            .from('staff_department_assignment')
            .select('*')
            .is('end_date', null);
        if (error) throw error;
        return data || [];
    } catch(e) { 
        console.error('Error fetching assignments:', e); 
        return []; 
    }
}

async function addStaffRecord(staffData) {
    try {
        const { data, error } = await window.supabaseClient
            .from('staff')
            .insert([staffData])
            .select();
        if (error) throw error;
        return data?.[0] || null;
    } catch(e) { 
        console.error('Error adding staff:', e); 
        alert('Error adding staff: ' + (e.message || e));
        return null; 
    }
}

async function updateStaffRecord(staffId, staffData) {
    try {
        const { data, error } = await window.supabaseClient
            .from('staff')
            .update(staffData)
            .eq('staff_id', staffId)
            .select();
        if (error) throw error;
        return data?.[0] || null;
    } catch(e) { 
        console.error('Error updating staff:', e); 
        alert('Error updating staff: ' + (e.message || e));
        return null; 
    }
}

async function deleteStaffRecord(staffId) {
    try {
        const { error } = await window.supabaseClient
            .from('staff')
            .delete()
            .eq('staff_id', staffId);
        if (error) throw error;
        return true;
    } catch(e) { 
        console.error('Error deleting staff:', e); 
        alert('Error deleting staff: ' + (e.message || e));
        return false; 
    }
}

async function addAssignment(assignData) {
    try {
        const { data, error } = await window.supabaseClient
            .from('staff_department_assignment')
            .insert([assignData])
            .select();
        if (error) throw error;
        return data?.[0] || null;
    } catch(e) { 
        console.error('Error adding assignment:', e); 
        alert('Error adding assignment: ' + (e.message || e));
        return null; 
    }
}

// ============================================
// FORM HANDLING
// ============================================

async function handleStaffFormSubmit(e) {
    e.preventDefault();
    
    const staffFirstName = document.getElementById('staffFirstName').value.trim();
    const staffLastName = document.getElementById('staffLastName').value.trim();
    const staffPosition = document.getElementById('staffPosition').value;
    const staffPhone = document.getElementById('staffPhone').value.trim();
    const staffDOB = document.getElementById('staffDOB').value;
    const staffAddress = document.getElementById('staffAddress').value.trim();
    const staffNIN = document.getElementById('staffNIN').value.trim();
    const staffWardId = document.getElementById('staffWardId').value ? parseInt(document.getElementById('staffWardId').value) : null;
    const staffSalary = document.getElementById('staffSalary').value ? parseFloat(document.getElementById('staffSalary').value) : null;
    const staffSalaryScale = document.getElementById('staffSalaryScale').value.trim();
    const staffHours = document.getElementById('staffHours').value ? parseInt(document.getElementById('staffHours').value) : null;
    const staffContractType = document.getElementById('staffContractType').value;
    const staffPaymentType = document.getElementById('staffPaymentType').value;
    
    if (!staffFirstName || !staffLastName || !staffPosition) {
        alert('Please fill in all required fields');
        return;
    }
    
    const staffData = {
        first_name: staffFirstName,
        last_name: staffLastName,
        position: staffPosition,
        phone: staffPhone || null,
        dob: staffDOB || null,
        address: staffAddress || null,
        nin: staffNIN || null,
        ward_id: staffWardId,
        salary: staffSalary,
        salary_scale: staffSalaryScale || null,
        hours_per_week: staffHours,
        contract_type: staffContractType || null,
        salary_payment_type: staffPaymentType || null,
        updated_at: new Date().toISOString()
    };
    
    let success = false;
    
    if (editingStaffId) {
        // Update existing staff
        success = await updateStaffRecord(editingStaffId, staffData) !== null;
    } else {
        // Add new staff
        staffData.created_at = new Date().toISOString();
        success = await addStaffRecord(staffData) !== null;
    }
    
    if (success) {
        alert(editingStaffId ? 'Staff updated successfully' : 'Staff added successfully');
        document.getElementById('staffForm').reset();
        editingStaffId = null;
        document.getElementById('staffId').value = '';
        document.getElementById('staffIdInput').value = '';
        await loadStaffData();
        renderStaffTable();
    }
}

async function handleAssignmentFormSubmit(e) {
    e.preventDefault();
    
    const staffId = parseInt(document.getElementById('assignStaffSelect').value);
    const deptId = parseInt(document.getElementById('assignDeptSelect').value);
    const startDate = document.getElementById('assignStartDate').value;
    
    if (!staffId || !deptId || !startDate) {
        alert('Please fill in all fields');
        return;
    }
    
    const assignData = {
        staff_id: staffId,
        dept_id: deptId,
        start_date: startDate,
        created_at: new Date().toISOString()
    };
    
    const success = await addAssignment(assignData) !== null;
    
    if (success) {
        alert('Assignment added successfully');
        document.getElementById('assignmentForm').reset();
        closeAssignmentModal();
        await loadStaffData();
        renderAssignments();
    }
}

// ============================================
// RENDER FUNCTIONS
// ============================================

function renderStaffTable() {
    const tbody = document.getElementById('staffTable');
    
    if (staffRecords.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No staff records found</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    staffRecords.forEach(staff => {
        const row = tbody.insertRow();
        row.insertCell(0).innerText = staff.staff_id || '-';
        row.insertCell(1).innerText = `${staff.first_name || ''} ${staff.last_name || ''}`.trim() || '-';
        row.insertCell(2).innerText = staff.position || '-';
        row.insertCell(3).innerText = staff.phone || '-';
        row.insertCell(4).innerText = staff.dob || '-';
        
        const contractCell = row.insertCell(5);
        contractCell.innerText = staff.contract_type || '-';
        
        const actionsCell = row.insertCell(6);
        actionsCell.className = 'action-icons';
        actionsCell.innerHTML = `
            <i class="fas fa-edit" title="Edit" onclick="editStaff(${staff.staff_id})"></i>
            <i class="fas fa-trash-alt" title="Delete" onclick="deleteStaff(${staff.staff_id})"></i>
        `;
    });
}

function renderAssignments() {
    const tbody = document.getElementById('assignmentsTable');
    
    if (staffAssignments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No assignments found</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    staffAssignments.forEach(assign => {
        const staff = staffRecords.find(s => s.staff_id === assign.staff_id);
        const dept = departments.find(d => d.dept_id === assign.dept_id);
        
        const row = tbody.insertRow();
        row.insertCell(0).innerText = assign.staff_id || '-';
        row.insertCell(1).innerText = staff ? `${staff.first_name} ${staff.last_name}`.trim() : '-';
        row.insertCell(2).innerText = staff ? staff.position : '-';
        row.insertCell(3).innerText = dept ? dept.dept_name : '-';
        row.insertCell(4).innerText = assign.start_date || '-';
        
        const actionsCell = row.insertCell(5);
        actionsCell.className = 'action-icons';
        actionsCell.innerHTML = `<i class="fas fa-trash-alt" title="Remove Assignment" onclick="deleteAssignment(${assign.assignment_id || assign.staff_id})"></i>`;
    });
}

function populateAssignmentSelects() {
    // Populate staff select
    const staffSelect = document.getElementById('assignStaffSelect');
    staffSelect.innerHTML = '<option value="">-- Choose Staff --</option>';
    staffRecords.forEach(staff => {
        const option = document.createElement('option');
        option.value = staff.staff_id;
        option.textContent = `${staff.first_name} ${staff.last_name} (${staff.position})`;
        staffSelect.appendChild(option);
    });
    
    // Populate department select
    const deptSelect = document.getElementById('assignDeptSelect');
    deptSelect.innerHTML = '<option value="">-- Choose Department --</option>';
    departments.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept.dept_id;
        option.textContent = dept.dept_name;
        deptSelect.appendChild(option);
    });
}

// ============================================
// DATA LOADING
// ============================================

async function loadStaffData() {
    // Wait for Supabase client to be initialized
    let retries = 0;
    while (!window.supabaseClient && retries < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
    }
    
    if (!window.supabaseClient) {
        console.error('✗ Supabase client not available');
        alert('Error: Could not connect to Supabase. Please reload the page.');
        return;
    }
    
    try {
        const [staff, depts, assignments] = await Promise.all([
            getAllStaff(),
            getAllDepartments(),
            getStaffAssignments()
        ]);
        
        staffRecords = staff || [];
        departments = depts || [];
        staffAssignments = assignments || [];
        
        console.log('✓ Staff data loaded:', staffRecords.length, 'staff,', departments.length, 'departments');
    } catch (e) {
        console.error('Error loading staff data:', e);
        alert('Error loading data from database: ' + (e.message || e));
    }
}

// ============================================
// EDITING FUNCTIONS
// ============================================

window.editStaff = function(staffId) {
    const staff = staffRecords.find(s => s.staff_id === staffId);
    if (!staff) return;
    
    editingStaffId = staffId;
    document.getElementById('staffId').value = staff.staff_id;
    document.getElementById('staffIdInput').value = staff.staff_id;
    document.getElementById('staffFirstName').value = staff.first_name || '';
    document.getElementById('staffLastName').value = staff.last_name || '';
    document.getElementById('staffPosition').value = staff.position || '';
    document.getElementById('staffPhone').value = staff.phone || '';
    document.getElementById('staffDOB').value = staff.dob || '';
    document.getElementById('staffAddress').value = staff.address || '';
    document.getElementById('staffNIN').value = staff.nin || '';
    document.getElementById('staffWardId').value = staff.ward_id || '';
    document.getElementById('staffSalary').value = staff.salary || '';
    document.getElementById('staffSalaryScale').value = staff.salary_scale || '';
    document.getElementById('staffHours').value = staff.hours_per_week || '';
    document.getElementById('staffContractType').value = staff.contract_type || '';
    document.getElementById('staffPaymentType').value = staff.salary_payment_type || '';
    
    // Scroll to form
    document.getElementById('staffForm').scrollIntoView({ behavior: 'smooth' });
};

window.deleteStaff = async function(staffId) {
    if (confirm('Are you sure you want to delete this staff member? This action cannot be undone.')) {
        const success = await deleteStaffRecord(staffId);
        if (success) {
            staffRecords = staffRecords.filter(s => s.staff_id !== staffId);
            renderStaffTable();
            alert('Staff deleted successfully');
        }
    }
};

window.deleteAssignment = async function(assignmentId) {
    if (confirm('Are you sure you want to remove this assignment?')) {
        try {
            const { error } = await window.supabaseClient
                .from('staff_department_assignment')
                .delete()
                .eq('assignment_id', assignmentId);
            
            if (error) throw error;
            
            staffAssignments = staffAssignments.filter(a => a.assignment_id !== assignmentId);
            renderAssignments();
            alert('Assignment removed successfully');
        } catch(e) {
            console.error('Error deleting assignment:', e);
            alert('Error removing assignment');
        }
    }
};

// ============================================
// MODAL MANAGEMENT
// ============================================

function openAssignmentModal() {
    document.getElementById('assignmentModal').style.display = 'flex';
    populateAssignmentSelects();
}

function closeAssignmentModal() {
    document.getElementById('assignmentModal').style.display = 'none';
    document.getElementById('assignmentForm').reset();
}

// ============================================
// TAB SWITCHING
// ============================================

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Deactivate all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    const tabElement = document.getElementById(tabName + 'Tab');
    if (tabElement) {
        tabElement.classList.add('active');
    }
    
    // Activate button
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async function() {
    console.log('Initializing Staff Management module...');
    
    // Load data from Supabase
    await loadStaffData();
    
    // Setup form handlers
    const staffForm = document.getElementById('staffForm');
    if (staffForm) {
        staffForm.addEventListener('submit', handleStaffFormSubmit);
    }
    
    const assignmentForm = document.getElementById('assignmentForm');
    if (assignmentForm) {
        assignmentForm.addEventListener('submit', handleAssignmentFormSubmit);
    }
    
    // Setup modal handlers
    const closeAssignBtn = document.getElementById('closeAssignModal');
    if (closeAssignBtn) {
        closeAssignBtn.addEventListener('click', closeAssignmentModal);
    }
    
    const cancelAssignBtn = document.getElementById('cancelAssignBtn');
    if (cancelAssignBtn) {
        cancelAssignBtn.addEventListener('click', closeAssignmentModal);
    }
    
    const btnNewAssignment = document.getElementById('btnNewAssignment');
    if (btnNewAssignment) {
        btnNewAssignment.addEventListener('click', openAssignmentModal);
    }
    
    // Setup tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });
    
    // Close modal when clicking outside
    const modal = document.getElementById('assignmentModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeAssignmentModal();
            }
        });
    }
    
    // Initial render
    renderStaffTable();
    renderAssignments();
    
    console.log('✓ Staff Management module initialized');
});
