// Magnetic Button Effect with Cursor Glow
document.addEventListener('DOMContentLoaded', function() {
    const button = document.querySelector('.contact-send-button');
    
    if (!button) return;

    button.addEventListener('mousemove', function(e) {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Calculate percentage position
        const xPercent = (x / rect.width) * 100;
        const yPercent = (y / rect.height) * 100;
        
        // Update CSS custom properties for glow position
        button.style.setProperty('--mouse-x', `${xPercent}%`);
        button.style.setProperty('--mouse-y', `${yPercent}%`);
    });

    button.addEventListener('mouseleave', function() {
        button.style.removeProperty('--mouse-x');
        button.style.removeProperty('--mouse-y');
    });
});
