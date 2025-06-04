# Logout Button Unresponsive on Safari Browser

## Description
The logout button on the application does not trigger any action when clicked in the Safari browser. This issue may be related to JavaScript event handling or session cookie behavior in Safari. No error messages are shown, and the UI remains unchanged.

**Note:** Potential edge cases include:
- Safari’s Intelligent Tracking Prevention (ITP) blocking third-party cookies or localStorage access
- Event listeners not bound correctly due to DOMContentLoaded timing differences in Safari
- CSP or SameSite cookie restrictions

## Steps to Reproduce
1. Open the application in Safari (macOS or iOS)
2. Log into a user account
3. Click the **Logout** button in the header/menu
4. Observe that no action is taken

## Expected vs Actual Behavior

**Expected:**  
Clicking the logout button should terminate the session and redirect the user to the login page

**Actual:**  
No response or navigation occurs; user remains logged in

## Environment (if known)
- **Browser:** Safari (confirmed on macOS 14.4.1 and iOS 17.x)
- **App Version:** v1.4.2 (frontend)
- **Frontend Framework:** React (or specify if different)
- **Authentication Method:** JWT (if applicable)

## Severity or Impact
- **Severity:** High  
- **Impact:** Affects user logout ability on all Safari browsers, potentially leading to security or session persistence concerns
