const answers = {};

export function saveAnswer(currentQuestion) {
    const inputElement = document.getElementById('answer');
    const selectedButton = document.querySelector('.button_gl.selected');
    const sc1Input = document.querySelector('.q_sc1');
    const unitSelect = document.querySelector('#unit');

    // remove 'question' from the currentquestion string and turn it into a int
    currentQuestion = parseInt(currentQuestion.replace('question', ''));
    console.log(`Current question: ${currentQuestion}`);

    // Save button answer if present
    if (selectedButton) {
        answers[currentQuestion] = selectedButton.getAttribute('data-answer');
        // Save button selection state
        answers[`${currentQuestion}-selected`] = selectedButton.className;
        console.log(`Answer saved for question ${currentQuestion}: ${answers[currentQuestion]}`);
        console.log(`Button state saved for question ${currentQuestion}: ${answers[`${currentQuestion}-selected`]}`);
    }
    // Save input answer if present
    else if (inputElement) {
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