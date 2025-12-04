# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static GitHub Pages site for syntropia.dev - a single-page "coming soon" landing page with interactive canvas animations. The site is hosted at https://syntropia.dev (configured via CNAME).

## Repository Structure

- **[index.html](index.html)** - Main HTML file
- **[public/](public/)** - Public assets directory
  - **[css/style.css](public/css/style.css)** - All CSS styles and animations
  - **[js/main.js](public/js/main.js)** - Interactive canvas JavaScript (particles, grid highlights, spring physics)
  - **[images/logo.svg](public/images/logo.svg)** - SVG logo mark (rotated diamond/rhombus design)
  - **[images/logo-*.png](public/images/)** - PNG logo exports (32, 64, 128, 180, 192, 256, 512px)
  - **[images/favicon.svg](public/images/favicon.svg)** - Browser favicon (32×32)
  - **[images/apple-touch-icon.svg](public/images/apple-touch-icon.svg)** - iOS home screen icon (180×180)
- **[CNAME](CNAME)** - Custom domain configuration for GitHub Pages

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
4. **Content layer** - Logo, text, and UI elements

### Key Interactive Systems

#### 1. Spring Physics Cursor (lines 304-439)
- **Target cursor** (`targetX`, `targetY`) - actual mouse position
- **Smooth cursor** (`smoothX`, `smoothY`) - delayed position using spring physics
- Spring parameters: `springStiffness: 0.08`, `damping: 0.75`
- Creates natural, elastic cursor following behavior

#### 2. Grid Highlighting System (lines 441-477)
- Uses **Gaussian falloff** for smooth bell-curve intensity distribution
- Highlights 20px×20px cells (1/3 of background grid at 60px)
- Follows the smooth cursor position, not actual mouse
- `sigma: 120` controls falloff spread
- `maxOpacity: 0.1` limits brightness
- Optimized to only check cells within `influenceRadius`

#### 3. Particle System (lines 325-388)
- 30 particles orbit around the logo center
- Each particle has:
  - **Orbital motion** - circular path with varying radius
  - **Wobble effect** - sinusoidal radius variation for organic movement
  - **Cursor repulsion** - particles pushed away when smooth cursor approaches (150px influence)
  - **Velocity/offset damping** - smooth return to orbit after disturbance
- Uses smooth cursor position for consistent behavior with grid highlights

### Animation Loop
The `animate()` function (lines 479-496) runs at browser refresh rate and:
1. Clears canvas
2. Updates logo center position (responsive to window resize)
3. Updates smooth cursor with spring physics
4. Draws grid highlights
5. Updates and draws all particles

### Responsive Behavior
- Canvas resizes to full viewport ([index.html:399-403](index.html#L399-L403))
- Logo center recalculates on scroll/resize ([index.html:405-409](index.html#L405-L409))
- Footer layout changes on mobile (<640px)

## Design System

CSS variables defined in `:root` ([index.html:11-19](index.html#L11-L19)):
- Color palette: Dark theme with white accents
- `--grid-size: 60px` - Background grid (CSS overlay)
- Particle grid uses hardcoded `HIGHLIGHT_SIZE: 20px` in JavaScript

## Font Stack
- **Archivo Black** - Display heading (Google Fonts)
- **Syne** - Body text (Google Fonts)
