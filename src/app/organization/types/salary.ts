export type CalcType = 'fixed' | 'formula';
export type ComponentType = 'earning' | 'deduction' | 'employer_contribution';

export interface SalaryComp {
  id: string;
  name: string;
  type: ComponentType;
  calcType: CalcType;
  value: number;
  formulaBaseIds: string[];
}

export interface CalculatedComponent extends SalaryComp {
  annualVal: number;
  monthlyVal: number;
}

export interface SalaryCalculations {
  computedCTC: number;
  calculatedComponents: CalculatedComponent[];
  grossMonthly: number;
  netMonthly: number;
  totalEarnings: number;
  totalDeductions: number;
  totalEmployer: number;
  unresolvedComps: SalaryComp[];
}

export const DEFAULT_COMPONENTS: SalaryComp[] = [
  // Earnings
  { id: "c_basic", name: "Basic", type: "earning", calcType: "fixed", value: 30000, formulaBaseIds: [] },
  { id: "c_hra", name: "HRA", type: "earning", calcType: "formula", value: 50, formulaBaseIds: ["c_basic"] },
  { id: "c_special", name: "Special Allowance", type: "earning", calcType: "fixed", value: 0, formulaBaseIds: [] },
  { id: "c_conv", name: "Conveyance Allowance", type: "earning", calcType: "fixed", value: 0, formulaBaseIds: [] },
  { id: "c_med", name: "Medical Allowance", type: "earning", calcType: "fixed", value: 0, formulaBaseIds: [] },
  
  // Deductions
  { id: "c_pf", name: "PF Deduction", type: "deduction", calcType: "formula", value: 12, formulaBaseIds: ["c_basic"] },
  { id: "c_esic", name: "ESIC Deduction", type: "deduction", calcType: "fixed", value: 0, formulaBaseIds: [] },
  { id: "c_pt", name: "Professional Tax", type: "deduction", calcType: "fixed", value: 200, formulaBaseIds: [] },
  { id: "c_tds", name: "TDS", type: "deduction", calcType: "fixed", value: 0, formulaBaseIds: [] },

  // Employer
  { id: "c_epf", name: "PF Employer", type: "employer_contribution", calcType: "formula", value: 12, formulaBaseIds: ["c_basic"] },
  { id: "c_eesic", name: "ESIC Employer", type: "employer_contribution", calcType: "fixed", value: 0, formulaBaseIds: [] },
  { id: "c_grat", name: "Gratuity", type: "employer_contribution", calcType: "formula", value: 4.81, formulaBaseIds: ["c_basic"] },
];
