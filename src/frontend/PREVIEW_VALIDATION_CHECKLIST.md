# Preview Environment Validation Checklist

This checklist ensures the preview deployment is functioning correctly before promoting to production.

## Prerequisites

**CRITICAL:** Before running any tests, verify the backend canister is running:

1. Check canister status:
   ```bash
   dfx canister status backend --network ic
   ```
   
2. Verify the canister is in "Running" state (not "Stopped")

3. If canister is stopped, start it:
   ```bash
   dfx canister start backend --network ic
   ```

**Note:** The frontend includes automatic health check preflight that detects canister-stopped early and provides clear error messages. If you see "Backend canister is stopped" errors during testing, follow the resolution steps above.

## Health Check & Retry Behavior

The admin initialization includes:
- **Health check preflight**: Detects canister-stopped or unavailable backend before attempting initialization
- **Automatic retry with exponential backoff**: Up to 3 attempts over ~14 seconds for replica rejections
- **User-friendly error messages**: Clear actionable guidance with inline replica rejection details

## High-Priority Validation

### 1. Official Login → Admin Dashboard Flow

**Super Admin Credentials (K107172621 bypass):**
- User ID: `K107172621`
- Password: `VaishnaviAdmin2025`

**IMPORTANT:** This bypass does NOT require any secret token. The backend recognizes `K107172621` as a Super Admin user ID and grants admin privileges automatically.

**Test Steps:**
1. [ ] Navigate to preview URL homepage
2. [ ] Click "Official Login" button in hero section
3. [ ] Enter User ID: `K107172621`
4. [ ] Enter Password: `VaishnaviAdmin2025`
5. [ ] Click "Login"
6. [ ] **CRITICAL:** Verify browser navigates to `/admin` immediately after login
7. [ ] **CRITICAL:** Verify "Initializing Admin Session" screen completes promptly (<5 seconds if backend is responsive)
8. [ ] **CRITICAL:** Verify NO 30-second hang or timeout occurs
9. [ ] **CRITICAL:** Verify dashboard loads with inquiries (or empty state) without manual retry
10. [ ] Verify inquiries display correctly (or demo inquiry if database is empty)

**Expected Behavior:**
- Login → Navigate to /admin → Brief initialization → Dashboard
- Frontend trusts backend's SessionEntity response immediately
- No extra verification calls that cause delays
- No timeout errors when backend is responsive

### 2. Public Inquiry Submission

1. [ ] Navigate to homepage
2. [ ] Scroll to inquiry form
3. [ ] Fill out form with test data
4. [ ] Submit inquiry
5. [ ] Verify success toast appears
6. [ ] Verify form resets
7. [ ] Log in as admin
8. [ ] Verify inquiry appears in dashboard

### 3. Admin Dashboard Operations

1. [ ] View inquiries list
2. [ ] Filter by read/unread status
3. [ ] Search by name or phone
4. [ ] Mark inquiry as read/unread
5. [ ] Delete inquiry (with confirmation)
6. [ ] Bulk mark as read
7. [ ] Export as JSON
8. [ ] Export as CSV
9. [ ] Refresh inquiries
10. [ ] Logout

### 4. Demo Inquiry Fallback

**Setup:** Ensure backend database is empty (no real inquiries)

1. [ ] Log in as admin
2. [ ] Verify one inquiry appears with amber "Demo" badge
3. [ ] Verify explanatory text: "This is a demo inquiry shown because no actual inquiries exist yet..."
4. [ ] Submit a real inquiry (log out, submit via public form, log back in)
5. [ ] Verify demo inquiry automatically disappears
6. [ ] Verify only real inquiry is visible

**Expected Behavior:**
- Demo inquiry provides visual feedback when database is empty
- Clear amber badge and explanatory text
- Automatically hidden when real inquiries exist

### 5. Error Recovery

**Test Scenario: Backend Canister Stopped**

**Setup:**
