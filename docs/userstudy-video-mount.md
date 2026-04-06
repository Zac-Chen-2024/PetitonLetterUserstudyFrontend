# Userstudy Video Mount

This repository variant replaces the original user study flow with the Dr.Hu EB1A video experience.

## Routing

- The deployed root path serves the video frontend directly.
- `/video` redirects to `/`.
- Any unknown path redirects to `/`.

## Frontend Source

- The UI is migrated from `PetitionLetter/frontend/frontend`.
- The route is locked to the `dr_hu_eb1a` video scenario.
- The deployed frontend defaults to `VITE_API_BASE=/api` when no build-time value is provided.

## Deployment Assumption

- Static assets are built with `base: /PetitonLetterUserstudyFrontend/`.
- The server should expose the matching backend under `/api` or provide `VITE_API_BASE` at build time.
