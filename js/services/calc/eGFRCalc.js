export function calculateEGFR(answers) {
    let creat = parseFloat(answers["4-SerumCreatinine"]);
    let unit = answers["4-Unit"];
    let age = parseInt(answers["2"]);
    let gender = answers["3"].toLowerCase();
    let race = answers["5-Unit"].toLowerCase();

    if (unit === "µmol/L") {
        creat = creat / 88.4;
    }

    // let egfr = 186 * Math.pow(creat, -1.154) * Math.pow(age, -0.203);
    let egfr = 186 * (creat**-1.154) * (age**-0.203);

    // //
    if (gender === "female") {
        egfr *= 0.742;
    }
    // //
    if (race === "black") {
        egfr *= 1.210;
    }
    // //

    console.log("Calculated eGFR:", egfr);
    return egfr.toFixed(2);
}

export function calculatePredEGFR(answers) {
    let creat = parseFloat(answers["4-SerumCreatinine"]);
    let unit = answers["4-Unit"];
    let age = parseInt(answers["2"]);
    let gender = answers["3"].toLowerCase();
    let height = parseFloat(answers["6-Height"]); // Assume you add height to the form
    let heightUnit = answers["6-Unit"].toLowerCase(); // cm or inches

    // Convert creatinine to mg/dL if needed
    if (unit === "µmol/L") {
        creat = creat / 88.4;
    }

    // Convert height to cm if needed
    if (heightUnit === "inches") {
        height *= 2.54;
    }

    let k = 0.55; // default for children 2-18 years
    if (age < 1) {
        k = answers["7-Premature"] === "yes" ? 0.33 : 0.45;
    } else if (age >= 13 && gender === "male") {
        k = 0.7;
    }

    let egfr = (k * height) / creat;

    console.log("Calculated Child eGFR:", egfr);
    return egfr.toFixed(2);
}
