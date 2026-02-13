# Specification

## Summary
**Goal:** Fix the Official Login admin authorization flow so the Admin Dashboard can reliably load and display all inquiry submissions without showing the generic “Error loading inquiries. Please try again.”

**Planned changes:**
- Fix admin-token (`sessionStorage['caffeineAdminToken']`) handling so, after Official Login, the admin actor/access-control initialization is applied before any admin inquiry API calls (including `getAllInquiries`).
- Ensure React Query + actor initialization reliably re-run when the Official Login token changes in the same tab session (login/logout), triggering appropriate refetch/redirect behavior.
- Improve Admin Dashboard error UI to display the most specific available failure reason and show context-appropriate actions (Logout for authorization failures; Retry for non-auth/transient failures).

**User-visible outcome:** After logging in via Official Login, navigating to `/admin` shows the existing inquiries list (and newly submitted inquiries appear after refresh/refetch); if loading fails, the dashboard shows a specific error message with the correct recovery action (Logout or Retry).
