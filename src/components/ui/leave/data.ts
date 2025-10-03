// Mock data layer for Leave Balances.
// Replace with API/database integration later.

export type LeaveBalance = {
  empId: string
  name: string
  designation: string
  clientId: string
  siteId: string
  CL: number
  SL: number
  EL: number
  LOP: number
  lastUpdated: string
}

export const clients = [
  { id: "c1", name: "Acme Facilities" },
  { id: "c2", name: "BlueSky Infra" },
]

const clientSites: Record<string, { id: string; name: string }[]> = {
  c1: [
    { id: "s1", name: "HQ" },
    { id: "s2", name: "Plant A" },
  ],
  c2: [
    { id: "s3", name: "North Hub" },
    { id: "s4", name: "South Hub" },
  ],
}

export function getSitesByClient(clientId: string) {
  return clientSites[clientId] ?? []
}

export const leaveBalances: LeaveBalance[] = [
  {
    empId: "E1001",
    name: "Ravi Kumar",
    designation: "Supervisor",
    clientId: "c1",
    siteId: "s1",
    CL: 5,
    SL: 3,
    EL: 8,
    LOP: 0,
    lastUpdated: new Date().toISOString(),
  },
  {
    empId: "E1002",
    name: "Priya Singh",
    designation: "Technician",
    clientId: "c1",
    siteId: "s2",
    CL: 2,
    SL: 1,
    EL: 6,
    LOP: 1,
    lastUpdated: new Date().toISOString(),
  },
  {
    empId: "E2101",
    name: "Aman Verma",
    designation: "Operator",
    clientId: "c2",
    siteId: "s3",
    CL: 4,
    SL: 2,
    EL: 4,
    LOP: 0,
    lastUpdated: new Date().toISOString(),
  },
  {
    empId: "E2201",
    name: "Neha Gupta",
    designation: "Admin",
    clientId: "c2",
    siteId: "s4",
    CL: 6,
    SL: 3,
    EL: 10,
    LOP: 0,
    lastUpdated: new Date().toISOString(),
  },
]

export function filterBalances(clientId: string, siteId?: string) {
  return leaveBalances.filter((r) => r.clientId === clientId && (!siteId || r.siteId === siteId))
}
