// TODO: Implement guard script to prevent users who are not logged in to access the page
// Function to check if the user is logged in
function isLoggedIn() {
    // Check for a specific token or session variable
    // This is just an example, replace with your actual authentication logic
    return localStorage.getItem('userToken') !== null;
}

// Guard script to prevent access if not logged in
function guardPage() {
    if (!isLoggedIn()) {
        // Redirect to login page if not logged in
        window.location.href = '../../html/account/index.html';
    }
}

// Run the guard script when the page loads
window.onload = guardPage;
