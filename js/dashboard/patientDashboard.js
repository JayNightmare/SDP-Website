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
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to load patient data. Please refresh the page.');
    });
});

function onMfaSetup(user) {
    createQR(user);

    // Create the modal container
    const modal = document.createElement('div');
    modal.classList.add("mfa-modal");

    // Add content to the modal
    modal.innerHTML = `
        <h2>Setup Multi-Factor Authentication</h2>
        <p>Scan the QR code below using your authenticator app:</p>
        <div id="qrcode">
            <img src="https://placehold.co/150" alt="QR Code">
        </div>
        <p>Enter the 6-digit code from your authenticator app:</p>
        <div class="mfa-input-container">
            <input type="text" maxlength="1" class="mfa-input" />
            <input type="text" maxlength="1" class="mfa-input" />
            <input type="text" maxlength="1" class="mfa-input" />
            <input type="text" maxlength="1" class="mfa-input" />
            <input type="text" maxlength="1" class="mfa-input" />
            <input type="text" maxlength="1" class="mfa-input" />
        </div>
        <button id="close-mfa-modal" style="padding: 10px 20px; background-color: #3e7c2e; color: #fff; border: none; border-radius: 4px; cursor: pointer;">Close</button>
    `;

    // Append the modal to the body
    document.body.appendChild(modal);

    // Add a semi-transparent background overlay
    const overlay = document.createElement('div');
    overlay.classList.add("mfa-overlay")

    document.body.appendChild(overlay);

    // Add event listener to close the modal
    document.getElementById('close-mfa-modal').addEventListener('click', () => {
        document.body.removeChild(overlay);
        document.body.removeChild(modal);
    });

    // Add event listeners to input fields for auto-jumping
    const inputs = modal.querySelectorAll('.mfa-input');
    inputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            // Allow only digits (0-9)
            if (!/^\d$/.test(e.target.value)) {
                e.target.value = ''; // Clear invalid input
                return;
            }

            if (e.target.value.length === 1 && index < inputs.length - 1) {
                inputs[index + 1].focus(); // Move to the next input
            }
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && index > 0 && !e.target.value) {
                inputs[index - 1].focus(); // Move to the previous input on Backspace
            }
        });
    });
}

function createQR(user) {
    let userToken = localStorage.getItem('userToken');

    // async fetch to get the QR code
    fetch('https://sdp-api-n04w.onrender.com/auth/mfa', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
        },
    })
        .then(response => {
            return response.json()
        })
        .then(data => {
            let payload = `otpauth://totp/${user}?secret=${data.secret}&issuer=SDP%20CKD`
            console.log(`MFA data: ${data.secret}`);
            console.log(`Payload: ${payload}`)
            // console.log(data)
            let qrdiv = document.getElementById("qrcode");
            qrdiv.innerHTML = ""; // Clear previous QR code if any

            var qrCode = new QRCode(qrdiv, {
                text: payload,
                width: 150,
                height: 150,
            });
        })
        .catch(error => console.error('Could not create a MFA key:', error));
}