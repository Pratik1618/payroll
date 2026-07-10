export type OrganizationNode = {
  id: string;
  name: string;
  children?: OrganizationNode[];
  head?: string;
  employeeCount?: number;
  monthlyPayroll?: number;
  employerCost?: number;
  activeManagers?: number;
  description?: string;
  coveredZones?: string[];
};

export const organizationData: OrganizationNode[] = [
  {
    id: "company",
    name: "Company",
    head: "CEO",
    employeeCount: 500,
    monthlyPayroll: 50000000,
    employerCost: 5500000,
    activeManagers: 45,
    description: "The global organization structure.",
    children: [
      {
        id: "top_management",
        name: "Top Management",
        head: "CEO",
        employeeCount: 5,
        monthlyPayroll: 2000000,
        employerCost: 220000,
        activeManagers: 5,
        description: "Executive leadership team.",
      },
      {
        id: "cto",
        name: "CTO",
        head: "Chief Technology Officer",
        employeeCount: 150,
        monthlyPayroll: 15000000,
        employerCost: 1650000,
        activeManagers: 12,
        description: "Technology and Engineering.",
      },
      {
        id: "operations",
        name: "Operations",
        head: "Director Operations",
        employeeCount: 16,
        monthlyPayroll: 12000000,
        employerCost: 1320000,
        activeManagers: 15,
        description: "Core business operations.",
        children: [
          {
            id: "ops_heads",
            name: "Operation Heads",
            head: "Director Operations",
            employeeCount: 4,
            monthlyPayroll: 1000000,
            employerCost: 110000,
            activeManagers: 3,
            description: "Operations Leadership Team",
            children: [
              { id: "ops_director", name: "Director Operations", head: "Director Operations", employeeCount: 1, monthlyPayroll: 500000, employerCost: 55000, activeManagers: 1, description: "Senior most operations leader" },
              { id: "ops_vp", name: "VP Operations", head: "VP Operations", employeeCount: 1, monthlyPayroll: 350000, employerCost: 38500, activeManagers: 1, description: "Head of Operations" },
              { 
                id: "ops_avps", 
                name: "AVP Operations", 
                head: "AVP Team", 
                employeeCount: 2, 
                monthlyPayroll: 490000, 
                employerCost: 53900, 
                activeManagers: 2, 
                description: "Regional AVPs"
              }
            ]
          },
          {
            id: "ops_west",
            name: "West Zone",
            head: "Priya Desai (AVP)",
            employeeCount: 3,
            monthlyPayroll: 4000000,
            employerCost: 440000,
            activeManagers: 6,
            description: "Western Zone Operations"
          },
          { id: "ops_south", name: "South Zone", head: "Priya Desai (AVP)", employeeCount: 3, monthlyPayroll: 3500000, employerCost: 385000, activeManagers: 4, description: "Southern Zone Operations" },
          { id: "ops_north", name: "North Zone", head: "Sunil Joshi (AVP)", employeeCount: 3, monthlyPayroll: 2500000, employerCost: 275000, activeManagers: 3, description: "Northern Zone Operations" },
          { id: "ops_east", name: "East Zone", head: "Sunil Joshi (AVP)", employeeCount: 3, monthlyPayroll: 2000000, employerCost: 220000, activeManagers: 2, description: "Eastern Zone Operations" },
        ],
      },
      {
        id: "hr",
        name: "HR",
        head: "Chief HR Officer",
        employeeCount: 40,
        monthlyPayroll: 2500000,
        employerCost: 275000,
        activeManagers: 5,
        description: "Human Resources Department",
        children: [
          { id: "hr_lnd", name: "Learning & Development", head: "Director L&D", employeeCount: 15, monthlyPayroll: 1000000, employerCost: 110000, activeManagers: 1, description: "Training and L&D" },
          { id: "hr_payroll", name: "Payroll", head: "Payroll Manager", employeeCount: 15, monthlyPayroll: 800000, employerCost: 88000, activeManagers: 2, description: "Payroll Operations" },
          { id: "hr_hrbp", name: "HRBP", head: "HRBP Head", employeeCount: 10, monthlyPayroll: 700000, employerCost: 77000, activeManagers: 2, description: "HR Business Partners" },
        ],
      },
      {
        id: "finance",
        name: "Finance",
        head: "CFO",
        employeeCount: 30,
        monthlyPayroll: 2500000,
        employerCost: 275000,
        activeManagers: 4,
        description: "Finance & Accounting",
        children: [
          { id: "fin_ap", name: "Accounts Payable", head: "AP Manager", employeeCount: 10, monthlyPayroll: 800000, employerCost: 88000, activeManagers: 1, description: "Vendor Payments & AP" },
          { id: "fin_ar", name: "Accounts Receivable", head: "AR Manager", employeeCount: 10, monthlyPayroll: 800000, employerCost: 88000, activeManagers: 1, description: "Invoicing & Collections" },
          { id: "fin_tax", name: "Taxation", head: "Taxation Head", employeeCount: 10, monthlyPayroll: 900000, employerCost: 99000, activeManagers: 2, description: "Tax & Compliance" },
        ],
      },
      { id: "procurement", name: "Procurement", head: "VP Procurement", employeeCount: 20, monthlyPayroll: 1200000, employerCost: 132000, activeManagers: 2, description: "Procurement & Sourcing" },
      { 
        id: "marketing", 
        name: "Marketing", 
        head: "CMO", 
        employeeCount: 40, 
        monthlyPayroll: 3000000, 
        employerCost: 330000, 
        activeManagers: 3, 
        description: "Marketing and Sales",
        children: [
          { id: "mkt_commercial", name: "Commercial", head: "Commercial Director", employeeCount: 10, monthlyPayroll: 800000, employerCost: 88000, activeManagers: 1, description: "Commercial & Strategy" },
          { id: "mkt_bd", name: "Business Development", head: "BD Head", employeeCount: 15, monthlyPayroll: 1200000, employerCost: 132000, activeManagers: 2, description: "New Business & Partnerships" }
        ]
      },

      { id: "admin", name: "Admin", head: "Admin Head", employeeCount: 15, monthlyPayroll: 800000, employerCost: 88000, activeManagers: 1, description: "Administration and Facilities" },
    ],
  },
];
