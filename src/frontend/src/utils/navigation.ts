/**
 * SPA navigation helper that updates browser history and notifies routing logic
 * without forcing full page reloads.
 */

export function navigateTo(path: string, replace = false) {
  if (replace) {
    window.history.replaceState(null, '', path);
  } else {
    window.history.pushState(null, '', path);
  }
  
  // Dispatch popstate event to notify App routing logic
  window.dispatchEvent(new PopStateEvent('popstate'));
}
