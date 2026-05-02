import type { ServiceDetailData } from "@/components/hizmetlerimiz/ServiceDetailClient";

// Mock service detail data (EN)
export const SERVICES_DETAIL: Record<string, ServiceDetailData> = {
  "ic-mimarlik-dekorasyon": {
    slug: "ic-mimarlik-dekorasyon",
    name: "Interior Architecture & Decoration",
    heroImageUrl: "/images/hero-1.webp",
    shortDescription:
      "We rethink living spaces with aesthetics and usability in mind—from concept to décor. Modern interior architecture projects with professional coordination in Adana.",
    hizmetKapsami: [
      "Needs analysis and concept definition",
      "Moodboard, color & material selections",
      "Plan layout and dimensioning",
      "3D visualization and revision cycles",
      "Custom furniture drawings",
      "On-site execution and procurement coordination",
    ],
    hizmetSureci: [
      { title: "Discovery & Brief", description: "We clarify needs, budget range, and style expectations." },
      { title: "Concept", description: "We define the spatial language, material palette, and key decisions." },
      { title: "Design Development", description: "We refine plans, details, and visuals through iterations." },
      { title: "Execution", description: "We protect quality on-site with production and field coordination." },
    ],
    sss: [
      { question: "How many revisions are included?", answer: "We include two main revision cycles. Additional revisions are planned together." },
      { question: "Is execution service mandatory?", answer: "No. We can deliver design-only or design + execution." },
      { question: "What’s the typical timeline?", answer: "It depends on the scale; first design delivery is usually within 2–4 weeks." },
    ],
  },
  "anahtar-teslim-proje": {
    slug: "anahtar-teslim-proje",
    name: "Turnkey Project",
    heroImageUrl: "/images/hero-2.webp",
    shortDescription:
      "By managing design, planning, and execution under one roof, we deliver smooth handovers aligned with budget and schedule.",
    hizmetKapsami: [
      "Scope & budget planning",
      "Design and execution coordination",
      "Purchasing and procurement management",
      "Site organization and quality control",
      "Program management and handover plan",
      "Post-handover support",
    ],
    hizmetSureci: [
      { title: "Planning", description: "We define scope, budget, and the project schedule." },
      { title: "Design & Approval", description: "We finalize design and lock execution decisions." },
      { title: "Execution", description: "We manage site, procurement, and quality control centrally." },
      { title: "Handover", description: "We complete handover with checklists and start the support phase." },
    ],
    sss: [
      { question: "How is budget controlled?", answer: "We proceed with itemized quantities & offers, and an approval-based purchasing flow." },
      { question: "Can delivery date slip?", answer: "We make risks visible early and plan alternatives to minimize deviations." },
    ],
  },
  "mimari-kontrolorluk": {
    slug: "mimari-kontrolorluk",
    name: "Architectural Supervision",
    heroImageUrl: "/images/hero-3.webp",
    shortDescription:
      "With site inspections and detail checks, we ensure the design is built accurately and with high quality.",
    hizmetKapsami: [
      "Execution detail review",
      "Site meetings and reporting",
      "Quality control and site inspections",
      "Workmanship/compliance follow-up",
      "Schedule coordination",
    ],
    hizmetSureci: [
      { title: "Kickoff", description: "We align on execution sets and control criteria." },
      { title: "Periodic Inspections", description: "We track progress through site visits and reports." },
      { title: "Critical Checkpoints", description: "We verify details and material decisions on-site." },
      { title: "Handover Control", description: "We run final quality control with snag/punch lists." },
    ],
    sss: [
      { question: "How often are inspections?", answer: "Planned weekly/biweekly depending on the project program." },
      { question: "What’s the reporting format?", answer: "Regular reports with photos, checklists, and action items." },
    ],
  },
  "mimari-tasarim-ruhsat-projesi": {
    slug: "mimari-tasarim-ruhsat-projesi",
    name: "Architectural Design & Permit Project",
    heroImageUrl: "/images/hero-4.webp",
    shortDescription:
      "We prepare clear, buildable, regulation-compliant permit sets that help accelerate approvals.",
    hizmetKapsami: [
      "Zoning/regulation pre-analysis",
      "Concept design development",
      "Permit set preparation",
      "Drawing standardization",
      "Coordination and revision management",
    ],
    hizmetSureci: [
      { title: "Analysis", description: "We gather zoning constraints, program needs, and site data." },
      { title: "Concept", description: "We finalize massing, plan, and façade decisions." },
      { title: "Permit Set", description: "We prepare drawings and documents in line with regulations." },
      { title: "Follow-up", description: "We manage required revisions and complete the process." },
    ],
    sss: [
      { question: "What does permit duration depend on?", answer: "Municipality workload, plot data, and project scope." },
      { question: "Do you coordinate other disciplines?", answer: "When needed, we coordinate with structural/mechanical/electrical teams." },
    ],
  },
  "mimari-danismanlik": {
    slug: "mimari-danismanlik",
    name: "Architectural Consulting",
    heroImageUrl: "/images/hero-5.webp",
    shortDescription:
      "We provide fast analysis, options, and decision support so you can move in the right direction on critical design choices.",
    hizmetKapsami: [
      "Concept guidance and review",
      "Plan/façade optimization",
      "Material and detail recommendations",
      "Cost/performance evaluation",
      "Decision support during execution",
    ],
    hizmetSureci: [
      { title: "Brief", description: "We clarify goals and constraints." },
      { title: "Analysis", description: "We evaluate the current design and alternatives." },
      { title: "Recommendations", description: "We produce a decision set and actionable next steps." },
      { title: "Follow-up", description: "We revisit critical points with additional reviews." },
    ],
    sss: [
      { question: "Is a single session possible?", answer: "Yes. We can do a rapid review session or ongoing consulting across the project." },
    ],
  },
  "yenileme-tadilat": {
    slug: "yenileme-tadilat",
    name: "Renovation & Remodeling",
    heroImageUrl: "/images/hero-6.webp",
    shortDescription:
      "We transform existing spaces with minimal demolition and maximum impact—delivering modern, durable solutions tailored to new needs.",
    hizmetKapsami: [
      "Existing conditions assessment",
      "Budget & phasing planning",
      "Material and workmanship selection",
      "Execution coordination",
      "Handover checks and improvements",
    ],
    hizmetSureci: [
      { title: "Site Visit", description: "We identify existing conditions and constraints on-site." },
      { title: "Planning", description: "We define phases, budget, and the project schedule." },
      { title: "Execution", description: "We deliver the transformation with site management and quality control." },
      { title: "Handover", description: "We complete final checks and hand over." },
    ],
    sss: [
      { question: "Can renovation happen while I’m living at home?", answer: "In some scenarios yes, with phased planning—confirmed after discovery." },
      { question: "How long does it take?", answer: "Depends on scope; phased renovations require careful timeline planning." },
    ],
  },
};

