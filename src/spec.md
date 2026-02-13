# Specification

## Summary
**Goal:** Make the admin secret deterministically grant admin privileges to any caller who provides the correct token, and expose a reliable `isCallerAdmin()` query for the frontend.

**Planned changes:**
- Update backend admin-session bootstrapping so `_initializeAccessControlWithSecret("admin-secret-token-2024")` grants admin privileges to the *current caller* every time, without being blocked by a one-time/global “admin already assigned” state.
- Ensure admin authorization is tracked per-caller so multiple different principals can independently become admin by providing the correct secret.
- Add/confirm a backend query method `isCallerAdmin()` that returns whether the current caller is authorized as admin, reflecting the per-caller state set by `_initializeAccessControlWithSecret`.
- Preserve existing behavior for incorrect secrets: no admin privileges are granted and admin-gated APIs continue to return Unauthorized.

**User-visible outcome:** Entering the correct admin secret (`admin-secret-token-2024`) reliably enables admin access for the current logged-in session, and the admin dashboard can confirm admin status via `isCallerAdmin()` instead of showing “Admin Session Initialization Failed.”
