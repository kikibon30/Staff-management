// ============================================
// STAFF RECORDS MODULE
// View-only staff records with summary statistics
// ============================================

// Global State
let allStaff = [];
let departments = [];
let staffAssignments = [];
let refreshInterval = null;
let searchTerm = '';

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
    } catch(e) { console.error('Error fetching staff:', e); return []; }
}

async function getAllDepartments() {
    try {
        const { data, error } = await window.supabaseClient
            .from('department')
            .select('*');
        if (error) throw error;
        return data || [];
    } catch(e) { console.error('Error fetching departments:', e); return []; }
}

async function getStaffAssignments() {
    try {
        const { data, error } = await window.supabaseClient
            .from('staff_department_assignment')
            .select('*')
            .is('end_date', null);
        if (error) throw error;
        return data || [];
    } catch(e) { console.error('Error fetching assignments:', e); return []; }
}

// ============================================
// RENDER FUNCTIONS
// ============================================

function getPositionBadge(position) {
    const pos = (position || '').toLowerCase();
    let badgeClass = 'badge-other';
    
    if (pos === 'doctor' || pos === 'consultant' || pos === 'registrar' || pos === 'senior doctor' || pos === 'junior doctor') {
        badgeClass = 'badge-doctor';
    } else if (pos === 'surgeon') {
        badgeClass = 'badge-surgeon';
    } else if (pos === 'nurse' || pos === 'senior nurse' || pos === 'junior nurse' || pos === 'midwife') {
        badgeClass = 'badge-nurse';
    } else if (pos === 'administrator' || pos === 'manager' || pos === 'receptionist') {
        badgeClass = 'badge-admin';
    } else if (pos === 'pharmacist' || pos === 'pharmacy technician' || pos === 'lab technician' || 
               pos === 'radiographer' || pos === 'technician') {
        badgeClass = 'badge-technical';
    }
    
    return `<span class="badge ${badgeClass}">${position || 'N/A'}</span>`;
}

function getStaffDepartment(staffId) {
    const assignment = staffAssignments.find(a => a.staff_id === staffId);
    if (assignment && assignment.dept_id) {
        const dept = departments.find(d => d.dept_id === assignment.dept_id);
        return dept ? dept.dept_name : '-';
    }
    return '-';
}

function renderStaffTable() {
    const tbody = document.getElementById('staffRecordsTable');
    
    let filteredStaff = allStaff;
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredStaff = allStaff.filter(staff => {
            const fullName = `${staff.first_name || ''} ${staff.last_name || ''}`.toLowerCase();
            const position = (staff.position || '').toLowerCase();
            const phone = (staff.phone || '').toLowerCase();
            return fullName.includes(term) || position.includes(term) || phone.includes(term);
        });
    }
    
    if (filteredStaff.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <i class="fas fa-user-slash"></i>
                    No staff records found
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = '';
    filteredStaff.forEach(staff => {
        const row = tbody.insertRow();
        const fullName = `${staff.first_name || ''} ${staff.last_name || ''}`.trim();
        const department = getStaffDepartment(staff.staff_id);
        const salary = staff.salary ? `$${Number(staff.salary).toLocaleString()}` : '-';
        
        row.insertCell(0).innerText = staff.staff_id || '-';
        row.insertCell(1).innerHTML = `<strong>${fullName || '-'}</strong>`;
        row.insertCell(2).innerHTML = getPositionBadge(staff.position);
        row.insertCell(3).innerText = department;
        row.insertCell(4).innerText = staff.phone || '-';
        row.insertCell(5).innerText = staff.email || '-';
        row.insertCell(6).innerText = salary;
        row.insertCell(7).innerText = staff.contract_type || '-';
    });
}

function updateSummaryStats() {
    const total = allStaff.length;
    const doctors = allStaff.filter(s => {
        const pos = (s.position || '').toLowerCase();
        return pos === 'doctor' || pos === 'consultant' || pos === 'registrar' || 
               pos === 'senior doctor' || pos === 'junior doctor' || pos === 'surgeon';
    }).length;
    const nurses = allStaff.filter(s => {
        const pos = (s.position || '').toLowerCase();
        return pos === 'nurse' || pos === 'senior nurse' || pos === 'junior nurse' || pos === 'midwife';
    }).length;
    const admins = allStaff.filter(s => {
        const pos = (s.position || '').toLowerCase();
        return pos === 'administrator' || pos === 'manager' || pos === 'receptionist';
    }).length;
    const technical = allStaff.filter(s => {
        const pos = (s.position || '').toLowerCase();
        return pos === 'pharmacist' || pos === 'pharmacy technician' || pos === 'lab technician' || 
               pos === 'radiographer' || pos === 'technician';
    }).length;
    
    const staffWithSalary = allStaff.filter(s => s.salary && s.salary > 0);
    const avgSalary = staffWithSalary.length > 0 
        ? staffWithSalary.reduce((sum, s) => sum + s.salary, 0) / staffWithSalary.length 
        : 0;
    
    document.getElementById('totalStaff').innerText = total;
    document.getElementById('totalDoctors').innerText = doctors;
    document.getElementById('totalNurses').innerText = nurses;
    document.getElementById('totalAdmins').innerText = admins;
    document.getElementById('totalTechnical').innerText = technical;
    document.getElementById('avgSalary').innerHTML = avgSalary > 0 ? `$${Math.round(avgSalary).toLocaleString()}` : '$0';
}

function renderDepartmentDistribution() {
    const container = document.getElementById('deptDistribution');
    
    if (departments.length === 0) {
        container.innerHTML = '<div class="empty-state">No department data available</div>';
        return;
    }
    
    // Count staff per department
    const deptCount = {};
    departments.forEach(dept => {
        deptCount[dept.dept_id] = {
            name: dept.dept_name,
            count: 0
        };
    });
    
    staffAssignments.forEach(assignment => {
        if (deptCount[assignment.dept_id]) {
            deptCount[assignment.dept_id].count++;
        }
    });
    
    const sortedDepts = Object.values(deptCount).sort((a, b) => b.count - a.count);
    
    if (sortedDepts.length === 0 || sortedDepts.every(d => d.count === 0)) {
        container.innerHTML = '<div class="empty-state">No staff assignments found</div>';
        return;
    }
    
    container.innerHTML = '';
    sortedDepts.forEach(dept => {
        const deptItem = document.createElement('div');
        deptItem.className = 'dept-item';
        deptItem.innerHTML = `
            <span class="dept-name">${dept.name}</span>
            <span class="dept-count">${dept.count} staff</span>
        `;
        container.appendChild(deptItem);
    });
}

// ============================================
// DATA LOADING
// ============================================

async function loadAllData() {
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
        // Show loading state
        const tbody = document.getElementById('staffRecordsTable');
        if (allStaff.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-state">
                        <i class="fas fa-spinner fa-pulse"></i>
                        Loading staff records...
                    </td>
                </tr>
            `;
        }
        
        const [staff, depts, assignments] = await Promise.all([
            getAllStaff(),
            getAllDepartments(),
            getStaffAssignments()
        ]);
        
        allStaff = staff || [];
        departments = depts || [];
        staffAssignments = assignments || [];
        
        renderStaffTable();
        updateSummaryStats();
        renderDepartmentDistribution();
        
        // Update last refresh time
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            const now = new Date();
            refreshBtn.title = `Last refreshed: ${now.toLocaleTimeString()}`;
        }
        
    } catch (error) {
        console.error('Error loading staff records:', error);
        const tbody = document.getElementById('staffRecordsTable');
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    Error loading staff records. Please refresh the page.
                </td>
            </tr>
        `;
    }
}

// ============================================
// EVENT HANDLERS
// ============================================

// Search functionality
document.getElementById('searchBox').addEventListener('input', (e) => {
    searchTerm = e.target.value;
    renderStaffTable();
});

// Manual refresh button
document.getElementById('refreshBtn').addEventListener('click', () => {
    loadAllData();
});

// ============================================
// AUTO-REFRESH
// ============================================

function startAutoRefresh() {
    if (refreshInterval) clearInterval(refreshInterval);
    refreshInterval = setInterval(() => {
        loadAllData();
    }, 30000); // Refresh every 30 seconds
}

function stopAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
}

// ============================================
// INITIALIZATION
// ============================================

window.addEventListener('DOMContentLoaded', () => {
    loadAllData();
    startAutoRefresh();
    
    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
        stopAutoRefresh();
    });
});

console.log('Staff Records Module Initialized');