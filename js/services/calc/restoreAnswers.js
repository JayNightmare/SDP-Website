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
}
