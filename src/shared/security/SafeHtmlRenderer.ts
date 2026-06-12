import DOMPurify from "dompurify";

/**
 * Centralized HTML sanitization layer to prevent XSS.
 * Use this instead of dangerouslySetInnerHTML anywhere in the app.
 */
export class SafeHtmlRenderer {
  static sanitize(html: string): string {
    if (!html) return "";

    return DOMPurify.sanitize(html, {
      USE_PROFILES: { html: true },
      FORBID_TAGS: ["script", "style", "iframe", "object"],
      FORBID_ATTR: ["onerror", "onload", "onclick"]
    } as any);
  }

  static render(html: string): { __html: string } {
    return {
      __html: SafeHtmlRenderer.sanitize(html)
    };
  }
}