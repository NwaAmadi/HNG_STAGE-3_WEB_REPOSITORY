# Insighta Labs+ Web Portal

A Next.js web portal for the Insighta Labs+ Profile Intelligence System. This repo is intentionally focused on the browser interface and expects a separate backend that already exposes the API contract described in the task brief.

## Stack

- Next.js App Router
- TypeScript
- Same-origin API proxy routes for secure cookie-based auth

## Environment

Create a local `.env.local` from `.env.example`:

```bash
BACKEND_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=Insighta Labs+
```

`BACKEND_API_BASE_URL` should point to the backend origin only, without a trailing slash.

## Scripts

```bash
pnpm install
pnpm dev
pnpm build
pnpm start
```

## Architecture

- UI pages live in `src/app`
- Shared session and auth state live in `src/components/session-provider.tsx`
- Browser requests use `/api/*` on the portal origin
- `src/app/api/[...path]/route.ts` proxies those requests to the backend

This proxy layer keeps the frontend aligned with the required paths while letting OAuth cookies, refresh cookies, and the readable CSRF cookie exist on the portal origin.

## Authentication Flow

1. User visits `/login`
2. The GitHub button opens `/api/auth/github`
3. Next.js proxies that request to the backend OAuth endpoint
4. Backend completes GitHub OAuth and sets:
   - `insighta_access_token`
   - `insighta_refresh_token`
   - `insighta_csrf_token`
5. Protected pages load session state with `GET /api/users/me`
6. If a protected request returns `401`, the client attempts one `POST /api/auth/refresh` and retries once

## Token Handling Approach

- Auth is cookie-based, not local-storage based
- Every authenticated browser request sends `credentials: "include"`
- Every `/api/profiles*` request includes `X-API-Version: 1`
- `POST` and `DELETE` requests include `X-CSRF-Token` using `insighta_csrf_token`

## Portal Pages

- `/login`
- `/dashboard`
- `/profiles`
- `/profiles/[id]`
- `/search`
- `/account`

