# hafis.fyi

Personal portfolio and technical blog for **Hafis Umar-Lawal**, a Hardware Engineer specializing in high-density power conversion, failure forensics, and functional safety.

## Overview

This repository contains the source code for my portfolio website. The site is a custom, lightweight, static single-page application (SPA) built without heavy frontend frameworks, relying on a custom build script to generate the static files from JSON and Markdown.

## Architecture

- **`src/`**: Contains the base HTML template (`template.html`).
- **`content/`**: Contains the raw JSON data (`profile.json`) and Markdown files (like `acknowledgements.md`) that drive the content of the site.
- **`articles/`**: Contains the technical deep-dives, forensics case studies, and essays.
- **`assets/`**: Contains images, diagrams, and other static media.
- **`build.js`**: A custom Node.js script that parses the templates and markdown files to generate the final static site structure.
- **`styles.css`**: Vanilla CSS utilizing modern CSS Grid and Flexbox for responsive layouts.

## Building Locally

To build the site locally:

1. Clone the repository
2. Install the necessary build dependencies:
   ```bash
   npm install
   ```
3. Run the build script (this reads `src/template.html` and compiles it into `index.html`):
   ```bash
   npm run build
   ```
4. Serve the root directory using any static file server, for example:
   ```bash
   npx serve .
   ```

## License

All written content, case studies, and project descriptions are proprietary and copyrighted by Hafis Umar-Lawal.
