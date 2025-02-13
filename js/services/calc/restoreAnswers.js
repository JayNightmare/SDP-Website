export function restoreAnswers(answers) {
    const ageInputField = document.querySelector('.q_age');
    if (ageInputField) {
        ageInputField.value = answers['2'] ? answers['2'] : '';
    }

    const genderButton = document.querySelector('.q3_answer');
    const maleGenderButton = document.querySelector('.male');
    const femaleGenderButton = document.querySelector('.female');
    if (genderButton) {
        if (answers['3'] == 'Male') {
            femaleGenderButton.classList.remove('selected');
            maleGenderButton.classList.add('selected');
        } else if (answers['3'] == 'Female') {
            maleGenderButton.classList.remove('selected');
            femaleGenderButton.classList.add('selected');
        }
    }

    const scInputField = document.querySelector('.q_sc1');
    const scUnitField = document.querySelector('.sc_unit');
    if (scInputField) {
        scInputField.value = answers['4-SerumCreatinine'] ? answers['4-SerumCreatinine'] : '';
    }
    if (scUnitField) {
        scUnitField.value = answers['4-Unit'] ? answers['4-Unit'] : 'mg/dL';
    }

    const raceUnitField = document.querySelector('.r_5');
    if (raceUnitField) {
        raceUnitField.value = answers['5-Unit'] ? answers['5-Unit'] : 'White';
    }
}
