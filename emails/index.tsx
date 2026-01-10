import PasswordResetEmailTemplate from "@/emails/components/forgot-password";
import EmailVerificationEmailTemplate from "@/emails/components/verify-email";
import { env as envClient } from "@/env/client";
import { env as envServer } from "@/env/server";
import { Resend } from "resend";

const resend = new Resend(envServer.RESEND_API_KEY);

interface SendEmailProps {
  email: string;
  url: string;
  name: string;
}

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
