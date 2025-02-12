document.addEventListener('DOMContentLoaded', function() {
    const scrollElement = document.getElementById('scroll');
    const scrollStart = document.getElementById('start-now');

    if (scrollElement) {
        scrollElement.addEventListener('click', function() {
            var targetClass = scrollElement.getAttribute('data-target');
            console.log("pressed");
            if (targetClass) {
                var targetElement = document.querySelector('.' + targetClass);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }

    if (scrollStart) {
        // when scrollstart is clicked, scroll to the top of the page
        scrollStart.addEventListener('click', function() {
            console.log("button");
            globalThis.scrollTo({ top: 0, left: 0, behavior: "smooth" });
        });
    }
});