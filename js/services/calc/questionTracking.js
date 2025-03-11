import { fetchPreResults, fetchResults, fetchQuestion } from "./fetchDetails.js";
import { saveAnswer } from "./saveAnswers.js";

document.addEventListener('DOMContentLoaded', function () {
    const start = document.getElementById('start-now');
    const firstPrev = document.getElementById('prev-1');

    let checkVal = false;
    let currentQuestion = 1;
    
    start.addEventListener('click', () => fetchQuestion(1));

    document.addEventListener('click', function (event) {
        if (event.target.id === 'next') {
            currentQuestion++;

            

            fetchQuestion(currentQuestion);
        }
    })
});
