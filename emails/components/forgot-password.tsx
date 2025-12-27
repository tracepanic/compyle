import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import {
  button,
  buttonContainer,
  container,
  content,
  footer,
  footerLink,
  footerLinks,
  footerText,
  header,
  heading,
  hr,
  legalLink,
  legalLinks,
  link,
  logoImage,
  main,
  paragraph,
  socialLink,
  socialSection,
  tagline,
} from "../styles";

/**
 * Props for the password reset email template.
 * @property name - The recipient's display name
 * @property url - The password reset URL
 */
interface PasswordResetEmailTemplateProps {
  name: string;
  url: string;
}

/**
 * Password reset email template component.
 * Renders a branded email with a password reset button and security information.
 *
 * @param props - The template properties
 * @param props.name - The recipient's name for personalization
 * @param props.url - The password reset URL (expires in 24 hours)
 * @returns React Email component for password reset
 */
export default function PasswordResetEmailTemplate({
  name = "Trace Panic",
  url = "http://localhost:3000/url",
}: PasswordResetEmailTemplateProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Reset your Compyle password</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src="https://compyle.tracepanic.com/compyle.svg"
              width="140"
              height="40"
              alt="Compyle"
              style={logoImage}
            />
            <Text style={tagline}>Apps Built With Compyle.ai</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={heading}>Reset Your Password</Heading>
            <Text style={paragraph}>Hi {name},</Text>
            <Text style={paragraph}>
              We received a request to reset the password for your Compyle Apps
              account. Click the button below to create a new password.
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={url}>
                Reset Password
              </Button>
            </Section>

            <Text style={paragraph}>
              If the button doesn&apos;t work, copy and paste this link into
              your browser:
            </Text>
            <Link href={url} style={link}>
              {url}
            </Link>

            <Section style={warningBox}>
              <Text style={warningText}>
                ⏰ This link will expire in 24 hours for security reasons.
              </Text>
            </Section>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              If you didn&apos;t request a password reset, you can safely ignore
              this email. Your password will remain unchanged.
            </Text>

            {/* Social Links */}
            <Section style={socialSection}>
              <Link href="https://x.com/compyle_ai" style={socialLink}>
                𝕏
              </Link>
              <Link href="https://discord.gg/U9djmRTDB4" style={socialLink}>
                Discord
              </Link>
              <Link
                href="https://www.linkedin.com/company/compyle-ai/"
                style={socialLink}
              >
                LinkedIn
              </Link>
            </Section>

            <Text style={footerText}>
              © {new Date().getFullYear()} SmartAppetite Corporation. All rights
              reserved.
            </Text>
            <Text style={footerLinks}>
              <Link href="https://compyle.tracepanic.com" style={footerLink}>
                Visit Compyle
              </Link>
              {" • "}
              <Link
                href="https://compyle.tracepanic.com/apps"
                style={footerLink}
              >
                Browse Apps
              </Link>
              {" • "}
              <Link href="https://docs.compyle.ai" style={footerLink}>
                Docs
              </Link>
            </Text>
            <Text style={legalLinks}>
              <Link
                href="https://app.termly.io/policy-viewer/policy.html?policyUUID=ffe987c4-1452-4c5f-8f9d-4dd1abd70f86"
                style={legalLink}
              >
                Terms of Service
              </Link>
              {" • "}
              <Link
                href="https://app.termly.io/policy-viewer/policy.html?policyUUID=0168892b-56de-455b-8e10-fbf1666a4f83"
                style={legalLink}
              >
                Privacy Policy
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const warningBox = {
  backgroundColor: "#FEF3C7",
  borderRadius: "6px",
  padding: "16px",
  marginTop: "24px",
};

const warningText = {
  color: "#92400E",
  fontSize: "14px",
  margin: "0",
  textAlign: "center" as const,
};
