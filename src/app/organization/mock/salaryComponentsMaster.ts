export type ComponentCategory = 'Earning' | 'Deduction' | 'Employer Contribution' | 'Welfare Scheme';

export interface SalaryComponentMasterItem {
  id: string;
  name: string;
  code: string;
  category: ComponentCategory;
  status: 'Active' | 'Inactive';
  description?: string;
}

export const initialSalaryComponentsMaster: SalaryComponentMasterItem[] = [
  {
    id: "comp-lww-emp",
    name: "Leave With Wages",
    code: "LWW_EMP",
    category: "Earning",
    status: "Active",
    description: "Statutory paid annual leave encashment payout to employee under Factories Act."
  },
  {
    id: "comp-lww-empr",
    name: "Leave With Wages Employer",
    code: "LWW_EMPR",
    category: "Employer Contribution",
    status: "Active",
    description: "Statutory employer provision for Leave With Wages encashment reserve."
  },
  {
    id: "comp-bonus-emp",
    name: "Bonus",
    code: "BONUS_EMP",
    category: "Earning",
    status: "Active",
    description: "Bonus payout to employee."
  },
  {
    id: "comp-bonus-empr",
    name: "Bonus Employer",
    code: "BONUS_EMPR",
    category: "Employer Contribution",
    status: "Active",
    description: "Employer bonus contribution / provision."
  },
  {
    id: "comp-swf-emp",
    name: "Staff Welfare Fund",
    code: "SWF_EMP",
    category: "Deduction",
    status: "Active",
    description: "Employee contribution deduction for staff welfare trust."
  },
  {
    id: "comp-swf-empr",
    name: "Staff Welfare Fund Employer",
    code: "SWF_EMPR",
    category: "Employer Contribution",
    status: "Active",
    description: "Employer contribution match for staff welfare trust."
  },
  {
    id: "comp-lwf-emp",
    name: "Labour Welfare Fund",
    code: "LWF_EMP",
    category: "Deduction",
    status: "Active",
    description: "Statutory employee deduction for state Labour Welfare Fund."
  },
  {
    id: "comp-lwf-empr",
    name: "Labour Welfare Fund Employer",
    code: "LWF_EMPR",
    category: "Employer Contribution",
    status: "Active",
    description: "Statutory employer contribution for state Labour Welfare Fund."
  },
  {
    id: "comp-medpol",
    name: "Medical Insurance Policy Premium",
    code: "MED_POL",
    category: "Deduction",
    status: "Active",
    description: "Group health insurance & medical policy premium deduction."
  },
  {
    id: "comp-basic",
    name: "Basic Salary",
    code: "BASIC",
    category: "Earning",
    status: "Active",
    description: "Core taxable basic salary component."
  },
  {
    id: "comp-hra",
    name: "House Rent Allowance",
    code: "HRA",
    category: "Earning",
    status: "Active",
    description: "Tax-exempt house rent allowance under IT rules."
  },
  {
    id: "comp-special",
    name: "Special Allowance",
    code: "SPECIAL",
    category: "Earning",
    status: "Active",
    description: "Balancing component in CTC calculation."
  },
  {
    id: "comp-conv",
    name: "Conveyance Allowance",
    code: "CONV",
    category: "Earning",
    status: "Active",
    description: "Standard monthly travel/conveyance allowance."
  },
  {
    id: "comp-med-allow",
    name: "Medical Allowance",
    code: "MED_ALLOW",
    category: "Earning",
    status: "Active",
    description: "Fixed monthly medical reimbursement allowance."
  },
  {
    id: "comp-pf-emp",
    name: "Provident Fund Employee",
    code: "EPF_EMP",
    category: "Deduction",
    status: "Active",
    description: "Statutory Employee Provident Fund contribution."
  },
  {
    id: "comp-pf-empr",
    name: "Provident Fund Employer",
    code: "EPF_EMPR",
    category: "Employer Contribution",
    status: "Active",
    description: "Employer EPF match contribution."
  },
  {
    id: "comp-esic-emp",
    name: "ESIC Employee",
    code: "ESIC_EMP",
    category: "Deduction",
    status: "Active",
    description: "Employee State Insurance statutory deduction."
  },
  {
    id: "comp-esic-empr",
    name: "ESIC Employer",
    code: "ESIC_EMPR",
    category: "Employer Contribution",
    status: "Active",
    description: "Employer ESIC statutory contribution."
  },
  {
    id: "comp-pt",
    name: "Professional Tax",
    code: "PT",
    category: "Deduction",
    status: "Active",
    description: "State professional tax slab deduction."
  },
  {
    id: "comp-tds",
    name: "Tax Deducted at Source",
    code: "TDS",
    category: "Deduction",
    status: "Active",
    description: "Monthly income tax withholding."
  },
  {
    id: "comp-grat",
    name: "Gratuity Trust",
    code: "GRAT",
    category: "Employer Contribution",
    status: "Active",
    description: "Statutory end of service gratuity provision."
  },
  {
    id: "comp-gtl",
    name: "Group Term Life Insurance",
    code: "GTLI",
    category: "Employer Contribution",
    status: "Active",
    description: "Group life insurance policy premium contribution."
  }
];

let salaryComponentsMasterList: SalaryComponentMasterItem[] = [...initialSalaryComponentsMaster];

export function getSalaryComponentsMaster(): SalaryComponentMasterItem[] {
  return salaryComponentsMasterList;
}

export function addSalaryComponentMaster(newComp: Omit<SalaryComponentMasterItem, "id">): SalaryComponentMasterItem {
  const id = `comp-${newComp.code.toLowerCase()}-${Date.now().toString(36)}`;
  const item: SalaryComponentMasterItem = { id, ...newComp };
  salaryComponentsMasterList.push(item);
  return item;
}

export function updateSalaryComponentMaster(id: string, updated: Partial<SalaryComponentMasterItem>): boolean {
  const index = salaryComponentsMasterList.findIndex(c => c.id === id);
  if (index > -1) {
    salaryComponentsMasterList[index] = { ...salaryComponentsMasterList[index], ...updated };
    return true;
  }
  return false;
}

export function deleteSalaryComponentMaster(id: string): boolean {
  const index = salaryComponentsMasterList.findIndex(c => c.id === id);
  if (index > -1) {
    salaryComponentsMasterList.splice(index, 1);
    return true;
  }
  return false;
}
