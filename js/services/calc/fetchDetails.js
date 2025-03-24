import { updateEGFRMarker } from "./marker.js";
import { restoreAnswers } from "./restoreAnswers.js";
import { exportAnswer } from "./saveAnswers.js";
// import { calculateEGFR, calculatePredEGFR } from "./eGFRCalc.js";

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
    console.log("Current Question:", target);
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

export function fetchPreResults(checkVal) {
    if (checkVal) {
        console.log("User Pediatric Answers:", answers);
        fetch(`../../../js/services/calc/html/child/question7.html`)
            .then(response => response.text())
            .then(data => {
                shellElement.innerHTML = data;
                displayResults();
            })
            .catch(error => console.error('Error fetching results:', error));
    } else {
        console.log("User Adult Answers:", answers);
        fetch(`../../../js/services/calc/html/adult/question6.html`)
            .then(response => response.text())
            .then(data => {
                shellElement.innerHTML = data;
                displayResults();
            })
            .catch(error => console.error('Error fetching results:', error));
    }
}

// //
/* ! Go Local Incase API is down
// export function fetchResults(checkVal) {
//     console.log("User Answers:", answers);
//     fetch(`../../../js/services/calc/html/results.html`)
//         .then(response => response.text())
//         .then(data => {
//             shellElement.innerHTML = data;
//             let resultsValue;
//             try {
//                 if (checkVal) {
//                     console.log("Calculating Pediatric eGFR");
//                     resultsValue = calculatePredEGFR(answers);
//                 } else {
//                     console.log("Calculating Adult eGFR");
//                     resultsValue = calculateEGFR(answers);
//                 }
//             } catch (error) {
//                 console.error('Error calculating eGFR:', error);
//             }
//             updateEGFRMarker(resultsValue);
//         })
//         .catch(error => console.error('Error fetching results:', error));
// }
*/
// //

export function fetchResults() {
    console.log("User Answers:", answers);

    const age = parseInt(answers["2-Age"]);
    const sex = answers["3-Gender"].toLowerCase();
    const creat = parseFloat(answers["4-SerumCreatinine"]);
    let race;
    race = race ? answers["6-Race"] : answers["5-Race"];

    let convertedCreat = creat;
    if (answers["4-SC-Unit"] === "mg/dL") convertedCreat = creat * 88.4;

    fetch(`../../../js/services/calc/html/results.html`)
        .then(response => response.text())
        .then(data => {
            shellElement.innerHTML = data;

            console.log('Loading >> eGFR Calculator');
            const loadingSpinner = document.querySelector('.loading-spinner');
            const egfrValue = document.getElementById('egfr-section');
            const egfrValueText = document.getElementById('egfr-value');
            
            // Show loading spinner
            console.log('Calculating...');
            if (loadingSpinner) loadingSpinner.style.display = 'block';
            if (egfrValue) egfrValue.style.display = 'none';
            
            // Fetch results from API
            fetch("https://sdp-api-n04w.onrender.com/calculate", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify([{
                    creat: convertedCreat,
                    age: age,
                    sex: sex,
                    race: race
                }]),
            })
                .then(response => response.json())
                .then(apiResult => {
                    // Hide spinner and show result
                    if (loadingSpinner) loadingSpinner.style.display = 'none';
                    if (egfrValue) egfrValue.style.display = 'inline';
                    const resultsValue = parseFloat(apiResult[0]?.eGFR).toFixed(2);
                    egfrValueText.textContent = resultsValue; // Display actual API result
                    console.log("API Result:", resultsValue);
                    updateEGFRMarker(resultsValue, age); // Pass age for pediatric/adult determination
                })
                .catch(error => {
                    console.error("Error fetching eGFR from API:", error);
                    if (loadingSpinner) loadingSpinner.style.display = 'none'; // Hide spinner on error
                });

            // //
            // ! Send Answers to API to send the Database if Token is Valid
            const token = localStorage.getItem("userToken");
            if (!token) {
                console.error("No auth token found in local storage");
                console.log("No user data to send");
                return;
            }

            // TODO: Replace with actual API endpoint
            fetch(`https://sdp-api-n04w.onrender.com/patient`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }).then(response => {
                if (!response.ok) throw new Error('Failed to fetch patient data');
                return response.json();
            }).then(data => {
                fetch(`https://sdp-api-n04w.onrender.com/patient/${data.id}/results`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(answers),
                }).then(response => {
                    if (!response.ok) {
                        console.error("Invalid token or user data");
                        console.log("No user data to send");
                        return;
                    }
                    return response.json();
                }).then(userCheckResult => {
                    if (userCheckResult) {
                        console.log("User Check Result:", userCheckResult);
                    }
                }).catch(error => console.error("Error checking user data:", error));
            }).catch(error => console.error("Error fetching user data:", error));
            // //
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
        const questionOrder = parseInt(questionNumber);
        listItem.classList.add('r_34');
        let answerText = answers[questionNumber];
        if (questionNumber === '4-SerumCreatinine') {
            answerText = `${answers['4-SerumCreatinine']} ${answers['4-SC-Unit']}`;
        } else if (questionNumber === '4-SC-Unit') {
            return;
        } else if (questionNumber === '2-Age') {
            answerText = `${answers['2-Age']} years old`;
        } else if (questionNumber === '7-Height') {
            answerText = `${answers['7-Height']} cm`;
        }

        if (questionNumber === '6-Race') listItem.innerHTML = `<strong>Question ${4}:</strong> ${answerText}`;
        else if (questionNumber === '7-Height') listItem.innerHTML = `<strong>Question ${5}:</strong> ${answerText}`;
        else listItem.innerHTML = `<strong>Question ${questionOrder-1}:</strong> ${answerText}`;
        resultList.appendChild(listItem);
    });

    resultsContainer.appendChild(resultList);
}