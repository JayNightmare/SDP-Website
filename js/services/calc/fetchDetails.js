import { updateEGFRMarker } from "./marker.js";
import { restoreAnswers } from "./restoreAnswers.js";
import { exportAnswer } from "./";
import { calculateEGFR, calculatePredEGFR } from "./eGFRCalc.js";

const shellElement = document.querySelector('.shell');
let answers = exportAnswer();

export function fetchQuestion(target) {
    // If target is a number, convert it to question format
    const questionFile = typeof target === 'number' ? `question${target}` : target;
    fetch(`../../../js/services/calc/html/${questionFile}.html`)
        .then(response => response.text())
        .then(data => {
            shellElement.innerHTML = data;

            setTimeout(() => restoreAnswers(answers), 50);
        })
        .catch(error => console.error('Error fetching question:', error));
}

export function fetchPreResults() {
    console.log("User Answers:", answers);
    fetch(`../../../js/services/calc/html/question6.html`)
        .then(response => response.text())
        .then(data => {
            shellElement.innerHTML = data;
            displayResults();
        })
        .catch(error => console.error('Error fetching results:', error));
}

export function fetchResults() {
    console.log("User Answers:", answers);
    fetch(`../../../js/services/calc/html/results.html`)
        .then(response => response.text())
        .then(data => {
            shellElement.innerHTML = data;
            let resultsValue;
            if (answers["1"] === "no") {
                resultsValue = calculatePredEGFR(answers);
            } else {
                resultsValue = calculateEGFR(answers);
            }
            updateEGFRMarker(resultsValue);
        })
        .catch(error => console.error('Error fetching results:', error));
}

function displayResults() {
    const resultsContainer = document.getElementById('results-container');
    if (!resultsContainer) {
        console.error('Results container not found');
        return;
    }

    const resultList = document.createElement('ul');

    Object.keys(answers).forEach(questionNumber => {
        const listItem = document.createElement('li');
        listItem.classList.add('r_34');
        listItem.innerHTML = `<strong>Question ${questionNumber}:</strong> ${answers[questionNumber]}`;
        resultList.appendChild(listItem);
    });

    resultsContainer.appendChild(resultList);
}