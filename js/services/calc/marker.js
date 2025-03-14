export function updateEGFRMarker(egfrValue) {
    const marker = document.getElementById("egfr-marker"); // * ❌ Marker
    const textValue = document.getElementById("egfr-value"); // * Show value

    textValue.innerText = egfrValue;

    let percentage = 0;

    if (egfrValue >= 90) percentage = 12.5; // * Middle of 0-25%
    else if (egfrValue >= 60) percentage = 35; // * Middle of 25-45%
    else if (egfrValue >= 45) percentage = 52.5; // * Middle of 45-60%
    else if (egfrValue >= 30) percentage = 67.5; // * Middle of 60-75%
    else if (egfrValue >= 15) percentage = 82.5; // * Middle of 75-90%
    else percentage = 95;

    marker.style.left = `${percentage}%`; // Move ❌ marker
}