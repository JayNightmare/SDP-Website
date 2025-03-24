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

        // Practitioner handlers
        if (event.target.id === 'practitioner-code') {
            fetch(`../../js/account/html/extraPractitioner.html`)
                .then(response => response.text())
                .then(data => { shellElement.innerHTML = data; })
                .catch(error => console.error('Error fetching page:', error));
        }

        // Patient registration handlers
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
                if (!response.ok) {
                    throw new Error(`Server responded with status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.status === "success") {
                    localStorage.setItem("userType", "patient");
                    localStorage.setItem("userToken", data.userToken);
                    
                    // Optional: Set token expiry
                    const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000); // 24 hours
                    localStorage.setItem("tokenExpiry", expiryTime);
                    
                    location.href = "../../html/dashboard/patient-dashboard.html";
                } else {
                    showErrorMessage(data.message || "Invalid credentials");
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showErrorMessage("Login failed. Please try again later.");
            })
            .finally(() => {
                // Restore button state
                loginButton.textContent = originalText;
                loginButton.disabled = false;
            });
        } else if (event.target && (event.target.id === 'practitioner-login')) {
            const id = document.getElementById("id").value;
            const password = document.getElementById("password").value;

            // Show loading state
            const loginButton = event.target;
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
                if (!response.ok) {
                    throw new Error('Login failed');
                }
                return response.json();
            })
            .then(data => {
                if (data.status === 'success') {
                    localStorage.setItem('userType', 'clinician');
                    localStorage.setItem('userToken', data.userToken);
                    
                    // Set token expiry
                    const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000); // 24 hours
                    localStorage.setItem('tokenExpiry', expiryTime);
                    
                    location.href = '../../html/dashboard/clinician-dashboard.html';
                } else {
                    throw new Error(data.message || 'Login failed');
                }
            })
            .catch(error => {
                console.error('Login error:', error);
                alert('Login failed. Please try again later.');
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
            
            // Insert after login button or another appropriate location
            const loginButton = document.getElementById("patient-login");
            loginButton.parentNode.insertBefore(errorDiv, loginButton.nextSibling);
            
            return errorDiv;
        }
    });
});
