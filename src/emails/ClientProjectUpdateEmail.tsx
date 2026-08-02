import {
  Body,
  Button,
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

type ClientProjectUpdateEmailProps = {
  clientName: string;
  projectTitle: string;
  updateTitle: string;
  excerpt: string;
  panelUrl: string;
};

export default function ClientProjectUpdateEmail({
  clientName,
  projectTitle,
  updateTitle,
  excerpt,
  panelUrl,
}: ClientProjectUpdateEmailProps) {
  const previewText = `${projectTitle}: ${updateTitle}`;

  return (
    <Html lang="tr">
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>Samet Alp Mimarlık</Heading>
            <Text style={sub}>Proje güncellemesi</Text>
          </Section>
          <Hr style={hr} />
          <Section style={section}>
            <Text style={value}>Merhaba {clientName},</Text>
            <Text style={value}>
              <strong>{projectTitle}</strong> projenizde yeni bir güncelleme yayınlandı.
            </Text>
            <Text style={label}>Başlık</Text>
            <Text style={value}>{updateTitle}</Text>
            {excerpt ? (
              <>
                <Text style={label}>Özet</Text>
                <Text style={messageBox}>{excerpt}</Text>
              </>
            ) : null}
            <Section style={{ marginTop: "24px" }}>
              <Button href={panelUrl} style={button}>
                Panele git
              </Button>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#fafafa",
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "32px 16px",
  maxWidth: "560px",
};

const header = { marginBottom: "8px" };
const h1 = {
  color: "#0F172A",
  fontSize: "18px",
  fontWeight: "700" as const,
  margin: "0",
};
const sub = { color: "#A67C52", fontSize: "12px", margin: "8px 0 0", letterSpacing: "0.08em" };
const hr = { borderColor: "#E2E8F0", margin: "20px 0" };
const section = {};
const label = {
  color: "#64748B",
  fontSize: "11px",
  fontWeight: "600" as const,
  letterSpacing: "0.06em",
  textTransform: "uppercase" as const,
  margin: "16px 0 4px",
};
const value = { color: "#0F172A", fontSize: "14px", lineHeight: "1.55", margin: "0 0 8px" };
const messageBox = {
  color: "#0F172A",
  fontSize: "14px",
  lineHeight: "1.55",
  margin: "0",
  whiteSpace: "pre-wrap" as const,
};
const button = {
  backgroundColor: "#A67C52",
  borderRadius: "8px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "13px",
  fontWeight: "600" as const,
  padding: "12px 20px",
  textDecoration: "none",
};
