const answers = {};

export function saveAnswer(currentQuestion) {
    const inputElement = document.getElementById('answer');
    const selectedButton = document.querySelector('.q3_answer.selected');
    const sc1Input = document.querySelector('.q_sc1');
    const unitSelect = document.querySelector('#unit');

    if (selectedButton) {
        answers[currentQuestion] = selectedButton.getAttribute('data-answer');
        console.log(`Answer saved for question ${currentQuestion}: ${answers[currentQuestion]}`);
    } else if (inputElement) {
        answers[currentQuestion] = inputElement.value;
        console.log(`Answer saved for question ${currentQuestion}: ${answers[currentQuestion]}`);
    }
    if (sc1Input) {
        answers[`${currentQuestion}-SerumCreatinine`] = sc1Input.value;
        console.log(`SC1 value saved: ${sc1Input.value}`);
    }
    if (unitSelect) {
        answers[`${currentQuestion}-Unit`] = unitSelect.options[unitSelect.selectedIndex].value;
        console.log(`Unit saved: ${unitSelect.value}`);
    }
}

export function exportAnswer() {
    return answers;
}