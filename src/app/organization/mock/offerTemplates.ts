export interface OfferTemplate {
  id: string;
  name: string;
  category: "Standard" | "Technical" | "Executive" | "Internship" | "Custom";
  description: string;
  noticePeriodDays: number;
  validityDays: number;
  probationMonths: number;
  isDefault: boolean;
  terms: string[];
}

export const initialOfferTemplates: OfferTemplate[] = [
  {
    id: "TPL-STD-01",
    name: "Standard Full-Time Employment",
    category: "Standard",
    description: "Default offer template for full-time permanent employees across departments.",
    noticePeriodDays: 30,
    validityDays: 15,
    probationMonths: 6,
    isDefault: true,
    terms: [
      "Standard 6 months probation period subject to performance review.",
      "30 days notice period during probation and post-confirmation.",
      "Comprehensive medical insurance coverage as per company policy.",
      "Standard IP and non-disclosure clauses applicable.",
    ],
  },
  {
    id: "TPL-ENG-02",
    name: "Engineering & Technical Offer",
    category: "Technical",
    description: "Tailored for software engineering, Product, and Technical roles with IP assignment.",
    noticePeriodDays: 60,
    validityDays: 10,
    probationMonths: 6,
    isDefault: false,
    terms: [
      "Full ownership of all software IP, code, and inventions developed assigned to the company.",
      "Strict confidentiality and data security compliance guidelines.",
      "60 days notice period post-confirmation.",
      "Annual technical learning and certification allowance.",
    ],
  },
  {
    id: "TPL-EXEC-03",
    name: "Executive & Management Offer",
    category: "Executive",
    description: "Senior leadership offer with variable performance bonus and non-compete terms.",
    noticePeriodDays: 90,
    validityDays: 20,
    probationMonths: 3,
    isDefault: false,
    terms: [
      "90 days notice period or equivalent salary in lieu thereof.",
      "Annual performance incentive plan tied to organizational KPIs.",
      "Non-compete and non-solicitation covenants valid for 12 months post-employment.",
      "Executive health checkup and travel allowance.",
    ],
  },
  {
    id: "TPL-INT-04",
    name: "Internship & Graduate Trainee",
    category: "Internship",
    description: "Stipend-based agreement for fixed-term interns and management trainees.",
    noticePeriodDays: 15,
    validityDays: 7,
    probationMonths: 0,
    isDefault: false,
    terms: [
      "Fixed-term internship duration subject to monthly evaluation.",
      "Monthly fixed stipend payout without statutory deductions.",
      "Certificate of Completion provided upon successful assignment end.",
      "15 days notice period for early departure.",
    ],
  },
];

let templatesStore: OfferTemplate[] = [...initialOfferTemplates];

export function getOfferTemplates(): OfferTemplate[] {
  return templatesStore;
}

export function addOfferTemplate(newTpl: Omit<OfferTemplate, "id">): OfferTemplate {
  const id = `TPL-CUST-${Date.now().toString(36).toUpperCase()}`;
  const tpl: OfferTemplate = { id, ...newTpl };
  templatesStore.push(tpl);
  return tpl;
}
