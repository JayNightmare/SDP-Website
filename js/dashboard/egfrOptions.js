import { ENDPOINT } from "../../config/config.js";

document.addEventListener("DOMContentLoaded", function () {
    const csvUpload = document.getElementById("csv-upload");
    const fileName = document.getElementById("file-name");
    const missingFields = document.getElementById("missing-fields");
    const missingFieldsForm = document.getElementById("missing-fields-form");
    const patientDropdown = document.getElementById("patient-dropdown");
    const patientSelection = document.getElementById("patient-selection");

    // Get Clinician ID from the endpoint using the token
    async function getClinicianId() {
        try {
            const response = await fetch(`${ENDPOINT}/clinician`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("userToken")}`,
                },
            });
            if (!response.ok) throw new Error("Failed to fetch clinician ID");
            const data = await response.json();
            return data.id;
        } catch (error) {
            console.error("Error fetching clinician ID:", error);
            return null;
        }
    }

    let clinicianId = getClinicianId();

    // Required fields for eGFR calculation
    const requiredFields = ["age", "sex", "race", "creatinine"];

    // Function to fetch patients for clinician
    async function fetchPatients() {
        const userToken = localStorage.getItem("userToken");
        try {
            // //
            // ! Get Patient ID's from clinician endpoint
            const getPatientIds = await fetch(
                `${ENDPOINT}/clinician/${clinicianId}/patients`,
                {
                    headers: {
                        Authorization: `Bearer ${userToken}`,
                        "Content-Type": "application/json",
                    },
                },
            );
            if (!getPatientIds.ok) throw new Error("Failed to fetch patients");
            const patients = await getPatientIds.json();
            console.log("Patients:", patients);

            // //

            // ! Get Patient details from clinician endpoint
            const getPatientDetails = await fetch(
                `${ENDPOINT}/clinician/${clinicianId}/patients/details`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${userToken}`,
                    },
                },
            );
            if (!getPatientDetails.ok)
                throw new Error("Failed to fetch patient details");
            const patientDetails = await getPatientDetails.json();
            console.log("Patient Details:", patientDetails);
            // //

            // Clear existing options except the default one
            patientDropdown.innerHTML =
                '<option value="">Choose a patient...</option>';

            // Add patient options
            patientDetails.patients.forEach((patient) => {
                const option = document.createElement("option");
                option.value = patient.id;
                option.textContent = `${patient.fullname} (${patient.id})`;
                patientDropdown.appendChild(option);
            });
        } catch (error) {
            console.error("Error fetching patients:", error);
            alert("Failed to load patient list. Please try again.");
        }
    }

    csvUpload.addEventListener("change", async function (e) {
        const file = e.target.files[0];
        if (!file) return;

        fileName.textContent = file.name;

        // If user is clinician, fetch patients first
        const userRole = localStorage.getItem("userType");
        if (userRole === "clinician") {
            patientSelection.style.display = "block";
            await fetchPatients();
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const text = e.target.result;
            processCSV(text);
        };
        reader.readAsText(file);
    });

    function processCSV(csv) {
        // Parse CSV
        const lines = csv.split("\n");
        if (lines.length < 2) {
            alert("CSV file appears to be empty");
            return;
        }
        console.log("CSV Lines:", lines);

        // Get headers and convert to lowercase for comparison
        const headers = lines[0]
            .split(",")
            .map((header) => header.trim().toLowerCase());

        // Check for missing required fields in headers
        const missingRequiredFields = requiredFields.filter(
            (field) => !headers.includes(field),
        );

        // Check for missing values in the first data row
        const firstDataRow = lines[1].split(",").map((val) => val.trim());
        const missingValues = [];

        requiredFields.forEach((field) => {
            const fieldIndex = headers.indexOf(field);
            if (
                fieldIndex !== -1 &&
                (!firstDataRow[fieldIndex] || firstDataRow[fieldIndex] === "")
            ) {
                missingValues.push(field);
            }
        });

        const allMissingFields = [
            ...new Set([...missingRequiredFields, ...missingValues]),
        ];

        if (allMissingFields.length > 0) {
            // Show missing fields form
            missingFields.style.display = "block";
            missingFieldsForm.innerHTML = allMissingFields
                .map(
                    (field) => `
                <div class="form-group">
                    <label for="${field}">${field.charAt(0).toUpperCase() + field.slice(1)}:</label>
                    <input type="text" id="${field}" name="${field}" required>
                </div>
            `,
                )
                .join("");

            // Add submit button
            missingFieldsForm.innerHTML += `
                <button type="submit" class="action-button">
                    <i class="fa fa-check"></i>
                    Process CSV
                </button>
            `;

            // Handle form submission
            if (!missingFieldsForm.dataset.listenerAdded) {
                missingFieldsForm.addEventListener("submit", function (e) {
                    e.preventDefault();

                    // Get values from form
                    const formData = new FormData(missingFieldsForm);
                    const missingFieldValues = {};
                    for (let [key, value] of formData.entries()) {
                        missingFieldValues[key] = value;
                    }

                    // Process CSV with missing values
                    processCSVWithMissingValues(
                        lines,
                        headers,
                        missingFieldValues,
                    );
                });
                missingFieldsForm.dataset.listenerAdded = true;
            }
        } else {
            // All required fields present, process directly
            processCSVWithMissingValues(lines, headers, {});
        }
    }

    function processCSVWithMissingValues(lines, headers, missingFieldValues) {
        const results = [];

        // Process each line (skipping header)
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue; // Skip empty lines

            const values = lines[i].split(",").map((val) => val.trim());
            const row = {};

            // Map CSV values
            headers.forEach((header, index) => {
                row[header] = values[index] || "";
            });

            // Add missing values from form
            Object.keys(missingFieldValues).forEach((field) => {
                // If field is missing in headers or value is empty, use the provided value
                if (!headers.includes(field) || !row[field]) {
                    row[field] = missingFieldValues[field];
                }
            });

            // Validate all required fields have values
            if (requiredFields.every((field) => row[field])) {
                results.push(row);
            }
        }

        const userRole = localStorage.getItem("userType");
        if (userRole === "clinician") {
            const selectedPatientId =
                document.getElementById("patient-dropdown").value;
            if (!selectedPatientId) {
                alert("Please select a patient before processing the CSV.");
                return;
            }

            // Store results globally for submit button
            window.processedResults = results;

            // Display results in a table
            const resultsTable = document.getElementById("results-table");
            const resultsCard = document.querySelector(".results-card");
            const submitButton = document.getElementById("submit-results");

            resultsTable.innerHTML = `
                <thead>
                    <tr>
                        ${headers.map((header) => `<th>${header.charAt(0).toUpperCase() + header.slice(1)}</th>`).join("")}
                        <th>eGFR</th>
                    </tr>
                </thead>
                <tbody>
                    ${results
                        .map(
                            (result) => `
                        <tr>
                            ${headers.map((header) => `<td>${result[header]}</td>`).join("")}
                            <td>${calculateEGFR(result)} mL/min/1.73m²</td>
                        </tr>
                    `,
                        )
                        .join("")}
                </tbody>
            `;
            resultsTable.style.display = "table";
            resultsCard.style.display = "block";
            submitButton.style.display = "block";

            // Add submit button handler
            submitButton.onclick = async function () {
                const userToken = localStorage.getItem("userToken");
                try {
                    let resultId = 1;
                    const promises = window.processedResults.map((result) => {
                        let creatinineValue = result.creatinine;
                        let creatinineUnit = "mg/dL";
                        const match = creatinineValue.match(
                            /^([\d.]+)\s*(µmol\/l|umol\/l|mg\/dl)?$/i,
                        );
                        if (match) {
                            creatinineValue = match[1];
                            creatinineUnit = match[2] || "mg/dL";
                        }

                        return fetch(
                            `${ENDPOINT}/patient/${selectedPatientId}/results`,
                            {
                                method: "POST",
                                headers: {
                                    Authorization: `Bearer ${userToken}`,
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    resultId: resultId,
                                    creat: creatinineValue,
                                    calcType: creatinineUnit,
                                    result: calculateEGFR(result),
                                }),
                            },
                        );
                    });

                    // Create answers array from the results
                    const answers = window.processedResults.map((result) => {
                        return fetch(
                            `${ENDPOINT}/patient/${selectedPatientId}/answers`,
                            {
                                method: "POST",
                                headers: {
                                    Authorization: `Bearer ${userToken}`,
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    resultId: resultId,
                                    "2-Age": result.age,
                                    "3-Gender": result.sex,
                                    "4-SC-Unit": "mg/dL",
                                    "4-SerumCreatinine": result.creatinine,
                                    "5-Race": result.race,
                                    "6-Race": null,
                                    "7-Height": null,
                                }),
                            },
                        );
                    });

                    await Promise.all([...promises, ...answers]);
                    alert("Results submitted successfully!");
                    // window.location.href = 'clinician-dashboard.html';
                } catch (error) {
                    console.error("Error:", error);
                    alert("Failed to submit results. Please try again.");
                }
            };
        } else {
            // Send results to server
            const userToken = localStorage.getItem("userToken");

            fetch(`${ENDPOINT}/patient`, {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                    "Content-Type": "application/json",
                },
            })
                .then((response) => {
                    if (!response.ok)
                        throw new Error("Failed to fetch patient data");
                    return response.json();
                })
                .then((data) => {
                    results.forEach((result) => {
                        // Extract creatinine value and unit
                        let creatinineValue = result.creatinine;
                        let creatinineUnit = "mg/dL"; // Default unit
                        const match = creatinineValue.match(
                            /^([\d.]+)\s*(µmol\/l|umol\/l|mg\/dl)?$/i,
                        );
                        if (match) {
                            creatinineValue = match[1];
                            creatinineUnit = match[2] || "mg/dL";
                        }

                        fetch(`${ENDPOINT}/patient/${data.id}/results`, {
                            method: "POST",
                            headers: {
                                Authorization: `Bearer ${userToken}`,
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                creat: creatinineValue,
                                calcType: creatinineUnit,
                                result: calculateEGFR(result),
                            }),
                        })
                            .then((response) => response.json())
                            .then((data) => {
                                if (data.status === "success") {
                                    alert("CSV data processed successfully!");
                                    window.location.href =
                                        "patient-dashboard.html";
                                } else {
                                    throw new Error(data.message);
                                }
                            })
                            .catch((error) => {
                                console.error("Error:", error);
                                alert(
                                    "Failed to process CSV data. Please try again.",
                                );
                            });
                    });
                });
        }
    }

    function calculateEGFR(data) {
        const age = parseInt(data.age);
        let scrRaw = data.creatinine.trim().toLowerCase(); // e.g., "88.4 µmol/l" or "1.2 mg/dl"
        const isFemale = data.sex.toLowerCase() === "female";
        const isBlack = data.race.toLowerCase() === "black";

        let scr = null;
        let unit = null;

        // Extract value and unit using regex
        const match = scrRaw.match(/^([\d.]+)\s*(µmol\/l|umol\/l|mg\/dl)?$/i);

        if (match) {
            scr = parseFloat(match[1]);
            unit = match[2]?.toLowerCase() || "mg/dl"; // default to mg/dL if not present
        } else {
            console.warn("Invalid creatinine value format:", scrRaw);
            return null; // or handle error
        }

        // Convert µmol/L to mg/dL if needed
        if (unit === "µmol/l" || unit === "umol/l") {
            scr = scr * 0.011312;
        }

        let egfr = 186 * Math.pow(scr, -1.154) * Math.pow(age, -0.203);

        if (isFemale) egfr *= 0.742;
        if (isBlack) egfr *= 1.212;

        return Math.round(egfr * 10) / 10;
    }
});
