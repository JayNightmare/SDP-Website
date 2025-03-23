document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('click', function (event) {
        if (event.target && (event.target.id === 'patient-login')) {
            event.preventDefault(); // Prevent form submission if within a form
            
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            
            // Add basic validation
            if (!email || !password) {
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
                body: JSON.stringify({ email: email, password: password }),
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
                    localStorage.setItem("userId", data.userId); // Store user ID if provided
                    
                    // Optional: Set token expiry
                    const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000); // 24 hours
                    localStorage.setItem("tokenExpiry", expiryTime);
                    
                    location.href = "../../html/dashboard/home-dashboard.html";
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
        }
    });
    
    // Helper function to show error messages
    function showErrorMessage(message) {
        const errorElement = document.getElementById("login-error") || 
                            createErrorElement();
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