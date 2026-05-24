// ============================================
// PATIENT RECORDS MODULE
// Complete CRUD Operations with Supabase
// ============================================

// Global State
let patients = [];
let admissions = [];
let editingPatientId = null;

// ============================================
// SUPABASE HELPER FUNCTIONS
// ============================================

async function getAllPatients() {
    try {
        const { data, error } = await window.supabaseClient
            .from('patient')
            .select('*')
            .order('patient_id', { ascending: true });
        if (error) throw error;
        return data || [];
    } catch(e) { 
        console.error('Error fetching patients:', e); 
        alert('Error loading patients: ' + (e.message || e));
        return []; 
    }
}

async function getAdmissions() {
    try {
        // Admission table not yet created - returning empty array for now
        // const { data, error } = await window.supabaseClient
        //     .from('admission')
        //     .select('*')
        //     .order('admission_date', { ascending: false })
        //     .limit(10);
        // if (error) throw error;
        return [] || [];
    } catch(e) { 
        console.error('Error fetching admissions:', e); 
        return []; 
    }
}

async function addPatientRecord(patientData) {
    try {
        const { data, error } = await window.supabaseClient
            .from('patient')
            .insert([patientData])
            .select();
        if (error) throw error;
        return data?.[0] || null;
    } catch(e) { 
        console.error('Error adding patient:', e); 
        alert('Error adding patient: ' + (e.message || e));
        return null; 
    }
}

async function updatePatientRecord(patientId, patientData) {
    try {
        const { data, error } = await window.supabaseClient
            .from('patient')
            .update(patientData)
            .eq('patient_id', patientId)
            .select();
        if (error) throw error;
        return data?.[0] || null;
    } catch(e) { 
        console.error('Error updating patient:', e); 
        alert('Error updating patient: ' + (e.message || e));
        return null; 
    }
}

async function deletePatientRecord(patientId) {
    try {
        const { error } = await window.supabaseClient
            .from('patient')
            .delete()
            .eq('patient_id', patientId);
        if (error) throw error;
        return true;
    } catch(e) { 
        console.error('Error deleting patient:', e); 
        alert('Error deleting patient: ' + (e.message || e));
        return false; 
    }
}

// ============================================
// FORM HANDLING
// ============================================

async function handlePatientFormSubmit(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('patientFirstName')?.value.trim() || '';
    const lastName = document.getElementById('patientLastName')?.value.trim() || '';
    const dob = document.getElementById('patientDOB')?.value || '';
    const sex = document.getElementById('patientGender')?.value || null;
    const phone = document.getElementById('patientPhone')?.value.trim() || null;
    const address = document.getElementById('patientAddress')?.value.trim() || null;
    const maritalStatus = document.getElementById('patientMaritalStatus')?.value || null;
    const dateRegistered = document.getElementById('patientDateRegistered')?.value || new Date().toISOString().split('T')[0];
    
    if (!firstName || !lastName || !dob) {
        alert('Please fill in all required fields');
        return;
    }
    
    const patientData = {
        first_name: firstName,
        last_name: lastName,
        dob: dob,
        sex: sex,
        phone: phone,
        address: address,
        marital_status: maritalStatus,
        date_registered: dateRegistered,
        updated_at: new Date().toISOString()
    };
    
    let success = false;
    
    if (editingPatientId) {
        // Update existing patient
        success = await updatePatientRecord(editingPatientId, patientData) !== null;
    } else {
        // Add new patient
        patientData.created_at = new Date().toISOString();
        success = await addPatientRecord(patientData) !== null;
    }
    
    if (success) {
        alert(editingPatientId ? 'Patient updated successfully' : 'Patient added successfully');
        document.getElementById('patientForm').reset();
        editingPatientId = null;
        document.getElementById('patientId').value = '';
        document.getElementById('patientIdInput').value = '';
        await loadPatientData();
        renderPatientTable();
    }
}

// ============================================
// RENDER FUNCTIONS
// ============================================

function renderPatientTable() {
    const tbody = document.getElementById('patientTable');
    
    let filteredPatients = patients;
    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value) {
        const term = searchInput.value.toLowerCase();
        filteredPatients = patients.filter(p => {
            const fullName = `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase();
            const email = (p.email || '').toLowerCase();
            const phone = (p.phone || '').toLowerCase();
            return fullName.includes(term) || email.includes(term) || phone.includes(term);
        });
    }
    
    if (filteredPatients.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No patients found</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    filteredPatients.forEach(patient => {
        const row = tbody.insertRow();
        row.insertCell(0).innerText = patient.patient_id || '-';
        row.insertCell(1).innerText = `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || '-';
        row.insertCell(2).innerText = patient.dob || '-';
        row.insertCell(3).innerText = patient.gender || '-';
        row.insertCell(4).innerText = patient.phone || '-';
        
        const actionsCell = row.insertCell(5);
        actionsCell.className = 'action-icons';
        actionsCell.innerHTML = `
            <i class="fas fa-edit" title="Edit" onclick="editPatient(${patient.patient_id})"></i>
            <i class="fas fa-trash-alt" title="Delete" onclick="deletePatient(${patient.patient_id})"></i>
        `;
    });
}

function renderAdmissionsTable() {
    const tbody = document.getElementById('admissionsTable');
    
    if (admissions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No admission records found</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    admissions.forEach(admission => {
        const patient = patients.find(p => p.patient_id === admission.patient_id);
        
        const row = tbody.insertRow();
        row.insertCell(0).innerText = admission.admission_id || '-';
        row.insertCell(1).innerText = patient ? `${patient.first_name} ${patient.last_name}`.trim() : '-';
        row.insertCell(2).innerText = admission.admission_date || '-';
        row.insertCell(3).innerText = admission.ward_id || '-';
        row.insertCell(4).innerText = `<span class="badge">${admission.status || 'Active'}</span>`;
    });
}

// ============================================
// DATA LOADING
// ============================================

async function loadPatientData() {
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
        const [patientData, admissionData] = await Promise.all([
            getAllPatients(),
            getAdmissions()
        ]);
        
        patients = patientData || [];
        admissions = admissionData || [];
        
        console.log('✓ Patient data loaded:', patients.length, 'patients,', admissions.length, 'admissions');
    } catch (e) {
        console.error('Error loading patient data:', e);
        alert('Error loading data from database: ' + (e.message || e));
    }
}

// ============================================
// EDITING FUNCTIONS
// ============================================

window.editPatient = function(patientId) {
    const patient = patients.find(p => p.patient_id === patientId);
    if (!patient) return;
    
    editingPatientId = patientId;
    document.getElementById('patientId').value = patient.patient_id;
    document.getElementById('patientIdInput').value = patient.patient_id;
    document.getElementById('patientFirstName').value = patient.first_name || '';
    document.getElementById('patientLastName').value = patient.last_name || '';
    document.getElementById('patientDOB').value = patient.dob || '';
    document.getElementById('patientGender').value = patient.gender || '';
    document.getElementById('patientPhone').value = patient.phone || '';
    document.getElementById('patientEmail').value = patient.email || '';
    document.getElementById('patientAddress').value = patient.address || '';
    document.getElementById('patientMaritalStatus').value = patient.marital_status || '';
    document.getElementById('patientBloodType').value = patient.blood_type || '';
    document.getElementById('patientDateRegistered').value = patient.date_registered || '';
    document.getElementById('patientEmergencyContact').value = patient.emergency_contact || '';
    document.getElementById('patientMedicalNotes').value = patient.medical_notes || '';
    
    // Scroll to form
    document.getElementById('patientForm').scrollIntoView({ behavior: 'smooth' });
};

window.deletePatient = async function(patientId) {
    if (confirm('Are you sure you want to delete this patient record? This action cannot be undone.')) {
        const success = await deletePatientRecord(patientId);
        if (success) {
            patients = patients.filter(p => p.patient_id !== patientId);
            renderPatientTable();
            alert('Patient deleted successfully');
        }
    }
};

// ============================================
// SEARCH FUNCTIONALITY
// ============================================

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            renderPatientTable();
        });
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async function() {
    console.log('Initializing Patient Records module...');
    
    // Load data from Supabase
    await loadPatientData();
    
    // Setup form handler
    const patientForm = document.getElementById('patientForm');
    if (patientForm) {
        patientForm.addEventListener('submit', handlePatientFormSubmit);
    }
    
    // Setup clear button
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            document.getElementById('patientForm').reset();
            editingPatientId = null;
            document.getElementById('patientId').value = '';
            document.getElementById('patientIdInput').value = '';
        });
    }
    
    // Setup search
    setupSearch();
    
    // Initial render
    renderPatientTable();
    renderAdmissionsTable();
    
    console.log('✓ Patient Records module initialized');
});
