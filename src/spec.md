# Specification

## Summary
**Goal:** Add a single “Official Login” on the homepage using fixed credentials, and restore guarded access to the admin dashboard for managing inquiries.

**Planned changes:**
- Add exactly one admin entry point on the homepage labeled “Official Login” that opens a login UI requiring User ID and Password and validates only `K107182721` / `Karauli#34`.
- Implement a session-only authenticated state (sessionStorage or equivalent) that persists on refresh within the same tab, is cleared on logout, and does not persist after tab/window close.
- Restore the admin dashboard at `/admin`, guarded so unauthenticated users are redirected to the homepage (or shown an unauthorized/disabled view), and authenticated users are routed to `/admin` after login.
- Re-enable admin inquiry management UI features: view inquiry details, delete, toggle read/unread, and export/download inquiries (CSV or JSON).
- Update SPA routing so `/admin` is not unconditionally redirected to `/` when logged in; ensure `/admin` and `/admin/` behave consistently with the login guard.
- Remove any unconditional redirect-to-`/` behavior from `frontend/public/admin/index.html` so direct navigation to `/admin` loads the SPA and then applies the guard.
- Extend the Motoko backend (`backend/main.mo`) with access-controlled APIs for listing inquiries, deleting by id, and setting read/unread (plus export-friendly retrieval if needed), without changing existing inquiry submission behavior.
- Add/restore React Query hooks for admin inquiry operations and ensure list updates via invalidation/refetch after mutations; export uses latest data.

**User-visible outcome:** Visitors still see the same public marketing site, with a single “Official Login” button. Logging in with the exact credentials opens the `/admin` dashboard where the official user can view inquiries, mark them read/unread, delete entries, export/download submissions, and log out to return to the normal homepage.
