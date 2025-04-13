document.addEventListener('DOMContentLoaded', function() {
    const shellElement = document.getElementById('shell');
    
    // Button click handlers
    document.getElementById('practitioner').addEventListener('click', function() {
        fetch(`../../js/account/html/practitioner.html`)
            .then(response => response.text())
            .then(data => { shellElement.innerHTML = data; })
            .catch(error => console.error('Error fetching page:', error));
    });

    document.getElementById('patient').addEventListener('click', function() {
        fetch(`../../js/account/html/patient.html`)
            .then(response => response.text())
            .then(data => { shellElement.innerHTML = data; })
            .catch(error => console.error('Error fetching page:', error));
    });

    // Global click event handler
    document.addEventListener('click', function (event) {
        // Show/Hide password handler
        if (event.target.classList.contains('show-password-btn')) {
            const targetId = event.target.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                event.target.textContent = 'Hide';
            } else {
                passwordInput.type = 'password';
                event.target.textContent = 'Show';
            }
        }

        // Handle race selection change
        if (event.target.id === 'race') {
            const otherRaceContainer = document.getElementById('other-race-container');
            if (event.target.value === 'other') {
                otherRaceContainer.style.display = 'block';
            } else {
                otherRaceContainer.style.display = 'none';
            }
        }

        // Navigation handlers
        if (event.target.id === 'prev') location.reload();
        if (event.target.id === 'prev-1') location.href = "/";
        if (event.target.id === 'prev-2') {
            fetch(`../../js/account/html/patient.html`)
                .then(response => response.text())
                .then(data => { shellElement.innerHTML = data; })
                .catch(error => console.error('Error fetching page:', error));
        }

        // Registration handlers
        if (event.target.id === 'clinician-register') {
            fetch(`../../js/account/html/practitioner-register.html`)
                .then(response => response.text())
                .then(data => { shellElement.innerHTML = data; })
                .catch(error => console.error('Error fetching page:', error));
        }
        
        if (event.target.id === 'patient-register') {
            fetch(`../../js/account/html/patient-register.html`)
                .then(response => response.text())
                .then(data => { shellElement.innerHTML = data; })
                .catch(error => console.error('Error fetching page:', error));
        }

        // Return to login from registration
        if (event.target.id === 'to-login') {
            fetch(`../../js/account/html/patient.html`)
                .then(response => response.text())
                .then(data => { shellElement.innerHTML = data; })
                .catch(error => console.error('Error fetching page:', error));
        }

        if (event.target.id === 'clinician-register-submit') {
            const registerButton = event.target;
            const loadingContainer = document.querySelector('.loading-container');
            const fullname = document.getElementById('fullname').value;
            const id = document.getElementById('id').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const dob = document.getElementById('dob').value;
            const phone = document.getElementById('phone').value;

            // Validate all fields are filled
            if (!fullname || !id || !password || !confirmPassword || !dob || !phone) {
                showErrorMessage('Please fill in all fields');
                return;
            }

            // Validate password match
            if (password !== confirmPassword) {
                showErrorMessage('Passwords do not match');
                return;
            }

            // Validate password length
            if (password.length < 8) {
                showErrorMessage('Password must be at least 8 characters long');
                return;
            }

            // Validate date format
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(dob)) {
                showErrorMessage('Date of birth must be in YYYY-MM-DD format');
                return;
            }

            // Validate phone number
            const phoneRegex = /^\+?[\d\s-]{10,}$/;
            if (!phoneRegex.test(phone)) {
                showErrorMessage('Please enter a valid phone number');
                return;
            }

            const userData = {
                fullname,
                id,
                password,
                dob,
                phone,
                type: 'clinician'
            };

            loadingContainer.style.display = 'block';
            registerButton.disabled = true;
            registerButton.style.opacity = '0.7';

            fetch('https://sdp-api-n04w.onrender.com/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            })
            .then(response => {
                if (!response.ok) {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        return response.json().then(data => {
                            throw new Error(data.message || 'Registration failed');
                        });
                    }
                    throw new Error('Registration failed');
                }
                return response.json();
            })
            .then(data => {
                alert('Your registration is being reviewed. You will be notified when your account is approved.');
                fetch(`../../js/account/html/practitioner.html`)
                    .then(response => response.text())
                    .then(data => { shellElement.innerHTML = data; })
                    .catch(error => console.error('Error fetching login page:', error));
            })
            .catch(error => {
                console.error('Registration error:', error);
                showErrorMessage(error.message || 'Registration failed. Please try again.');
            })
            .finally(() => {
                loadingContainer.style.display = 'none';
                registerButton.disabled = false;
                registerButton.style.opacity = '1';
            });
        }

        if (event.target.id === 'patient-register-submit') {
            const registerButton = event.target;
            const loadingContainer = document.querySelector('.loading-container');
            const fullname = document.getElementById('fullname').value;
            const nhsId = document.getElementById('NHS-ID').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const dob = document.getElementById('dob').value;
            const phone = document.getElementById('phone').value;
            const race = document.getElementById('race').value;
            const otherRace = document.getElementById('other-race').value;
            const sex = document.getElementById('sex').value;

            if (!fullname || !nhsId || !password || !confirmPassword || !dob || !phone || !race || !sex) {
                console.log(
                    fullname, nhsId, password, confirmPassword, dob, phone, race, sex
                )
                alert('Please fill in all fields');
                return;
            }
            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }
            if (password.length < 8) {
                alert('Password must be at least 8 characters long');
                return;
            }

            if (nhsId.length !== 10) {
                alert('NHS ID must be 10 characters long');
                return;
            }

            if (race === 'other' && !otherRace) {
                alert('Please specify your race');
                return;
            }

            const userData = {
                fullname,
                id: nhsId,
                password,
                dob,
                phone,
                race: race === 'other' ? otherRace : race,
                sex,
                type: 'patient'
            };

            console.log(userData);

            loadingContainer.style.display = 'block';
            registerButton.disabled = true;
            registerButton.style.opacity = '0.7';

            fetch('https://sdp-api-n04w.onrender.com/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            })
            .then(response => {
                if (!response.ok) throw new Error('Registration failed');
                console.error('Registration response:', response);
                return response.json();
            })
            .then(data => {
                // Store token if provided by API
                if (data.userToken) {
                    localStorage.setItem('token', data.userToken);
                }
                
                alert('Registration successful! Please log in.');
                fetch(`../../js/account/html/patient.html`)
                    .then(response => response.text())
                    .then(data => { shellElement.innerHTML = data; })
                    .catch(error => console.error('Error fetching login page:', error));
            })
            .catch(error => {
                console.error('Registration error:', error);
                alert('Registration failed. Please try again.');
            })
            .finally(() => {
                loadingContainer.style.display = 'none';
                registerButton.disabled = false;
                registerButton.style.opacity = '1';
            });
        }

        // Handle patient login
        if (event.target && (event.target.id === 'patient-login')) {
            event.preventDefault(); // Prevent form submission if within a form
            
            const nhsID = document.getElementById("NHS-ID").value;
            const password = document.getElementById("password").value;
            
            // Add basic validation
            if (!nhsID || !password) {
                showErrorMessage("Please enter both email and password");
                return;
            }
            
            // Show loading state
            const loginButton = document.getElementById("patient-login");
            const originalText = loginButton.textContent;
            loginButton.textContent = "Logging in...";
            loginButton.disabled = true;

            fetch("https://sdp-api-n04w.onrender.com/auth/login/patient", {
                method: "POST",
                body: JSON.stringify({ id: nhsID, password: password }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                if (response.status === 303) {
                    // Show 2FA modal
                    show2FAModal({nhsID, password});
                    return Promise.reject("2FA required");
                }
                if (!response.ok) {
                    throw new Error(`Server responded with status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.status === "success") {
                    localStorage.setItem("userType", "patient");
                    localStorage.setItem("userToken", data.userToken);
                    localStorage.setItem("userId", nhsID);
                    
                    // Optional: Set token expiry
                    const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000); // 24 hours
                    localStorage.setItem("tokenExpiry", expiryTime);
                    
                    location.href = "../../html/dashboard/patient-dashboard.html";
                } else {
                    showErrorMessage(data.message || "Invalid credentials");
                }
            })
            .catch(error => {
                if (error !== "2FA required") {
                    console.error('Error:', error);
                    showErrorMessage("Login failed. Please try again later.");
                }
            })
            .finally(() => {
                // Restore button state
                loginButton.textContent = originalText;
                loginButton.disabled = false;
            });
        } else if (event.target && (event.target.id === 'clinician-login' || event.target.classList.contains('button_gl'))) {
            event.preventDefault();
            
            const id = document.getElementById("id").value;
            const password = document.getElementById("password").value;

            // Add basic validation
            if (!id || !password) {
                showErrorMessage("Please enter both HPC ID and password");
                return;
            }
            
            // Show loading state
            const loginButton = document.getElementById('clinician-login');
            const originalText = loginButton.textContent;
            loginButton.textContent = 'Logging in...';
            loginButton.disabled = true;

            fetch('https://sdp-api-n04w.onrender.com/auth/login/clinician', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id, password })
            })
            .then(response => {
                if (response.status === 302) {
                    // MFA not set up yet
                    showMFASetupModal({id, password});
                    return Promise.reject("MFA setup required");
                }
                if (response.status === 303) {
                    // Show 2FA modal
                    show2FAModal({id, password});
                    return Promise.reject("2FA required");
                }
                if (!response.ok) {
                    throw new Error('Login failed');
                }
                return response.json();
            })
            .then(data => {
                if (data.status === 'success') {
                    localStorage.setItem('userType', 'clinician');
                    localStorage.setItem('userToken', data.userToken);
                    localStorage.setItem('userId', id);
                    
                    // Set token expiry
                    const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000); // 24 hours
                    localStorage.setItem('tokenExpiry', expiryTime);
                    
                    location.href = '../../html/dashboard/clinician-dashboard.html';
                } else {
                    throw new Error(data.message || 'Login failed');
                }
            })
            .catch(error => {
                if (error !== "2FA required") {
                    console.error('Login error:', error);
                    showErrorMessage("Invalid credentials. Please check your HPC ID and password.");
                }
            })
            .finally(() => {
                // Restore button state
                loginButton.textContent = originalText;
                loginButton.disabled = false;
            });
        }

        function showErrorMessage(message) {
            const errorElement = document.getElementById("login-error") || createErrorElement();
            errorElement.textContent = message;
            errorElement.style.display = "block";
        }
        
        function createErrorElement() {
            const errorDiv = document.createElement("div");
            errorDiv.id = "login-error";
            errorDiv.classList.add("error-message");
            errorDiv.style.color = "red";
            errorDiv.style.marginTop = "10px";

            const errorContainer = document.getElementById('error-message');
            if (errorContainer) {
                errorContainer.appendChild(errorDiv);
            } else {
                const newErrorContainer = document.createElement('div');
                newErrorContainer.classList.add('error-container');
                shellElement.appendChild(newErrorContainer);
                newErrorContainer.appendChild(errorDiv);
            }
            
            return errorDiv;
        }
    });
});

function showMFASetupModal(userData) {
    // Create the modal container
    const modal = document.createElement('div');
    modal.classList.add("mfa-modal");

    // Add content to the modal
    modal.innerHTML = `
        <h2>Set Up Two-Factor Authentication</h2>
        <p>Please scan this QR code with your authenticator app:</p>
        <div id="qr-code" style="text-align: center; margin: 20px 0;">
            Loading QR code...
        </div>
        <p>Enter the 6-digit code from your authenticator app to verify:</p>
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
    overlay.classList.add("mfa-overlay");
    document.body.appendChild(overlay);

    // Get QR code for MFA setup
    fetch(`https://sdp-api-n04w.onrender.com/auth/mfa/setup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: userData.nhsID || userData.id,
            type: userData.nhsID ? 'patient' : 'clinician'
        })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('qr-code').innerHTML = `
            <img src="${data.qrCode}" alt="QR Code" style="max-width: 200px;" />
            <p style="margin-top: 10px;">Or enter this code manually: <strong>${data.secret}</strong></p>
        `;
    })
    .catch(error => {
        console.error('Error fetching QR code:', error);
        document.getElementById('qr-code').innerHTML = 'Error loading QR code. Please try again.';
    });

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

            // Move to the next input if valid
            if (e.target.value.length === 1 && index < inputs.length - 1) {
                inputs[index + 1].focus(); // Move to the next input
            }

            // Check if all fields are filled
            if (Array.from(inputs).every(input => input.value.length === 1)) {
                const code = Array.from(inputs).map(input => input.value).join('');
                setupMFAVerification(userData, code); // Verify the setup
            }
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && index > 0 && !e.target.value) {
                inputs[index - 1].focus(); // Move to the previous input on Backspace
            }
        });
    });
}

function setupMFAVerification(userData, code) {
    fetch(`https://sdp-api-n04w.onrender.com/auth/mfa/verify-setup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: userData.nhsID || userData.id,
            type: userData.nhsID ? 'patient' : 'clinician',
            code: code
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Invalid verification code');
        }
        return response.json();
    })
    .then(data => {
        alert('MFA setup successful! Please log in again.');
        location.reload();
    })
    .catch(error => {
        console.error('MFA setup verification failed:', error);
        alert('Invalid verification code. Please try again.');
    });
}

function show2FAModal(userData) {
    // Create the modal container
    const modal = document.createElement('div');
    modal.classList.add("mfa-modal");

    // Add content to the modal
    modal.innerHTML = `
        <h2>Two-Factor Authentication</h2>
        <p>Please enter the 6-digit code sent to your authenticator app:</p>
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
    overlay.classList.add("mfa-overlay");
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

            // Move to the next input if valid
            if (e.target.value.length === 1 && index < inputs.length - 1) {
                inputs[index + 1].focus(); // Move to the next input
            }

            // Check if all fields are filled
            if (Array.from(inputs).every(input => input.value.length === 1)) {
                const code = Array.from(inputs).map(input => input.value).join('');
                verify2FACode(userData, code); // Call the API with the entered code
            }
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && index > 0 && !e.target.value) {
                inputs[index - 1].focus(); // Move to the previous input on Backspace
            }
        });
    });
}

function verify2FACode(userData, code) {
    const endpoint = userData.nhsID ? 
        "https://sdp-api-n04w.onrender.com/auth/mfa/patient" :
        "https://sdp-api-n04w.onrender.com/auth/mfa/clinician";

    fetch(endpoint, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            id: userData.nhsID || userData.id,
            password: userData.password,
            code: code
         })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Invalid 2FA code");
        }
        return response.json();
    })
    .then(data => {
        alert("2FA verification successful! Redirecting to dashboard...");
        if (userData.nhsID) {
            localStorage.setItem("userType", "patient");
            localStorage.setItem("userToken", data.userToken);
            localStorage.setItem("userId", userData.nhsID);
            
            // Optional: Set token expiry
            const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000); // 24 hours
            localStorage.setItem("tokenExpiry", expiryTime);
            
            location.href = "../../html/dashboard/patient-dashboard.html";
        } else {
            localStorage.setItem("userType", "clinician");
            localStorage.setItem("userToken", data.userToken);
            localStorage.setItem("userId", userData.id);
            
            // Optional: Set token expiry
            const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000); // 24 hours
            localStorage.setItem("tokenExpiry", expiryTime);
            
            location.href = "../../html/dashboard/clinician-dashboard.html";
        }
    })
    .catch(error => {
        console.error("2FA verification failed:", error);
        alert("Invalid 2FA code. Please try again.");
    });
}