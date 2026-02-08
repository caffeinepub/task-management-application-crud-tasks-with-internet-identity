# Specification

## Summary
**Goal:** Ensure the app never flashes or renders any “Access Denied” UI during initial load for signed-out users, and always shows the Features + Sign in landing screen when not authenticated.

**Planned changes:**
- Adjust initial auth/route gating so signed-out users always render the signed-out landing screen (Features + Sign in) throughout initialization, with no transient “Access Denied” state.
- Harden top-level authorization error handling during authenticated startup so any auth/permission-related failure clears the in-app session and returns the user to the signed-out landing screen, without relying on a single exact error-string match.
- Clear/Invalidate React Query caches after forced logout due to an authorization error to prevent protected queries from repeatedly failing.
- Remove any remaining renderable “Access Denied” screen implementation and eliminate all code paths that import/route/render it.

**User-visible outcome:** Opening the site while signed out always shows the Features + Sign in landing screen immediately and consistently; “Access Denied” never appears on refresh/initial load, and any auth failure during startup logs the user out back to the signed-out landing screen.
