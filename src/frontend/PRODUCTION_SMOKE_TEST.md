# Production Smoke Test Checklist

This document provides a manual smoke-test checklist to verify that the production (live) deployment is functioning correctly without regressions.

## Prerequisites
- Fresh browser session (incognito/private mode recommended)
- Clear browser cache and cookies before testing
- Test on both desktop and mobile viewports

## Test Cases

### 1. Homepage Load (/)
**Expected:** Homepage loads successfully with all sections and assets visible
- [ ] Navigate to the live site root URL
- [ ] Verify the page loads without errors (check browser console)
- [ ] Confirm all sections render: Hero, Services, Why Choose Us, Form, Contact, Footer
- [ ] Check that images load correctly:
  - [ ] Hero background image (`/assets/generated/vaishnavi-hero.dim_1600x900.png`)
  - [ ] Logo in navigation bar (`/assets/generated/vaishnavi-logo.dim_512x512.png`)
- [ ] Verify navigation bar is functional and sticky
- [ ] Confirm no console errors or warnings

### 2. Unauthenticated Admin Access (/admin)
**Expected:** Brief "Redirecting..." state, then redirect to homepage
- [ ] In a fresh session (not logged in), navigate directly to `/admin`
- [ ] Verify you see a brief "Redirecting..." message with spinner (not a blank screen)
- [ ] Confirm automatic redirect to homepage (/)
- [ ] Verify no console errors during redirect

### 3. Official Login Flow
**Expected:** Successful login navigates to Admin Dashboard at /admin
- [ ] From the homepage, click "Official Login" button in the hero section
- [ ] Verify login dialog opens
- [ ] Enter credentials:
  - User ID: `K107172621`
  - Password: `Karauli#34`
- [ ] Click "लॉगिन करें" (Login) button
- [ ] Verify successful login and automatic navigation to `/admin`
- [ ] Confirm Admin Dashboard renders with:
  - [ ] Header showing "Admin Dashboard" with logo
  - [ ] Inquiry list/tabs (All/Unread/Read)
  - [ ] Logout button in header
  - [ ] No blank screens or stuck loading states

### 4. Admin Dashboard Functionality
**Expected:** All admin inquiry actions work without errors

#### 4a. Empty State (No Inquiries)
- [ ] If no inquiries exist, verify empty state displays:
  - [ ] "No inquiries yet" message in English
  - [ ] Inbox icon
  - [ ] Visible "Refresh" button
- [ ] Click the "Refresh" button
- [ ] Verify button shows loading state ("Refreshing..." with spinning icon)
- [ ] Confirm data refetches without errors

#### 4b. Inquiry Management (When Inquiries Exist)
- [ ] Verify inquiry list loads correctly
- [ ] Test tab switching (All/Unread/Read)
- [ ] Test marking inquiry as read:
  - [ ] Click "Mark as read" action on an unread inquiry
  - [ ] Verify inquiry updates to read state (opacity changes, "नया" badge removed)
  - [ ] Click "Refresh" button to confirm state persists after refetch
- [ ] Test marking inquiry as unread:
  - [ ] Click "Mark as unread" action on a read inquiry
  - [ ] Verify inquiry updates to unread state ("नया" badge appears)
  - [ ] Click "Refresh" button to confirm state persists after refetch
- [ ] Test search by name/phone
- [ ] Test filter by inquiry type
- [ ] Test bulk actions: select multiple inquiries and mark as read/unread
- [ ] Test export actions:
  - [ ] Export as JSON
  - [ ] Export as CSV
- [ ] Test delete inquiry:
  - [ ] Click delete action
  - [ ] Verify confirmation dialog appears
  - [ ] Confirm deletion
  - [ ] Verify inquiry is removed from list
  - [ ] Click "Refresh" button to confirm inquiry does not reappear
- [ ] Verify no console errors during any action
- [ ] Click Logout button
- [ ] Verify redirect to homepage and session cleared

### 5. Public Inquiry Form Submission
**Expected:** Form submission succeeds, shows success feedback, resets, and appears in Admin Dashboard
- [ ] Navigate to homepage (/)
- [ ] Scroll to "संपर्क करें" (Contact) form section
- [ ] Fill out the form:
  - Name: `Test User Production`
  - Phone: `9876543210`
  - Email: `test@example.com` (optional)
  - Message: `Test inquiry from production smoke test`
  - Select inquiry type (सामान्य पूछताछ or सेवा अनुरोध)
  - If Service Request, select a service category
- [ ] Click "पूछताछ भेजें" (Submit) button
- [ ] Verify success message appears: "धन्यवाद! आपकी पूछताछ सफलतापूर्वक प्राप्त हो गई है..."
- [ ] Confirm form resets after successful submission (all fields cleared)
- [ ] Check no console errors
- [ ] Log in to Admin Dashboard (if not already logged in)
- [ ] Navigate to `/admin`
- [ ] Verify the newly submitted inquiry appears in the list
- [ ] If it doesn't appear immediately, click the "Refresh" button
- [ ] Confirm the inquiry details match what was submitted:
  - [ ] Name: "Test User Production"
  - [ ] Phone: "9876543210"
  - [ ] Message content matches
  - [ ] Inquiry type and service category (if applicable) are correct
  - [ ] Inquiry is marked as unread (has "नया" badge)

### 6. Deep Link Restoration (404 Fallback)
**Expected:** Deep links are preserved and restored after login
- [ ] In a fresh session (logged out), navigate directly to `/admin`
- [ ] Verify redirect to `/` occurs
- [ ] Log in via Official Login (User ID: `K107172621`, Password: `Karauli#34`)
- [ ] After successful login, verify automatic navigation to `/admin`
- [ ] Confirm Admin Dashboard renders correctly

### 7. Mobile Responsiveness
**Expected:** All features work on mobile viewport
- [ ] Resize browser to mobile width (< 768px) or use device emulation
- [ ] Verify navigation menu collapses to hamburger icon
- [ ] Test mobile menu open/close
- [ ] Verify all sections are readable and properly laid out
- [ ] Test form submission on mobile
- [ ] Test Official Login on mobile
- [ ] Test admin dashboard on mobile (if logged in):
  - [ ] Verify inquiry cards are readable
  - [ ] Test actions work on mobile
  - [ ] Test "Refresh" button in empty state (if applicable)

## Success Criteria
All checkboxes above should be checked (✓) for the production deployment to be considered stable and ready for live traffic.

## Reporting Issues
If any test case fails:
1. Note the specific step that failed
2. Capture browser console errors (if any)
3. Take screenshots of the issue
4. Document the browser and device used
5. Report to the development team with all details

## Known Limitations
- **Data Persistence:** Inquiries are stored in the backend canister's stable memory. If the canister is upgraded without proper migration, old inquiries may be lost. Always verify that migration logic in `backend/migration.mo` is correctly implemented before upgrading.
- **Inquiry ID Sequence:** The `nextId` counter must be preserved across upgrades to prevent ID collisions.

---
**Last Updated:** February 13, 2026
