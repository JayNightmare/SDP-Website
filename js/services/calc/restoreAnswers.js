export function restoreAnswers(answers) {
    // Restore input field answers
    const ageInputField = document.querySelector('.q_age');
    if (ageInputField) {
        ageInputField.value = answers['3-Age'] ? answers['3-Age'] : '';
    }

    // Restore gender button selection
    const genderAnswer = answers['4-Gender'];
    const buttons = document.querySelectorAll('.gender');
    buttons.forEach(button => {
        button.classList.remove('selected'); // Remove selection from all buttons
        if (button.textContent.trim().toLowerCase() === genderAnswer.toLowerCase()) {
            button.classList.add('selected'); // Select the correct one
        }
    });

    // Restore special input fields
    const scInputField = document.querySelector('.q_sc1');
    const scUnitField = document.querySelector('.sc_unit');
    if (scInputField) {
        scInputField.value = answers['5-SerumCreatinine'] ? answers['5-SerumCreatinine'] : '';
    }
    if (scUnitField) {
        scUnitField.value = answers['5-SC-Unit'] ? answers['5-SC-Unit'] : 'mg/dL';
    }

    // Restore race field
    const raceUnitField = document.querySelector('.r_5');
    if (raceUnitField) {
        raceUnitField.value = answers['6-Race'] ? answers['6-Race'] : 'White';
    }

    // Restore height values
    const standardHeightField = document.querySelector('.q_height_s');

    if (standardHeightField) {
        standardHeightField.value = answers['7-Height'] ? answers['7-Height'] : '';
    }
}
