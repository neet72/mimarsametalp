import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

type ContactFormEmailProps = {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  submittedAtIso: string;
};

export default function ContactFormEmail({
  firstName,
  lastName,
  email,
  message,
  submittedAtIso,
}: ContactFormEmailProps) {
  const previewText = `${firstName} ${lastName} — yeni iletişim formu`;

  return (
    <Html lang="tr">
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>Samet Alp Mimarlık</Heading>
            <Text style={sub}>İletişim formu bildirimi</Text>
          </Section>
          <Hr style={hr} />
          <Section style={section}>
            <Text style={label}>Gönderen</Text>
            <Text style={value}>
              {firstName} {lastName}
            </Text>
            <Text style={label}>E-posta</Text>
            <Text style={value}>
              <a href={`mailto:${email}`} style={link}>
                {email}
              </a>
            </Text>
            <Text style={label}>Tarih (UTC)</Text>
            <Text style={value}>{submittedAtIso}</Text>
          </Section>
          <Hr style={hr} />
          <Section style={section}>
            <Text style={label}>Mesaj</Text>
            <Text style={messageBox}>{message}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f4f4f5",
  fontFamily:
    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "32px 24px",
  maxWidth: "560px",
};

const header = { paddingBottom: "12px" };

const h1 = {
  color: "#0f172a",
  fontSize: "22px",
  fontWeight: "600" as const,
  margin: "0 0 8px",
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
};

const sub = {
  color: "#64748b",
  fontSize: "13px",
  margin: "0",
};

const hr = { borderColor: "#e2e8f0", margin: "20px 0" };

const section = { padding: "0 0 8px" };

const label = {
  color: "#64748b",
  fontSize: "11px",
  fontWeight: "600" as const,
  textTransform: "uppercase" as const,
  letterSpacing: "0.12em",
  margin: "16px 0 4px",
};

const value = {
  color: "#0f172a",
  fontSize: "15px",
  lineHeight: "1.5",
  margin: "0",
};

const link = { color: "#a67c52", textDecoration: "none" };

const messageBox = {
  ...value,
  whiteSpace: "pre-wrap" as const,
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "16px",
  marginTop: "8px",
};
