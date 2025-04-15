document.addEventListener('DOMContentLoaded', function() {
    // Get user data from localStorage
    const userToken = localStorage.getItem('userToken');

    // Update last login time
    const lastLoginElement = document.getElementById('last-login-time');
    lastLoginElement.textContent = new Date().toLocaleString();

    // Fetch patient data from API
    fetch(`https://sdp-api-n04w.onrender.com/patient`, {
        headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to fetch patient data');
        return response.json();
    })
    .then(data => {
        // Update patient name in header
        document.getElementById('patient-name').textContent = data.fullname;

        // Update patient information card
        document.getElementById('full-name').textContent = data.fullname;
        document.getElementById('dob').textContent = new Date(data.dob).toLocaleDateString();
        document.getElementById('phone').textContent = data.phone;
        document.getElementById('id').textContent = data.id;

        // MFA status
        document.getElementById('mfa').innerHTML = data.mfa?.verified ?
        `2FA enabled` :
        `<button onClick="onMfaSetup(${data.id})">Setup MFA</button>`;

        // Handle eGFR results
        if (data.results && data.results.length > 0) {
            // Sort by date descending (assuming most recent results are at the end of array)
            const sortedResults = [...data.results].reverse();

            // Update latest result
            const latest = sortedResults[0];
            console.log(latest);
            console.log(sortedResults)
            document.getElementById('latest-egfr').textContent = `${latest.eGFR} mL/min/1.73m²`;
            document.getElementById('latest-egfr-date').textContent = new Date().toLocaleDateString(); // Using current date as results don't include date


            // Update history
            const historyContainer = document.getElementById('egfr-history');
            sortedResults.slice(1, 3).forEach(result => {
                const calculationTypeMatch = result.calculationType.match(/\[(.*?)\]/) || result.calculationType.match(/\((.*?)\)/);
                const unit = calculationTypeMatch ? calculationTypeMatch[1] : 'mg/dL';
                const resultElement = document.createElement('div');
                resultElement.className = 'result-row';
                resultElement.innerHTML = `
                    <div class="result-header">${result.calculationType}</div>
                    <div class="result-value">${result.eGFR} mL/min/1.73m²</div>
                    <div class="result-details">
                        Creatinine: ${result.creatine} ${unit}

                    </div>
                `;
                historyContainer.appendChild(resultElement);
            });
        } else {
            // No results available
            document.getElementById('latest-egfr').textContent = 'No results';
            document.getElementById('latest-egfr-date').textContent = 'N/A';
            
            const historyContainer = document.getElementById('egfr-history');
            historyContainer.innerHTML = '<div class="no-results">No previous results available. Use the eGFR Calculator to get started.</div>';
        }

        // Check if patient has any appointments scheduled in the future
        
        let appointments = data.appointments
        console.log(appointments)
        // Date bullshit (thanks for putting time in a separate variable dumbass)
        if (appointments.length > 0) {
            const futureAppointments = appointments.filter(appointment => {
                let hours = appointment.time.slice(0,2)
                let minutes = appointment.time.slice(3,5)
                let date = new Date(appointment.date).setHours(hours, minutes)
                console.log(`appointment date: ${date} current date: ${new Date()}`)
                return date > new Date()
            });
            console.log(futureAppointments)
            futureAppointments.sort((a, b) => {
                let dateA = new Date(a.date).setHours(a.time.slice(0,2), a.time.slice(3,5))
                let dateB = new Date(b.date).setHours(b.time.slice(0,2), b.time.slice(3,5))
                
                return dateA - dateB
            });
            console.log(futureAppointments)

            const appointmentsContainer = document.querySelector('.appointments');
            appointmentsContainer.innerHTML = ''; // Clear existing content

            // Limit to the first 3 appointments
            futureAppointments.slice(0, 3).forEach(appointment => {
                const appointmentRow = document.createElement('div');
                appointmentRow.className = 'appointment-row';
                appointmentRow.innerHTML = `
                    <div class="appointment-date">${new Date(appointment.date).toLocaleDateString()}</div>
                    <div class="appointment-time">${appointment.time}</div>
                    <div class="appointment-description">${appointment.notes || 'No description available'}</div>
                `;
                appointmentsContainer.appendChild(appointmentRow);
            });

            if (futureAppointments.length === 0) {
                appointmentsContainer.innerHTML = '<p>No upcoming appointments</p>';
            }

            if (futureAppointments.length > 3) {
                // Add a button with 3 dots below the list of appointments
                const moreButton = document.createElement('button');
                moreButton.className = 'more-button';
                moreButton.innerHTML = '&#x2026;'; // HTML entity for 3 dots (ellipsis)
                moreButton.title = 'View more appointments'; // Tooltip for the button

                // Add event listener for the button (optional)
                moreButton.addEventListener('click', () => {
                    showAllAppointmentsModal(futureAppointments);
                });

                appointmentsContainer.appendChild(moreButton);
            }

        } else {
            const appointmentsContainer = document.querySelector('.appointments');
            appointmentsContainer.innerHTML = '<p>No appointments</p>';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to load patient data. Please refresh the page.');
    });
});

function showAllAppointmentsModal(appointments) {
    // Create the modal container
    const modal = document.createElement('div');
    modal.className = 'appointments-modal';

    // Add modal content
    modal.innerHTML = `
        <div class="appointment-modal-content">
            <span class="close-modal">&times;</span>
            <h2>All Appointments</h2>
            <div class="appointments-list">
                ${appointments.map(appointment => `
                    <div class="appointment-row">
                        <div class="appointment-date">${new Date(appointment.date).toLocaleDateString()}</div>
                        <div class="appointment-time">${appointment.time}</div>
                        <div class="appointment-description">${appointment.notes || 'No description available'}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // Append the modal to the body
    document.body.appendChild(modal);

    // Add a semi-transparent background overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    document.body.appendChild(overlay);

    // Add event listener to close the modal
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(overlay);
        document.body.removeChild(modal);
    });

    // Close modal when clicking on the overlay
    overlay.addEventListener('click', () => {
        document.body.removeChild(overlay);
        document.body.removeChild(modal);
    });
}