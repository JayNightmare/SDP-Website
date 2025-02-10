document.addEventListener('DOMContentLoaded', function() {
    var scrollElement = document.getElementById('scroll');
    if (scrollElement) {
        scrollElement.addEventListener('click', function() {
            var targetClass = scrollElement.getAttribute('data-target');
            if (targetClass) {
                var targetElement = document.querySelector('.' + targetClass);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }
});