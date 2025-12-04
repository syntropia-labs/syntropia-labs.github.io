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

    update() {
        this.angle += this.speed;
        this.wobbleAngle += this.wobbleSpeed;

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
            this.vx -= (dx / dist) * force;
            this.vy -= (dy / dist) * force;
        }

        this.offsetX += this.vx;
        this.offsetY += this.vy;
        this.vx *= 0.92;
        this.vy *= 0.92;

        this.offsetX *= 0.95;
        this.offsetY *= 0.95;

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
function updateSmoothCursor() {
    // Spring force toward target
    const forceX = (targetX - smoothX) * springStiffness;
    const forceY = (targetY - smoothY) * springStiffness;

    // Apply force to velocity
    velocityX += forceX;
    velocityY += forceY;

    // Apply damping
    velocityX *= damping;
    velocityY *= damping;

    // Update position
    smoothX += velocityX;
    smoothY += velocityY;
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

// Animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateLogoCenter();
    updateSmoothCursor();

    // Draw grid highlights first (behind particles)
    drawGridHighlights();

    // Update and draw particles
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    requestAnimationFrame(animate);
}

// Initialize
window.addEventListener('resize', resize);
resize();
animate();
