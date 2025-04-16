// Get clinician ID from localStorage
const clinicianType = localStorage.getItem('userType');
const userToken = localStorage.getItem('userToken');

if (!clinicianType || clinicianType !== 'clinician') {
    window.location.href = '../../html/account/index.html';
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    loadClinicianInfo();
    loadPatients();
    setupSearchAndFilter();
    loadDashboardStats();
});

// Load clinician information
async function loadClinicianInfo() {
    try {
        const response = await fetch(`https://sdp-api-n04w.onrender.com/clinician`, {
            headers: {
                'Authorization': `Bearer ${userToken}`
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

// Get Clinician ID from the endpoint using the token
async function getClinicianId() {
    try {
        const response = await fetch(`https://sdp-api-n04w.onrender.com/clinician`, {
            headers: {
                'Authorization': `Bearer ${userToken}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch clinician ID');
        const data = await response.json();
        return data.id;
    }
    catch (error) {
        console.error('Error fetching clinician ID:', error);
        return null;
    }
}

let clinicianId;
getClinicianId().then(id => clinicianId = id);

// ! Load patients list
async function loadPatients() {
    try {
        // Fetch detailed patient data for all patients assigned to the clinician
        const response = await fetch(`https://sdp-api-n04w.onrender.com/clinician/${clinicianId}/patients/details`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${userToken}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch patient details');

        const data = await response.json();

        if (data.status !== 'success') {
            throw new Error('Unexpected response format');
        }

        const patients = data.patients;

        // Display the patients in the table
        displayPatients(patients);

        // Display appointments in the table
        displayAppointments();

    } catch (error) {
        console.error('Error loading patients:', error);
    }
}

// ! Display patients in the table
function displayPatients(patients) {
    const tbody = document.getElementById('patients-list');
    tbody.innerHTML = '';
    
    patients.forEach(patient => {
        // Get the eGFR from the result with the highest resultId in the results array
        let egfr = null;
        if (patient.results && Array.isArray(patient.results) && patient.results.length > 0) {
            const highestResult = patient.results.reduce((max, result) => result.resultId > max.resultId ? result : max, patient.results[0]);
            egfr = highestResult.eGFR;
        } else {
            console.warn('No results found for patient:', patient.id);
            egfr = "No Results";
        }

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
        } else if (egfr < 15) {
            status = 'Kidney Failure';
            statusClass = 'dark-red';
        } else if (egfr === "No Results") {
            status = 'No Results Available';
            statusClass = 'grey';
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${patient.fullname}</td>
            <td>${patient.id}</td>
            <td><span class="status-badge ${statusClass}">${status}</span></td>
            <td class="actions">
                <button onclick="viewPatient('${patient.id}')" class="action-btn view">
                    <i class="fa fa-eye"></i>
                </button>
                <button onclick="contactPatient('${patient.id}')" class="action-btn contact">
                    <i class="fa fa-phone"></i>
                </button>
                <button onclick="deletePatient('${patient.id}')" class="action-btn delete">
                    <i class="fa fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// //

// ! Appointments

// * Display appointments in the table
async function displayAppointments() {
    try {
        const response = await fetch(`https://sdp-api-n04w.onrender.com/clinician`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch appointments');

        const clinicianData = await response.json();
        const appointments = clinicianData.appointments || [];
        const tbody = document.getElementById('appointment-list');
        tbody.innerHTML = '';

        for (const appointment of appointments) {
            try {
                // Fetch patient details using the patient ID from the appointment
                const patientResponse = await fetch(`https://sdp-api-n04w.onrender.com/clinician/${clinicianId}/patients/details`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userToken}`
                    }
                });

                if (!patientResponse.ok) throw new Error('Failed to fetch patient details');

                const patientData = await patientResponse.json();
                const patient = patientData.patients.find(p => p.id === appointment.patientID);
                const patientName = patient ? patient.fullname : 'Unknown Patient';

                console.log('Appointment:', appointment);

                const tr = document.createElement('tr');
                if (appointment.date && appointment.time && patientName) {
                    tr.innerHTML = `
                        <td>${new Date(appointment.date).toLocaleDateString()} at ${appointment.time}</td>
                        <td>${patientName}</td>
                        <td>${appointment.notes || 'No notes'}</td>
                        <td class="actions">
                            <button onclick="viewAppointment('${appointment.appointmentID}')" class="action-btn view">
                                <i class="fa fa-eye"></i>
                            </button>
                            <button onclick="editAppointment('${appointment.appointmentID}')" class="action-btn edit">
                                <i class="fa fa-edit"></i>
                            </button>
                            <button onclick="deleteAppointment('${appointment.appointmentID}', '${appointment.patientID}')" class="action-btn delete">
                                <i class="fa fa-trash"></i>
                            </button>
                        </td>
                    `;
                } else {
                    console.warn('Incomplete appointment data:', appointment);
                }
                tbody.appendChild(tr);
            } catch (error) {
                console.error(`Error fetching patient details for appointment ${appointment.appointmentID}:`, error);
            }
        }
    } catch (error) {
        console.error('Error displaying appointments:', error);
    }
}

// View appointment details
async function viewAppointment(appointmentId) {
    try {
        const response = await fetch(`https://sdp-api-n04w.onrender.com/clinician`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch appointment details');

        const data = await response.json();
        const appointment = data.appointments.find(a => a.appointmentID === appointmentId);
        if (!appointment) throw new Error('Appointment not found');

        // Fetch patient details for the appointment
        const patientResponse = await fetch(`https://sdp-api-n04w.onrender.com/clinician/${clinicianId}/patients/details`, {
            headers: {
                'Authorization': `Bearer ${userToken}`
            }
        });

        if (!patientResponse.ok) throw new Error('Failed to fetch patient details');

        const patientData = await patientResponse.json();
        const patient = patientData.patients.find(p => p.patientID === patientData.patientID);
        const patientName = patient ? patient.fullname : 'Unknown Patient';

        console.log(patientData);
        console.log(patient);
        console.log(patientName);

        // Show appointment modal
        showAppointmentModal(appointment, patientName);
    } catch (error) {
        console.error('Error viewing appointment:', error);
    }
}

// Edit appointment
async function editAppointment(appointmentId) {
    try {
        const response = await fetch(`https://sdp-api-n04w.onrender.com/clinician`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch appointment details');

        const data = await response.json();
        const appointment = data.appointments.find(a => a.appointmentID === appointmentId);
        if (!appointment) throw new Error('Appointment not found');

        // Fetch patient details for the appointment
        const patientResponse = await fetch(`https://sdp-api-n04w.onrender.com/clinician/${clinicianId}/patients/details`, {
            headers: {
                'Authorization': `Bearer ${userToken}`
            }
        });

        if (!patientResponse.ok) throw new Error('Failed to fetch patient details');

        const patientData = await patientResponse.json();
        const patient = patientData.patients.find(p => p.id === appointment.patientID);
        const patientName = patient ? patient.fullname : 'Unknown Patient';

        // Create a modal for editing the appointment
        const modal = document.createElement('div');
        modal.classList.add('add-modal');

        modal.innerHTML = `
            <div class="modal-content">
                <h2>Edit Appointment</h2>
                <p style="margin-top: 10px"><strong>Patient:</strong> ${patientName}</p>
                <form id="edit-appointment-form">
                    <div class="form-group">
                        <label for="edit-appointment-date">Date:</label>
                        <input type="date" id="edit-appointment-date" value="${appointment.date}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-appointment-time">Time:</label>
                        <input type="time" id="edit-appointment-time" value="${appointment.time}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-appointment-notes">Notes:</label>
                        <textarea id="edit-appointment-notes">${appointment.notes || ''}</textarea>
                    </div>
                    <p id="edit-appointment-error-message" class="error-message" style="color: red; display: none;">Failed to update appointment. Please try again.</p>
                    <br>
                    <div class="form-buttons">
                        <button type="submit" class="submit-btn">Save Changes</button>
                        <button type="button" onclick="this.parentElement.parentElement.parentElement.parentElement.remove()" class="cancel-btn">Cancel</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('edit-appointment-form').addEventListener('submit', async (e) => {
            e.preventDefault();

            const date = document.getElementById('edit-appointment-date').value;
            const time = document.getElementById('edit-appointment-time').value;
            const notes = document.getElementById('edit-appointment-notes').value;
            const errorMessage = document.getElementById('edit-appointment-error-message');

            try {
                const updateResponse = await fetch(`https://sdp-api-n04w.onrender.com/clinician/${clinicianId}/appointments`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userToken}`
                    },
                    body: JSON.stringify({
                        appointmentID: appointmentId,
                        patientID: appointment.patientID,
                        updatedDetails: { date, time, notes }
                    })
                });

                if (!updateResponse.ok) {
                    errorMessage.style.display = 'block';
                    errorMessage.textContent = 'Failed to update appointment. Please try again.';
                    return;
                }

                modal.remove();

                // Refresh the appointments list
                displayAppointments();
            } catch (error) {
                console.error('Error updating appointment:', error);
                errorMessage.style.display = 'block';
                errorMessage.textContent = 'An error occurred. Please try again.';
            }
        });
    } catch (error) {
        console.error('Error editing appointment:', error);
    }
}

// Delete appointment
async function deleteAppointment(appointment, patientID) {
    if (!confirm('Are you sure you want to delete this appointment?')) return;

    console.log('Deleting appointment with ID:', appointment);

    try {
        // Delete the appointment from the clinician's appointments
        const response = await fetch(`https://sdp-api-n04w.onrender.com/clinician/${clinicianId}/appointments`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({
                appointmentID: appointment,
                patientID: patientID
            })
        });

        if (!response.ok) throw new Error('Failed to delete appointment from clinician');

        // Optionally, you can show a success message
        alert('Appointment deleted successfully');

        // Refresh the appointments list
        displayAppointments();
    } catch (error) {
        console.error('Error deleting appointment:', error);
    }
}

// Show appointment modal with details
function showAppointmentModal(appointment, patientName) {
    const modal = document.createElement('div');
    modal.classList.add('add-modal');

    modal.innerHTML = `
        <div class="modal-content">
            <h2>Appointment Details</h2>
            <br>
            <div class="appointment-info">
                <p><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${appointment.time}</p>
                <p><strong>Patient:</strong> ${patientName}</p>
                <p><strong>Notes:</strong> ${appointment.notes || 'No notes available'}</p>
            </div>
            <br>
            <div class="form-buttons">
                <button onclick="this.parentElement.parentElement.parentElement.remove()" class="cancel-btn">Close</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

// Setup search and filter functionality
function setupSearchAndFilter() {
    const searchInput = document.getElementById('patient-search');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filterPatients(searchTerm);
    });
}

// //

// ! Patients

function filterPatients(searchTerm) {
    const tbody = document.getElementById('patients-list');
    const rows = tbody.getElementsByTagName('tr');
    
    Array.from(rows).forEach(row => {
        const patientName = row.cells[0].textContent.toLowerCase();
        const patientId = row.cells[1].textContent.toLowerCase();
        if (patientName.includes(searchTerm) || patientId.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// View patient details
async function viewPatient(patientId) {
    try {
        const response = await fetch(`https://sdp-api-n04w.onrender.com/clinician/${clinicianId}/patients/details`, {
            headers: {
            'Authorization': `Bearer ${userToken}`
            }
        });
        
        const data = await response.json();
        const patient = data.patients.find(p => p.id === patientId);
        if (!patient) throw new Error('Patient not found');
        
        if (!response.ok) throw new Error('Failed to fetch patient details');
        
        showPatientModal(patient);
    } catch (error) {
        console.error('Error viewing patient:', error);
    }
}

// Delete patient
async function deletePatient(patientID) {
    if (!confirm('Are you sure you want to remove this patient? This will also remove all appointments for this patient.')) return;

    console.log('Deleting patient with ID:', patientID);
    console.log('Clinician ID:', clinicianId);
    
    try {
        // First get all appointments
        const appointmentsResponse = await fetch(`https://sdp-api-n04w.onrender.com/clinician`, {
            headers: {
                'Authorization': `Bearer ${userToken}`
            }
        });
        
        if (!appointmentsResponse.ok) throw new Error('Failed to fetch appointments');
        
        const clinicianData = await appointmentsResponse.json();
        const appointments = clinicianData.appointments || [];
        console.log('Appointments:', appointments);
        
        // Delete all appointments for this patient
        const patientAppointments = appointments.filter(apt => apt.patientID === patientID);
        for (const appointment of patientAppointments) {
            await fetch(`https://sdp-api-n04w.onrender.com/clinician/${clinicianId}/appointments`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify({ 
                    appointmentId: appointment.appointmentID,
                    patientId: appointment.patientID
                })
            });
        }

        // Then delete the patient
        const response = await fetch(`https://sdp-api-n04w.onrender.com/clinician/${clinicianId}/patients`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({ patientID })
        });
        
        if (!response.ok) throw new Error('Failed to delete patient', response.statusText);
        
        // Reload both patients list and appointments
        loadPatients();
        displayAppointments();
    } catch (error) {
        console.error('Error deleting patient:', error);
    }
}

// Contact patient
function contactPatient(patientId) {
    // Fetch patient details from the clinician's patient details endpoint
    fetch(`https://sdp-api-n04w.onrender.com/clinician/${clinicianId}/patients/details`, {
        headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to fetch patient details');
        return response.json();
    })
    .then(data => {
        const patient = data.patients.find(p => p.id === patientId);
        if (!patient) throw new Error('Patient not found');

        // Create a messaging interface modal
        const modal = document.createElement('div');
        modal.classList.add('add-modal');
        
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Contact Patient</h2>
                <br>
                <p><strong>Name:</strong> ${patient.fullname}</p>
                <p><strong>Phone:</strong> ${patient.phone}</p>
                <textarea id="message-text" placeholder="Type your message here..." rows="5"></textarea>
                <div class="form-buttons">
                    <button id="send-message-btn" class="submit-btn">Send Message</button>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="cancel-btn">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Handle sending the message
        document.getElementById('send-message-btn').addEventListener('click', () => {
            const message = document.getElementById('message-text').value;
            if (!message.trim()) {
                alert('Message cannot be empty');
                return;
            }
            
            // Simulate sending the message (e.g., via an API or SMS gateway)
            alert('Message sent successfully!');
            modal.remove();
        });
    })
    .catch(error => {
        console.error('Error contacting patient:', error);
        alert('Failed to load patient details. Please try again.');
    });
}

// Show patient modal with details
function showPatientModal(patient) {
    const modal = document.createElement('div');
    modal.classList.add('add-modal');

    const answers = patient.answers || [];
    const timestamp = answers.length > 0 ? answers[0].timestamp : null;
    const dateString = new Date(timestamp).toLocaleDateString();
    
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Patient Details</h2>
            <br>
            <div class="patient-info">
                <p><strong>Name:</strong> ${patient.fullname}</p>
                <p><strong>ID:</strong> ${patient.id}</p>
                <p><strong>Date of Birth:</strong> ${new Date(patient.dob).toLocaleDateString()}</p>
                <p><strong>Phone:</strong> ${patient.phone}</p>
            </div>
            <br>
            <div class="test-results">
                <h3>Kidney Results</h3>
                <br>
                ${!patient.results || patient.results.length === 0 ? '<p>No test results available.</p>' : `
                <table>
                    <thead>
                        <tr>
                            <th style="padding-right: 15px">Date</th>
                            <th style="padding-right: 15px">Creatine</th>
                            <th>Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${patient.results.map(test => `
                            <tr>
                                <td style="padding-right: 15px">${dateString}</td>
                                <td style="padding-right: 15px">${test.creatine || 'N/A'} ${test.calculationType || ''}</td>
                                <td>${test.eGFR} mL/min/1.73m²</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                `}
            </div>
            <br>
            <div class="form-buttons">
                <button onclick="this.parentElement.parentElement.parentElement.remove()" class="cancel-btn">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// //

// ! Add New Features

// Add new patient
document.querySelector('.new-patient-btn').addEventListener('click', () => {
    const modal = document.createElement('div');
    modal.classList.add('add-modal');
    
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Add New Patient</h2>
            <div id="add-patient-form" class="add-form">
                <br>
                <div class="form-group">
                    <label for="patient-id">Patient ID:</label>
                    <input type="text" id="patient-id" required>
                </div>
                <p id="error-message-container" class="error-message" style="color: red; display: none;">Invalid Patient ID. Please try again.</p>
                <br>
                <div class="form-buttons">
                    <button id="submit-patient-btn" class="submit-btn">Add Patient</button>
                    <button type="button" onclick="this.parentElement.parentElement.parentElement.parentElement.remove()" class="cancel-btn">Cancel</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('submit-patient-btn').addEventListener('click', async () => {
        const patientId = document.getElementById('patient-id').value;
        const errorMessage = document.getElementById('error-message-container');
        
        try {
            const response = await fetch(`https://sdp-api-n04w.onrender.com/clinician/${clinicianId}/patients`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify({ id: patientId })
            });
            
            if (!response.ok) {
                if (response.status === 422) {
                    errorMessage.style.display = 'block';
                    errorMessage.style.paddingTop = '10px';
                } else if (response.status === 401) {
                    const errorData = await response.json();
                    errorMessage.innerHTML = errorData.message || response.statusText;
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
            const response = await fetch(`https://sdp-api-n04w.onrender.com/clinician/${clinicianId}/patients/details`, {
                headers: {
                    'Authorization': `Bearer ${userToken}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch patient details');

            const data = await response.json();
            const patients = data.patients;
            const patientSelect = document.getElementById('appointment-patient-id');

            patients.forEach(patient => {
                const option = document.createElement('option');
                option.value = patient.id;
                option.textContent = `${patient.fullname} (${patient.id})`;
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
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify({ patientID: patientId, appointmentDetails: {date, time, notes} })
            });
            
            if (response.status === 404) {
                errorMessage.style.display = 'block';
                const errorData = await response.json();
                errorMessage.innerHTML = errorData.message || response.statusText;
                return;
            } else if (!response.ok) {
                errorMessage.style.display = 'block';
                errorMessage.innerHTML = 'Failed to schedule appointment. Please try again.';
                return;
            }

            modal.remove();
            // Refresh the appointments list or dashboard
            loadDashboardStats();
            loadPatients();
        } catch (error) {
            console.error('Error scheduling appointment:', error);
        }
    });
});

// //

// Update stats overview dynamically
async function loadDashboardStats() {
    try {
        const response = await fetch(`https://sdp-api-n04w.onrender.com/clinician`, {
            headers: {
                'Authorization': `Bearer ${userToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Failed to fetch dashboard stats');

        const stats = await response.json();

        // Update stat cards with real data
        document.getElementById('today-patients').textContent = stats.patients?.length || 0;
        document.getElementById('appointments').textContent = stats.appointments?.length || 0;
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// Call the function on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    loadDashboardStats();
});
