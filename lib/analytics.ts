/**
 * Fire a GA4 custom event for form submissions.
 * Safe to call client-side only — checks for window.gtag existence.
 */
export function trackFormSubmit(formName: string, source: string) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", "form_submit", {
      form_name: formName,
      form_source: source,
      page_url: window.location.href,
    });
  }
}

/** Track form submission errors */
export function trackFormError(formName: string, errorMessage: string) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", "form_error", {
      form_name: formName,
      error_message: errorMessage,
      page_url: window.location.href,
    });
  }
}
