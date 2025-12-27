import {
  button,
  buttonContainer,
  container,
  content,
  footer,
  footerText,
  header,
  heading,
  hr,
  legalLink,
  legalLinks,
  logoImage,
  main,
  paragraph,
  socialLink,
  socialSection,
  tagline,
} from "@/emails/styles";
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

interface PasswordResetEmailTemplateProps {
  name: string;
  url: string;
}

export default function PasswordResetEmailTemplate({
  name = "Trace Panic",
  url = "https://www.compyle.ai",
}: PasswordResetEmailTemplateProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Reset Your Compyle password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src="https://compyle.tracepanic.com/compyle.svg"
              width="140"
              height="60"
              alt="Compyle"
              style={logoImage}
            />
            <Text style={tagline}>Compyle Apps</Text>
          </Section>

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
              The password reset link in the button will expire in 1 hour for
              security reasons.
            </Text>

            <Text style={paragraph}>
              If you didn&apos;t request a password reset, you can safely ignore
              this email. Your password will remain unchanged.
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
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
              <Link href="https://docs.compyle.ai" style={socialLink}>
                Compyle.ai
              </Link>
            </Section>

            <Text style={footerText}>
              © {new Date().getFullYear()} SmartAppetite Corporation. All rights
              reserved.
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
