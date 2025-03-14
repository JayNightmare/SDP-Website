// * Calculate eGFR based on the CKiD formula
export function calculateEGFR(answers) {
    let age = parseInt(answers["3-Age"]);
    let gender = answers["4-Gender"].toLowerCase();
    let creat = parseFloat(answers["5-SerumCreatinine"]);
    let unit = answers["5-SC-Unit"];
    let race = answers["6-Race"].toLowerCase();

    if (unit === "µmol/L") {
        creat = creat / 88.4;
    }

    // let egfr = 186 * Math.pow(creat, -1.154) * Math.pow(age, -0.203);
    let egfr = 186 * creat ** -1.154 * age ** -0.203;

    // //
    if (gender === "female") {
        egfr *= 0.742;
    }
    // //
    if (race === "black") {
        egfr *= 1.21;
    }
    // //

    console.log("Calculated eGFR:", egfr);
    return egfr.toFixed(2);
}

// * Calculate Pediatric eGFR
export function calculatePredEGFR(answers) {
    let age = parseFloat(answers["3-Age"]);
    let gender = answers["4-Gender"].toLowerCase();
    let creat = parseFloat(answers["5-SerumCreatinine"]);
    let unit = answers["5-SC-Unit"];
    let race = answers["6-Race"].toLowerCase();
    let height = parseFloat(answers["7-Height"]); // * Height is in cm

    // * Convert creatinine to mg/dL if needed
    if (unit === "µmol/L") creat = creat / 88.4;

    // ? -> k value
    let k = 0.413;

    // //
    // ? -> Age-based k values
    // if (age < 1) {
    //     k = 0.33; // * -> Preterm infants
    // } else if (age < 2) {
    //     k = 0.45; // * -> Full-term infants <2 years
    // } else if (age < 13) {
    //     k = 0.55; // * -> Children 2-12 years
    // } else if (gender === "male") {
    //     k = 0.7; // * -> Males 13+
    // } else {
    //     k = 0.55; // * -> Females 13+
    // }
    // //

    let egfr = (k * height) / creat;

    // * Race Adjustment
    if (race === "black") egfr *= 1.16;

    console.log("Calculated Pediatric eGFR:", egfr);
    return egfr.toFixed(2);
}
