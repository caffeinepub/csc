# Preview Environment Validation Checklist

This checklist helps you verify that the preview deployment is working correctly before promoting to production.

## Prerequisites

Before testing the application, ensure the backend canister is running:

### 1. Check Backend Canister Status

**Important**: The backend canister must be running before you can test Official Login and the admin dashboard. If the canister is stopped, initialization will fail with a "Canister is stopped" error.

#### How to Check (requires dfx CLI access):

1. **Get the backend canister ID** from your deployment output or run:
   ```bash
   dfx canister id backend --network ic
   ```

2. **Check the canister status**:
   ```bash
   dfx canister status backend --network ic
   ```

3. **Verify the output shows**:
   ```
   Status: Running
   ```

4. **If the status shows "Stopped"**, start the canister:
   ```bash
   dfx canister start backend --network ic
   ```

5. **Confirm it started successfully** by checking status again:
   ```bash
   dfx canister status backend --network ic
   ```

6. **Test backend connectivity** by calling the health check endpoint:
   ```bash
   dfx canister call backend getHealthStatus --network ic
   ```
   Expected output: `("healthy")`

#### What to Do If Canister Won't Start:

- Check canister cycles balance: `dfx canister status backend --network ic` (look for "Balance")
- If cycles are low, top up the canister
- Check deployment logs for errors during the last upgrade
- If the canister is stuck, consider redeploying with `dfx deploy backend --network ic`

**Stop here if the backend canister is not running.** Do not proceed to Official Login or admin testing until the canister status is "Running" and the health check returns successfully.

---

## 1. Homepage & Public Features

### 1.1 Homepage Loads
- [ ] Navigate to the preview URL
- [ ] Page loads without errors
- [ ] All sections render correctly:
  - [ ] Hero section with Hindi tagline
  - [ ] Services section (6 departments with accordions)
  - [ ] Why Choose Us section
  - [ ] Mission & Vision section
  - [ ] FAQ section
  - [ ] Inquiry form
  - [ ] Contact section
  - [ ] Footer with attribution

### 1.2 Navigation
- [ ] Navigation bar is visible and functional
- [ ] All navigation links work (smooth scroll to sections)
- [ ] Mobile menu works on small screens
- [ ] Logo/brand mark displays correctly

### 1.3 Inquiry Form Submission
- [ ] Fill out the inquiry form with test data
- [ ] Select a service category from dropdown
- [ ] Submit the form
- [ ] Success message appears
- [ ] Form resets after successful submission
- [ ] Error handling works (try submitting with missing required fields)

---

## 2. Official Login & Admin Access

### 2.1 Official Login Flow
- [ ] Click "Official Login" button in hero section or admin section
- [ ] Official Login dialog opens
- [ ] Enter credentials:
  - User ID: `K107172621`
  - Password: `Karauli#34`
- [ ] Click "Login"
- [ ] Login succeeds (no error messages)
- [ ] Dialog closes automatically
- [ ] User is redirected to `/admin` dashboard

### 2.2 Admin Dashboard Initialization

**Expected Behavior**: The admin dashboard should initialize automatically when you navigate to `/admin` after Official Login.

#### Automatic Retry with Exponential Backoff

The system will automatically retry initialization up to 3 times over ~14 seconds if it encounters recoverable errors:
- Attempt 1: Immediate
- Attempt 2: After 2 seconds
- Attempt 3: After 6 seconds (total: ~8 seconds)
- Attempt 4: After 12 seconds (total: ~14 seconds)

During automatic retry, you will see:
- [ ] "Initializing admin session..." message
- [ ] Retry attempt counter (e.g., "Attempt 2 of 3")
- [ ] Progress indicator

#### Successful Initialization

After successful initialization (either on first attempt or after automatic retry):
- [ ] Admin dashboard displays "Admin Dashboard" header
- [ ] Inquiry list loads and displays
- [ ] No error messages visible
- [ ] All admin controls are functional

#### "Admin Secret Already Used" Error (Expected Behavior)

**This is normal and expected** if you've logged in before in the same session. The system treats this as a recoverable error.

What you should see:
- [ ] Error message: "Admin secret already used. Please click Retry to reconnect."
- [ ] **Retry button is the primary action** (orange/prominent)
- [ ] Logout button is secondary (gray/outline)
- [ ] "Hide Technical Details" collapsible section (optional to expand)

**Resolution**:
- [ ] Click the **Retry** button
- [ ] System clears cached state and reinitializes
- [ ] Initialization succeeds on retry
- [ ] Admin dashboard loads normally

**Do NOT logout and login again** — this will not fix the issue. Always use Retry first.

#### Backend Canister Stopped Error

If you see an error message containing:
- "Backend service is stopped"
- "Canister ... is stopped"
- "Reject Code: 5"

**This means the backend canister is not running.** This is the exact scenario we're preventing with the Prerequisites section above.

**Resolution**:
1. [ ] Go back to Prerequisites section above
2. [ ] Follow the "Check Backend Canister Status" steps
3. [ ] Start the canister if it's stopped
4. [ ] Return to the admin dashboard
5. [ ] Click **Retry** button
6. [ ] Initialization should now succeed

#### Other Initialization Errors

If you see any other error:
- [ ] Read the error message carefully
- [ ] Check "Technical Details" section for replica rejection details (reject code, request ID)
- [ ] Click **Retry** button first (may be a transient network issue)
- [ ] If retry fails multiple times, check:
  - [ ] Network connectivity
  - [ ] Browser console for additional errors
  - [ ] Backend canister status (may have stopped during testing)

### 2.3 Admin Dashboard Features

Once initialized successfully:

#### Inquiry List
- [ ] Previously submitted test inquiry appears in the list
- [ ] Inquiry details are correct (name, phone, message, service category)
- [ ] Timestamp is formatted correctly
- [ ] "Unread" badge appears on new inquiries

#### Filtering & Search
- [ ] Tabs work: All / Unread / Read
- [ ] Search by name works
- [ ] Search by phone number works
- [ ] Filter by inquiry type works
- [ ] Filter by service category works
- [ ] Filters can be combined

#### Individual Inquiry Actions
- [ ] Mark inquiry as read (badge disappears)
- [ ] Mark inquiry as unread (badge reappears)
- [ ] Delete inquiry (confirmation dialog appears)
- [ ] Confirm deletion (inquiry removed from list)

#### Bulk Actions
- [ ] Select multiple inquiries using checkboxes
- [ ] "Mark as Read" bulk action works
- [ ] "Mark as Unread" bulk action works
- [ ] Export as JSON works (file downloads)
- [ ] Export as CSV works (file downloads, opens in spreadsheet)

#### Logout
- [ ] Click "Logout" button in header
- [ ] User is logged out
- [ ] Redirected to homepage
- [ ] Cached admin data is cleared
- [ ] Navigating back to `/admin` shows login prompt

---

## 3. Error Recovery Testing

### 3.1 Network Interruption
- [ ] Log in to admin dashboard
- [ ] Disable network (airplane mode or disconnect WiFi)
- [ ] Try to perform an action (e.g., mark inquiry as read)
- [ ] Error message appears
- [ ] Re-enable network
- [ ] Click retry or refresh
- [ ] Action succeeds

### 3.2 Session Expiration
- [ ] Log in to admin dashboard
- [ ] Wait for session to expire (or clear sessionStorage manually)
- [ ] Try to perform an admin action
- [ ] System detects authorization error
- [ ] Automatic reinitialization attempts
- [ ] If reinitialization fails, clear error message appears
- [ ] Logout and login again to restore access

### 3.3 Backend Upgrade During Session
- [ ] Log in to admin dashboard
- [ ] Submit a test inquiry from another browser/incognito window
- [ ] Trigger a backend upgrade (redeploy backend canister)
- [ ] Return to admin dashboard
- [ ] Click "Retry Initialization" if needed
- [ ] Previously submitted inquiry still appears
- [ ] New inquiry appears after refresh
- [ ] No data loss

---

## 4. Responsive Design

### 4.1 Mobile (375px - 767px)
- [ ] All sections stack vertically
- [ ] Text is readable without zooming
- [ ] Buttons are large enough to tap
- [ ] Forms are usable
- [ ] Navigation menu collapses to hamburger
- [ ] Admin dashboard is usable on mobile

### 4.2 Tablet (768px - 1023px)
- [ ] Layout adapts appropriately
- [ ] Two-column layouts where appropriate
- [ ] Navigation remains accessible
- [ ] Admin dashboard uses available space efficiently

### 4.3 Desktop (1024px+)
- [ ] Full multi-column layouts
- [ ] Optimal use of screen space
- [ ] No horizontal scrolling
- [ ] Admin dashboard shows all controls without crowding

---

## 5. Browser Compatibility

Test in at least two browsers:

### Chrome/Edge
- [ ] All features work
- [ ] No console errors
- [ ] Smooth animations

### Firefox
- [ ] All features work
- [ ] No console errors
- [ ] Consistent appearance

### Safari (if available)
- [ ] All features work
- [ ] No console errors
- [ ] Consistent appearance

---

## 6. Performance

- [ ] Homepage loads in < 3 seconds
- [ ] Inquiry form submission responds in < 2 seconds
- [ ] Admin dashboard loads in < 3 seconds
- [ ] No layout shifts during page load
- [ ] Smooth scrolling and animations

---

## 7. Accessibility

- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are visible
- [ ] Form labels are properly associated
- [ ] Error messages are announced
- [ ] Color contrast meets WCAG AA standards

---

## Sign-Off

- [ ] All critical issues resolved
- [ ] All tests passed
- [ ] Ready for production deployment

**Tester Name**: ___________________________

**Date**: ___________________________

**Notes**:
