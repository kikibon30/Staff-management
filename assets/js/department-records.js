// ============================================
// DEPARTMENT RECORDS MODULE
// View-only department records with statistics
// ============================================

// Global State
let allDepartments = [];
let staffAssignments = [];
let staffMembers = [];
let currentView = 'cards';
let searchTerm = '';
let refreshInterval = null;

// ============================================
// SUPABASE HELPER FUNCTIONS
// ============================================

async function getAllDepartments() {
    try {
        const { data, error } = await window.supabaseClient
            .from('department')
            .select('*')
            .order('dept_id', { ascending: true });
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

async function getAllStaff() {
    try {
        const { data, error } = await window.supabaseClient
            .from('staff')
            .select('staff_id, first_name, last_name, position');
        if (error) throw error;
        return data || [];
    } catch(e) { console.error('Error fetching staff:', e); return []; }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getDepartmentStaffCount(deptId) {
    return staffAssignments.filter(a => a.dept_id === deptId).length;
}

function getDepartmentHead(dept) {
    if (dept.staff_id) {
        const head = staffMembers.find(s => s.staff_id === dept.staff_id);
        if (head) return `${head.first_name || ''} ${head.last_name || ''}`.trim();
        return `ID: ${dept.staff_id}`;
    }
    return '-';
}

function filterDepartments() {
    if (!searchTerm) return allDepartments;
    const term = searchTerm.toLowerCase();
    return allDepartments.filter(dept => {
        const name = (dept.dept_name || '').toLowerCase();
        const location = (dept.dept_location || '').toLowerCase();
        return name.includes(term) || location.includes(term);
    });
}

// ============================================
// RENDER FUNCTIONS
// ============================================

function renderCardsView() {
    const container = document.getElementById('cardsView');
    const filtered = filterDepartments();
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <i class="fas fa-building"></i>
                No departments found matching your search
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    filtered.forEach(dept => {
        const staffCount = getDepartmentStaffCount(dept.dept_id);
        const head = getDepartmentHead(dept);
        const budget = dept.budget ? `$${dept.budget.toLocaleString()}` : '-';
        
        const card = document.createElement('div');
        card.className = 'dept-card';
        card.innerHTML = `
            <div class="dept-card-header">
                <div class="dept-name">${escapeHtml(dept.dept_name || 'Unnamed')}</div>
                <div class="dept-id">ID: ${dept.dept_id || '-'}</div>
            </div>
            <div class="dept-details">
                <div class="dept-detail">
                    <span class="detail-label">Location</span>
                    <span class="detail-value">${escapeHtml(dept.dept_location || '-')}</span>
                </div>
                <div class="dept-detail">
                    <span class="detail-label">Department Head</span>
                    <span class="detail-value">${escapeHtml(head)}</span>
                </div>
                <div class="dept-detail">
                    <span class="detail-label">Phone</span>
                    <span class="detail-value">${escapeHtml(dept.dept_phone || '-')}</span>
                </div>
                <div class="dept-detail">
                    <span class="detail-label">Staff Count</span>
                    <span class="detail-value">${staffCount}</span>
                </div>
                <div class="dept-detail">
                    <span class="detail-label">Budget</span>
                    <span class="detail-value">${budget}</span>
                </div>
            </div>
            ${dept.description ? `<div class="dept-description">${escapeHtml(dept.description)}</div>` : ''}
        `;
        container.appendChild(card);
    });
}

function renderTableView() {
    const tbody = document.getElementById('deptsTableBody');
    const filtered = filterDepartments();
    
    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <i class="fas fa-building"></i>
                    No departments found
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = '';
    filtered.forEach(dept => {
        const row = tbody.insertRow();
        const staffCount = getDepartmentStaffCount(dept.dept_id);
        const budget = dept.budget ? `$${dept.budget.toLocaleString()}` : '-';
        
        row.insertCell(0).innerText = dept.dept_id || '-';
        row.insertCell(1).innerText = dept.dept_name || '-';
        row.insertCell(2).innerText = dept.dept_location || '-';
        row.insertCell(3).innerText = getDepartmentHead(dept);
        row.insertCell(4).innerText = dept.dept_phone || '-';
        row.insertCell(5).innerText = staffCount;
        row.insertCell(6).innerText = budget;
    });
}

function renderBudgetDistribution() {
    const container = document.getElementById('budgetDistribution');
    const departmentsWithBudget = allDepartments.filter(d => d.budget && d.budget > 0);
    
    if (departmentsWithBudget.length === 0) {
        container.innerHTML = '<div class="empty-state">No budget data available</div>';
        return;
    }
    
    const maxBudget = Math.max(...departmentsWithBudget.map(d => d.budget));
    
    container.innerHTML = '';
    departmentsWithBudget
        .sort((a, b) => b.budget - a.budget)
        .forEach(dept => {
            const percentage = (dept.budget / maxBudget) * 100;
            const budgetFormatted = `$${dept.budget.toLocaleString()}`;
            
            const item = document.createElement('div');
            item.className = 'budget-item';
            item.innerHTML = `
                <div class="budget-bar-container">
                    <div class="budget-label">
                        <span class="budget-name">${escapeHtml(dept.dept_name || 'Unnamed')}</span>
                        <span class="budget-amount">${budgetFormatted}</span>
                    </div>
                    <div class="budget-bar" style="width: ${percentage}%">
                        ${percentage > 15 ? budgetFormatted : ''}
                    </div>
                </div>
            `;
            container.appendChild(item);
        });
}

function updateSummaryStats() {
    const total = allDepartments.length;
    const locations = new Set(allDepartments.map(d => d.dept_location).filter(l => l)).size;
    const totalStaffAssigned = staffAssignments.length;
    const totalBudget = allDepartments.reduce((sum, d) => sum + (d.budget || 0), 0);
    
    document.getElementById('totalDepts').innerText = total;
    document.getElementById('totalLocations').innerText = locations;
    document.getElementById('totalStaff').innerText = totalStaffAssigned;
    document.getElementById('totalBudget').innerHTML = `$${totalBudget.toLocaleString()}`;
}

function switchView(view) {
    currentView = view;
    const cardsView = document.getElementById('cardsView');
    const tableView = document.getElementById('tableView');
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    
    if (view === 'cards') {
        cardsView.style.display = 'grid';
        tableView.style.display = 'none';
        renderCardsView();
    } else {
        cardsView.style.display = 'none';
        tableView.style.display = 'block';
        renderTableView();
    }
    
    toggleBtns.forEach(btn => {
        const btnView = btn.dataset.view;
        if (btnView === view) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
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
        const [depts, assignments, staff] = await Promise.all([
            getAllDepartments(),
            getStaffAssignments(),
            getAllStaff()
        ]);
        
        allDepartments = depts || [];
        staffAssignments = assignments || [];
        staffMembers = staff || [];
        
        updateSummaryStats();
        renderBudgetDistribution();
        
        if (currentView === 'cards') {
            renderCardsView();
        } else {
            renderTableView();
        }
        
        // Update refresh button tooltip
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            const now = new Date();
            refreshBtn.title = `Last refreshed: ${now.toLocaleTimeString()}`;
        }
        
    } catch (error) {
        console.error('Error loading department data:', error);
    }
}

// ============================================
// EVENT HANDLERS
// ============================================

// Search functionality
document.getElementById('searchBox').addEventListener('input', (e) => {
    searchTerm = e.target.value;
    if (currentView === 'cards') {
        renderCardsView();
    } else {
        renderTableView();
    }
});

// View toggle
document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        switchView(btn.dataset.view);
    });
});

// Manual refresh button
document.getElementById('refreshBtn').addEventListener('click', () => {
    loadAllData();
});

// Escape HTML helper
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ============================================
// AUTO-REFRESH
// ============================================

function startAutoRefresh() {
    if (refreshInterval) clearInterval(refreshInterval);
    refreshInterval = setInterval(() => {
        loadAllData();
    }, 30000);
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
    
    window.addEventListener('beforeunload', () => {
        stopAutoRefresh();
    });
});

console.log('Department Records Module Initialized');