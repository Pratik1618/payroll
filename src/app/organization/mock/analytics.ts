export type DepartmentCostData = {
  department: string;
  cost: number;
  percentage: number;
};

export type EmployeeDistributionData = {
  department: string;
  count: number;
  percentage: number;
};

export type SalaryDistributionData = {
  range: string;
  count: number;
  percentage: number;
};

export type AnalyticsData = {
  departmentCost: DepartmentCostData[];
  employeeDistribution: EmployeeDistributionData[];
  salaryDistribution: SalaryDistributionData[];
};

export const analyticsMockData: AnalyticsData = {
  departmentCost: [
    { department: "Operations", cost: 12000000, percentage: 24 },
    { department: "Technology", cost: 15000000, percentage: 30 },
    { department: "Marketing", cost: 3000000, percentage: 6 },
    { department: "Finance", cost: 2500000, percentage: 5 },
    { department: "Others", cost: 17500000, percentage: 35 },
  ],
  employeeDistribution: [
    { department: "Operations", count: 200, percentage: 40 },
    { department: "Technology", count: 150, percentage: 30 },
    { department: "Marketing", count: 40, percentage: 8 },
    { department: "Finance", count: 30, percentage: 6 },
    { department: "Others", count: 80, percentage: 16 },
  ],
  salaryDistribution: [
    { range: "< ₹50,000", count: 150, percentage: 30 },
    { range: "₹50k - ₹1L", count: 200, percentage: 40 },
    { range: "₹1L - ₹2.5L", count: 100, percentage: 20 },
    { range: "₹2.5L - ₹5L", count: 40, percentage: 8 },
    { range: "> ₹5L", count: 10, percentage: 2 },
  ],
};
