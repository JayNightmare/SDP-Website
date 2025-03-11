export function restoreAnswers(answers) {
    // Restore input field answers
    const ageInputField = document.querySelector('.q_age');
    if (ageInputField) {
        ageInputField.value = answers['2'] ? answers['2'] : '';
    }

    // Restore button selections
    for (let key in answers) {
        // Check if this is a button selection state
        if (key.endsWith('-selected')) {
            const questionNumber = key.split('-')[0];
            const className = answers[key];
            // Find all buttons for this question
            const buttons = document.querySelectorAll('.button_gl');
            buttons.forEach(button => {
                // Remove selected class from all buttons
                button.classList.remove('selected');
                // If this button matches the saved state, select it
                if (button.className === className) {
                    button.classList.add('selected');
                }
            });
        }
    }

    // Restore special input fields
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

    const standardHeightField = document.querySelector('.q_height_s');
    const feetHeightField = document.querySelector('.q_height_f');
    const inchesHeightField = document.querySelector('.q_height_i');

    const heightUnitField = document.querySelector('.height_unit');

    if (standardHeightField) {
        standardHeightField.value = answers['6-Height-Standard'] ? answers['6-Height-Standard'] : '';
    }
    if (feetHeightField && inchesHeightField) {
        feetHeightField.value = answers['6-Height-Feet'] ? answers['6-Height-Feet'] : '';
        inchesHeightField.value = answers['6-Height-Inches'] ? answers['6-Height-Inches'] : '';
    }
    if (heightUnitField) {
        heightUnitField.value = answers['6-Unit'] ? answers['6-Unit'] : 'cm';
    }
}
