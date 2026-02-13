# Production Smoke Test Checklist

This checklist verifies that the production deployment is working correctly after going live.

## Prerequisites

Ensure you have:
- Production URL (e.g., `https://your-app.ic0.app`)
- Official Login credentials:
  - User ID: `K107172621`
  - Password: `Karauli#34`

### Verify Backend Canister is Running

**Critical**: Before testing Official Login and admin access, confirm the backend canister is running.

#### How to Check (requires dfx CLI access):

1. **Get the production backend canister ID** from your deployment output or run:
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

4. **If the status shows "Stopped"**, start the canister immediately:
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
- If cycles are critically low, top up the canister immediately
- Check deployment logs for errors during the last upgrade
- Verify the canister is not frozen due to insufficient cycles
- If the canister is stuck, contact support or consider emergency redeployment

**Stop here if the backend canister is not running.** Do not proceed to Official Login or admin testing until the canister status is "Running" and the health check returns successfully.

---

## 1. Homepage & Public Access

### 1.1 Homepage Loads
- [ ] Navigate to production URL
- [ ] Page loads without errors (check browser console)
- [ ] All sections render correctly:
  - [ ] Hero section with Hindi tagline
  - [ ] Services section (6 departments)
  - [ ] Why Choose Us section
  - [ ] Mission & Vision section
  - [ ] FAQ section
  - [ ] Inquiry form
  - [ ] Contact section
  - [ ] Footer with attribution

### 1.2 Navigation
- [ ] Navigation bar works
- [ ] All section links work (smooth scroll)
- [ ] Mobile menu works on small screens
- [ ] Logo displays correctly

### 1.3 Contact Information
- [ ] Phone number is correct and clickable
- [ ] WhatsApp link works (opens WhatsApp)
- [ ] Email address is correct
- [ ] Address is complete and accurate
- [ ] Opening hours are correct

---

## 2. Inquiry Form Submission

### 2.1 Submit Test Inquiry
- [ ] Fill out inquiry form with test data:
  - Name: `Test User`
  - Phone: `9999999999`
  - Email: `test@example.com`
  - Service Category: Select any
  - Message: `Production smoke test inquiry`
- [ ] Submit form
- [ ] Success message appears
- [ ] Form resets after submission

### 2.2 Verify Submission (Admin Dashboard)
- [ ] Log in to admin dashboard (see section 3)
- [ ] Verify test inquiry appears in inquiry list
- [ ] Verify all details are correct
- [ ] Mark inquiry as read
- [ ] Delete test inquiry (cleanup)

---

## 3. Official Login & Admin Access

### 3.1 Official Login
- [ ] Click "Official Login" button
- [ ] Official Login dialog opens
- [ ] Enter credentials:
  - User ID: `K107172621`
  - Password: `Karauli#34`
- [ ] Click "Login"
- [ ] Login succeeds
- [ ] Redirected to `/admin` dashboard

### 3.2 Admin Dashboard Initialization

**Expected Behavior**: The admin dashboard should initialize automatically when you navigate to `/admin` after Official Login.

#### Automatic Retry with Exponential Backoff

The system will automatically retry initialization up to 3 times over ~14 seconds if it encounters recoverable errors:
- Attempt 1: Immediate
- Attempt 2: After 2 seconds
- Attempt 3: After 6 seconds (total: ~8 seconds)
- Attempt 4: After 12 seconds (total: ~14 seconds)

During automatic retry:
- [ ] "Initializing admin session..." message displays
- [ ] Retry attempt counter shows progress
- [ ] Progress indicator is visible

#### Successful Initialization

After successful initialization:
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

**This means the backend canister is not running.** This is a critical production issue.

**Immediate Resolution**:
1. [ ] Go back to Prerequisites section above
2. [ ] Follow the "Verify Backend Canister is Running" steps
3. [ ] Start the canister if it's stopped
4. [ ] Return to the admin dashboard
5. [ ] Click **Retry** button
6. [ ] Initialization should now succeed

**Post-Resolution**:
- [ ] Investigate why the canister stopped (check cycles balance, deployment logs)
- [ ] Set up monitoring to prevent future occurrences
- [ ] Document the incident

#### Other Initialization Errors

If you see any other error:
- [ ] Read the error message carefully
- [ ] Check "Technical Details" section for replica rejection details
- [ ] Click **Retry** button first
- [ ] If retry fails multiple times:
  - [ ] Check network connectivity
  - [ ] Check browser console for errors
  - [ ] Verify backend canister status
  - [ ] Contact support if issue persists

### 3.3 Admin Dashboard Features

Once initialized successfully:

#### Inquiry List
- [ ] All inquiries load correctly
- [ ] Inquiry details are accurate
- [ ] Timestamps are formatted correctly
- [ ] Unread badges appear on new inquiries

#### Filtering & Search
- [ ] Tabs work: All / Unread / Read
- [ ] Search by name works
- [ ] Search by phone works
- [ ] Filter by inquiry type works
- [ ] Filter by service category works

#### Individual Actions
- [ ] Mark inquiry as read
- [ ] Mark inquiry as unread
- [ ] Delete inquiry (with confirmation)

#### Bulk Actions
- [ ] Select multiple inquiries
- [ ] Mark as Read (bulk)
- [ ] Mark as Unread (bulk)
- [ ] Export as JSON
- [ ] Export as CSV

#### Logout
- [ ] Click "Logout" button
- [ ] User is logged out
- [ ] Redirected to homepage
- [ ] Cached data is cleared

---

## 4. Mobile Responsiveness

### 4.1 Test on Mobile Device
- [ ] Open production URL on mobile device
- [ ] Homepage renders correctly
- [ ] Navigation menu works
- [ ] Inquiry form is usable
- [ ] Official Login works
- [ ] Admin dashboard is functional on mobile

---

## 5. Performance Check

- [ ] Homepage loads in < 3 seconds
- [ ] Inquiry form submission responds in < 2 seconds
- [ ] Admin dashboard loads in < 3 seconds
- [ ] No console errors
- [ ] No broken images or assets

---

## 6. Security Verification

- [ ] HTTPS is enabled (check for padlock icon)
- [ ] No mixed content warnings
- [ ] Admin routes require authentication
- [ ] Unauthorized users cannot access `/admin`
- [ ] Session expires appropriately

---

## 7. Error Recovery

### 7.1 Network Interruption
- [ ] Log in to admin dashboard
- [ ] Disable network briefly
- [ ] Try to perform an action
- [ ] Error message appears
- [ ] Re-enable network
- [ ] Retry succeeds

### 7.2 Backend Upgrade During Session
- [ ] Log in to admin dashboard
- [ ] Note current inquiry count
- [ ] Trigger backend upgrade (if applicable)
- [ ] Return to admin dashboard
- [ ] Click "Retry Initialization" if needed
- [ ] Verify data persistence (no data loss)

---

## Sign-Off

- [ ] All critical tests passed
- [ ] No blocking issues found
- [ ] Production deployment verified

**Tester Name**: ___________________________

**Date**: ___________________________

**Production URL**: ___________________________

**Notes**:
