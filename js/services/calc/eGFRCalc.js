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

export function calculatePredEGFR() {
    // Retrieve input values (assuming form fields or function arguments)
    let age = parseFloat(document.getElementById('age').value);
    let gender = document.getElementById('gender').value;  // e.g., "male" or "female"
    let heightCm;
    // Determine height in cm based on selected unit
    if (document.getElementById('heightUnit').value === 'cm') {
        // Height provided in centimeters
        heightCm = parseFloat(document.getElementById('heightCm').value);
    } else {
        // Height provided in feet and inches – convert to centimeters
        let feet = parseFloat(document.getElementById('heightFeet').value) || 0;
        let inches = parseFloat(document.getElementById('heightInches').value) || 0;
        heightCm = (feet * 30.48) + (inches * 2.54);
    }
    // Get creatinine and convert to mg/dL if provided in µmol/L
    let creatinine = parseFloat(document.getElementById('creatinine').value);
    let creatinineUnit = document.getElementById('creatinineUnit').value;  // "mg/dL" or "umol/L"
    if (creatinineUnit === 'umol/L') {
        creatinine = creatinine / 88.4;  // convert µmol/L to mg/dL&#8203;:contentReference[oaicite:4]{index=4}
    }
    
    let eGFR;
    if (age <= 18) {
        // **Pediatric calculation using Schwartz equation**
        let k;
        if (age < 1) {
            // Infant under 1 year old
            let isPreterm = document.getElementById('pretermInfant').checked;  // Checkbox or flag for preterm
            k = isPreterm ? 0.33 : 0.45;
        } else if (age < 13) {
            // Child 1 to 12 years old
            k = 0.55;
        } else {
            // Adolescent 13-18 years old
            k = (gender.toLowerCase() === 'male') ? 0.70 : 0.55;
        }
        // Calculate eGFR using Schwartz formula
        eGFR = (k * heightCm) / creatinine;  // height in cm, creatinine in mg/dL&#8203;:contentReference[oaicite:5]{index=5}
    } else {
        // **Adult eGFR calculation** (existing formula remains unchanged)
        // eGFR = ... (use the original adult formula, e.g., CKD-EPI, MDRD, etc.)
        // For example (placeholder): eGFR = 175 * Math.pow(creatinine, -1.154) * Math.pow(age, -0.203) * (gender.toLowerCase() === 'female' ? 0.742 : 1);
        // (The actual adult formula implementation goes here)
    }
    // Round the result to 2 decimal places and return
    return parseFloat(eGFR.toFixed(2));
}
