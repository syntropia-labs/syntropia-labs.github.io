# Syntropia

[![Live Site](https://img.shields.io/badge/live-syntropia.dev-blue)](https://syntropia.dev)

Official landing page for **Syntropia** - an agentic data platform.

## Overview

This is a static single-page landing site featuring:
- Interactive canvas animations with particle system
- Spring physics-based cursor tracking
- Gaussian-falloff grid highlights
- Scroll-triggered contact form with backend integration
- Responsive design optimized for all devices
- Frame-rate independent animations using delta time
- Dynamic copyright year

## Tech Stack

- **Vanilla JavaScript** - Interactive canvas system with particle physics
- **HTML5 Canvas** - Rendering layer for particles and grid effects
- **CSS3** - Animations, gradients, and responsive layouts
- **GitHub Pages** - Static site hosting

## Local Development

No build process required. Simply open the HTML file in a browser:

```bash
open index.html
```

Or use a local server:

```bash
python -m http.server 8000
# Visit http://localhost:8000
```

## Project Structure

```
.
├── index.html              # Main HTML file
├── public/
│   ├── css/
│   │   └── style.css      # Styles and CSS animations
│   ├── js/
│   │   └── main.js        # Canvas animations, physics, and form handling
│   ├── images/
│   │   ├── logo.svg       # SVG logo
│   │   ├── logo-*.png     # PNG exports (32-512px)
│   │   ├── favicon.svg    # Browser favicon (SVG)
│   │   └── apple-touch-icon.svg
│   └── site.webmanifest   # PWA manifest for app icons
├── CNAME                  # Custom domain config
├── README.md              # Project documentation
└── CLAUDE.md              # AI assistant guidelines

```

## Features

### Interactive Canvas System

The page features a sophisticated animation system:

- **Spring Physics Cursor** - Smooth elastic cursor following with configurable stiffness and damping
- **Particle System** - 30 particles with orbital motion, wobble effects, and cursor repulsion
- **Grid Highlighting** - Gaussian falloff lighting following the cursor
- **Delta Time Normalization** - Consistent 60fps animation speed across all devices and frame rates

### Contact Form

Below-the-fold contact section with:

- **Scroll Reveal Animation** - Intersection Observer triggers fade-in on scroll
- **Backend Integration** - Submits to Cloud Run endpoint
- **Form Validation** - Email required, message optional
- **Success Handling** - Form disappears after successful submission
- **Error Handling** - User-friendly error messages with retry

### Cross-Platform Support

- **Multi-format Favicons** - SVG, PNG (32px, 192px), and Apple touch icon (180px)
- **Web Manifest** - PWA-ready with multiple icon sizes
- **Safari/iOS Optimized** - Proper theme color and touch icons
- **Responsive Design** - Mobile-first approach with adaptive layouts

## Deployment

Automatic deployment via GitHub Pages:
1. Push changes to `main` branch
2. Site deploys automatically to https://syntropia.dev
3. Changes appear within minutes

## About Syntropia

Syntropia is an agentic data platform revolutionizing how organizations interact with and leverage their data.

Visit [syntropia.dev](https://syntropia.dev) to learn more.

## License

Copyright © 2024 Syntropia Labs. All rights reserved.
