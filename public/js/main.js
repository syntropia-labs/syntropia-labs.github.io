const canvas = document.getElementById('interactiveCanvas');
const ctx = canvas.getContext('2d');
const logoWrapper = document.getElementById('logoWrapper');
const GRID_SIZE = 60; // Background grid size
const HIGHLIGHT_SIZE = 20; // Smaller illuminated squares (1/3 of grid)

// Target cursor position (actual mouse)
let targetX = -1000;
let targetY = -1000;

// Smoothed cursor position (with spring delay)
let smoothX = -1000;
let smoothY = -1000;
let velocityX = 0;
let velocityY = 0;

// Spring physics parameters
const springStiffness = 0.03;
const damping = 0.65;

let logoCenter = { x: 0, y: 0 };

// Gaussian function for bell curve falloff
function gaussian(x, sigma) {
    return Math.exp(-(x * x) / (2 * sigma * sigma));
}

// Particle class for orbiting dots
class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.baseRadius = 40 + Math.random() * 60;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = (0.005 + Math.random() * 0.015) * (Math.random() > 0.5 ? 1 : -1);
        this.size = 1 + Math.random() * 2;
        this.opacity = 0.3 + Math.random() * 0.5;

        this.wobbleAngle = Math.random() * Math.PI * 2;
        this.wobbleSpeed = 0.02 + Math.random() * 0.03;
        this.wobbleAmount = 5 + Math.random() * 15;

        this.vx = 0;
        this.vy = 0;
        this.offsetX = 0;
        this.offsetY = 0;
    }

    update(deltaMultiplier) {
        // Scale rotation and wobble by delta time
        this.angle += this.speed * deltaMultiplier;
        this.wobbleAngle += this.wobbleSpeed * deltaMultiplier;

        const wobble = Math.sin(this.wobbleAngle) * this.wobbleAmount;
        const radius = this.baseRadius + wobble;

        const baseX = logoCenter.x + Math.cos(this.angle) * radius;
        const baseY = logoCenter.y + Math.sin(this.angle) * radius;

        // Use smoothed cursor position for particle influence
        const dx = smoothX - baseX;
        const dy = smoothY - baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const influenceRadius = 150;

        if (dist < influenceRadius && dist > 0) {
            const force = (1 - dist / influenceRadius) * 2;
            this.vx -= (dx / dist) * force * deltaMultiplier;
            this.vy -= (dy / dist) * force * deltaMultiplier;
        }

        // Scale velocity application by delta time
        this.offsetX += this.vx * deltaMultiplier;
        this.offsetY += this.vy * deltaMultiplier;

        // Convert damping to frame-independent
        const velocityDamping = Math.pow(0.92, deltaMultiplier);
        const offsetDamping = Math.pow(0.95, deltaMultiplier);

        this.vx *= velocityDamping;
        this.vy *= velocityDamping;
        this.offsetX *= offsetDamping;
        this.offsetY *= offsetDamping;

        this.x = baseX + this.offsetX;
        this.y = baseY + this.offsetY;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fill();
    }
}

// Create particles
const particles = [];
const PARTICLE_COUNT = 30;

for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
}

// Resize handler
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    updateLogoCenter();
}

function updateLogoCenter() {
    const rect = logoWrapper.getBoundingClientRect();
    logoCenter.x = rect.left + rect.width / 2;
    logoCenter.y = rect.top + rect.height / 2;
}

// Mouse move handler
document.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
});

document.addEventListener('mouseleave', () => {
    targetX = -1000;
    targetY = -1000;
});

// Update smoothed cursor position with spring physics
function updateSmoothCursor(deltaMultiplier) {
    // Spring force toward target
    const forceX = (targetX - smoothX) * springStiffness;
    const forceY = (targetY - smoothY) * springStiffness;

    // Apply force to velocity (scaled by delta time)
    velocityX += forceX * deltaMultiplier;
    velocityY += forceY * deltaMultiplier;

    // Apply damping (converted to frame-independent)
    const dampingFactor = Math.pow(damping, deltaMultiplier);
    velocityX *= dampingFactor;
    velocityY *= dampingFactor;

    // Update position (scaled by delta time)
    smoothX += velocityX * deltaMultiplier;
    smoothY += velocityY * deltaMultiplier;
}

// Draw grid highlights with bell curve falloff (smaller squares)
function drawGridHighlights() {
    if (smoothX < -500 || smoothY < -500) return;

    const sigma = 120;
    const maxOpacity = 0.1;
    const influenceRadius = sigma * 3;

    // Calculate grid cell range to check (using smaller highlight grid)
    const startCol = Math.max(0, Math.floor((smoothX - influenceRadius) / HIGHLIGHT_SIZE));
    const endCol = Math.ceil((smoothX + influenceRadius) / HIGHLIGHT_SIZE);
    const startRow = Math.max(0, Math.floor((smoothY - influenceRadius) / HIGHLIGHT_SIZE));
    const endRow = Math.ceil((smoothY + influenceRadius) / HIGHLIGHT_SIZE);

    for (let col = startCol; col <= endCol; col++) {
        for (let row = startRow; row <= endRow; row++) {
            const cellX = col * HIGHLIGHT_SIZE;
            const cellY = row * HIGHLIGHT_SIZE;
            const cellCenterX = cellX + HIGHLIGHT_SIZE / 2;
            const cellCenterY = cellY + HIGHLIGHT_SIZE / 2;

            // Calculate distance from smoothed cursor to cell center
            const dx = smoothX - cellCenterX;
            const dy = smoothY - cellCenterY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Apply gaussian falloff
            const intensity = gaussian(dist, sigma);
            const opacity = intensity * maxOpacity;

            if (opacity > 0.001) {
                ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                ctx.fillRect(cellX, cellY, HIGHLIGHT_SIZE, HIGHLIGHT_SIZE);
            }
        }
    }
}

// Delta time tracking for consistent animation speed
let lastTime = null;
const TARGET_FPS = 60;
const TARGET_FRAME_TIME = 1000 / TARGET_FPS; // 16.67ms

// Animation loop
function animate(currentTime) {
    // Initialize lastTime on first frame
    if (lastTime === null) {
        lastTime = currentTime;
    }

    // Calculate delta time and normalize to 60fps baseline
    const deltaTime = currentTime - lastTime;
    const deltaMultiplier = deltaTime / TARGET_FRAME_TIME;
    lastTime = currentTime;

    // Cap delta multiplier to prevent huge jumps when tab becomes inactive
    const cappedDelta = Math.min(deltaMultiplier, 3);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateLogoCenter();
    updateSmoothCursor(cappedDelta);

    // Draw grid highlights first (behind particles)
    drawGridHighlights();

    // Update and draw particles
    particles.forEach(particle => {
        particle.update(cappedDelta);
        particle.draw();
    });

    requestAnimationFrame(animate);
}

// Initialize
window.addEventListener('resize', resize);
resize();
requestAnimationFrame(animate);

// Set current year in footer
const yearSpan = document.getElementById('currentYear');
if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
}

// Contact section scroll reveal
const contactSection = document.getElementById('contactSection');

const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.2
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

if (contactSection) {
    observer.observe(contactSection);
}

// Contact form submission
const contactForm = document.getElementById('contactForm');
const CONTACT_ENDPOINT = 'https://syntropia-contact-140805327369.us-east1.run.app';

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = contactForm.querySelector('.submit-btn');
        const formData = new FormData(contactForm);

        const data = {
            email: formData.get('email'),
            message: formData.get('message') || ''
        };

        // Remove any existing status messages
        const existingStatus = contactForm.querySelector('.form-status');
        if (existingStatus) {
            existingStatus.remove();
        }

        // Disable submit button
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        try {
            const response = await fetch(CONTACT_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                // Success - hide form and show success message
                contactForm.style.display = 'none';

                const statusDiv = document.createElement('div');
                statusDiv.className = 'form-status success';
                statusDiv.textContent = 'Message sent successfully! We\'ll get back to you soon.';
                contactForm.parentElement.appendChild(statusDiv);
            } else {
                throw new Error('Failed to send message');
            }
        } catch (error) {
            // Error
            const statusDiv = document.createElement('div');
            statusDiv.className = 'form-status error';
            statusDiv.textContent = 'Failed to send message. Please try again later.';
            contactForm.appendChild(statusDiv);

            // Re-enable submit button on error
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
        }
    });
}
