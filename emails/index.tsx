import PasswordResetEmailTemplate from "@/emails/components/forgot-password";
import EmailVerificationEmailTemplate from "@/emails/components/verify-email";
import { env as envClient } from "@/env/client";
import { env as envServer } from "@/env/server";
import { Resend } from "resend";

const resend = new Resend(envServer.RESEND_API_KEY);

/**
 * Props for sending emails to users.
 * @property email - The recipient's email address
 * @property url - The action URL (verification link or password reset link)
 * @property name - The recipient's display name for personalization
 */
interface SendEmailProps {
  email: string;
  url: string;
  name: string;
}

/**
 * Sends an email verification email to a newly registered user.
 * Uses the Resend API to deliver a branded email with a verification link.
 *
 * @param props - The email properties
 * @param props.email - The recipient's email address
 * @param props.url - The email verification URL
 * @param props.name - The recipient's name for personalization
 * @throws Error if the email fails to send
 *
 * @example
 * ```ts
 * await sendEmailVerificationEmail({
 *   email: "user@example.com",
 *   url: "https://compyle.tracepanic.com/verify?token=abc123",
 *   name: "John Doe"
 * });
 * ```
 */
export async function sendEmailVerificationEmail({
  email,
  url,
  name,
}: SendEmailProps) {
  try {
    await resend.emails.send({
      to: [email],
      from: `Compyle Team <auth@${envClient.NEXT_PUBLIC_EMAIL_DOMAIN}>`,
      subject: "Compyle: Verify your email address",
      react: EmailVerificationEmailTemplate({ url, name }),
    });
  } catch (error) {
    console.error("Failed to send verification email:", error);
    throw error;
  }
}

/**
 * Sends a password reset email to a user who requested to reset their password.
 * Uses the Resend API to deliver a branded email with a password reset link.
 *
 * @param props - The email properties
 * @param props.email - The recipient's email address
 * @param props.url - The password reset URL (expires in 24 hours)
 * @param props.name - The recipient's name for personalization
 * @throws Error if the email fails to send
 *
 * @example
 * ```ts
 * await sendPasswordResetEmail({
 *   email: "user@example.com",
 *   url: "https://compyle.tracepanic.com/reset?token=xyz789",
 *   name: "John Doe"
 * });
 * ```
 */
export async function sendPasswordResetEmail({
  email,
  url,
  name,
}: SendEmailProps) {
  try {
    await resend.emails.send({
      to: [email],
      from: `Compyle Team <auth@${envClient.NEXT_PUBLIC_EMAIL_DOMAIN}>`,
      subject: "Compyle: Reset your password",
      react: PasswordResetEmailTemplate({ url, name }),
    });
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    throw error;
  }
}
