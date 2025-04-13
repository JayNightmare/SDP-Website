document.addEventListener('DOMContentLoaded', function() {
    // Get user data from localStorage
    const userToken = localStorage.getItem('userToken');

    // Update last login time
    const lastLoginElement = document.getElementById('last-login-time');
    lastLoginElement.textContent = new Date().toLocaleString();

    // Fetch patient data from API
    fetch(`https://sdp-api-n04w.onrender.com/patient`, {
        headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to fetch patient data');
        return response.json();
    })
    .then(data => {
        // Update patient name in header
        document.getElementById('patient-name').textContent = data.fullname;

        // Update patient information card
        document.getElementById('full-name').textContent = data.fullname;
        document.getElementById('dob').textContent = new Date(data.dob).toLocaleDateString();
        document.getElementById('phone').textContent = data.phone;
        document.getElementById('id').textContent = data.id;

        // MFA status
        document.getElementById('mfa').innerHTML = data.mfa?.verified ?
        `2FA enabled` :
        `<button onClick="onMfaSetup(${data.id})">Setup MFA</button>`;

        // Handle eGFR results
        if (data.results && data.results.length > 0) {
            // Sort by date descending (assuming most recent results are at the end of array)
            const sortedResults = [...data.results].reverse();

            // Update latest result
            const latest = sortedResults[0];
            console.log(latest);
            console.log(sortedResults)
            document.getElementById('latest-egfr').textContent = `${latest.eGFR} mL/min/1.73m²`;
            document.getElementById('latest-egfr-date').textContent = new Date().toLocaleDateString(); // Using current date as results don't include date


            // Update history
            const historyContainer = document.getElementById('egfr-history');
            sortedResults.slice(1, 3).forEach(result => {
                const calculationTypeMatch = result.calculationType.match(/\[(.*?)\]/) || result.calculationType.match(/\((.*?)\)/);
                const unit = calculationTypeMatch ? calculationTypeMatch[1] : 'mg/dL';
                const resultElement = document.createElement('div');
                resultElement.className = 'result-row';
                resultElement.innerHTML = `
                    <div class="result-header">${result.calculationType}</div>
                    <div class="result-value">${result.eGFR} mL/min/1.73m²</div>
                    <div class="result-details">
                        Creatinine: ${result.creatine} ${unit}

                    </div>
                `;
                historyContainer.appendChild(resultElement);
            });
        } else {
            // No results available
            document.getElementById('latest-egfr').textContent = 'No results';
            document.getElementById('latest-egfr-date').textContent = 'N/A';
            
            const historyContainer = document.getElementById('egfr-history');
            historyContainer.innerHTML = '<div class="no-results">No previous results available. Use the eGFR Calculator to get started.</div>';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to load patient data. Please refresh the page.');
    });
});
