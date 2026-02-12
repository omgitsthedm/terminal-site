# terminal-site

Minimal static HTML site set up for GitHub + Netlify.

## Commands

- `npm run dev` - run local Netlify dev server
- `npm run lint` - run JS, CSS, and HTML lint checks
- `npm run format:check` - verify formatting
- `npm run deploy:preview` - create Netlify preview deploy
- `npm run deploy:prod` - push production deploy

## CI/CD

- GitHub Actions `CI` workflow runs lint + format checks on push/PR.
- GitHub Actions `Lighthouse Audit` workflow runs performance audit on `main`.
- Dependabot updates npm and GitHub Actions weekly.
