import { fetchPreResults, fetchResults, fetchQuestion } from "./fetchDetails.js";
import { saveAnswer } from "./saveAnswers.js";

document.addEventListener('DOMContentLoaded', function () {
    const start = document.getElementById('start-now');
    const firstPrev = document.getElementById('prev-1');

    let checkVal = false;
    
    start.addEventListener('click', () => fetchQuestion(1));

    document.addEventListener('click', function (event) {
        if (event.target && event.target.classList.contains('check_calc')) {
            const target = event.target.getAttribute('data-target');
            
            if (event.target.getAttribute('data-answer') === 'no') {
                checkVal = true;
            }
            else if (event.target.getAttribute('data-answer') === 'yes') {
                checkVal = false;
            }

            console.log("Next target:", target);
            console.log("Check value:", checkVal);
            saveAnswer(target);
            fetchQuestion(target);
        }

        // //

        // * Handle Input button
        if (event.target && event.target.id === 'next-input') {
            const answer = document.getElementById('answer');

            if (answer && answer.value === '') return alert('Please enter an answer'); // * Prevent empty answers from being submitted
            if (checkVal && (answer > 18 || answer.value < 1)) return alert('Must be below 18'); // * Below 18 and above 1 years old
            if (!checkVal && answer.value < 18 || answer.value > 120) return alert('Must be above 18'); // * Above 18 years old

            const target = event.target.getAttribute('data-target');
            console.log("Next target:", target);
            saveAnswer(target);
            fetchQuestion(target);
        }

        // //

        // * Handle button selection
        if (event.target && event.target.classList.contains('button_gl')) {
            const questionButtons = event.target.parentElement.querySelectorAll('.button_gl');
            // Remove selected class from all buttons in the group
            questionButtons.forEach(button => button.classList.remove('selected'));
            // Add selected class to clicked button
            event.target.classList.add('selected');
        }

        if (event.target && event.target.id === 'next-button') {
            // Check if a button is selected
            const selectedButton = event.target.parentElement.querySelector('.button_gl.selected');
            if (!selectedButton) {
                return alert('Please select an answer');
            }
            const target = event.target.getAttribute('data-target');
            console.log("Next target:", target);
            saveAnswer(target);
            fetchQuestion(target);
        }

        // //

        // * Handle radio button selection
        if (event.target && event.target.name === 'unit') {
            const cmElement = document.getElementById('cm');
            const feetElement = document.getElementById('feet');
        
            if (event.target.value === 'cm') {
                cmElement.style.display = 'block';
                feetElement.style.display = 'none';
            } else if (event.target.value === 'feet') {
                cmElement.style.display = 'none';
                feetElement.style.display = 'block';
            }
        }

        if (event.target && event.target.id === 'pre-results') {
            const unit = document.querySelector('input[name="unit"]:checked');
            if (!unit) return alert('Please select a unit (cm or feet/inches)');
        
            let height = null;
        
            if (unit.value === 'cm') {
                height = document.getElementById('height-cm').value;
                if (!height) return alert('Please enter your height in cm');
            } else if (unit.value === 'feet') {
                const feet = document.getElementById('height-feet').value;
                const inches = document.getElementById('height-inches').value;
                if (!feet || !inches) return alert('Please enter both feet and inches');
                height = `${feet}ft ${inches}in`;
            }
        
            const target = event.target.getAttribute('data-target');

            saveAnswer(target);
            fetchQuestion(target);
        }

        if (event.target && event.target.id === 'prev') {
            const prev = document.getElementById('prev');
            if (checkVal && prev.getAttribute('data-target') === 'question2') fetchQuestion('question8');
            const target = prev.getAttribute('data-target');
            console.log("Previous target:", target);
        };

        if (event.target && event.target.id === 'prev-1') {
            window.location.reload();
        };
    })
});
