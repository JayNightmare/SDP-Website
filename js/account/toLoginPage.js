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
        if (event.target.id === 'practitioner-login') {
            const practitionerID = document.getElementById('id-practitioner');
            if (practitionerID && practitionerID.value === "12345") {
                location.href = "../../html/dashboard/home-dashboard.html";
            } else {
                alert("Invalid practitioner ID");
            }
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

        // Handle registration form submission
        if (event.target.id === 'patient-register-submit') {
            const fullname = document.getElementById('fullname').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const dob = document.getElementById('dob').value;
            const phone = document.getElementById('phone').value;

            // Basic validation
            if (!fullname || !email || !password || !confirmPassword || !dob || !phone) {
                alert('Please fill in all fields');
                return;
            }
            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }
            if (!email.includes('@')) {
                alert('Please enter a valid email address');
                return;
            }

            // Prepare user data for API
            const userData = {
                fullname,
                email,
                password,
                dob,
                phone,
                type: 'patient'
            };

            // Send registration data to API
            fetch('https://sdp-api-n04w.onrender.com/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Registration failed');
                }
                return response.json();
            })
            .then(data => {
                // Store token if provided by API
                if (data.token) {
                    localStorage.setItem('token', data.token);
                }
                
                alert('Registration successful! Please log in.');
                // Return to login page
                fetch(`../../js/account/html/patient.html`)
                    .then(response => response.text())
                    .then(data => { shellElement.innerHTML = data; })
                    .catch(error => console.error('Error fetching login page:', error));
            })
            .catch(error => {
                console.error('Registration error:', error);
                alert('Registration failed. Please try again.');
            });
        }

        // Handle patient login
        if (event.target.id === 'patient-login') {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('remember-me').checked;

            // Basic validation
            if (!email || !password) {
                alert('Please enter both email and password');
                return;
            }

            // Send login request to API
            fetch('https://sdp-api-n04w.onrender.com/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Login failed');
                }
                return response.json();
            })
            .then(data => {
                // Store token from API
                if (data.token) {
                    localStorage.setItem('token', data.token);
                    // Store login state if remember me is checked
                    if (rememberMe) {
                        localStorage.setItem('isLoggedIn', 'true');
                    }
                    // Redirect to dashboard
                    location.href = "../../html/dashboard/home-dashboard.html";
                } else {
                    throw new Error('No token received');
                }
            })
            .catch(error => {
                console.error('Login error:', error);
                alert('Invalid email or password');
            });
        }
    });
});
