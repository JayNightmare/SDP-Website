import { updateEGFRMarker } from "./marker.js";
import { restoreAnswers } from "./restoreAnswers.js";
import { exportAnswer } from "./saveAnswers.js";
import { calculateEGFR, calculatePredEGFR } from "./eGFRCalc.js";

const shellElement = document.querySelector('.shell');
let answers = exportAnswer();

export function fetchStartQuestion() {
    console.log("Starting Questions");
    fetch(`../../../js/services/calc/html/question1.html`)
        .then(response => response.text())
        .then(data => {
            shellElement.innerHTML = data;
        })
        .catch(error => console.error('Error fetching question:', error));
}

export function fetchQuestion(target, checkVal) {
    if (!checkVal) {
        console.log("Adult Route, ", checkVal);
        fetch(`../../../js/services/calc/html/adult/question${target}.html`)
            .then(response => response.text())
            .then(data => {
                shellElement.innerHTML = data;
    
                setTimeout(() => restoreAnswers(answers), 50);
            })
            .catch(error => console.error('Error fetching question:', error));
    } else if (checkVal) {
        console.log("Pediatric Route, ", checkVal);
        fetch(`../../../js/services/calc/html/child/question${target}.html`)
            .then(response => response.text())
            .then(data => {
                shellElement.innerHTML = data;
    
                setTimeout(() => restoreAnswers(answers), 50);
            })
            .catch(error => console.error('Error fetching question:', error));
    }
}

export function fetchPreResults(target, checkVal) {
    if (checkVal) {
        console.log("User Pediatric Answers:", answers);
        fetch(`../../../js/services/calc/html/child/question${target}.html`)
            .then(response => response.text())
            .then(data => {
                shellElement.innerHTML = data;
                displayResults();
            })
            .catch(error => console.error('Error fetching results:', error));
    } else {
        console.log("User Adult Answers:", answers);
        fetch(`../../../js/services/calc/html/adult/question${target}.html`)
            .then(response => response.text())
            .then(data => {
                shellElement.innerHTML = data;
                displayResults();
            })
            .catch(error => console.error('Error fetching results:', error));
    }
}

export function fetchResults(checkVal) {
    console.log("User Answers:", answers);
    fetch(`../../../js/services/calc/html/results.html`)
        .then(response => response.text())
        .then(data => {
            shellElement.innerHTML = data;
            let resultsValue;
            if (checkVal) {
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