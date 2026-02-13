# Specification

## Summary
**Goal:** Make Official Login reliably authorize the current caller as admin so `/admin` consistently loads inquiries, and ensure inquiries persist across canister upgrades.

**Planned changes:**
- Backend: Fix admin bootstrapping so `_initializeAccessControlWithSecret("admin-secret-token-2024")` deterministically grants admin authorization to the current caller, is idempotent per-caller, and does not rely on a single global “already initialized” flag that blocks later sessions.
- Backend: Persist inquiry submissions and `nextId` in upgrade-safe storage so inquiries survive canister upgrades and IDs continue increasing without collisions (add migration only if required to preserve existing data).
- Frontend: Ensure post-Official Login flow navigates to `/admin` and loads the inquiry list (or empty state) without showing the unauthorized “Failed to Load Inquiries” error; Refresh should reliably refetch without transient actor/authorization errors during a valid session.
- Validation: Verify changes using the repo’s Preview and Production checklists for Official Login, admin initialization, and inquiry visibility/actions (read/unread, delete) without breaking public inquiry submission success feedback.

**User-visible outcome:** After Official Login (User ID `K107172621`, Password `Karauli#34`), the app can navigate to `/admin` and reliably display the inquiries list (or “No Inquiries Yet”), with Refresh/read/unread/delete working, and inquiries remaining available after upgrades.
