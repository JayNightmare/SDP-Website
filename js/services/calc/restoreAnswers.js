export function restoreAnswers(answers) {
    // * Restore Age input field
    const ageInputField = document.querySelector('.q_age');
    if (ageInputField) {
        ageInputField.value = answers['2-Age'] ? answers['2-Age'] : '';
    }

    // * Restore Gender button selection
    const genderAnswer = answers['3-Gender'];
    const buttons = document.querySelectorAll('.gender');
    buttons.forEach(button => {
        button.classList.remove('selected');
        if (button.textContent.trim().toLowerCase() === genderAnswer.toLowerCase()) {
            button.classList.add('selected');
        }
    });

    // * Restore Serum Creatinine fields
    const scInputField = document.querySelector('.q_sc1');
    const scUnitField = document.querySelector('.sc_unit');
    if (scInputField) {
        scInputField.value = answers['4-SerumCreatinine'] ? answers['4-SerumCreatinine'] : '';
    }
    if (scUnitField) {
        scUnitField.value = answers['4-SC-Unit'] ? answers['4-SC-Unit'] : 'mg/dL';
    }

    // * Restore Race field
    const raceUnitField = document.querySelector('.r_5');
    if (raceUnitField) {
        raceUnitField.value = answers['6-Race'] ? answers['6-Race'] : 'White';
    }

    // * Restore Height values
    const standardHeightField = document.querySelector('.q_height_s');

    if (standardHeightField) {
        standardHeightField.value = answers['7-Height'] ? answers['7-Height'] : '';
    }
}
