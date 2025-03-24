function toggleNav() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("active");
}

// Close menu when clicking outside
document.addEventListener('click', function(event) {
    const sidebar = document.getElementById("sidebar");
    const toggleBtn = document.querySelector('.toggle-btn');
    
    if (sidebar.classList.contains('active') && 
        !sidebar.contains(event.target) && 
        !toggleBtn.contains(event.target)) {
        sidebar.classList.remove('active');
    }
});
