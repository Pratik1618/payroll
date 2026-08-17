export let designations = [
  "ASST MANAGER - OPERATIONS",
  "ASST. MANAGER TECHNICAL",
  "AVP - BUSINESS DEVELOPMENT",
  "AVP OPERATIONS",
  "BUSINESS ANALYST",
  "BUSINESS DEVELOPMENT MANAGER",
  "BUSINESS HEAD",
  "DEVELOPERS - IT",
  "DIRECTOR",
  "DIRECTOR - Human Resources",
  "DIRECTOR - Operations",
  "DRIVER",
  "ENGINEER - SOFTWARE DEVELOPER",
  "EXECUTIVE COMPLIANCE",
  "FIELD EXECUTIVE",
  "FRONT-END DEVELOPER",
  "HEAD - LEARNING & DEVELOPMENT",
  "HELPDESK EXECUTIVE",
  "HOUSE KEEPER",
  "HR & PAYROLL EXECUTIVE",
  "HUMAN RESOURCE BUSINESS PARTNER",
  "INTERN",
  "MANAGER",
  "MANAGER - MARKET RESEARCH & BUSINESS DEVELOPMENT",
  "MANAGER - OPERATIONS",
  "MANAGER-COMPLIANCE",
  "Managing Director",
  "OFFICE BOY",
  "OPERATION EXECUTIVE",
  "OPERATION MANAGER",
  "OPERATIONS CO-ORDINATOR",
  "OPERATIONS HEAD",
  "OPERATIONS HEAD - SOUTH INDIA",
  "PAYROLL EXECUTIVE",
  "REGIONAL MANAGER",
  "REGIONAL MANAGER - NORTH",
  "SENIOR BILLING EXECUTIVE",
  "SENIOR MANAGER - BUSINESS DEVELOPMENT FOR GUJARAT & MADHYA PRADESH REGION",
  "SENIOR PROCUREMENT EXECUTIVE",
  "SENIOR STRATEGIC MANAGER ASSOCIATE",
  "SR. TENDER EXECUTIVE",
  "SR.EXECUTIVE HR",
  "SUPERVISOR",
  "TEAM LEADER",
  "TRAINEE- SUPERVISOR",
  "TRAINER",
  "TRAINING EXECUTIVE",
  "TRAINING MANAGER",
  "TRAINING SUPERVISOR",
  "VICE PRESIDENT - ACCOUNTS AND FINANCE",
];

export function getDesignations(): string[] {
  return designations;
}

export function addDesignation(title: string): boolean {
  const trimmed = title.trim();
  if (!trimmed) return false;
  if (designations.some((d) => d.toLowerCase() === trimmed.toLowerCase())) {
    return false;
  }
  designations.push(trimmed);
  designations.sort((a, b) => a.localeCompare(b));
  return true;
}

export function deleteDesignation(title: string): boolean {
  const index = designations.findIndex((d) => d.toLowerCase() === title.toLowerCase().trim());
  if (index > -1) {
    designations.splice(index, 1);
    return true;
  }
  return false;
}
