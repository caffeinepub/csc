# Specification

## Summary
**Goal:** Fix the admin-session initialization hang so Official Login reliably transitions to the Admin Dashboard without waiting on any legacy token-handshake or timing out.

**Planned changes:**
- Update the `/admin` initialization flow to treat a valid backend session response (e.g., `session.user` with `role === "admin"`) as immediate success, stopping the “Initializing Admin Session” spinner promptly and rendering the dashboard.
- Remove/disable client-side checks that block admin initialization or admin queries solely due to missing admin tokens, and rely on `sessionStorage.officialUserId` plus the backend-returned session object for admin authorization state.
- Ensure successful Official Login auto-navigates to `/admin`, starts admin initialization deterministically, and proceeds to inquiries loading without additional manual clicks.
- Redeploy updated frontend assets and run the documented production smoke test for Official Login → `/admin` initialization and inquiry visibility to confirm the timeout/spinner issue is resolved.

**User-visible outcome:** After logging in via Official Login, the app immediately navigates to `/admin` and the Admin Dashboard loads without a long “Initializing Admin Session” spinner or timeout; inquiries (or the existing empty state) appear as expected.
