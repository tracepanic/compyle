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

interface EmailVerificationEmailTemplateProps {
  name: string;
  url: string;
}

export default function EmailVerificationEmailTemplate({
  name = "Trace Panic",
  url = "https://www.compyle.ai",
}: EmailVerificationEmailTemplateProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Verify your email address to get started with Compyle</Preview>
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
            <Heading style={heading}>Welcome to Compyle!</Heading>
            <Text style={paragraph}>Hi {name},</Text>
            <Text style={paragraph}>
              Thanks for signing up for Compyle Apps! We&apos;re excited to have
              you join our community of builders.
            </Text>
            <Text style={paragraph}>
              Please verify your email address to activate your account and
              start exploring.
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={url}>
                Verify Email Address
              </Button>
            </Section>

            <Text style={paragraph}>
              If you didn&apos;t create a Compyle account, you can safely ignore
              this email.
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
