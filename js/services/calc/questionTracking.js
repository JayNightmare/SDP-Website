const answers = {};
let currentQuestion = 1;

document.addEventListener('DOMContentLoaded', function () {
    const startButton = document.getElementById('start-now');
    const shellElement = document.querySelector('.shell');

    startButton.addEventListener('click', function () {
        fetchQuestion(currentQuestion);
    });

    document.addEventListener('click', function (event) {
        if (event.target.matches('.q3_answer')) {
            document.querySelectorAll('.q3_answer').forEach(btn => btn.classList.remove('selected'));
            event.target.classList.add('selected');
        }

        if (event.target && event.target.id === 'next') {
            const ageInput = document.querySelector('.q_age');
            const sc1Input = document.querySelector('.q_sc1');
            const scc2Input = document.querySelector('.q_scc2');
            let allValid = true;

            // ! Check if age is entered and valid
            if (ageInput) {
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
            if (scc2Input && scc2Input.value.trim() === '') {
                alert('Please enter Serum Cystatin C value.');
                return allValid = false;
            }

            saveAnswer();
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
            saveAnswer();
            console.log(currentQuestion);
            fetchPreResults();
        }
        else if (event.target && event.target.id === 'results') { fetchResults(); }
        else if (event.target && event.target.id === 'start-over') { window.location.reload(); }
        else if (event.target && event.target.id === 'under-age') { window.location.href = "../../../html/home/index.html" }
    });

    function fetchQuestion(questionNumber) {
        fetch(`../../../js/services/calc/html/question${questionNumber}.html`)
            .then(response => response.text())
            .then(data => {
                shellElement.innerHTML = data;
            })
            .catch(error => console.error('Error fetching question:', error));
    }

    function saveAnswer() {
        const inputElement = document.getElementById('answer');
        const selectedButton = document.querySelector('.q3_answer.selected');
        const sc1Input = document.querySelector('.q_sc1');
        const unitSelect = document.querySelector('#unit');
        const scc2Input = document.querySelector('.q_scc2');
    
        if (selectedButton) {
            answers[currentQuestion] = selectedButton.getAttribute('data-answer');
            console.log(`Answer saved for question ${currentQuestion}: ${answers[currentQuestion]}`);
        } else if (inputElement) {
            answers[currentQuestion] = inputElement.value;
            console.log(`Answer saved for question ${currentQuestion}: ${answers[currentQuestion]}`);
        }
        if (sc1Input) {
            console.log(`SC1 value saved: ${sc1Input.value}`);
            answers[`${currentQuestion}-SerumCreatinine`] = sc1Input.value;
        }
        if (unitSelect) {
            console.log(`Unit saved: ${unitSelect.value}`);
            answers[`${currentQuestion}-Unit`] = unitSelect.options[unitSelect.selectedIndex].value;
        }
        if (scc2Input) {
            console.log(`SCC2 value saved: ${scc2Input.value}`);
            answers[`${currentQuestion}-SerumCystatinC`] = scc2Input.value;
        }
    }

    function fetchPreResults() {
        console.log("User Answers:", answers);
        fetch(`../../../js/services/calc/html/question6.html`)
            .then(response => response.text())
            .then(data => {
                shellElement.innerHTML = data;
                displayResults();
            })
            .catch(error => console.error('Error fetching results:', error));
    }

    function fetchResults() {
        console.log("User Answers:", answers);
        fetch(`../../../js/services/calc/html/results.html`)
            .then(response => response.text())
            .then(data => {
                shellElement.innerHTML = data;
                // displayResults();
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
});
