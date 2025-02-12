document.addEventListener('DOMContentLoaded', function() {
    const startButton = document.getElementById('start-now');
    const shellElement = document.querySelector('.shell');
    let currentQuestion = 1;

    startButton.addEventListener('click', function() {
        fetchQuestion(currentQuestion);
        window.history.pushState({}, '', '?started=true');
    });

    document.addEventListener('click', function(event) {
        if (event.target && event.target.id === 'next') {
            currentQuestion++;
            fetchQuestion(currentQuestion);
        } else if (event.target && event.target.id === 'prev') {
            if (currentQuestion > 1) {
                currentQuestion--;
                fetchQuestion(currentQuestion);
            } else {
                window.location.reload();
            }
        } else if (event.target && event.target.id === 'prev-1') {
            fetchQuestion(currentQuestion);
        } else if (event.target && event.target.id === 'results') {
            fetchResults();
        } else if (event.target && event.target.id === 'under-age') {
            window.location.href = '/';
        }
    });

    function fetchQuestion(questionNumber) {
        fetch(`/js/services/calc/html/question${questionNumber}.html`)
            .then(response => response.text())
            .then(data => {
                shellElement.innerHTML = data;
            })
            .catch(error => console.error('Error fetching question:', error));
    }

    function fetchResults() {
        fetch(`/js/services/calc/html/results.html`)
            .then(response => response.text())
            .then(data => {
                shellElement.innerHTML = data;
            })
            .catch(error => console.error('Error fetching results:', error));
    }
});