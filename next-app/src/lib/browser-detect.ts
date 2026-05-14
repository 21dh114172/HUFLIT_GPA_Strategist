/**
 * Browser detection thresholds for HUFLIT GPA Strategist.
 * Roughly targets browsers from ~2021 (ES2021 support, CSS Grid gap, etc.)
 */
export const BROWSER_THRESHOLDS = {
  chrome: 90,
  firefox: 90,
  safari: 15,
  edge: 90,
  opera: 76,
} as const;

export interface BrowserInfo {
  name: string;
  version: number;
  isOld: boolean;
}

/**
 * Detects the current browser and version using userAgent.
 * Designed to be safe to run in both Node and Browser environments.
 */
export function detectBrowser(): BrowserInfo {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return { name: "unknown", version: 0, isOld: false };
  }

  const ua = navigator.userAgent;
  let name = "unknown";
  let version = 0;

  // Detection logic
  if (ua.includes("Firefox/")) {
    name = "firefox";
    version = parseInt(ua.split("Firefox/")[1], 10);
  } else if (ua.includes("Edg/")) {
    name = "edge";
    version = parseInt(ua.split("Edg/")[1], 10);
  } else if (ua.includes("OPR/") || ua.includes("Opera/")) {
    name = "opera";
    version = parseInt(ua.split("OPR/")[1] || ua.split("Opera/")[1], 10);
  } else if (ua.includes("Chrome/")) {
    name = "chrome";
    version = parseInt(ua.split("Chrome/")[1], 10);
  } else if (ua.includes("Safari/")) {
    name = "safari";
    version = parseInt(ua.split("Version/")[1], 10);
  }

  const threshold = (BROWSER_THRESHOLDS as Record<string, number>)[name] || 0;
  const isOld = name !== "unknown" && version < threshold;

  // If unknown browser, we treat it as "not old" by default to avoid blocking niche modern browsers,
  // but the inline script will have more conservative fallback.
  return { name, version, isOld };
}

/**
 * Minified string representation of the detection logic for inline scripts.
 * This is used to generate the script tag in layout.tsx.
 */
export const INLINE_DETECTION_JS = `
(function() {
  var p = localStorage.getItem('app-preference');
  if (p === 'nextjs') return;
  if (p === 'legacy') {
    if (!window.location.pathname.includes('/legacy/')) {
      window.location.replace((window.NEXT_PUBLIC_BASE_PATH || '') + '/legacy/');
    }
    return;
  }

  var ua = navigator.userAgent;
  var n = 'unknown', v = 0;
  if (ua.indexOf('Firefox/') > -1) { n = 'firefox'; v = parseInt(ua.split('Firefox/')[1], 10); }
  else if (ua.indexOf('Edg/') > -1) { n = 'edge'; v = parseInt(ua.split('Edg/')[1], 10); }
  else if (ua.indexOf('OPR/') > -1) { n = 'opera'; v = parseInt(ua.split('OPR/')[1], 10); }
  else if (ua.indexOf('Chrome/') > -1) { n = 'chrome'; v = parseInt(ua.split('Chrome/')[1], 10); }
  else if (ua.indexOf('Safari/') > -1 && ua.indexOf('Version/') > -1) { n = 'safari'; v = parseInt(ua.split('Version/')[1], 10); }

  var t = {chrome:90,firefox:90,safari:15,edge:90,opera:76};
  var isOld = n !== 'unknown' && v < (t[n] || 0);
  
  if (isOld && !window.location.pathname.includes('/legacy/')) {
    window.location.replace((window.NEXT_PUBLIC_BASE_PATH || '') + '/legacy/');
  }
})();
`.trim();
