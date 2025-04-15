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

// Function to show a popup when the login period expires
function showSessionExpiredPopup() {
    // Clear any existing inactivity timers and remove inactivity popup if present
    clearTimeout(inactivityTimeout);
    clearTimeout(popupTimeout);
    const existingPopup = document.querySelector('#inactivity-popup');
    const existingOverlay = document.querySelector('#inactivity-overlay');
    if (existingPopup) document.body.removeChild(existingPopup);
    if (existingOverlay) document.body.removeChild(existingOverlay);

    const popup = document.createElement('div');
    popup.id = 'popup-inactive-modal';
    popup.innerHTML = `
        <h2>Session Expired</h2>
        <br>
        <p>Your login session has expired. Please log back in for security reasons.</p>
        <br>
        <button id="session-expired-ok" style="padding: 10px 20px; background-color: #3e7c2e; color: #fff; border: none; border-radius: 4px; cursor: pointer;">OK</button>
    `;

    document.body.appendChild(popup);

    const overlay = document.createElement('div');
    overlay.id = 'overlay-inactive-modal';

    document.body.appendChild(overlay);

    document.getElementById('session-expired-ok').addEventListener('click', () => {
        document.body.removeChild(popup);
        document.body.removeChild(overlay);
        window.location.href = '../../html/account/index.html';
    });
}

// Modified guard script to show popup if session expired
function guardPage() {
    let userType = localStorage.getItem('userType');

    console.log('User Type:', userType);
    
    // Get the current URL
    const currentUrl = window.location.href;

    // check if the URL contains 'clinician-dashboard', if so, check if the userType is 'clinician'
    if (currentUrl.includes('cclinician-dashboard') && userType !== 'clinician') {
        window.location.href = '../../html/account/index.html';
    }

    if (isLoggedIn() === false) {
        showSessionExpiredPopup();
    }
}

let inactivityTimeout;
let popupTimeout;

// Function to show a popup when the user is inactive
function showInactivityPopup() {
    const popup = document.createElement('div');
    popup.id = 'popup-inactive-modal';
    popup.innerHTML = `
        <h2>Are you still there?</h2>
        <br>
        <p>You have been inactive for a while. Please confirm you are still here.</p>
        <br>
        <button id="inactivity-popup-ok" style="padding: 10px 20px; background-color: #3e7c2e; color: #fff; border: none; border-radius: 4px; cursor: pointer;">I'm here</button>
    `;

    document.body.appendChild(popup);

    const overlay = document.createElement('div');
    overlay.id = 'overlay-inactive-modal';
    document.body.appendChild(overlay);

    document.getElementById('inactivity-popup-ok').addEventListener('click', () => {
        document.body.removeChild(popup);
        document.body.removeChild(overlay);
        resetInactivityTimer();
    });

    // Set a timeout to force logout if no interaction with the popup
    popupTimeout = setTimeout(() => {
        forceLogout();
    }, 30000); // 30 seconds
}

// Function to force logout the user
function forceLogout() {
    localStorage.removeItem('userToken');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('userType');
    window.location.href = '../../html/account/index.html';
}

// Function to reset the inactivity timer
function resetInactivityTimer() {
    clearTimeout(inactivityTimeout);
    clearTimeout(popupTimeout);
    inactivityTimeout = setTimeout(() => {
        showInactivityPopup();
    }, 60000); // 60 seconds
}

// Event listeners to detect user activity
['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetInactivityTimer);
});

// Run the guard script when the page loads
window.onload = () => {
    guardPage();
    resetInactivityTimer();
};