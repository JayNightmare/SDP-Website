// Function to format date to a readable string
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Function to create a history item element
function createHistoryItem(historyData) {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `
        <div class="date">${formatDate(historyData.timestamp)}</div>
        <div class="result">eGFR: ${historyData.result}</div>
    `;
    
    // Add click handler to show modal
    item.addEventListener('click', () => showHistoryDetail(historyData));
    
    return item;
}

// Function to show history detail in modal
function showHistoryDetail(historyData) {
    // Set the result
    document.getElementById('modal-result').textContent = `eGFR: ${historyData.result}`;
    
    // Clear previous answers
    const answersContainer = document.getElementById('modal-answers');
    answersContainer.innerHTML = '';
    
    // Add each answer
    Object.entries(historyData.answers).forEach(([question, answer]) => {
        const answerItem = document.createElement('div');
        answerItem.className = 'answer-item';
        answerItem.innerHTML = `
            <div class="question">${question}</div>
            <div class="answer">${answer}</div>
        `;
        answersContainer.appendChild(answerItem);
    });
    
    // Show the modal
    $('#historyModal').modal('show');
}

// Function to fetch patient data and display history
async function loadHistory() {
    try {
        const userType = localStorage.getItem("userType");
        const userToken = localStorage.getItem("userToken");
        
        if (!userType || !userToken) {
            window.location.href = "../../login.html";
            return;
        }

        // Fetch patient data from API
        const response = await fetch("https://sdp-api-n04w.onrender.com/patient", {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const patientData = await response.json();
        const historyData = patientData.results || [];
        const historyList = document.getElementById('history-list');
        
        if (historyData.length === 0) {
            historyList.innerHTML = '<div class="no-history">No calculation history available</div>';
            return;
        }

        // Sort history by timestamp (most recent first)
        historyData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Clear existing content
        historyList.innerHTML = '';

        // Add history items
        historyData.forEach(item => {
            historyList.appendChild(createHistoryItem(item));
        });

    } catch (error) {
        console.error('Error loading history:', error);
        document.getElementById('history-list').innerHTML = 
            '<div class="error">Error loading history. Please try again later.</div>';
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', loadHistory);
