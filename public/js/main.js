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

    update(deltaMultiplier, velocityDamping, offsetDamping) {
        // Scale rotation and wobble by delta time
        this.angle += this.speed * deltaMultiplier;
        this.wobbleAngle += this.wobbleSpeed * deltaMultiplier;

        // Cache trig calculations
        const wobbleSin = Math.sin(this.wobbleAngle);
        const angleCos = Math.cos(this.angle);
        const angleSin = Math.sin(this.angle);

        const wobble = wobbleSin * this.wobbleAmount;
        const radius = this.baseRadius + wobble;

        const baseX = logoCenter.x + angleCos * radius;
        const baseY = logoCenter.y + angleSin * radius;

        // Use smoothed cursor position for particle influence
        const dx = smoothX - baseX;
        const dy = smoothY - baseY;
        const distSq = dx * dx + dy * dy;
        const influenceRadiusSq = 22500; // 150^2

        // Early exit if too far - use squared distance to avoid sqrt
        if (distSq < influenceRadiusSq && distSq > 0) {
            const dist = Math.sqrt(distSq); // Only calculate sqrt when needed
            const force = (1 - dist / 150) * 2;
            const invDist = 1 / dist;
            this.vx -= dx * invDist * force * deltaMultiplier;
            this.vy -= dy * invDist * force * deltaMultiplier;
        }

        // Scale velocity application by delta time
        this.offsetX += this.vx * deltaMultiplier;
        this.offsetY += this.vy * deltaMultiplier;

        // Apply pre-calculated damping
        this.vx *= velocityDamping;
        this.vy *= velocityDamping;
        this.offsetX *= offsetDamping;
        this.offsetY *= offsetDamping;

        this.x = baseX + this.offsetX;
        this.y = baseY + this.offsetY;
    }

    // Removed individual draw method - using batched drawing now
}

// Create particles - reduce count on mobile
const particles = [];
const isMobile = /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(navigator.userAgent);
const PARTICLE_COUNT = isMobile ? 15 : 30;

for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
}

// Sort particles by opacity for efficient batched rendering
particles.sort((a, b) => a.opacity - b.opacity);

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

// Batch draw particles by opacity groups
// Particles are pre-sorted by opacity, so we can batch consecutive particles efficiently
function drawParticlesBatched() {
    if (particles.length === 0) return;

    const TWO_PI = 6.283185307179586;
    let currentOpacity = Math.round(particles[0].opacity * 10) / 10;

    ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
    ctx.beginPath();

    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const pOpacity = Math.round(p.opacity * 10) / 10;

        // If opacity changed, fill current batch and start new one
        if (pOpacity !== currentOpacity) {
            ctx.fill();
            currentOpacity = pOpacity;
            ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
            ctx.beginPath();
        }

        // Add particle to current batch
        ctx.moveTo(p.x + p.size, p.y);
        ctx.arc(p.x, p.y, p.size, 0, TWO_PI);
    }

    // Fill the last batch
    ctx.fill();
}

// Draw grid highlights with quadratic falloff (smaller squares) - batched for performance
function drawGridHighlights() {
    if (smoothX < -500 || smoothY < -500) return;

    const maxOpacity = 0.1;
    const influenceRadius = 360;
    const influenceRadiusSq = 129600; // 360^2 - pre-calculated for performance
    const halfHighlightSize = 10; // HIGHLIGHT_SIZE / 2

    // Calculate grid cell range to check (using smaller highlight grid)
    const startCol = Math.max(0, Math.floor((smoothX - influenceRadius) / HIGHLIGHT_SIZE));
    const endCol = Math.ceil((smoothX + influenceRadius) / HIGHLIGHT_SIZE);
    const startRow = Math.max(0, Math.floor((smoothY - influenceRadius) / HIGHLIGHT_SIZE));
    const endRow = Math.ceil((smoothY + influenceRadius) / HIGHLIGHT_SIZE);

    // Group cells by opacity (quantize to reduce unique values)
    const opacityGroups = new Map();

    for (let col = startCol; col <= endCol; col++) {
        const cellX = col * HIGHLIGHT_SIZE;
        const cellCenterX = cellX + halfHighlightSize;

        for (let row = startRow; row <= endRow; row++) {
            const cellY = row * HIGHLIGHT_SIZE;
            const cellCenterY = cellY + halfHighlightSize;

            // Calculate squared distance first
            const dx = smoothX - cellCenterX;
            const dy = smoothY - cellCenterY;
            const distSq = dx * dx + dy * dy;

            // Quadratic falloff - much cheaper than Math.exp, visually similar
            const t = 1 - distSq / influenceRadiusSq;
            const intensity = t > 0 ? t * t : 0;
            const opacity = intensity * maxOpacity;

            if (opacity > 0.001) {
                // Round opacity to reduce unique values (improves batching)
                const opacityKey = Math.round(opacity * 400) / 400;

                if (!opacityGroups.has(opacityKey)) {
                    opacityGroups.set(opacityKey, []);
                }
                opacityGroups.get(opacityKey).push({ x: cellX, y: cellY });
            }
        }
    }

    // Draw each opacity group in a single batch
    opacityGroups.forEach((cells, opacity) => {
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath();
        for (let i = 0; i < cells.length; i++) {
            ctx.rect(cells[i].x, cells[i].y, HIGHLIGHT_SIZE, HIGHLIGHT_SIZE);
        }
        ctx.fill();
    });
}

// Delta time tracking for consistent animation speed
let lastTime = performance.now();
const TARGET_FPS = 30; // Lower FPS for better mobile performance
const TARGET_FRAME_TIME = 1000 / TARGET_FPS; // 33.33ms

// Performance stats tracking
let animateTimeSamples = [];
const MAX_SAMPLES = 10;
let showStats = false;

// Animation loop
function animate() {
    const animateStartTime = performance.now();
    const currentTime = animateStartTime;
    const deltaTime = currentTime - lastTime;
    const deltaMultiplier = deltaTime / (1000 / 60); // Normalize to 60fps baseline
    lastTime = currentTime;

    // Cap delta multiplier to prevent huge jumps
    const cappedDelta = Math.min(deltaMultiplier, 3);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateLogoCenter();
    updateSmoothCursor(cappedDelta);

    // Draw grid highlights first (behind particles)
    drawGridHighlights();

    // Pre-calculate damping factors once per frame
    const velocityDamping = Math.pow(0.92, cappedDelta);
    const offsetDamping = Math.pow(0.95, cappedDelta);

    // Update all particles
    for (let i = 0; i < particles.length; i++) {
        particles[i].update(cappedDelta, velocityDamping, offsetDamping);
    }

    // Draw all particles in batches
    drawParticlesBatched();

    // Update stats if visible
    if (showStats) {
        // Track animation performance
        const animateEndTime = performance.now();
        const animateTime = animateEndTime - animateStartTime;
        animateTimeSamples.push(animateTime);
        if (animateTimeSamples.length > MAX_SAMPLES) {
            animateTimeSamples.shift();
        }

        updateStatsDisplay();
    }
}

// Initialize
window.addEventListener('resize', resize);
resize();

// Use setInterval instead of requestAnimationFrame for better mobile performance
setInterval(animate, TARGET_FRAME_TIME);

// Create stats display element
const statsDisplay = document.createElement('div');
statsDisplay.id = 'statsDisplay';
document.body.appendChild(statsDisplay);

// Detect device type
function getDeviceType() {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return 'Tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        return 'Mobile';
    }
    return 'Desktop';
}

// Update stats display
function updateStatsDisplay() {
    const avgAnimateTime = animateTimeSamples.length > 0
        ? (animateTimeSamples.reduce((a, b) => a + b, 0) / animateTimeSamples.length).toFixed(2)
        : '0.00';

    statsDisplay.innerHTML = `
        <div>Screen: ${window.innerWidth}x${window.innerHeight}</div>
        <div>Device: ${getDeviceType()}</div>
        <div>Avg Animate: ${avgAnimateTime}ms</div>
        <div>Target Frame: ${TARGET_FRAME_TIME.toFixed(2)}ms</div>
    `;
}

// Toggle stats with Ctrl+Shift+S
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        showStats = !showStats;
        statsDisplay.classList.toggle('visible', showStats);
        if (showStats) {
            updateStatsDisplay();
        }
    }
});

// Set current year in footer
const yearSpan = document.getElementById('currentYear');
if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
}

// Navigation functionality
const navLinks = document.querySelectorAll('.nav-link');
const sections = {
    home: document.getElementById('home'),
    visionSection: document.getElementById('visionSection'),
    productSection: document.getElementById('productSection'),
    contactSection: document.getElementById('contactSection')
};

// Smooth scroll to section
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('data-section');
        const targetSection = sections[targetId];

        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Update active nav link based on scroll position
const navObserverOptions = {
    root: null,
    rootMargin: '-50% 0px -50% 0px',
    threshold: 0
};

const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Remove active class from all links
            navLinks.forEach(link => link.classList.remove('active'));

            // Add active class to corresponding link
            const activeLink = document.querySelector(`[data-section="${entry.target.id}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
        }
    });
}, navObserverOptions);

// Observe all sections
Object.values(sections).forEach(section => {
    if (section) {
        navObserver.observe(section);
    }
});

// Scroll reveal for sections
const visionSection = document.getElementById('visionSection');
const productSection = document.getElementById('productSection');
const contactSection = document.getElementById('contactSection');

const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.2
};

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all sections
if (visionSection) {
    sectionObserver.observe(visionSection);
}

if (productSection) {
    sectionObserver.observe(productSection);
}

if (contactSection) {
    sectionObserver.observe(contactSection);
}

// Staggered animation for benefit cards
const benefitCards = document.querySelectorAll('.benefit-card');

const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            // Add staggered delay based on card position
            const cardIndex = Array.from(benefitCards).indexOf(entry.target);
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, cardIndex * 100); // 100ms delay between each card
            cardObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

benefitCards.forEach(card => {
    cardObserver.observe(card);
});

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
                contactForm.classList.add('hidden');

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
