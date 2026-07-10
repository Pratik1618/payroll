export type SalaryCostData = {
  basicSalary: number;
  hra: number;
  specialAllowance: number;
  employerPf: number;
  employerEsic: number;
  bonus: number;
  gratuity: number;
  totalCost: number;
  payrollBudgetUsedPercent: number;
};

export const salaryCostMockData: Record<string, SalaryCostData> = {
  "company": {
    basicSalary: 25000000,
    hra: 10000000,
    specialAllowance: 10000000,
    employerPf: 2500000,
    employerEsic: 500000,
    bonus: 2000000,
    gratuity: 500000,
    totalCost: 55500000,
    payrollBudgetUsedPercent: 82,
  },
  "ops_west": {
    basicSalary: 2000000,
    hra: 800000,
    specialAllowance: 800000,
    employerPf: 200000,
    employerEsic: 40000,
    bonus: 160000,
    gratuity: 40000,
    totalCost: 4440000,
    payrollBudgetUsedPercent: 78,
  },
  "ops_west_mumbai": {
    basicSalary: 1000000,
    hra: 400000,
    specialAllowance: 400000,
    employerPf: 100000,
    employerEsic: 20000,
    bonus: 80000,
    gratuity: 20000,
    totalCost: 2220000,
    payrollBudgetUsedPercent: 85,
  }
};

export const getSalaryCostForNode = (nodeId: string): SalaryCostData => {
  return salaryCostMockData[nodeId] || salaryCostMockData["ops_west"];
};
