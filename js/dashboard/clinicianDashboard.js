// Get clinician ID from localStorage
const clinicianId = localStorage.getItem('userId');
if (!clinicianId) {
    window.location.href = '../../js/account/html/practitioner.html';
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    loadClinicianInfo();
    loadPatients();
    setupSearchAndFilter();
});

// Load clinician information
async function loadClinicianInfo() {
    try {
        const response = await fetch(`https://sdp-api-n04w.onrender.com/clinician/${clinicianId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch clinician info');
        
        const data = await response.json();
        
        // Update dashboard header
        document.getElementById('clinician-name').textContent = `Dr. ${data.name}`;
        document.getElementById('last-login-time').textContent = new Date(data.lastLogin).toLocaleString();
        
    } catch (error) {
        console.error('Error loading clinician info:', error);
    }
}

// Load patients list
async function loadPatients() {
    try {
        const response = await fetch(`https://sdp-api-n04w.onrender.com/clinician/${clinicianId}/patients`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch patients');
        
        const patients = await response.json();
        displayPatients(patients);
        
    } catch (error) {
        console.error('Error loading patients:', error);
    }
}

// Display patients in the table
function displayPatients(patients) {
    const tbody = document.getElementById('patients-list');
    tbody.innerHTML = '';
    
    patients.forEach(patient => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${patient.name}</td>
            <td>${patient.id}</td>
            <td><span class="status-badge ${patient.status.toLowerCase()}">${patient.status}</span></td>
            <td>
                <button onclick="viewPatient('${patient.id}')" class="action-btn view">
                    <i class="fa fa-eye"></i>
                </button>
                <button onclick="deletePatient('${patient.id}')" class="action-btn delete">
                    <i class="fa fa-trash"></i>
                </button>
                <button onclick="contactPatient('${patient.id}')" class="action-btn contact">
                    <i class="fa fa-phone"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Setup search and filter functionality
function setupSearchAndFilter() {
    const searchInput = document.getElementById('patient-search');
    let debounceTimer;
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const searchTerm = e.target.value.toLowerCase();
            filterPatients(searchTerm);
        }, 300);
    });
}

// Filter patients based on search term
async function filterPatients(searchTerm) {
    try {
        const response = await fetch(`https://sdp-api-n04w.onrender.com/clinician/${clinicianId}/patients?search=${searchTerm}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch filtered patients');
        
        const patients = await response.json();
        displayPatients(patients);
        
    } catch (error) {
        console.error('Error filtering patients:', error);
    }
}

// View patient details
async function viewPatient(patientId) {
    try {
        const response = await fetch(`https://sdp-api-n04w.onrender.com/patient/${patientId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch patient details');
        
        const patient = await response.json();
        showPatientModal(patient);
        
    } catch (error) {
        console.error('Error viewing patient:', error);
    }
}

// Delete patient
async function deletePatient(patientId) {
    if (!confirm('Are you sure you want to remove this patient?')) return;
    
    try {
        const response = await fetch(`https://sdp-api-n04w.onrender.com/clinician/${clinicianId}/patients/${patientId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to delete patient');
        
        // Reload patients list
        loadPatients();
        
    } catch (error) {
        console.error('Error deleting patient:', error);
    }
}

// Contact patient
function contactPatient(patientId) {
    // Implementation for contacting patient (e.g., showing phone number or opening messaging interface)
}

// Show patient modal with details
function showPatientModal(patient) {
    const modal = document.createElement('div');
    modal.classList.add('patient-modal');
    
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Patient Details</h2>
            <div class="patient-info">
                <p><strong>Name:</strong> ${patient.name}</p>
                <p><strong>ID:</strong> ${patient.id}</p>
                <p><strong>Date of Birth:</strong> ${new Date(patient.dob).toLocaleDateString()}</p>
                <p><strong>Phone:</strong> ${patient.phone}</p>
                <p><strong>Email:</strong> ${patient.email}</p>
            </div>
            <div class="test-results">
                <h3>Test Results</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Test Type</th>
                            <th>Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${patient.testResults?.map(test => `
                            <tr>
                                <td>${new Date(test.date).toLocaleDateString()}</td>
                                <td>${test.type}</td>
                                <td>${test.result}</td>
                            </tr>
                        `).join('') || '<tr><td colspan="3">No test results available</td></tr>'}
                    </tbody>
                </table>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="close-btn">Close</button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Add new patient
document.querySelector('.new-appointment-btn').addEventListener('click', () => {
    const modal = document.createElement('div');
    modal.classList.add('add-patient-modal');
    
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Add New Patient</h2>
            <form id="add-patient-form">
                <div class="form-group">
                    <label for="patient-id">Patient ID:</label>
                    <input type="text" id="patient-id" required>
                </div>
                <div class="form-buttons">
                    <button type="submit" class="submit-btn">Add Patient</button>
                    <button type="button" onclick="this.parentElement.parentElement.parentElement.remove()" class="cancel-btn">Cancel</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('add-patient-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const patientId = document.getElementById('patient-id').value;
        
        try {
            const response = await fetch(`https://sdp-api-n04w.onrender.com/clinician/${clinicianId}/patients`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ patientId })
            });
            
            if (!response.ok) throw new Error('Failed to add patient');
            
            modal.remove();
            loadPatients();
            
        } catch (error) {
            console.error('Error adding patient:', error);
        }
    });
});
