import { fetchPreResults, fetchResults, fetchQuestion, fetchStartQuestion } from "./fetchDetails.js";
import { saveAnswer, resetAnswers } from "./saveAnswers.js";

document.addEventListener('DOMContentLoaded', function () {
    const startButton = document.getElementById('start-now');
    let checkVal = false;
    let currentQuestion = 1;
    
    startButton.addEventListener('click', function () {
        currentQuestion = 2;
        fetchStartQuestion();
    });

    document.addEventListener('click', function (event) {
        const age = document.querySelector('.q_age');
        const sc1Input = document.querySelector('.q_sc1');
        const height = document.querySelector('.q_height_s');

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
            // ! If gender is selected, add selected class to the button
            if (event.target.matches('.gender')) {
                document.querySelectorAll('.gender').forEach(btn => btn.classList.remove('selected'));
                event.target.classList.add('selected');
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
            // ! Check if Serum Creatinine is entered and valid
            if (sc1Input && sc1Input.value.trim() === '') {
                return alert('Please enter Serum Creatinine value.');
            }
            // //

            // //
            console.log("Previous Question: ", currentQuestion);
            saveAnswer(currentQuestion);
            return fetchQuestion(currentQuestion++, checkVal);
            // //
        }

        if (event.target.id === 'prev') {
            currentQuestion--;
            console.log("Back To Question: ", currentQuestion);
            if (currentQuestion === 1) {
                return fetchStartQuestion();
            }
            if (currentQuestion === 2) {
                resetAnswers();
                return fetchStartQuestion();
            }
            if (currentQuestion === 3) return fetchQuestion(2, checkVal);
            else return fetchQuestion(currentQuestion, checkVal);
        }

        if (event.target.id === 'prev-1') {
            window.location.reload();
        }

        if (event.target.id === 'prev-2') {
            if (checkVal && currentQuestion === 7) {
                console.log("Prev-2 Check True: ", currentQuestion);
                currentQuestion = 6;
                return fetchQuestion(currentQuestion, checkVal);
            }
            else if (!checkVal && currentQuestion === 6) {
                console.log("Prev-2 Check False: ", currentQuestion);
                currentQuestion = 5;
                return fetchQuestion(currentQuestion, checkVal);
            }
            else if (currentQuestion === 6) {
                console.log("Prev-2 Else: ", currentQuestion);
                currentQuestion--;
                return fetchQuestion(currentQuestion, checkVal);
            }
        }

        if (event.target.id === 'prev-3') {
            console.log("Prev-3", currentQuestion);
            fetchPreResults(checkVal);
        }

        if (event.target && event.target.id === 'pre-results') {
            // //
            // ! Check if height is entered and valid
            if (height && height.value.trim() === '') {
            return alert('Please enter height value.');
            }
            // //
            if (currentQuestion === 6 && checkVal) {
                currentQuestion++;
            } else if (currentQuestion === 5 && !checkVal) {
                currentQuestion++;
            }
            saveAnswer(currentQuestion);
            console.log(currentQuestion);
            fetchPreResults(currentQuestion, checkVal);
        }

        if (event.target && event.target.id === 'results') { fetchResults(checkVal); }

        if (event.target && event.target.id === 'start-over') { window.location.reload(); }
    })
});
