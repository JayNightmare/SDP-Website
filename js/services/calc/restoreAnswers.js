export function restoreAnswers(questionNumber, answers) {
    // const inputFields = document.querySelectorAll('.q_input');
    // inputFields.forEach(input => {
    //     const answerKey = `${questionNumber}-${input.name}`;
    //     if (answers[answerKey]) {
    //         input.value = answers[answerKey];
    //     }
    // });

    // const selectElements = document.querySelectorAll('select.q_input');
    // selectElements.forEach(select => {
    //     const answerKey = `${questionNumber}-${select.name}`;
    //     if (answers[answerKey]) {
    //         select.value = answers[answerKey];
    //     }
    // });

    // const selectedAnswer = answers[questionNumber];
    // if (selectedAnswer) {
    //     const matchingButton = document.querySelector(`.q3_answer[data-answer="${selectedAnswer}"]`);
    //     if (matchingButton) {
    //         matchingButton.classList.add('selected');
    //     }
    // }

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
