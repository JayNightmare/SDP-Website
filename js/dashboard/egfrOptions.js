document.addEventListener('DOMContentLoaded', function() {
    const csvUpload = document.getElementById('csv-upload');
    const fileName = document.getElementById('file-name');
    const missingFields = document.getElementById('missing-fields');
    const missingFieldsForm = document.getElementById('missing-fields-form');

    // Required fields for eGFR calculation
    const requiredFields = ['age', 'sex', 'race', 'creatinine'];

    csvUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        fileName.textContent = file.name;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const text = e.target.result;
            processCSV(text);
        };
        reader.readAsText(file);
    });

    function processCSV(csv) {
        // Parse CSV
        const lines = csv.split('\n');
        if (lines.length < 2) {
            alert('CSV file appears to be empty');
            return;
        }

        // Get headers and convert to lowercase for comparison
        const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
        
        // Check for missing required fields
        const missingRequiredFields = requiredFields.filter(field => 
            !headers.includes(field)
        );

        if (missingRequiredFields.length > 0) {
            // Show missing fields form
            missingFields.style.display = 'block';
            missingFieldsForm.innerHTML = missingRequiredFields.map(field => `
                <div class="form-group">
                    <label for="${field}">${field.charAt(0).toUpperCase() + field.slice(1)}:</label>
                    <input type="text" id="${field}" name="${field}" required>
                </div>
            `).join('');

            // Add submit button
            missingFieldsForm.innerHTML += `
                <button type="submit" class="action-button">
                    <i class="fa fa-check"></i>
                    Process CSV
                </button>
            `;

            // Handle form submission
            missingFieldsForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Get values from form
                const formData = new FormData(missingFieldsForm);
                const missingValues = {};
                for (let [key, value] of formData.entries()) {
                    missingValues[key] = value;
                }

                // Process CSV with missing values
                processCSVWithMissingValues(lines, headers, missingValues);
            });
        } else {
            // All required fields present, process directly
            processCSVWithMissingValues(lines, headers, {});
        }
    }

    function processCSVWithMissingValues(lines, headers, missingValues) {
        const results = [];

        // Process each line (skipping header)
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue; // Skip empty lines

            const values = lines[i].split(',').map(val => val.trim());
            const row = {};

            // Map CSV values
            headers.forEach((header, index) => {
                row[header] = values[index];
            });

            // Add missing values
            Object.assign(row, missingValues);

            // Validate required fields
            if (requiredFields.every(field => row[field])) {
                results.push(row);
            }
        }

        // Send results to server
        const userToken = localStorage.getItem('userToken');

        fetch(`https://sdp-api-n04w.onrender.com/patient`, {
            headers: {
                'Authorization': `Bearer ${userToken}`,
                'Content-Type': 'application/json'
            }
        }).then(response => {
            if (!response.ok) throw new Error('Failed to fetch patient data');
            return response.json();
        }).then(data => {
            results.forEach(result => {
                fetch(`https://sdp-api-n04w.onrender.com/patient/${data.id}/results`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${userToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        creat: result.creatinine,
                        calcType: 'CSV Upload (MDRD)',
                        result: calculateEGFR(result)
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        alert('CSV data processed successfully!');
                        window.location.href = 'patient-dashboard.html';
                    } else {
                        throw new Error(data.message);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Failed to process CSV data. Please try again.');
                });
            });
        });
    }

    function calculateEGFR(data) {
        const age = parseInt(data.age);
        const scr = parseFloat(data.creatinine);
        const isFemale = data.sex.toLowerCase() === 'female';
        const isBlack = data.race.toLowerCase() === 'black';

        let egfr = 186 * Math.pow(scr, -1.154) * Math.pow(age, -0.203);
        
        if (isFemale) { egfr *= 0.742; }
        if (isBlack) { egfr *= 1.212; }

        return Math.round(egfr * 10) / 10; // Round to 1 decimal place
    }
});
