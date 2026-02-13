# Production Smoke Test Checklist

This document provides a comprehensive checklist for validating the production deployment of the inquiry management system.

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

## Official Login Flow (Super Admin Bypass)

### Test Scenario: Official Login → Admin Dashboard

**Super Admin Credentials (K107172621 bypass):**
- User ID: `K107172621`
- Password: `VaishnaviAdmin2025`

**IMPORTANT:** This bypass does NOT require any secret token. The backend recognizes `K107172621` as a Super Admin user ID and grants admin privileges automatically.

1. **Navigate to homepage**
   - [ ] Homepage loads successfully
   - [ ] All sections render correctly (Hero, Services, FAQ, Contact, etc.)

2. **Open Official Login dialog**
   - [ ] Click "Official Login" button in hero section
   - [ ] Dialog opens with User ID and Password fields

3. **Enter Super Admin credentials**
   - [ ] Enter User ID: `K107172621`
   - [ ] Enter Password: `VaishnaviAdmin2025`
   - [ ] Click "Login" button

4. **Verify immediate navigation to /admin**
   - [ ] After successful login, browser navigates to `/admin` automatically
   - [ ] No manual navigation or extra clicks required

5. **Verify admin initialization completes promptly**
   - [ ] "Initializing Admin Session" screen appears briefly (should complete in <5 seconds if backend is responsive)
   - [ ] **CRITICAL:** Initialization does NOT hang for ~30 seconds
   - [ ] **CRITICAL:** No timeout error occurs
   - [ ] Dashboard loads successfully after initialization

6. **Verify inquiries visibility**
   - [ ] If inquiries exist: Inquiry list displays all inquiries
   - [ ] If no inquiries exist: Empty state or demo inquiry fallback displays
   - [ ] No additional manual retry or refresh needed

### Expected Behavior

- **Successful path**: Login → Navigate to /admin → Brief initialization → Dashboard with inquiries
- **No timeouts**: Initialization completes promptly when backend returns valid session
- **Trust backend**: Frontend accepts backend's SessionEntity response immediately without extra verification

## Public Inquiry Submission

### Test Scenario: Submit Contact Inquiry

1. **Navigate to homepage**
   - [ ] Scroll to "Get in Touch" section
   - [ ] Inquiry form is visible

2. **Fill out contact form**
   - [ ] Enter name: "Test User"
   - [ ] Enter phone: "9876543210"
   - [ ] Enter email: "test@example.com"
   - [ ] Select inquiry type: "Contact"
   - [ ] Enter message: "This is a test inquiry"
   - [ ] Click "Submit Inquiry"

3. **Verify submission success**
   - [ ] Success toast notification appears
   - [ ] Form resets to empty state
   - [ ] No errors in browser console

4. **Verify inquiry appears in admin dashboard**
   - [ ] Log in as admin (if not already logged in)
   - [ ] Navigate to admin dashboard
   - [ ] New inquiry appears in the list
   - [ ] All inquiry details are correct

### Test Scenario: Submit Service Request

1. **Fill out service request form**
   - [ ] Enter name: "Service Test"
   - [ ] Enter phone: "9876543211"
   - [ ] Enter email: "service@example.com"
   - [ ] Select inquiry type: "Service Request"
   - [ ] Select service category: Any category from dropdown
   - [ ] Enter message: "I need help with [service]"
   - [ ] Click "Submit Inquiry"

2. **Verify submission and admin visibility**
   - [ ] Success toast appears
   - [ ] Form resets
   - [ ] Inquiry appears in admin dashboard with correct service category

## Admin Dashboard Operations

### Test Scenario: Inquiry Management

1. **View inquiries**
   - [ ] All inquiries display in list
   - [ ] Inquiry cards show all details (name, phone, email, message, timestamp, type, category)
   - [ ] Unread inquiries are visually distinct

2. **Filter inquiries**
   - [ ] Click "Unread" tab → Only unread inquiries show
   - [ ] Click "Read" tab → Only read inquiries show
   - [ ] Click "All" tab → All inquiries show

3. **Search inquiries**
   - [ ] Enter name in search box → Matching inquiries filter
   - [ ] Enter phone number → Matching inquiries filter
   - [ ] Clear search → All inquiries return

4. **Mark inquiry as read**
   - [ ] Click "Mark as Read" on an unread inquiry
   - [ ] Success toast appears
   - [ ] Inquiry moves to "Read" tab
   - [ ] Visual indicator updates

5. **Mark inquiry as unread**
   - [ ] Click "Mark as Unread" on a read inquiry
   - [ ] Success toast appears
   - [ ] Inquiry moves to "Unread" tab

6. **Delete inquiry**
   - [ ] Click "Delete" on an inquiry
   - [ ] Confirmation dialog appears
   - [ ] Click "Delete" in dialog
   - [ ] Success toast appears
   - [ ] Inquiry removed from list

7. **Bulk operations**
   - [ ] Select multiple inquiries using checkboxes
   - [ ] Click "Mark Selected as Read"
   - [ ] All selected inquiries marked as read
   - [ ] Success toast shows count

8. **Export inquiries**
   - [ ] Click "Export" dropdown
   - [ ] Click "Export as JSON"
   - [ ] JSON file downloads with all inquiry data
   - [ ] Click "Export as CSV"
   - [ ] CSV file downloads with formatted data

### Test Scenario: Refresh and Logout

1. **Refresh inquiries**
   - [ ] Click "Refresh" button
   - [ ] Loading indicator appears briefly
   - [ ] Inquiry list updates
   - [ ] Success toast appears

2. **Logout**
   - [ ] Click "Logout" button
   - [ ] Redirects to homepage
   - [ ] Admin session cleared
   - [ ] Attempting to access `/admin` redirects to homepage

## Demo Inquiry Fallback

### Test Scenario: Empty Database

**Setup:**
1. Ensure the backend database has NO real inquiries (fresh deployment or after deleting all inquiries)

**Test:**
1. **Log in as admin**
   - [ ] Navigate to `/admin`
   - [ ] Admin dashboard loads successfully

2. **Verify demo inquiry displays**
   - [ ] One inquiry card appears labeled "Demo Inquiry"
   - [ ] Inquiry has amber "Demo" badge
   - [ ] Explanatory text appears: "This is a demo inquiry shown because no actual inquiries exist yet. It will automatically disappear once real inquiries are submitted."
   - [ ] Demo inquiry shows placeholder data (name: "Demo Inquiry", phone: "1234567890", etc.)

3. **Submit a real inquiry**
   - [ ] Log out from admin
   - [ ] Navigate to homepage
   - [ ] Submit a real inquiry through the public form
   - [ ] Log back in as admin

4. **Verify demo inquiry disappears**
   - [ ] Only the real inquiry appears in the list
   - [ ] Demo inquiry is automatically hidden
   - [ ] No "Demo" badge visible

**Expected Behavior:**
- Demo inquiry provides visual feedback when database is empty
- Demo inquiry automatically hides when real data exists
- Clear labeling prevents confusion with real inquiries

## Error Recovery Patterns

### Test Scenario: Backend Canister Stopped

**Setup:**
1. Stop the backend canister:
   ```bash
   dfx canister stop backend --network ic
   ```

**Test:**
1. **Attempt admin login**
   - [ ] Log in with Super Admin credentials
   - [ ] Navigate to `/admin`
   - [ ] Health check preflight detects canister-stopped
   - [ ] Error message displays: "Backend canister is stopped. Please contact the system administrator to start the canister."
   - [ ] Error includes "Retry Initialization" button

2. **Verify error details**
   - [ ] Click "Show Technical Details"
   - [ ] Replica rejection details display (reject code, request ID)
   - [ ] "Backend canister is stopped" flag is present

3. **Attempt retry (should fail)**
   - [ ] Click "Retry Initialization"
   - [ ] Error persists (canister still stopped)
   - [ ] Automatic retry with exponential backoff (up to 3 attempts)
   - [ ] Final error message after all retries exhausted

**Recovery:**
1. Start the backend canister:
   ```bash
   dfx canister start backend --network ic
   ```

2. **Retry initialization**
   - [ ] Click "Retry Initialization" in error UI
   - [ ] Initialization succeeds
   - [ ] Dashboard loads with inquiries

**Expected Behavior:**
- Health check detects canister-stopped early (before attempting initialization)
- Clear error message with actionable guidance
- Automatic retry with bounded attempts
- Manual retry succeeds after canister is started

### Test Scenario: Network Timeout

**Setup:**
1. Simulate slow network (browser DevTools → Network → Throttling → Slow 3G)

**Test:**
1. **Attempt admin login**
   - [ ] Log in and navigate to `/admin`
   - [ ] Initialization takes longer than usual
   - [ ] Automatic retry with exponential backoff (2s, 4s, 8s delays)
   - [ ] If timeout occurs after 30 seconds, error message displays
   - [ ] Error message: "Admin session initialization timed out after 30 seconds..."

2. **Retry with normal network**
   - [ ] Disable network throttling
   - [ ] Click "Retry Initialization"
   - [ ] Initialization succeeds

**Expected Behavior:**
- Automatic retry handles transient network issues
- Timeout after 30 seconds prevents indefinite hang
- Manual retry succeeds after network improves

## Browser Compatibility

Test the above scenarios in:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Android)

## Performance Checks

- [ ] Homepage loads in <3 seconds
- [ ] Admin dashboard loads in <5 seconds (after initialization)
- [ ] Inquiry list renders smoothly with 50+ inquiries
- [ ] Search/filter operations are instant (<100ms)
- [ ] No memory leaks after extended use

## Security Checks

- [ ] Cannot access `/admin` without Official Login
- [ ] Attempting to access `/admin` while logged out redirects to homepage
- [ ] Logout clears all admin session data
- [ ] Public inquiry submission does not require authentication
- [ ] Admin operations (mark read, delete) require admin session

## Notes

- All UI strings are in English
- Timestamps use en-US locale formatting
- Demo inquiry is clearly labeled and automatically hidden when real data exists
- Error messages provide actionable guidance with inline replica details
- Automatic retry with exponential backoff handles transient errors
- Health check preflight detects canister-stopped early
- Super Admin bypass (K107172621) does NOT require any secret token
- Admin initialization trusts backend session response immediately without extra verification
