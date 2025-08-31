# Patient Visit Manager — NGXS Migration

This project is a beginner-friendly refactor of your Angular app to use **NGXS** for state management.

## What changed
- Added NGXS with slices: `Auth`, `Patients`, `Doctors`, `Visits`, `Fees`, `Activity`.
- Components now **dispatch actions** and **read via selectors** (no direct service state).
- Services remain **API callers only**.
- **Caching**: List loads skip network if fetched within last **2 minutes** (unless forced).
- **Persistence**: Auth state is saved in `localStorage` via NGXS Storage Plugin.
- **JWT Interceptor** reads token from `localStorage.auth.token` and adds `Authorization` header.

## Quick Start
```bash
npm i
npm run start
```
(Use your existing Angular CLI commands.)

## Where to look
- `src/app/state/*` — NGXS actions/state files.
- `src/app/login-page/login-page.component.ts` — now dispatches `AuthActions.Login`.
- `src/app/*-dashboard/*.ts` — use `Store` + selectors (Patients/Doctors/Visits).
- `src/app/core/interceptors/jwt.interceptor.ts` — picks token from localStorage.

## Notes
- Services still call your current REST endpoints (IP/ports remain the same).
- Guards read token/role from `localStorage.auth` to allow/deny routes.
- To force refresh lists: call `LoadAll(true)`.
