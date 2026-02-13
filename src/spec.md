# Specification

## Summary
**Goal:** Fix preview /admin so the Admin session initializes reliably after Official Login and the Admin Dashboard consistently shows all inquiries (old + new), including across backend upgrades.

**Planned changes:**
- Frontend: Resolve the /admin “Initializing admin session…” hang and prevent “Admin Session Initialization Failed” under normal conditions when the backend canister is running.
- Frontend: Improve the admin initialization failure UI to show a clear English error with replica rejection details (reject code and request id when available), plus an expandable technical details area.
- Frontend: Add a deterministic Retry flow that re-creates the admin actor and re-runs `initializeAccessControlWithSecret` before any inquiry calls; prevent user-facing “Actor not available” errors by gating queries until prerequisites are ready.
- Frontend: Ensure the Admin Dashboard inquiry list loads all stored inquiries and refreshes to include newly submitted inquiries after submission.
- Backend: Persist inquiries in upgrade-safe storage so inquiries survive canister upgrades; ensure `submitInquiry` appends safely with non-colliding IDs and `getAllInquiries` returns the full persisted set for authorized admin callers.
- Documentation: Add a short preview validation checklist in the repo to confirm the backend canister is running before testing Official Login and /admin.

**User-visible outcome:** In preview, admins can log in and open /admin without getting stuck or failing initialization, can retry deterministically on transient replica errors, and can see all inquiries (previously submitted and newly submitted), even after publishing new preview versions.
