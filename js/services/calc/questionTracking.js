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
            saveAnswer();
            currentQuestion++;
            fetchQuestion(currentQuestion);
        } else if (event.target && event.target.id === 'prev') {
            if (currentQuestion > 1) {
                currentQuestion--;
                fetchQuestion(currentQuestion);
            } else if (currentQuestion === 1) {
                window.location.reload();
            }
        } else if (event.target && event.target.id === 'prev-1') {
            fetchQuestion(currentQuestion);
        } else if (event.target && event.target.id === 'results') {
            fetchResults();
        } else if (event.target && event.target.id === 'start-over') {
            window.location.reload();
        }
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
    
        if (selectedButton) {
            answers[currentQuestion] = selectedButton.getAttribute('data-answer');
            console.log(`Answer saved for question ${currentQuestion}: ${answers[currentQuestion]}`);
        } else if (inputElement) {
            answers[currentQuestion] = inputElement.value;
            console.log(`Answer saved for question ${currentQuestion}: ${answers[currentQuestion]}`);
        }
    }

    function fetchResults() {
        console.log("User Answers:", answers);
        fetch(`../../../js/services/calc/html/results.html`)
            .then(response => response.text())
            .then(data => {
                shellElement.innerHTML = data;
                displayResults();
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
