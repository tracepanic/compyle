/**
 * Shared email template styles for Compyle emails.
 * These styles are used across all email templates for consistent branding.
 * @module emails/styles
 */

/** Main body styles with light gray background */
export const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

/** Container styles for the email card with white background and shadow */
export const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "0",
  maxWidth: "600px",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
};

/** Header section with gradient background (indigo to purple) */
export const header = {
  background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
  padding: "32px 40px",
  borderRadius: "8px 8px 0 0",
};

/** Logo image styles - centered */
export const logoImage = {
  margin: "0 auto",
  display: "block",
};

/** Tagline text below the logo */
export const tagline = {
  color: "rgba(255, 255, 255, 0.9)",
  fontSize: "14px",
  fontWeight: "500",
  margin: "12px 0 0",
  textAlign: "center" as const,
  letterSpacing: "0.5px",
};

/** Main content section padding */
export const content = {
  padding: "40px",
};

/** Heading styles for email titles */
export const heading = {
  color: "#1a1a1a",
  fontSize: "24px",
  fontWeight: "600",
  margin: "0 0 24px",
  textAlign: "center" as const,
};

/** Paragraph text styles */
export const paragraph = {
  color: "#4a5568",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "0 0 16px",
};

/** Container for CTA buttons - centered */
export const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

/** Primary CTA button styles with brand color */
export const button = {
  backgroundColor: "#4F46E5",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  padding: "14px 32px",
  display: "inline-block",
};

/** Inline link styles */
export const link = {
  color: "#4F46E5",
  fontSize: "14px",
  wordBreak: "break-all" as const,
};

/** Horizontal rule divider */
export const hr = {
  borderColor: "#e5e7eb",
  margin: "0",
};

/** Footer section padding */
export const footer = {
  padding: "24px 40px",
};

/** Footer text styles - muted color */
export const footerText = {
  color: "#9ca3af",
  fontSize: "13px",
  lineHeight: "22px",
  margin: "0 0 8px",
  textAlign: "center" as const,
};

/** Footer navigation links container */
export const footerLinks = {
  color: "#9ca3af",
  fontSize: "13px",
  margin: "16px 0 0",
  textAlign: "center" as const,
};

/** Individual footer link styles */
export const footerLink = {
  color: "#4F46E5",
  textDecoration: "none",
};

/** Social media links section */
export const socialSection = {
  textAlign: "center" as const,
  margin: "16px 0",
};

/** Individual social media link styles */
export const socialLink = {
  color: "#4F46E5",
  fontSize: "13px",
  fontWeight: "600",
  textDecoration: "none",
  margin: "0 12px",
};

/** Legal links section (Terms, Privacy) */
export const legalLinks = {
  color: "#9ca3af",
  fontSize: "11px",
  margin: "12px 0 0",
  textAlign: "center" as const,
};

/** Individual legal link styles */
export const legalLink = {
  color: "#9ca3af",
  textDecoration: "none",
};
