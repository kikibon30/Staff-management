// ============================================
// WARD MANAGEMENT MODULE
// Complete CRUD Operations with Supabase
// ============================================

// Global State
let wards = [];
let editingWardId = null;

// ============================================
// SUPABASE HELPER FUNCTIONS
// ============================================

async function getAllWards() {
    try {
        const { data, error } = await window.supabaseClient
            .from('ward')
            .select('*')
            .order('ward_id', { ascending: true });
        if (error) throw error;
        return data || [];
    } catch(e) { 
        console.error('Error fetching wards:', e); 
        alert('Error loading wards: ' + (e.message || e));
        return []; 
    }
}

async function addWardRecord(wardData) {
    try {
        const { data, error } = await window.supabaseClient
            .from('ward')
            .insert([wardData])
            .select();
        if (error) throw error;
        return data?.[0] || null;
    } catch(e) { 
        console.error('Error adding ward:', e); 
        alert('Error adding ward: ' + (e.message || e));
        return null; 
    }
}

async function updateWardRecord(wardId, wardData) {
    try {
        const { data, error } = await window.supabaseClient
            .from('ward')
            .update(wardData)
            .eq('ward_id', wardId)
            .select();
        if (error) throw error;
        return data?.[0] || null;
    } catch(e) { 
        console.error('Error updating ward:', e); 
        alert('Error updating ward: ' + (e.message || e));
        return null; 
    }
}

async function deleteWardRecord(wardId) {
    try {
        const { error } = await window.supabaseClient
            .from('ward')
            .delete()
            .eq('ward_id', wardId);
        if (error) throw error;
        return true;
    } catch(e) { 
        console.error('Error deleting ward:', e); 
        alert('Error deleting ward: ' + (e.message || e));
        return false; 
    }
}

// ============================================
// FORM HANDLING
// ============================================

async function handleWardFormSubmit(e) {
    e.preventDefault();
    
    const wardName = document.getElementById('wardName').value.trim();
    const wardLocation = document.getElementById('wardLocation').value.trim();
    const wardType = document.getElementById('wardType').value;
    const wardBeds = document.getElementById('wardBeds').value ? parseInt(document.getElementById('wardBeds').value) : null;
    const wardPhone = document.getElementById('wardPhone').value.trim();
    
    if (!wardName) {
        alert('Please fill in ward name');
        return;
    }
    
    const wardData = {
        ward_name: wardName,
        location: wardLocation || null,
        ward_type: wardType || null,
        total_beds: wardBeds,
        tel_extension: wardPhone || null,
        updated_at: new Date().toISOString()
    };
    
    let success = false;
    
    if (editingWardId) {
        // Update existing ward
        success = await updateWardRecord(editingWardId, wardData) !== null;
    } else {
        // Add new ward
        wardData.created_at = new Date().toISOString();
        success = await addWardRecord(wardData) !== null;
    }
    
    if (success) {
        alert(editingWardId ? 'Ward updated successfully' : 'Ward added successfully');
        document.getElementById('wardForm').reset();
        editingWardId = null;
        document.getElementById('wardId').value = '';
        document.getElementById('wardIdInput').value = '';
        await loadWardData();
        renderWardTable();
    }
}

// ============================================
// RENDER FUNCTIONS
// ============================================

function renderWardTable() {
    const tbody = document.getElementById('wardsTable');
    
    if (wards.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No wards found</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    wards.forEach(ward => {
        const row = tbody.insertRow();
        row.insertCell(0).innerText = ward.ward_id || '-';
        row.insertCell(1).innerText = ward.ward_name || '-';
        row.insertCell(2).innerText = ward.location || '-';
        row.insertCell(3).innerText = ward.ward_type || '-';
        row.insertCell(4).innerText = ward.total_beds || '-';
        
        const actionsCell = row.insertCell(5);
        actionsCell.className = 'action-icons';
        actionsCell.innerHTML = `
            <i class="fas fa-edit" title="Edit" onclick="editWard(${ward.ward_id})"></i>
            <i class="fas fa-trash-alt" title="Delete" onclick="deleteWard(${ward.ward_id})"></i>
        `;
    });
}

// ============================================
// DATA LOADING
// ============================================

async function loadWardData() {
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
        const wardData = await getAllWards();
        wards = wardData || [];
        console.log('✓ Ward data loaded:', wards.length, 'wards');
        renderWardTable();
    } catch (e) {
        console.error('Error loading ward data:', e);
        alert('Error loading data from database: ' + (e.message || e));
    }
}

// ============================================
// EVENT HANDLERS
// ============================================

window.editWard = function(wardId) {
    const ward = wards.find(w => w.ward_id === wardId);
    if (ward) {
        editingWardId = wardId;
        document.getElementById('wardId').value = ward.ward_id;
        document.getElementById('wardIdInput').value = ward.ward_id;
        document.getElementById('wardName').value = ward.ward_name || '';
        document.getElementById('wardLocation').value = ward.location || '';
        document.getElementById('wardType').value = ward.ward_type || '';
        document.getElementById('wardBeds').value = ward.total_beds || '';
        document.getElementById('wardPhone').value = ward.tel_extension || '';
    }
};

window.deleteWard = async function(wardId) {
    if (confirm('Delete this ward? This action cannot be undone.')) {
        const success = await deleteWardRecord(wardId);
        if (success) {
            wards = wards.filter(w => w.ward_id !== wardId);
            renderWardTable();
            alert('Ward deleted successfully');
        } else {
            alert('Error deleting ward');
        }
    }
};

document.getElementById('wardForm').addEventListener('submit', handleWardFormSubmit);

document.getElementById('clearBtn').addEventListener('click', () => {
    document.getElementById('wardForm').reset();
    document.getElementById('wardId').value = '';
    document.getElementById('wardIdInput').value = '';
    editingWardId = null;
});

// ============================================
// PAGE INITIALIZATION
// ============================================

// Load data when page loads
async function initializeWardPage() {
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
    
    await loadWardData();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeWardPage);
