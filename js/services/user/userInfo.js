(async function() {
    let userToken = localStorage.getItem("userToken");
    let userType = localStorage.getItem("userType")

    let userName = document.getElementById("userName");
    try {
        let user = await getUserData(userType, userToken);
        console.log(user);
        userName.innerText = user.email;
    } catch (error) {
        console.error("Error fetching user data:", error);
    }
})();

async function getUserData(type, userToken) {
    // Validate inputs before making request
    if (!type || !userToken) {
        console.error("Missing required parameters: type or userToken");
        throw new Error("Missing authentication information");
    }
    
    let url;
    if (type === "clinician") {
        url = "https://sdp-api-n04w.onrender.com/clinician";
    } else if (type === "patient") {
        url = "https://sdp-api-n04w.onrender.com/patient";
    } else {
        console.error("Invalid user type:", type);
        throw new Error("Invalid user type");
    }
    
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            }
        });
        
        // Check response status
        if (response.status === 422) {
            console.error("Server could not process the request (422)");
            const errorData = await response.json();
            console.log("Error details:", errorData);
            throw new Error(errorData.message || "Invalid request format");
        }
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error(`HTTP error ${response.status}:`, errorData);
            throw new Error(errorData.message || `Request failed with status ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error("Error fetching user data:", error);
        throw error;
    }
}

async function loadUserProfile() {
    try {
        const userType = localStorage.getItem("userType");
        const userToken = localStorage.getItem("userToken");
        
        if (!userType || !userToken) {
            // Redirect to login
            window.location.href = "../../login.html";
            return;
        }
        
        const userData = await getUserData(userType, userToken);
        console.log("User data loaded:", userData);
        
        // Update UI with user data
        // ...
        
    } catch (error) {
        console.error("Failed to load profile:", error);
        // Show error message to user
        document.getElementById("error-container").textContent = 
            "Failed to load your profile. Please try logging in again.";
    }
}

// Call this function when the page loads
document.addEventListener("DOMContentLoaded", loadUserProfile);