export function updateEGFRMarker(egfrValue, age) {
    const marker = document.getElementById("egfr-marker"); // * ❌ Marker
    const textValue = document.getElementById("egfr-value"); // * Show value
    const adultRanges = document.getElementById("result-meaning");
    const pediatricRanges = document.getElementById("result-meaning-pediatric");

    textValue.innerText = egfrValue;

    // Determine if patient is pediatric
    const isPediatric = age < 18;

    let percentage = 0;

    if (isPediatric) {
        // Pediatric thresholds
        if (egfrValue >= 90) percentage = 12.5;
        else if (egfrValue >= 80) percentage = 30;
        else if (egfrValue >= 60) percentage = 50;
        else if (egfrValue >= 30) percentage = 70;
        else percentage = 90;

        // Show pediatric ranges, hide adult ranges
        pediatricRanges.style.display = "block";
        adultRanges.style.display = "none";
    } else {
        // Adult thresholds
        if (egfrValue >= 90) percentage = 12.5; // * Middle of 0-25%
        else if (egfrValue >= 60) percentage = 35; // * Middle of 25-45%
        else if (egfrValue >= 45) percentage = 52.5; // * Middle of 45-60%
        else if (egfrValue >= 30) percentage = 67.5; // * Middle of 60-75%
        else if (egfrValue >= 15) percentage = 82.5; // * Middle of 75-90%
        else percentage = 95;

        // Show adult ranges, hide pediatric ranges
        pediatricRanges.style.display = "none";
        adultRanges.style.display = "block";
    }

    marker.style.left = `${percentage}%`; // Move ❌ marker
}
