document.addEventListener('DOMContentLoaded', function() {
    const shellElement = document.getElementById('shell');
    const practitionerCode = document.getElementById('practitioner-code');

    document.getElementById('practitioner').addEventListener('click', function() {
        fetch(`../../js/account/html/practitioner.html`)
                .then(response => response.text())
                .then(data => { shellElement.innerHTML = data; })
                .catch(error => console.error('Error fetching question:', error));
    });

    document.getElementById('patient').addEventListener('click', function() {
        fetch(`../../js/account/html/patient.html`)
                .then(response => response.text())
                .then(data => { shellElement.innerHTML = data; })
                .catch(error => console.error('Error fetching question:', error));
    });

    document.addEventListener('click', function (event) {
        if (event.target && event.target.id === 'prev') location.reload();
        if (event.target && event.target.id === 'prev-1') location.href = "/";
        if (event.target && event.target.id === 'prev-2') {
            fetch(`../../js/account/html/practitioner.html`)
                .then(response => response.text())
                .then(data => { shellElement.innerHTML = data; })
                .catch(error => console.error('Error fetching question:', error));
        }
        if (event.target && event.target.id === 'practitioner-code') {
            fetch(`../../js/account/html/extraPractitioner.html`)
                .then(response => response.text())
                .then(data => { shellElement.innerHTML = data; })
                .catch(error => console.error('Error fetching question:', error));
        }
    });
});