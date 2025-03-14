document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('click', function (event) {
        if (event.target && (event.target.id === 'patient-login')) {
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;


            fetch("https://sdp-api-n04w.onrender.com/auth/login/patient", {
                method: "POST",
                body: JSON.stringify({ email: email, password: password }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.status) {
                    localStorage.setItem("userType", "patient")
                    localStorage.setItem("userToken", data.userToken)
                    location.href = "../../html/dashboard/home-dashboard.html";
                } else {
                    alert("Invalid credentials");
                }
            })
            .catch(error => console.error('Error:', error));
        }
        else if (event.target && (event.target.id === 'clinician-login')) {
            const id = document.getElementById("id").value;
            const password = document.getElementById("password").value;

            fetch("https://sdp-api-n04w.onrender.com/auth/login/clinician", {
                method: "POST",
                body: JSON.stringify({ id: id, password: password }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.status) {
                    localStorage.setItem("userToken", data.userToken)
                    localStorage.setItem("userType", "clinician")
                    location.href = "../../html/dashboard/home-dashboard.html";
                } else {
                    alert("Invalid credentials");
                }
            })
            .catch(error => console.error('Error:', error));
        }
    })
})