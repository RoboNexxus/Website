// Magnetic Button Effect with Smooth Cursor Glow
document.addEventListener('DOMContentLoaded', function() {
    const button = document.querySelector('.contact-send-button');
    
    if (!button) return;

    let mouseX = 50;
    let mouseY = 50;
    let currentX = 50;
    let currentY = 50;
    let isHovering = false;

    button.addEventListener('mousemove', function(e) {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Calculate percentage position
        mouseX = (x / rect.width) * 100;
        mouseY = (y / rect.height) * 100;
        isHovering = true;
    });

    button.addEventListener('mouseenter', function() {
        isHovering = true;
    });

    button.addEventListener('mouseleave', function() {
        isHovering = false;
        mouseX = 50;
        mouseY = 50;
    });

    // Smooth animation loop for buttery smooth following
    function animate() {
        if (isHovering) {
            // Smooth interpolation (lerp) for fluid motion
            currentX += (mouseX - currentX) * 0.15;
            currentY += (mouseY - currentY) * 0.15;
        } else {
            // Return to center when not hovering
            currentX += (50 - currentX) * 0.1;
            currentY += (50 - currentY) * 0.1;
        }
        
        // Update CSS variables
        button.style.setProperty('--mouse-x', `${currentX}%`);
        button.style.setProperty('--mouse-y', `${currentY}%`);
        
        requestAnimationFrame(animate);
    }

    animate();
});
