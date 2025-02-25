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

    if (gender === "female") {
        egfr *= 0.742;
    }

    if (race === "black") {
        egfr *= 1.210;
    }

    console.log("Calculated eGFR:", egfr);
    return egfr.toFixed(2);
}

export function calculatePredEGFR(answers) {
    let creat = parseFloat(answers["4-SerumCreatinine"]);
    let unit = answers["4-Unit"];
    let age = parseInt(answers["2"]);
    let gender = answers["3"].toLowerCase();
    let race = answers["5-Unit"].toLowerCase();

    if (unit === "µmol/L") {
        creat = creat / 88.4;
    }

    // TODO: Add height and weight to the calculation for children

    // let egfr = 186 * Math.pow(creat, -1.154) * Math.pow(age, -0.203);
    let egfr = 186 * (creat**-1.154) * (age**-0.203);

    if (gender === "female") {
        egfr *= 0.742;
    }

    if (race === "black") {
        egfr *= 1.210;
    }

    console.log("Calculated eGFR:", egfr);
    return egfr.toFixed(2);
}