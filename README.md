# Nandish Chokshi — Portfolio

Personal portfolio website showcasing my work experience, research projects, and contact information.

**Live:** [nandish02.github.io/portfolio](https://nandish02.github.io/portfolio/)

## Tech Stack

- **React 18** with functional components and hooks
- **Tailwind CSS** for utility-first styling with a custom design system
- **Canvas API** for interactive particle background animation
- **Formsubmit.co** for serverless contact form (unlimited, free)
- **GitHub Pages** for hosting via `gh-pages`

## Sections

| Section | Description |
|---------|-------------|
| **Hero** | Animated intro with glassmorphism chips, gradient text, and particle canvas |
| **Experience** | Timeline of roles at Nutanix (MTS → MTS-1) and AIISC research internship |
| **Projects** | Brain-LLM neural activation mapping and VAE Pyro vs PyTorch benchmark |
| **Contact** | Custom form + direct links to Email, LinkedIn, and GitHub |

## Getting Started

```bash
# Install dependencies
npm install

# Run locally
npm start
# → http://localhost:3000/portfolio

# Production build
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## Project Structure

```
src/
├── components/
│   ├── Navbar.js          # Glassmorphism nav with scroll-aware highlights
│   ├── Home.js            # Hero section
│   ├── Experience.js      # Work timeline with grouped role progression
│   ├── Projects.js        # Project cards with animated SVG illustrations
│   ├── Contact.js         # Contact form + social links
│   ├── Footer.js          # Footer with branding and socials
│   ├── ParticleCanvas.js  # Interactive canvas particle background
│   └── Loader.js          # Page load animation
├── Images/                # Logos and project assets
├── useOnScreen.js         # Intersection Observer hook for scroll animations
├── App.js                 # Root layout
├── index.js               # Entry point
└── index.css              # Tailwind directives + custom utilities
```

## License

This project is open source and available for reference.
