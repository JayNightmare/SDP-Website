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
        }
    });

    function fetchQuestion(questionNumber) {
        fetch(`./html/question${questionNumber}.html`)
            .then(response => response.text())
            .then(data => {
                shellElement.innerHTML = data;
            })
            .catch(error => console.error('Error fetching question:', error));
    }
});