# Shivansh Dengla Portfolio Website

A professional portfolio website built with HTML, CSS, and JavaScript, now powered by Vite for modern development workflow.

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (comes with Node.js)

### Installation

1. Install dependencies:
```bash
npm install
```

### Development

Start the development server with hot module replacement:

```bash
npm run dev
```

The site will be available at `http://localhost:3000` and will automatically open in your browser.

### Build for Production

Build the site for production:

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment.

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

## 📁 Project Structure

```
.
├── index.html          # Home page
├── about.html          # About page
├── contact.html        # Contact page
├── css/                # Stylesheets
├── js/                 # JavaScript files
├── img/                # Images
├── vendor/             # Third-party libraries
├── vite.config.js      # Vite configuration
└── package.json        # npm dependencies and scripts
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 📝 Notes

- The development server supports hot module replacement (HMR)
- All HTML files are automatically detected and served
- Static assets (images, CSS, JS) are served from their original locations
- The build process optimizes assets for production deployment

## 🚢 Deployment

After building with `npm run build`, deploy the contents of the `dist/` directory to your hosting provider (GitHub Pages, Netlify, Vercel, etc.).

