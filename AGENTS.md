# AGENTS.md — Terminal Site

## Scope

- Work only inside `/Users/davidmarsh/Desktop/LiFi NYC/Clients/LittleFightNYC/Brand/Terminal Site` (resolved Git root: `/Users/davidmarsh/Code/LiFi NYC/Clients/LittleFightNYC/Brand/Terminal Site`).
- Preserve unrelated changes and inspect `git status --short` before edits.

## Source of truth

- GitHub: https://github.com/omgitsthedm/terminal-site.git
- Canonical branch: `main`
- Read `SOURCE_OF_TRUTH.md` for production linkage. Do not infer that Git and production are synchronized.

## Stack and commands

- Stack: Vite / Node.js
- Dev: `npm run dev`
- Build: `npm run build`
- Test: no standard test command detected
- Lint: `npm run lint`

## Constraints

- Never expose or modify secrets, `.env*`, credentials, production data, DNS, billing, auth, payments, bookings, or real form submissions outside the requested scope.
- Clear, scoped plain-language authorization is sufficient for live changes; evaluate the user's meaning rather than matching fixed wording.
- Treat host links and historical handoffs as snapshots until verified.

## Validation and handoff

- Run the smallest relevant build, lint, test, and browser checks supported by the repository.
- Record changed files, validation, unresolved risks, and one next action. Do not paste transcripts or repeat global instructions.
