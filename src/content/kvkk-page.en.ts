import { OFFICE_ADDRESS_EN } from "@/content/kvkk-page";

export const KVKK_PAGE_TITLE = "Privacy Notice & Privacy Policy";
export const KVKK_PAGE_DESCRIPTION =
  "Samet Alp Architecture privacy notice and privacy policy regarding the processing of personal data.";

export const KVKK_UPDATED = "28 July 2026";

export const KVKK_SECTIONS = [
  {
    id: "notice",
    title: "1. Privacy notice",
    paragraphs: [
      "In line with Türkiye’s Personal Data Protection Law (KVKK), Samet Alp Architecture (“the Studio”) processes personal data you share via our website and contact channels as described below.",
      `Data controller: Samet Alp Architecture — ${OFFICE_ADDRESS_EN}. Contact: info@mimarsametalp.com / +90 (541) 426 76 44.`,
    ],
  },
  {
    id: "data",
    title: "2. Personal data we process",
    paragraphs: [
      "Through the contact form and similar channels we may process your first name, last name, email address, phone number (if provided), and message content. Connection data such as IP address may be stored for a limited time for security.",
    ],
  },
  {
    id: "purpose",
    title: "3. Purposes and legal bases",
    paragraphs: [
      "We process your data to evaluate project requests, respond to you, run appointments and consulting, improve service quality, and meet legal obligations.",
      "Legal bases include performance of a contract or pre-contractual steps, legitimate interests, and—where required—your explicit consent.",
    ],
  },
  {
    id: "transfer",
    title: "4. Transfers and retention",
    paragraphs: [
      "Data may be shared with hosting / email providers only as needed. Cross-border transfers follow applicable KVKK procedures.",
      "We retain data only for as long as needed for the purpose and applicable retention rules, then delete, destroy, or anonymize it.",
    ],
  },
  {
    id: "rights",
    title: "5. Your rights",
    paragraphs: [
      "You may request information about whether your data is processed, how it is used, to whom it is transferred, correction or deletion, and remedies for damages, under KVKK Article 11.",
      "Send requests in writing to info@mimarsametalp.com.",
    ],
  },
  {
    id: "privacy",
    title: "6. Privacy policy",
    paragraphs: [
      "When you visit our site, limited technical data may be collected via cookies or similar technologies. Essential cookies keep the site working; analytics—if used—are kept as anonymized as practical.",
      "Third-party links (maps, social media) follow their own privacy policies; the Studio is not responsible for those sites.",
      "This text may be updated. The current version is published on this page.",
    ],
  },
] as const;

export const CONTACT_FORM_KVKK_LABEL =
  "I have read the Privacy Notice and accept the processing of my personal data for this contact request.";
export const CONTACT_FORM_KVKK_ERROR = "Please accept the privacy notice to continue.";
