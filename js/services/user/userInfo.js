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
    let response;
    if (type === "clinician") {
        response = await fetch("https://sdp-api-n04w.onrender.com/clinician", {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
        }})}
    else if (type === "patient") {
        response = await fetch("https://sdp-api-n04w.onrender.com/patient", {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
        }});
    }

    return await response.json();
}