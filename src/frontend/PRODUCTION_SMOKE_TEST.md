# Production Smoke Test Checklist

This checklist verifies that the production deployment is working correctly after going live.

## Prerequisites

Ensure you have:
- Production URL (e.g., `https://your-app.ic0.app`)
- Official Login credentials:
  - User ID: `K107172621`
  - Password: `Karauli#34`

---

## Critical Path Tests

### Test 1: Homepage Loads
- [ ] Navigate to production URL
- [ ] Verify homepage loads without errors
- [ ] Verify all sections are visible:
  - Hero section with business name and logo
  - Services section
  - Why Choose Us section
  - Inquiry form section
  - Contact section
  - Footer with attribution

### Test 2: Official Login & Admin Access
- [ ] Click "Official Login" button in hero section
- [ ] Enter credentials in the dialog
- [ ] Click "Login"
- [ ] Verify automatic navigation to `/admin`
- [ ] Verify admin dashboard loads (one of these states):
  - **Initializing**: Shows spinner with "Initializing Admin Session"
  - **Ready**: Shows inquiry list or empty state
  - **Failed**: Shows error with recovery actions

### Test 3: Admin Session Initialization Resilience
- [ ] After Official Login, if "Admin secret already used" error appears:
  - [ ] Verify error message explains this is normal behavior
  - [ ] Verify **Retry Initialization** is the primary action (not Logout)
  - [ ] Click **Retry Initialization**
  - [ ] Verify dashboard loads successfully after retry
- [ ] If initialization succeeds immediately:
  - [ ] Verify inquiry list or empty state is shown
  - [ ] Proceed to next test

### Test 4: Page Refresh Persistence
- [ ] While logged in to admin dashboard, refresh the page (F5)
- [ ] Verify admin session persists (no redirect to homepage)
- [ ] Verify inquiries reload successfully
- [ ] Verify no initialization errors occur

### Test 5: Logout and Re-login Cycle
- [ ] Click "Logout" button in admin dashboard
- [ ] Verify redirect to homepage
- [ ] Click "Official Login" again
- [ ] Enter credentials and login
- [ ] Verify admin dashboard loads successfully
- [ ] Verify no "Admin secret already used" error blocks access
- [ ] If error appears, verify **Retry Initialization** resolves it

### Test 6: Submit Public Inquiry
- [ ] Open homepage (logout if needed)
- [ ] Scroll to "Send Us an Inquiry" section
- [ ] Fill out the form:
  - Name: `Production Test User`
  - Phone: `9999999999`
  - Email: `test@production.com`
  - Inquiry Type: "Service Request"
  - Service Category: Select any
  - Message: `Production smoke test inquiry - ${new Date().toISOString()}`
- [ ] Click "Submit Inquiry"
- [ ] Verify success message appears
- [ ] Verify form resets after submission

### Test 7: View Inquiry in Admin Dashboard
- [ ] Login to admin dashboard (Official Login)
- [ ] If initialization error appears, click **Retry Initialization**
- [ ] Verify the inquiry submitted in Test 6 appears in the list
- [ ] Verify inquiry details are correct:
  - Name, phone, email
  - Inquiry type and service category
  - Message content
  - Marked as "Unread"

### Test 8: Mark Inquiry as Read
- [ ] Find the test inquiry in the list
- [ ] Click the three-dot menu (⋮)
- [ ] Click "Mark as Read"
- [ ] Verify status updates to "Read" with green checkmark
- [ ] Verify success toast notification

### Test 9: Delete Test Inquiry
- [ ] Click the three-dot menu on the test inquiry
- [ ] Click "Delete"
- [ ] Confirm deletion in the dialog
- [ ] Verify inquiry is removed from the list
- [ ] Verify success toast notification

### Test 10: Refresh Button
- [ ] Click "Refresh" button in admin dashboard header
- [ ] Verify inquiries reload
- [ ] Verify loading spinner appears briefly
- [ ] Verify inquiry list updates

---

## Error Recovery Tests

### Test 11: Retry Initialization After Error
- [ ] If any initialization error occurs:
  - [ ] Click "Show Technical Details" to expand error info
  - [ ] Verify error message is in English
  - [ ] Verify reject code/request ID shown (if applicable)
  - [ ] Click **Retry Initialization**
  - [ ] Verify error clears and dashboard loads

### Test 12: Multiple Retry Attempts
- [ ] If initialization fails:
  - [ ] Click **Retry Initialization** up to 3 times
  - [ ] Verify each retry attempts fresh initialization
  - [ ] Verify eventual success or clear error message

### Test 13: Logout After Persistent Errors
- [ ] If initialization fails repeatedly:
  - [ ] Click **Logout** button
  - [ ] Verify redirect to homepage
  - [ ] Wait 10 seconds
  - [ ] Login again with Official Login
  - [ ] Verify fresh session resolves the issue

---

## Mobile Responsiveness (Optional but Recommended)

### Test 14: Mobile View
- [ ] Open production URL on mobile device or use DevTools mobile emulation
- [ ] Verify homepage is responsive
- [ ] Verify navigation menu works (hamburger menu if applicable)
- [ ] Verify inquiry form is usable on mobile
- [ ] Login to admin dashboard
- [ ] Verify admin dashboard is responsive
- [ ] Verify inquiry cards are readable and actions are accessible

---

## Known Issues & Expected Behavior

### "Admin secret already used to initialize the system"

**Status**: This is **expected behavior** in production after the first initialization.

**What it means**: The backend has already been initialized with the admin secret. This is normal and secure behavior.

**Expected resolution**:
1. Error message should explain this is normal
2. **Retry Initialization** button should be the primary action (not Logout)
3. Clicking **Retry Initialization** should successfully load the dashboard
4. This should work consistently across logout/login cycles and page refreshes

**If retry doesn't work**:
- Check backend canister status (requires dfx access)
- Verify network connectivity
- Try logging out and logging in again
- If issue persists, contact system administrator

---

### Backend Canister Issues

**Symptoms**:
- "Backend service is stopped"
- "Canister unavailable"
- Initialization timeout (30 seconds)

**Resolution** (requires dfx access):
