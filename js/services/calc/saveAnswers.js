const answers = {};

export function saveAnswer(currentQuestion, checkVal) {
    const ageInput = document.querySelector('.q_age');
    const selectedButton = document.querySelector('.gender.selected');
    const sc1Input = document.querySelector('.q_sc1');
    const unitSelect = document.querySelector('#unit');
    const raceSelect = document.querySelector('.race');
    const standardHeight = document.querySelector('.q_height_s');

    // Save button answer if present
    if (selectedButton) {
        answers[`${currentQuestion}-Gender`] = selectedButton.getAttribute('data-answer');
        // Save button selection state
        console.log(`Answer saved for question ${currentQuestion}: ${selectedButton.getAttribute('data-answer')}`);
    }
    // Save input answer if present
    else if (ageInput) {
        answers[`${currentQuestion}-Age`] = ageInput.value;
        console.log(`SC1 value saved: ${ageInput.value}`);
    }
    if (sc1Input) {
        answers[`${currentQuestion}-SerumCreatinine`] = sc1Input.value;
        console.log(`SC1 value saved: ${sc1Input.value}`);
    }
    if (unitSelect && !raceSelect) {
        answers[`${currentQuestion}-SC-Unit`] = unitSelect.options[unitSelect.selectedIndex].value;
        console.log(`Unit saved: ${unitSelect.value}`);
    }
    if (raceSelect) {
        answers[`${currentQuestion}-Race`] = raceSelect.options[raceSelect.selectedIndex].value;
        console.log(`Race saved: ${raceSelect.value}`);
    }

    if (standardHeight) {
        answers[`${currentQuestion}-Height`] = standardHeight.value;
        console.log(`Standard Height saved: ${standardHeight.value}`);
    }
}

export function exportAnswer() {
    return answers;
}