import { ENDPOINT } from "../../config/config.js";

// Function to format a date into a readable format
function formatDate(timestamp) {
    const date = new Date(timestamp);
    const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    };
    return date.toLocaleDateString(undefined, options);
}

// Function to create a history item element
function createHistoryItem(resultData, answersData) {
    const item = document.createElement("div");
    console.log("Creating history item:", resultData, answersData);
    item.className = "history-item";
    item.innerHTML = `
        <div class="date">${formatDate(answersData.timestamp)}</div>
        <div class="result">eGFR: ${resultData.eGFR} mL/min/1.73m²</div>
    `;

    // Add click handler to show modal
    item.addEventListener("click", () =>
        showHistoryDetail(resultData, answersData),
    );

    return item;
}

// Function to show history detail in modal
function showHistoryDetail(resultData, answersData) {
    // Reset modal content
    document.getElementById("modal-result").textContent = "";
    const answersContainer = document.getElementById("modal-answers");
    answersContainer.innerHTML = "";

    // Validate resultData
    if (!resultData) {
        console.error("Invalid resultData:", resultData);
        document.getElementById("modal-result").textContent =
            "Invalid result data";
        return;
    }

    // Set the result
    document.getElementById("modal-result").textContent =
        `eGFR: ${resultData.eGFR} mL/min/1.73m²`;
    document.getElementById("modal-date").textContent = formatDate(
        answersData.timestamp,
    );

    // Validate and add answers
    if (answersData && typeof answersData === "object") {
        let questionNumber = 1;
        Object.entries(answersData).forEach(([question, answer]) => {
            if (
                question === "resultId" ||
                question === "_id" ||
                question === "timestamp" ||
                answer === null
            ) {
                return; // Skip displaying result_id and _id
            }

            const splitQuestion = question.split("-");
            const questionLabel =
                splitQuestion.length > 1
                    ? `Question ${questionNumber}: ${splitQuestion[1].trim()}`
                    : `Question ${questionNumber}: ${splitQuestion[0].trim()}`;

            const answerItem = document.createElement("div");
            answerItem.className = "answer-item";
            answerItem.innerHTML = `
                <div class="question">${questionLabel}</div>
                <div class="answer">${answer}</div>
            `;
            answersContainer.appendChild(answerItem);
            questionNumber++;
        });
    } else {
        answersContainer.innerHTML =
            '<div class="no-answers">No answers available</div>';
    }

    // Show the modal
    $("#historyModal").modal("show");
}

// Function to fetch patient data and display history
async function loadHistory() {
    try {
        const userToken = localStorage.getItem("userToken");
        if (!userToken) {
            throw new Error("User token not found. Please log in again.");
        }

        // Fetch patient data from API
        const response = await fetch("${ENDPOINT}/patient", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userToken}`,
            },
        });
        console.log("Response:", response);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const patientData = await response.json();
        if (
            !patientData ||
            !Array.isArray(patientData.results) ||
            !Array.isArray(patientData.answers)
        ) {
            throw new Error("Invalid patient data format");
        }

        const historyResultsData = patientData.results;
        const historyAnswersData = patientData.answers;
        console.log("History Results Data:", historyResultsData);
        console.log("History Answers Data:", historyAnswersData);
        const historyList = document.getElementById("history-list");

        if (historyResultsData.length === 0) {
            historyList.innerHTML =
                '<div class="no-history">No calculation history available</div>';
            return;
        }

        // Sort history by timestamp (most recent first)
        historyResultsData.sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
        );

        // Clear existing content
        historyList.innerHTML = "";

        // Add history items - matching results with corresponding answers by index
        historyResultsData.forEach((resultItem, index) => {
            const answersItem = historyAnswersData[index] || {};
            historyList.appendChild(createHistoryItem(resultItem, answersItem));
        });
    } catch (error) {
        console.error("Error loading history:", error);
        document.getElementById("history-list").innerHTML =
            `<div class="error">Error loading history: ${error.message}. Please try again later.</div>`;
    }
}

// Ensure loadHistory is called when the page loads
document.addEventListener("DOMContentLoaded", function () {
    loadHistory();
});
