function onMfaSetup(user) {
    createQR(user);

    // Create the modal container
    const modal = document.createElement("div");
    modal.classList.add("mfa-modal");

    // Add content to the modal
    modal.innerHTML = `
        <h2>Setup Multi-Factor Authentication</h2>
        <p>Scan the QR code below using your authenticator app:</p>
        <div id="qrcode">
            <img src="https://placehold.co/150" alt="QR Code">
        </div>
        <p>Enter the 6-digit code from your authenticator app:</p>
        <div class="mfa-input-container">
            <input type="text" maxlength="1" class="mfa-input" />
            <input type="text" maxlength="1" class="mfa-input" />
            <input type="text" maxlength="1" class="mfa-input" />
            <input type="text" maxlength="1" class="mfa-input" />
            <input type="text" maxlength="1" class="mfa-input" />
            <input type="text" maxlength="1" class="mfa-input" />
        </div>
        <button id="close-mfa-modal" style="padding: 10px 20px; background-color: #3e7c2e; color: #fff; border: none; border-radius: 4px; cursor: pointer;">Close</button>
    `;

    // Append the modal to the body
    document.body.appendChild(modal);

    // Add a semi-transparent background overlay
    const overlay = document.createElement("div");
    overlay.classList.add("mfa-overlay");

    document.body.appendChild(overlay);

    // Add event listener to close the modal
    document.getElementById("close-mfa-modal").addEventListener("click", () => {
        document.body.removeChild(overlay);
        document.body.removeChild(modal);
    });

    // Add event listeners to input fields for auto-jumping
    const inputs = modal.querySelectorAll(".mfa-input");
    inputs.forEach((input, index) => {
        input.addEventListener("input", (e) => {
            // Allow only digits (0-9)
            if (!/^\d$/.test(e.target.value)) {
                e.target.value = ""; // Clear invalid input
                return;
            }

            // Move to the next input if valid
            if (e.target.value.length === 1 && index < inputs.length - 1) {
                inputs[index + 1].focus(); // Move to the next input
            }

            // Check if all fields are filled
            if (Array.from(inputs).every((input) => input.value.length === 1)) {
                const code = Array.from(inputs)
                    .map((input) => input.value)
                    .join("");
                verifyMfaCode(code); // Call the API with the entered code
            }
        });

        input.addEventListener("keydown", (e) => {
            if (e.key === "Backspace" && index > 0 && !e.target.value) {
                inputs[index - 1].focus(); // Move to the previous input on Backspace
            }
        });
    });
}

function createQR(user) {
    let userToken = localStorage.getItem("userToken");
    if (!userToken || userToken === "undefined") {
        console.error("User token not found in localStorage.");
        return;
    }

    // async fetch to get the QR code
    fetch("${ENDPOINT}/auth/mfa", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
        },
    })
        .then(async (response) => {
            if (!response.ok) {
                if (response.status === 422) {
                    const errorData = await response.json();
                    throw new Error(
                        errorData.message || "Unprocessable Entity",
                    );
                }
                throw new Error("Failed to verify MFA code");
            }
            return response.json();
        })
        .then((data) => {
            let payload = `otpauth://totp/${user}?secret=${data.secret}&issuer=SDP%20CKD`;
            console.log(`MFA data: ${data.secret}`);
            console.log(`Payload: ${payload}`);
            // console.log(data)
            let qrdiv = document.getElementById("qrcode");
            qrdiv.innerHTML = ""; // Clear previous QR code if any

            var qrCode = new QRCode(qrdiv, {
                text: payload,
                width: 150,
                height: 150,
            });
        })
        .catch((error) => console.error("Could not create a MFA key:", error));
}

function verifyMfaCode(code) {
    const userToken = localStorage.getItem("userToken");

    fetch("${ENDPOINT}/auth/mfa", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            code: code,
        }),
    })
        .then(async (response) => {
            if (!response.ok) {
                if (response.status === 422) {
                    const errorData = await response.json();
                    throw new Error(
                        errorData.message || "Unprocessable Entity",
                    );
                }
                throw new Error("Failed to verify MFA code");
            }
            return response.json();
        })
        .then((data) => {
            console.log("MFA verification successful:", data);

            // Notify the user
            alert(
                "MFA setup complete! For security reasons, you will now be logged out.",
            );

            // Log out the user
            localStorage.removeItem("userToken"); // Clear the user token
            localStorage.removeItem("userType"); // Clear any other user-related data
            window.location.href = "../../html/account/index.html"; // Redirect to the login page
        })
        .catch((error) => {
            console.error("MFA verification failed:", error);
            alert(error.message || "Invalid MFA code. Please try again.");
        });
}
