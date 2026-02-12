# Specification

## Summary
**Goal:** Fix the production deployment error so Draft Version 2 can be published live successfully.

**Planned changes:**
- Investigate the live publish (production) pipeline failure and identify the root cause of the deployment error.
- Apply targeted fixes so both the backend canister and frontend assets build successfully during a live publish.
- Validate post-deploy behavior to ensure the main site loads and the hidden `/admin` route still renders.

**User-visible outcome:** The project can be published live without deployment errors, and the live site (including `/admin`) loads successfully after deployment.
