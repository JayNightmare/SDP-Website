document.addEventListener('DOMContentLoaded', function() {
    // Get the logout link
    const logoutLink = document.querySelector('.logout');
    
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default link behavior
            
            // Clear all authentication-related data from localStorage
            localStorage.removeItem('userToken');
            localStorage.removeItem('userType');
            localStorage.removeItem('tokenExpiry');
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userId');
            
            // Redirect to login page
            window.location.href = '../../html/account/index.html';
        });
    }
});
