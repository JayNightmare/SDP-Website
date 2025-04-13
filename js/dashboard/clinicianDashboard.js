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
        const response = await fetch(`https://sdp-api-n04w.onrender.com/clinician`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch clinician info');
        
        const data = await response.json();
        
        // Update dashboard header
        document.getElementById('clinician-name').textContent = `${data.fullname}`;
        document.getElementById('last-login-time').textContent = new Date().toLocaleString();
        
    } catch (error) {
        console.error('Error loading clinician info:', error);
    }
}

// Load patients list
async function loadPatients() {
    try {
        // Fetch the list of patient IDs from the clinician endpoint
        const clinicianResponse = await fetch(`https://sdp-api-n04w.onrender.com/clinician/${clinicianId}/patients`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            }
        });

        if (!clinicianResponse.ok) throw new Error('Failed to fetch patient IDs');

        const patientIds = await clinicianResponse.json();

        // Fetch detailed patient data for each patient ID
        const patientPromises = patientIds.map(async (patientId) => {
            const patientResponse = await fetch(`https://sdp-api-n04w.onrender.com/clinician/${clinicianId}/patients/details`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                }
            });

            if (!patientResponse.ok) throw new Error(`Failed to fetch patient details for ID: ${patientId}`);

            console.log(patientResponse);
            return patientResponse.json();
        });

        const patients = await Promise.all(patientPromises);

        // Display the patients in the table
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
        let egfr = patient.egfr;
        let status = '';
        let statusClass = '';

        if (egfr >= 90) {
            status = 'Normal or High Function';
            statusClass = 'green';
        } else if (egfr >= 60) {
            status = 'Mildly Decreased Function';
            statusClass = 'light-green';
        } else if (egfr >= 45) {
            status = 'Mild to Moderate Decrease';
            statusClass = 'yellow';
        } else if (egfr >= 30) {
            status = 'Moderate to Severe Decrease';
            statusClass = 'orange';
        } else if (egfr >= 15) {
            status = 'Severe Decrease';
            statusClass = 'red';
        } else {
            status = 'Kidney Failure';
            statusClass = 'dark-red';
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${patient.fullname}</td>
            <td>${patient.nhsid}</td>
            <td><span class="status-badge ${statusClass}">${status}</span></td>
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
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`
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
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`
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
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`
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
            <button onclick="this.parentElement.remove()" class="close-btn">Close</button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Add new patient
document.querySelector('.new-patient-btn').addEventListener('click', () => {
    const modal = document.createElement('div');
    modal.classList.add('add-modal');
    
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Add New Patient</h2>
            <form id="add-patient-form add-form">
                <br>
                <div class="form-group">
                    <label for="patient-id">Patient ID:</label>
                    <input type="text" id="patient-id" required>
                </div>
                <p id="error-message-container" class="error-message" style="color: red; display: none;">Invalid Patient ID. Please try again.</p>
                <br>
                <div class="form-buttons">
                    <button type="submit" class="submit-btn">Add Patient</button>
                    <button type="button" onclick="this.parentElement.parentElement.parentElement.parentElement.remove()" class="cancel-btn">Cancel</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('add-patient-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const patientId = document.getElementById('patient-id').value;
        console.log('Adding patient with ID:', patientId);
        const errorMessage = document.getElementById('error-message-container');
        
        try {
            const response = await fetch(`https://sdp-api-n04w.onrender.com/clinician/${clinicianId}/patients`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                },
                body: JSON.stringify({ id: patientId })
            });
            
            if (!response.ok) {
                if (response.status === 422) {
                    errorMessage.style.display = 'block';
                    errorMessage.style.paddingTop = '10px';
                } else {
                    throw new Error('Failed to add patient');
                }
                return;
            }
            
            modal.remove();
            loadPatients();
            
        } catch (error) {
            console.error('Error adding patient:', error);
        }
    });
});

// Add new appointment
document.querySelector('.new-appointment-btn').addEventListener('click', () => {
    const modal = document.createElement('div');
    modal.classList.add('add-modal');
    
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Schedule New Appointment</h2>
            <form id="add-appointment-form">
                <br>
                <div class="form-group">
                    <label for="appointment-patient-id">Patient:</label>
                    <select id="appointment-patient-id" required>
                        <option disabled selected value="">Select a patient</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="appointment-date">Date:</label>
                    <input type="date" id="appointment-date" required>
                </div>
                <div class="form-group">
                    <label for="appointment-time">Time:</label>
                    <input type="time" id="appointment-time" required>
                </div>
                <div class="form-group">
                    <label for="appointment-notes">Notes:</label>
                    <textarea id="appointment-notes"></textarea>
                </div>
                <p id="appointment-error-message" class="error-message" style="color: red; display: none;">Failed to schedule appointment. Please try again.</p>
                <br>
                <div class="form-buttons">
                    <button type="submit" class="submit-btn">Schedule Appointment</button>
                    <button type="button" onclick="this.parentElement.parentElement.parentElement.parentElement.remove()" class="cancel-btn">Cancel</button>
                </div>
            </form>
        </div>
    `;

    // Populate the dropdown with patients
    (async () => {
        try {
            const response = await fetch(`https://sdp-api-n04w.onrender.com/clinician/${clinicianId}/patients`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch patients');

            const patients = await response.json();
            const patientSelect = document.getElementById('appointment-patient-id');

            patients.forEach(patient => {
                const option = document.createElement('option');
                option.value = patient.id;
                option.textContent = `${patient.fullname} (${patient.nhsid})`;
                patientSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading patients for dropdown:', error);
        }
    })();
    
    document.body.appendChild(modal);
    
    document.getElementById('add-appointment-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const patientId = document.getElementById('appointment-patient-id').value;
        const date = document.getElementById('appointment-date').value;
        const time = document.getElementById('appointment-time').value;
        const notes = document.getElementById('appointment-notes').value;
        const errorMessage = document.getElementById('appointment-error-message');
        
        try {
            const response = await fetch(`https://sdp-api-n04w.onrender.com/clinician/${clinicianId}/appointments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                },
                body: JSON.stringify({ patientId, date, time, notes })
            });
            
            if (!response.ok) {
                errorMessage.style.display = 'block';
                return;
            }
            
            modal.remove();
            // Optionally, reload appointments or update the UI
            
        } catch (error) {
            console.error('Error scheduling appointment:', error);
        }
    });
});
