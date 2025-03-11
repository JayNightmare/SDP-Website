import { fetchPreResults, fetchResults, fetchQuestion, fetchStartQuestion } from "./fetchDetails.js";
import { saveAnswer } from "./saveAnswers.js";

document.addEventListener('DOMContentLoaded', function () {
    const startButton = document.getElementById('start-now');
    let checkVal = false;
    let currentQuestion = 1;
    
    startButton.addEventListener('click', function () {
        fetchStartQuestion();
    });

    document.addEventListener('click', function (event) {
        let valid = true;
        const age = document.querySelector('.q_age');

        if (event.target.id === 'next') {
            // //
            // ! If data-target is equal to child, set checkVal to true
            if (event.target.getAttribute('data-target') === 'child') {
                checkVal = true;
            } else if (event.target.getAttribute('data-target') === 'adult') {
                checkVal = false;
            }
            // //

            // //
            // ! Check if age is present and validate age
            if (age && checkVal == true) {
                console.log('Age:', age.value);
                if (age.value.trim() === '') {
                    return alert('Please fill in the required field before proceeding');
                } else if (age.value >= 18) {
                    return alert('You must be at younger than 18 years old to participate');
                }
            } else if (age && checkVal == false) {
                console.log('Age:', age.value);
                if (age.value.trim() === '') {
                    return alert('Please fill in the required field before proceeding');
                } else if (age.value < 18) {
                    return alert('You must be at least 18 years old to participate');
                }
            }
            // //

            // //
            currentQuestion++;
            console.log(currentQuestion);
            saveAnswer(currentQuestion, checkVal);
            fetchQuestion(currentQuestion, checkVal);
        }

        if (event.target.id === 'prev') {
            if (currentQuestion === 2) {
                currentQuestion--;
                console.log(currentQuestion);
                return fetchStartQuestion();
            } else {
                currentQuestion--;
                console.log(currentQuestion);
                fetchQuestion(currentQuestion, checkVal);
            }

        }

        if (event.target.id === 'prev-1') {
            window.location.reload();
        }

        if (event.target && event.target.id === 'pre-results') {
            saveAnswer(currentQuestion);
            console.log(currentQuestion);
            fetchPreResults(currentQuestion, checkVal);
        }

        if (event.target && event.target.id === 'results') { fetchResults(checkVal); }
    })
});
