const answers = {};

export function saveAnswer(currentQuestion, checkVal) {
    const inputElement = document.getElementById('answer');
    const selectedButton = document.querySelector('.button_gl.selected');
    const sc1Input = document.querySelector('.q_sc1');
    const unitSelect = document.querySelector('#unit');

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
        answers[`${currentQuestion}-SC-Unit`] = unitSelect.options[unitSelect.selectedIndex].value;
        console.log(`Unit saved: ${unitSelect.value}`);
    }

    // * If checkVal is true, save child answer
    if (checkVal) {
        const standardHeight = document.querySelector('.q_height_s');
        const feetHeight = document.querySelector('.q_height_f');
        const inchesHeight = document.querySelector('.q_height_i');
        const heightUnit = document.querySelector('.height_unit');

        if (standardHeight) {
            answers[`${currentQuestion}-Height-Standard`] = standardHeight.value;
            console.log(`Standard Height saved: ${standardHeight.value}`);
        }
        if (feetHeight && inchesHeight) {
            answers[`${currentQuestion}-Height-Feet`] = feetHeight.value;
            console.log(`Feet Height saved: ${feetHeight.value}`);

            answers[`${currentQuestion}-Height-Inches`] = inchesHeight.value;
            console.log(`Inches Height saved: ${inchesHeight.value}`);
        }
        if (heightUnit) {
            answers[`${currentQuestion}-H-Unit`] = heightUnit.options[heightUnit.selectedIndex].value;
            console.log(`Height Unit saved: ${heightUnit.value}`);
        }
    }
}

export function exportAnswer() {
    return answers;
}