import { SalaryComp } from "../types/salary";

export type OfferStatus = "Pending" | "Sent" | "Accepted" | "Declined" | "Expired" | "Joined";

export interface OfferLetter {
  id: string;
  tid: string;
  candidateName: string;
  candidateEmail: string;
  designation: string;
  departmentId: string;
  departmentName: string;
  ctc: number;
  monthlyCtc: number;
  issuedDate: string;
  validTill: string;
  status: OfferStatus;
  salaryComponents: SalaryComp[];
}

export const initialOfferLetters: OfferLetter[] = [
  {
    id: "OFF-2026-001",
    tid: "",
    candidateName: "Aarav Sharma",
    candidateEmail: "aarav.sharma@example.com",
    designation: "Software Engineer",
    departmentId: "cto",
    departmentName: "CTO / Technology",
    ctc: 1200000,
    monthlyCtc: 100000,
    issuedDate: "2026-07-20",
    validTill: "2026-08-05",
    status: "Sent",
    salaryComponents: [
      { id: "c_basic", name: "Basic Salary", type: "earning", calcType: "fixed", value: 50000, formulaBaseIds: [] },
      { id: "c_hra", name: "House Rent Allowance", type: "earning", calcType: "fixed", value: 25000, formulaBaseIds: [] },
      { id: "c_special", name: "Special Allowance", type: "earning", calcType: "fixed", value: 20000, formulaBaseIds: [] },
      { id: "c_epf", name: "Provident Fund Employer", type: "employer_contribution", calcType: "fixed", value: 1800, formulaBaseIds: [] },
    ],
  },
  {
    id: "OFF-2026-002",
    tid: "",
    candidateName: "Riya Verma",
    candidateEmail: "riya.verma@example.com",
    designation: "HR Business Partner",
    departmentId: "hr",
    departmentName: "HR Department",
    ctc: 900000,
    monthlyCtc: 75000,
    issuedDate: "2026-07-15",
    validTill: "2026-07-30",
    status: "Accepted",
    salaryComponents: [
      { id: "c_basic", name: "Basic Salary", type: "earning", calcType: "fixed", value: 37500, formulaBaseIds: [] },
      { id: "c_hra", name: "House Rent Allowance", type: "earning", calcType: "fixed", value: 18750, formulaBaseIds: [] },
      { id: "c_special", name: "Special Allowance", type: "earning", calcType: "fixed", value: 16950, formulaBaseIds: [] },
      { id: "c_epf", name: "Provident Fund Employer", type: "employer_contribution", calcType: "fixed", value: 1800, formulaBaseIds: [] },
    ],
  },
  {
    id: "OFF-2026-003",
    tid: "TID-2026-71840",
    candidateName: "Vikram Patel",
    candidateEmail: "vikram.patel@example.com",
    designation: "Senior Finance Manager",
    departmentId: "finance",
    departmentName: "Finance",
    ctc: 1800000,
    monthlyCtc: 150000,
    issuedDate: "2026-07-10",
    validTill: "2026-07-25",
    status: "Joined",
    salaryComponents: [
      { id: "c_basic", name: "Basic Salary", type: "earning", calcType: "fixed", value: 75000, formulaBaseIds: [] },
      { id: "c_hra", name: "House Rent Allowance", type: "earning", calcType: "fixed", value: 37500, formulaBaseIds: [] },
      { id: "c_special", name: "Special Allowance", type: "earning", calcType: "fixed", value: 35700, formulaBaseIds: [] },
      { id: "c_epf", name: "Provident Fund Employer", type: "employer_contribution", calcType: "fixed", value: 1800, formulaBaseIds: [] },
    ],
  },
  {
    id: "OFF-2026-004",
    tid: "",
    candidateName: "Ananya Iyer",
    candidateEmail: "ananya.iyer@example.com",
    designation: "Marketing Specialist",
    departmentId: "marketing",
    departmentName: "Marketing",
    ctc: 750000,
    monthlyCtc: 62500,
    issuedDate: "2026-06-28",
    validTill: "2026-07-12",
    status: "Declined",
    salaryComponents: [
      { id: "c_basic", name: "Basic Salary", type: "earning", calcType: "fixed", value: 31250, formulaBaseIds: [] },
      { id: "c_hra", name: "House Rent Allowance", type: "earning", calcType: "fixed", value: 15625, formulaBaseIds: [] },
      { id: "c_special", name: "Special Allowance", type: "earning", calcType: "fixed", value: 13825, formulaBaseIds: [] },
      { id: "c_epf", name: "Provident Fund Employer", type: "employer_contribution", calcType: "fixed", value: 1800, formulaBaseIds: [] },
    ],
  },
];

let offerLettersStore: OfferLetter[] = [...initialOfferLetters];

export function getOfferLetters(): OfferLetter[] {
  return offerLettersStore;
}

export function addOfferLetter(
  newOffer: Omit<OfferLetter, "id" | "tid" | "issuedDate" | "validTill"> & { tid?: string; validDays?: number }
): OfferLetter {
  const count = offerLettersStore.length + 1;
  const id = `OFF-2026-${String(count).padStart(3, "0")}`;
  const initialStatus = newOffer.status || "Sent";
  
  // TID is generated ONLY when status is Joined
  const tid = initialStatus === "Joined" 
    ? (newOffer.tid || `TID-2026-${Math.floor(10000 + Math.random() * 90000)}`)
    : "";

  const now = new Date();
  const issuedDate = now.toISOString().split("T")[0];
  
  const validDays = newOffer.validDays || 15;
  const expiryDate = new Date(now.getTime() + validDays * 24 * 60 * 60 * 1000);
  const validTill = expiryDate.toISOString().split("T")[0];

  const item: OfferLetter = {
    id,
    tid,
    candidateName: newOffer.candidateName,
    candidateEmail: newOffer.candidateEmail,
    designation: newOffer.designation,
    departmentId: newOffer.departmentId,
    departmentName: newOffer.departmentName,
    ctc: newOffer.ctc,
    monthlyCtc: newOffer.monthlyCtc,
    issuedDate,
    validTill,
    status: initialStatus,
    salaryComponents: newOffer.salaryComponents || [],
  };

  offerLettersStore = [item, ...offerLettersStore];
  return item;
}

export function updateOfferStatus(id: string, status: OfferStatus): OfferLetter | null {
  const index = offerLettersStore.findIndex((o) => o.id === id);
  if (index !== -1) {
    const current = offerLettersStore[index];
    let newTid = current.tid;

    // Generate TID ONLY when status changes to Joined
    if (status === "Joined" && !newTid) {
      newTid = `TID-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    }

    offerLettersStore[index] = { 
      ...current, 
      status, 
      tid: newTid 
    };
    return offerLettersStore[index];
  }
  return null;
}

export function deleteOfferLetter(id: string): boolean {
  const initialLength = offerLettersStore.length;
  offerLettersStore = offerLettersStore.filter((o) => o.id !== id);
  return offerLettersStore.length < initialLength;
}
