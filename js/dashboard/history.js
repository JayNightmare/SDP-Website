// Function to create a history item element
function createHistoryItem(resultData, answersData) {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `
        <div class="date">${formatDate(resultData.timestamp)}</div>
        <div class="result">eGFR: ${resultData.result}</div>
    `;
    
    // Add click handler to show modal
    item.addEventListener('click', () => showHistoryDetail(resultData, answersData));
    
    return item;
}

// Function to show history detail in modal
function showHistoryDetail(resultData, answersData) {
    // Set the result
    document.getElementById('modal-result').textContent = `eGFR: ${resultData.result}`;
    
    // Clear previous answers
    const answersContainer = document.getElementById('modal-answers');
    answersContainer.innerHTML = '';
    
    // Add each answer
    Object.entries(answersData).forEach(([question, answer]) => {
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
        const userToken = localStorage.getItem("userToken");

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
        const historyResultsData = patientData.results || [];
        const historyAnswersData = patientData.answers || [];
        console.log(historyResultsData);
        console.log(historyAnswersData);
        const historyList = document.getElementById('history-list');
        
        if (historyResultsData.length === 0) {
            historyList.innerHTML = '<div class="no-history">No calculation history available</div>';
            return;
        }

        // Sort history by timestamp (most recent first)
        historyResultsData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Clear existing content
        historyList.innerHTML = '';

        // Add history items - matching results with corresponding answers by index
        historyResultsData.forEach((resultItem, index) => {
            const answersItem = historyAnswersData[index] || {};
            historyList.appendChild(createHistoryItem(resultItem, answersItem));
        });

    } catch (error) {
        console.error('Error loading history:', error);
        document.getElementById('history-list').innerHTML = 
            '<div class="error">Error loading history. Please try again later.</div>';
    }
}
