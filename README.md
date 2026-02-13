# terminal-site

Premium 3D web starter with a cinematic motion stack and production CI/CD.

## Stack

- `three` for 3D scene rendering
- `postprocessing` for bloom, vignette, and film grain
- `gsap` + `ScrollTrigger` for sequenced, scroll-linked motion
- `lenis` for smooth inertial scrolling
- `lil-gui` for live tuning of scene parameters
- `vite` for module bundling and fast dev server
- `gltf-pipeline` for Draco model compression

## Commands

- `npm run dev` - local Vite dev server
- `npm run build` - production build to `dist/`
- `npm run preview` - preview built output
- `npm run lint` - JS, CSS, and HTML lint checks
- `npm run format:check` - formatting validation
- `npm run test:visual` - Playwright visual regression
- `npm run test:visual:update` - regenerate screenshot baseline
- `npm run model:draco` - compress `public/models/input.glb`
- `npm run model:pipeline` - direct `gltf-pipeline` run with draco compression
- `npm run deploy:preview` - Netlify preview deploy (builds first)
- `npm run deploy:prod` - Netlify production deploy (builds first)

## Creative Features Included

- JSON-driven building generation from `public/data/building.json`
- Scroll-reactive camera motion
- Cinematic post effects and interactive pointer parallax
- Staggered reveal animations for content sections
- Tunable creative controls panel (`lil-gui`)

## CI/CD

- `CI` workflow: lint + format on push/PR
- `Visual Regression` workflow: screenshot diffs on push/PR
- `Lighthouse Audit` workflow: page quality check on `main`
- Dependabot: weekly npm + GitHub Actions updates
