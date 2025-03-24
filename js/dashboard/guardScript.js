// TODO: Implement guard script to prevent users who are not logged in to access the page
// Function to check if the user is logged in
function isLoggedIn() {
    const userToken = localStorage.getItem('userToken');
    const tokenExpiry = localStorage.getItem('tokenExpiry');

    if (userToken && tokenExpiry) {
        const expiryTimestamp = parseInt(tokenExpiry, 10);
        return expiryTimestamp > Date.now();
    }
    return false;
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
