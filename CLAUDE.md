# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static GitHub Pages site for syntropia.dev - a single-page landing page with interactive canvas animations, vision/product sections, navigation, and a contact form. The site is hosted at https://syntropia.dev (configured via CNAME).

### Page Structure
- **Home** - Hero section with logo, tagline, and "Coming Soon" status
- **Vision** - "The New Reality" section explaining AI transformation in software delivery
- **Product** - "Days Instead of Months" section showcasing the Agentic Data Platform
- **Contact** - Contact form for user inquiries

## Repository Structure

- **[index.html](index.html)** - Main HTML file with navbar, sections, and contact form
- **[public/](public/)** - Public assets directory
  - **[css/style.css](public/css/style.css)** - All CSS styles, glass-morphism effects, animations, navbar, sections
  - **[js/main.js](public/js/main.js)** - Interactive canvas, navigation, scroll animations, form handling
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
- Uses **quadratic falloff** (`t²`) for smooth intensity distribution
- Highlights 20px×20px cells (1/3 of background grid at 60px)
- Follows the smooth cursor position, not actual mouse
- `influenceRadius: 360px` on desktop, **120px on mobile** (1/3 radius for better mobile performance)
- `maxOpacity: 0.1` limits brightness
- **Batched rendering** - groups cells by opacity, reducing canvas operations by ~95%
- Uses `ctx.rect()` + `fill()` instead of individual `fillRect()` calls
- Optimized to only check cells within `influenceRadius` using squared distances

#### 4. Particle System
- **30 particles** on all devices orbit around the logo center
- Each particle has:
  - **Orbital motion** - circular path with varying radius
  - **Wobble effect** - sinusoidal radius variation for organic movement
  - **Cursor repulsion** - particles pushed away when smooth cursor approaches (150px influence)
  - **Velocity/offset damping** - smooth return to orbit after disturbance
  - **Cached trigonometry** - pre-calculates sin/cos per frame
- **Batched rendering** - particles pre-sorted by opacity, drawn in groups
- Uses smooth cursor position for consistent behavior with grid highlights
- All motion scaled by delta time for consistent speed across devices

### Animation Loop
The `animate()` function runs via `requestAnimationFrame` and:
1. Calculates delta time and normalizes to 60fps baseline
2. Clears canvas
3. Updates logo center position (responsive to window resize)
4. Updates smooth cursor with spring physics (delta time scaled)
5. Draws grid highlights
6. Updates and draws all particles (delta time scaled)

**Benefits of requestAnimationFrame**:
- Syncs with display refresh rate (60Hz, 120Hz, 144Hz, etc.)
- Automatically pauses when tab is hidden (saves battery)
- Better browser optimization than setInterval
- Delta time system ensures consistent animation speed across all refresh rates

### Responsive Behavior
- Canvas resizes to full viewport
- Logo center recalculates on scroll/resize
- Footer and contact form layout changes on mobile (<640px)
- Contact form width adapts with padding on small screens

## Navigation Bar

Fixed-position navbar at the top of the page with transparent glass-morphism design:

### Features
- **Transparent Background** - `rgba(17, 17, 21, 0.6)` with `backdrop-filter: blur(20px)`
- **Logo Mark** - Rotated diamond design matching the hero logo
- **Active State Tracking** - Uses Intersection Observer to highlight current section in viewport
- **Smooth Scrolling** - Click navigation links to smoothly scroll to corresponding sections
- **Responsive Design** - Adapts layout for mobile devices (<768px)

### Implementation
- **Scroll Detection** - `IntersectionObserver` with `rootMargin: '-50% 0px -50% 0px'` centers detection
- **Active Link Highlighting** - Adds `.active` class to nav link when corresponding section enters viewport
- **Data Attributes** - Links use `data-section` attribute matching section `id` for navigation mapping

## Vision & Product Sections

Two content sections that explain the company's vision and product offering:

### Vision Section ("The New Reality")
- **Content Structure** - Three paragraphs with justified text alignment
- **Key Phrases** - Important concepts wrapped in `<strong>` tags for emphasis
- **Topics** - AI transformation, future stack architecture, structural shift in software delivery

### Product Section ("Days Instead of Months")
- **Product Description** - Four-paragraph introduction to Agentic Data Platform
- **Benefit Cards** - Four cards highlighting key features:
  1. Autonomous Intelligence
  2. Rapid Deployment
  3. Cost Efficiency
  4. Infrastructure Control
- **Grid Layout** - Responsive 2-column grid (stacks on mobile)
- **Glass-morphism Design** - Cards use same transparent background as navbar

### Scroll Animations
- **Section Reveals** - Sections fade in when 20% enters viewport (Intersection Observer)
- **Staggered Cards** - Benefit cards animate sequentially with 100ms delays
- **Once-only** - Animations trigger once and remain visible (observer unobserved after trigger)

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
- **Glass-morphism Background** - Form inputs use `rgba(17, 17, 21, 0.6)` with `backdrop-filter: blur(20px)`
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

### Glass-morphism Pattern
Consistent transparent background effect applied across UI components:
- **Background**: `rgba(17, 17, 21, 0.6)` - Semi-transparent dark background
- **Blur**: `backdrop-filter: blur(20px)` - Frosted glass effect
- **Border**: `1px solid rgba(255, 255, 255, 0.08)` - Subtle outline
- **Applied to**: Navbar, benefit cards, form inputs

This creates visual hierarchy while maintaining the minimalist aesthetic and allowing background elements (grid, particles, orbs) to show through.

### CSS Variables
Defined in `:root`:
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
