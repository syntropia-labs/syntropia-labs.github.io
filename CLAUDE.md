# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static GitHub Pages site for syntropia.dev - a single-page landing page with interactive canvas animations and a contact form. The site is hosted at https://syntropia.dev (configured via CNAME).

## Repository Structure

- **[index.html](index.html)** - Main HTML file with contact form
- **[public/](public/)** - Public assets directory
  - **[css/style.css](public/css/style.css)** - All CSS styles, animations, and contact form styling
  - **[js/main.js](public/js/main.js)** - Interactive canvas, form handling, scroll animations
  - **[images/logo.svg](public/images/logo.svg)** - SVG logo mark (rotated diamond/rhombus design)
  - **[images/logo-*.png](public/images/)** - PNG logo exports (32, 64, 128, 180, 192, 256, 512px)
  - **[images/favicon.svg](public/images/favicon.svg)** - Browser favicon (SVG)
  - **[images/apple-touch-icon.svg](public/images/apple-touch-icon.svg)** - iOS home screen icon (180×180)
  - **[site.webmanifest](public/site.webmanifest)** - PWA manifest with app icons
- **[CNAME](CNAME)** - Custom domain configuration for GitHub Pages
- **[README.md](README.md)** - Project documentation

## Development Workflow

### Local Development
Open [index.html](index.html) directly in a browser to preview changes. No build process or local server required.

### Deployment
Changes are automatically deployed to GitHub Pages when pushed to the `main` branch. The site becomes available at https://syntropia.dev within a few minutes.

## Interactive Canvas Architecture

The page features a sophisticated interactive canvas system built with vanilla JavaScript:

### Canvas Layers (z-index order, bottom to top)
1. **Ambient orbs** - CSS-animated background gradients
2. **Interactive canvas** - Contains grid highlights and particles
3. **Grid overlay** - CSS-based static grid pattern
4. **Content layer** - Logo, text, UI elements, and contact form

### Key Interactive Systems

#### 1. Delta Time Animation System
- **Frame-rate independent animations** - Normalizes to 60fps baseline (16.67ms per frame)
- Uses `performance.now()` for accurate timing
- Calculates `deltaMultiplier` to scale all movements consistently
- Prevents animation jumps when tab becomes inactive (capped at 3x)
- All physics, rotation, and damping scaled by delta time

#### 2. Spring Physics Cursor
- **Target cursor** (`targetX`, `targetY`) - actual mouse position
- **Smooth cursor** (`smoothX`, `smoothY`) - delayed position using spring physics
- Spring parameters: `springStiffness: 0.03`, `damping: 0.65`
- Creates natural, elastic cursor following behavior
- Time-independent damping using `Math.pow(damping, deltaMultiplier)`

#### 3. Grid Highlighting System
- Uses **Gaussian falloff** for smooth bell-curve intensity distribution
- Highlights 20px×20px cells (1/3 of background grid at 60px)
- Follows the smooth cursor position, not actual mouse
- `sigma: 120` controls falloff spread
- `maxOpacity: 0.1` limits brightness
- Optimized to only check cells within `influenceRadius`

#### 4. Particle System
- 30 particles orbit around the logo center
- Each particle has:
  - **Orbital motion** - circular path with varying radius
  - **Wobble effect** - sinusoidal radius variation for organic movement
  - **Cursor repulsion** - particles pushed away when smooth cursor approaches (150px influence)
  - **Velocity/offset damping** - smooth return to orbit after disturbance
- Uses smooth cursor position for consistent behavior with grid highlights
- All motion scaled by delta time for consistent speed across devices

### Animation Loop
The `animate()` function runs at browser refresh rate and:
1. Calculates delta time and normalizes to 60fps baseline
2. Clears canvas
3. Updates logo center position (responsive to window resize)
4. Updates smooth cursor with spring physics (delta time scaled)
5. Draws grid highlights
6. Updates and draws all particles (delta time scaled)

### Responsive Behavior
- Canvas resizes to full viewport
- Logo center recalculates on scroll/resize
- Footer and contact form layout changes on mobile (<640px)
- Contact form width adapts with padding on small screens

## Contact Form

The page includes a below-the-fold contact section with scroll-triggered animations:

### Features
- **Intersection Observer** - Triggers fade-in animation when section enters viewport (20% threshold)
- **Form Fields** - Email (required) and message (optional)
- **Backend Integration** - Submits to Cloud Run endpoint: `https://syntropia-contact-140805327369.us-east1.run.app`
- **Success Handling** - Form disappears after successful submission, replaced with success message
- **Error Handling** - Displays user-friendly error message with retry capability
- **Loading States** - Button shows "Sending..." during submission and disables to prevent double-submit

### Styling
- Matches dark theme with subtle borders and hover effects
- Smooth transitions for all interactive elements
- Form inputs with focus states for better UX
- Success/error messages styled with green/red color schemes

## Additional Features

### Dynamic Copyright Year
- Footer copyright year updates automatically using JavaScript
- Uses `new Date().getFullYear()` to stay current

### Multi-Platform Icon Support
- **SVG Favicon** - Modern browsers with vector scaling
- **PNG Icons** - Multiple sizes (32px, 192px) for compatibility
- **Apple Touch Icon** - 180×180px optimized for iOS
- **Web Manifest** - PWA-ready with icon sizes from 32px to 512px
- **Theme Color** - Matches site background (#0a0a0c) for browser chrome

## Design System

CSS variables defined in `:root`:
- **Colors**:
  - `--bg-primary: #0a0a0c` - Main background
  - `--bg-secondary: #111115` - Secondary backgrounds (form inputs, status badge)
  - `--text-primary: #f4f4f5` - Main text color
  - `--text-muted: #71717a` - Muted text (tagline, subtitles, placeholders)
  - `--accent: #ffffff` - Accent color (buttons, logo, particle highlights)
  - `--accent-glow: rgba(255, 255, 255, 0.1)` - Subtle glow effects
- **Layout**:
  - `--grid-size: 60px` - Background grid (CSS overlay)
  - Particle grid uses hardcoded `HIGHLIGHT_SIZE: 20px` in JavaScript

## Font Stack
- **Archivo Black** - Display heading (Google Fonts)
- **Syne** - Body text and form inputs (Google Fonts)
