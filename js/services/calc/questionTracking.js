import { fetchPreResults, fetchResults, fetchQuestion } from "./fetchDetails.js";
import { saveAnswer } from "./saveAnswers.js";

let currentQuestion = 1;

document.addEventListener('DOMContentLoaded', function () {
    const startButton = document.getElementById('start-now');

    startButton.addEventListener('click', function () {
        fetchQuestion(currentQuestion);
    });

    document.addEventListener('click', function (event) {
        if (event.target.matches('.q3_answer')) {
            document.querySelectorAll('.q3_answer').forEach(btn => btn.classList.remove('selected'));
            event.target.classList.add('selected');
        }

        if (event.target && event.target.id === 'next') {
            // If user clicked next button but data answer is No, bring user to question2-5
            if (currentQuestion === 1) {
                if (document.querySelector('.q3_answer.selected').id === 'no') {
                    currentQuestion = 7;
                    fetchQuestion(currentQuestion);
                    return;
                }
            }

            const ageInput = document.querySelector('.q_age');
            const sc1Input = document.querySelector('.q_sc1');
            let allValid = true;

            // ! Check if age is entered and valid
            if (ageInput && document.querySelector('.q3_answer.selected').id === 'yes') {
                if (ageInput.value.trim() === '') {
                    return alert('Please fill in the required field before proceeding.');
                } else if (ageInput.value < 18) {
                    return alert('You must be at least 18 years old to participate.');
                }
            }

            // ! Check if Serum Creatinine is entered and valid
            if (sc1Input && sc1Input.value.trim() === '') {
                alert('Please enter Serum Creatinine value.');
                return allValid = false;
            }

            saveAnswer(currentQuestion);
            currentQuestion++;
            console.log(currentQuestion);
            fetchQuestion(currentQuestion);
        } else if (event.target && event.target.id === 'prev') {
            if (currentQuestion > 1) {
                currentQuestion--;
                console.log(currentQuestion);
                fetchQuestion(currentQuestion);
            }
            else if (currentQuestion === 1) { window.location.reload(); }
        }
        else if (event.target && event.target.id === 'prev-1') { fetchQuestion(currentQuestion); }
        else if (event.target && event.target.id === 'pre-results') {
            saveAnswer(currentQuestion);
            console.log(currentQuestion);
            fetchPreResults();
        }
        else if (event.target && event.target.id === 'results') { fetchResults(); }
        else if (event.target && event.target.id === 'start-over') { window.location.reload(); }
    });
});
