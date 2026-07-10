export type Employee = {
  id: string;
  employeeId: string;
  name: string;
  designation: string;
  department: string;
  reportingManager: string;
  monthlySalary: number;
  status: "Active" | "On Leave" | "Resigned";
  avatarUrl?: string;
  hierarchyLevel: number;
  nodeId: string;
  coveredZones?: string[];
};

export const employeesData: Employee[] = [
  { id: "e1", employeeId: "EMP-001", name: "Rahul Sharma", designation: "VP Operations", department: "Operations", reportingManager: "CEO", monthlySalary: 350000, status: "Active", hierarchyLevel: 1, nodeId: "ops_vp" },
  { id: "e2", employeeId: "EMP-002", name: "Priya Desai", designation: "AVP Operations", department: "Operations", reportingManager: "VP Operations", monthlySalary: 250000, status: "Active", hierarchyLevel: 2, nodeId: "ops_avps", coveredZones: ["West", "South"] },
  { id: "e9", employeeId: "EMP-009", name: "Sunil Joshi", designation: "AVP Operations", department: "Operations", reportingManager: "VP Operations", monthlySalary: 240000, status: "Active", hierarchyLevel: 2, nodeId: "ops_avps", coveredZones: ["North", "East"] },
  
  // West Zone
  { id: "e3", employeeId: "EMP-003", name: "Amit Patel", designation: "Zonal Head", department: "West Zone", reportingManager: "Priya Desai", monthlySalary: 150000, status: "Active", hierarchyLevel: 3, nodeId: "ops_west" },
  { id: "e4", employeeId: "EMP-004", name: "Sneha Reddy", designation: "Regional Manager", department: "West Zone", reportingManager: "Amit Patel", monthlySalary: 120000, status: "Active", hierarchyLevel: 4, nodeId: "ops_west" },
  { id: "e5", employeeId: "EMP-005", name: "Vikram Singh", designation: "Operation Executive", department: "West Zone", reportingManager: "Sneha Reddy", monthlySalary: 60000, status: "Active", hierarchyLevel: 5, nodeId: "ops_west" },
  
  // South Zone
  { id: "e6", employeeId: "EMP-006", name: "Kavita Iyer", designation: "Zonal Head", department: "South Zone", reportingManager: "Priya Desai", monthlySalary: 145000, status: "On Leave", hierarchyLevel: 3, nodeId: "ops_south" },
  { id: "e7", employeeId: "EMP-007", name: "Rajesh Kumar", designation: "Regional Manager", department: "South Zone", reportingManager: "Kavita Iyer", monthlySalary: 110000, status: "Active", hierarchyLevel: 4, nodeId: "ops_south" },
  { id: "e8", employeeId: "EMP-008", name: "Meera Nair", designation: "Operation Executive", department: "South Zone", reportingManager: "Rajesh Kumar", monthlySalary: 55000, status: "Active", hierarchyLevel: 5, nodeId: "ops_south" },
  
  // North Zone
  { id: "e10", employeeId: "EMP-010", name: "Anita Gupta", designation: "Zonal Head", department: "North Zone", reportingManager: "Sunil Joshi", monthlySalary: 140000, status: "Active", hierarchyLevel: 3, nodeId: "ops_north" },
  { id: "e11", employeeId: "EMP-011", name: "Ravi Teja", designation: "Regional Manager", department: "North Zone", reportingManager: "Anita Gupta", monthlySalary: 105000, status: "Active", hierarchyLevel: 4, nodeId: "ops_north" },
  { id: "e12", employeeId: "EMP-012", name: "Sara Khan", designation: "Operation Executive", department: "North Zone", reportingManager: "Ravi Teja", monthlySalary: 50000, status: "Active", hierarchyLevel: 5, nodeId: "ops_north" },
  
  // East Zone
  { id: "e13", employeeId: "EMP-013", name: "Arjun Das", designation: "Zonal Head", department: "East Zone", reportingManager: "Sunil Joshi", monthlySalary: 135000, status: "Active", hierarchyLevel: 3, nodeId: "ops_east" },
  { id: "e14", employeeId: "EMP-014", name: "Pooja Hegde", designation: "Regional Manager", department: "East Zone", reportingManager: "Arjun Das", monthlySalary: 100000, status: "Active", hierarchyLevel: 4, nodeId: "ops_east" },
  { id: "e15", employeeId: "EMP-015", name: "Sanjay Dutta", designation: "Operation Executive", department: "East Zone", reportingManager: "Pooja Hegde", monthlySalary: 45000, status: "Active", hierarchyLevel: 5, nodeId: "ops_east" }
];
