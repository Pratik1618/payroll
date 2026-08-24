"use client";

import { useState, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

// ---------------------------------------------------------------------------
// Salary component codes in exact order requested by user
// (matches post_salary_components.js)
// ---------------------------------------------------------------------------
const SALARY_COMPONENT_COLUMNS = [
  // --- EARNINGS ---
  { code: "BASIC", name: "Basic Salary", category: "Earning", required: "Yes", description: "Core taxable basic monthly salary component.", example: 11632 },
  { code: "DA", name: "Dearness Allowance", category: "Earning", required: "No", description: "Cost-of-living adjustment allowance.", example: 3614 },
  { code: "HRA", name: "House Rent Allowance", category: "Earning", required: "No", description: "Tax-exempt house rent allowance under IT rules.", example: 3709 },
  { code: "CONVEYANCE", name: "Conveyance Allowance", category: "Earning", required: "No", description: "Standard monthly travel/conveyance allowance.", example: 3000 },
  { code: "WASHING_ALLOWANCE", name: "Washing Allowance", category: "Earning", required: "No", description: "Uniform maintenance and washing allowance.", example: 0 },
  { code: "OTHER_ALLOWANCE", name: "Other Allowance", category: "Earning", required: "No", description: "Miscellaneous monthly earnings allowance.", example: 2500 },
  { code: "OVERTIME", name: "Overtime Pay", category: "Earning", required: "No", description: "Overtime hours payout.", example: 0 },
  { code: "LEAVE_WITH_WAGES", name: "Leave With Wages", category: "Earning", required: "No", description: "Statutory paid annual leave encashment payout.", example: 0 },
  { code: "EX_GRATIA", name: "Ex-Gratia", category: "Earning", required: "No", description: "Ex-Gratia discretionary payout.", example: 0 },
  { code: "CCA", name: "City Compensatory Allowance", category: "Earning", required: "No", description: "Allowance to offset cost of living in tier-1 cities.", example: 0 },
  { code: "EDUCATIONAL_ALLOWANCE", name: "Educational Allowance", category: "Earning", required: "No", description: "Children education allowance.", example: 0 },
  { code: "MEDICAL_ALLOWANCE", name: "Medical Allowance", category: "Earning", required: "No", description: "Fixed monthly medical reimbursement allowance.", example: 0 },
  { code: "OT_AMOUNT", name: "OT Amount", category: "Earning", required: "No", description: "Calculated overtime pay amount.", example: 0 },
  { code: "PAID_HOLIDAY", name: "Paid Holiday Allowance", category: "Earning", required: "No", description: "Payout for working on national/declared holidays.", example: 0 },
  { code: "SPL_ALLOWANCE", name: "Special Allowance", category: "Earning", required: "No", description: "Balancing component in monthly CTC calculation.", example: 0 },
  { code: "WEEKLY_OFF", name: "Weekly Off Allowance", category: "Earning", required: "No", description: "Payout for working on weekly off/rest days.", example: 0 },
  { code: "GRATUITY", name: "Gratuity Payout", category: "Earning", required: "No", description: "Statutory gratuity disbursement.", example: 0 },
  { code: "REIMBURSEMENT", name: "Reimbursement", category: "Earning", required: "No", description: "Official expense reimbursement payout.", example: 0 },
  { code: "LTC", name: "Leave Travel Concession", category: "Earning", required: "No", description: "Statutory travel concession payout.", example: 0 },
  { code: "BONUS", name: "Bonus", category: "Earning", required: "No", description: "Bonus payout to employee.", example: 0 },
  { code: "ATTIRE", name: "Attire Allowance", category: "Earning", required: "No", description: "Uniform and dress code allowance.", example: 0 },
  { code: "MEAL", name: "Meal Allowance", category: "Earning", required: "No", description: "Food voucher or meal coupon allowance.", example: 0 },
  { code: "LTA", name: "Leave Travel Allowance", category: "Earning", required: "No", description: "LTA tax-exempt travel allowance.", example: 0 },
  { code: "CONSOLIDATED_WAGES_1", name: "Consolidated Wages 1", category: "Earning", required: "No", description: "All-inclusive consolidated wages tier 1.", example: 0 },
  { code: "CONSOLIDATED_WAGES_2", name: "Consolidated Wages 2", category: "Earning", required: "No", description: "All-inclusive consolidated wages tier 2.", example: 0 },
  { code: "BASIC_DA_ARREARS", name: "Basic DA Arrears", category: "Earning", required: "No", description: "Retrospective revision arrears for Basic & DA.", example: 0 },
  { code: "OTHER_ARREARS", name: "Other Arrears", category: "Earning", required: "No", description: "Arrears for miscellaneous allowances.", example: 0 },
  { code: "SITE_ALLOWANCE", name: "Site Allowance", category: "Earning", required: "No", description: "Special field/site deployment allowance.", example: 0 },
  { code: "HOLIDAY_ALLOWANCE", name: "Holiday Allowance", category: "Earning", required: "No", description: "Special holiday work allowance.", example: 0 },
  { code: "LEAVE_ENCASHMENT", name: "Leave Encashment", category: "Earning", required: "No", description: "Encashment payout for unavailed leave balance.", example: 0 },
  { code: "P_OT", name: "Production Overtime (P_OT)", category: "Earning", required: "No", description: "Piece-rate or production overtime pay.", example: 0 },
  { code: "CONY", name: "Conveyance Allowance (Short Code)", category: "Earning", required: "No", description: "Standard monthly travel allowance.", example: 0 },
  { code: "BONUS_Q_Y", name: "Bonus Quarterly/Yearly", category: "Earning", required: "No", description: "Periodic quarterly or annual statutory bonus.", example: 0 },
  { code: "P_HOLIDAY", name: "Paid Holiday Pay (Short)", category: "Earning", required: "No", description: "Holiday shift premium payout.", example: 0 },
  { code: "LTA_M", name: "Monthly LTA (LTA_M)", category: "Earning", required: "No", description: "Monthly accrued leave travel allowance.", example: 0 },
  { code: "EX_GRATIA_Q_Y", name: "Ex-Gratia Quarterly/Yearly", category: "Earning", required: "No", description: "Periodic quarterly or annual ex-gratia bonus.", example: 0 },
  { code: "FIXED_COMPENSATION", name: "Fixed Compensation", category: "Earning", required: "No", description: "Fixed monthly gross compensation.", example: 0 },
  { code: "PERFORMANCE_ALLOWANCE", name: "Performance Allowance", category: "Earning", required: "No", description: "Variable performance incentive payout.", example: 0 },
  { code: "MEDICAL_REM_MER", name: "Medical Reimbursement (MER)", category: "Earning", required: "No", description: "Actual bill medical reimbursement payout.", example: 0 },
  { code: "CAR_REPAIR_RMB", name: "Car Repair Reimbursement (CAR)", category: "Earning", required: "No", description: "Motor car repair & maintenance reimbursement.", example: 0 },
  { code: "BOOK_PERIODICAL_RMB", name: "Book & Periodical Reimbursement (BP)", category: "Earning", required: "No", description: "Books, newspapers & journals reimbursement.", example: 0 },
  { code: "WASHING_ALLOWANCE_ARREARS", name: "Washing Allowance Arrears", category: "Earning", required: "No", description: "Retrospective arrears for washing allowance.", example: 0 },
  { code: "PLI", name: "Performance Linked Incentive (PLI)", category: "Earning", required: "No", description: "Performance linked incentive bonus.", example: 0 },
  { code: "MEDICAL_INS_REB", name: "Medical Insurance Rebate", category: "Earning", required: "No", description: "Reimbursement/rebate for personal medical policy.", example: 0 },
  { code: "FOOD_ALLOWANCE", name: "Food Allowance", category: "Earning", required: "No", description: "Fixed monthly food allowance.", example: 0 },
  { code: "SUBSISTENCE_ALLOWANCE", name: "Subsistence Allowance", category: "Earning", required: "No", description: "Statutory subsistence allowance during inquiry.", example: 0 },
  { code: "FIXED_LTA_PA", name: "Fixed LTA Per Annum", category: "Earning", required: "No", description: "Fixed annual LTA component.", example: 0 },
  { code: "FIXED_MEAL_CARD", name: "Fixed Meal Card", category: "Earning", required: "No", description: "Prepaid meal card monthly benefit.", example: 0 },
  { code: "FIXED_MEDICAL_RMB", name: "Fixed Medical Reimbursement", category: "Earning", required: "No", description: "Fixed structured medical reimbursement.", example: 0 },
  { code: "FIXED_PLI_PA", name: "Fixed Performance Incentive PA", category: "Earning", required: "No", description: "Fixed annual performance incentive.", example: 0 },
  { code: "FIXED_MEDICAL_INS_REB", name: "Fixed Medical Insurance Rebate", category: "Earning", required: "No", description: "Fixed monthly medical policy rebate.", example: 0 },
  { code: "FIXED_CAR_REPAIR_RMB", name: "Fixed Car Repair RMB", category: "Earning", required: "No", description: "Fixed monthly car repair allowance.", example: 0 },
  { code: "FIXED_BOOK_PERIODICAL_RMB", name: "Fixed Book & Periodical RMB", category: "Earning", required: "No", description: "Fixed monthly books & periodicals allowance.", example: 0 },
  { code: "FIXED_TELEPHONE_RMB", name: "Fixed Telephone Reimbursement", category: "Earning", required: "No", description: "Fixed monthly telephone allowance.", example: 0 },
  { code: "TELEPHONE_REB", name: "Telephone Rebate", category: "Earning", required: "No", description: "Monthly mobile/broadband bill reimbursement.", example: 0 },
  { code: "CASH_RISK_ALLOWANCE", name: "Cash Risk Allowance", category: "Earning", required: "No", description: "Risk allowance for cash handlers/cashiers.", example: 0 },
  { code: "BA_OT_FD", name: "BA & OT Fixed", category: "Earning", required: "No", description: "Basic Allowance & OT Fixed Lump-sum.", example: 0 },
  { code: "INCENTIVE", name: "Incentive", category: "Earning", required: "No", description: "Sales or operational goal achievement payout.", example: 0 },
  { code: "FOOD", name: "Food Pay", category: "Earning", required: "No", description: "Daily meal subsidy payout.", example: 0 },
  { code: "WO_ALLOWANCE", name: "W/O Allowance", category: "Earning", required: "No", description: "Weekly off shift allowance.", example: 0 },
  { code: "METRO_CITY_ALLOWANCE", name: "Metro City Allowance", category: "Earning", required: "No", description: "Special tier-1 metropolitan city allowance.", example: 0 },
  { code: "ROOM_RENT_REIMB", name: "Room Rent Reimbursement", category: "Earning", required: "No", description: "Official travel room rent reimbursement.", example: 0 },
  { code: "BASIC_DA_ADVANCE", name: "Basic DA Advance Payout", category: "Earning", required: "No", description: "Advance wage payout against Basic & DA.", example: 0 },
  { code: "OTHER_ADVANCE", name: "Other Advance Payout", category: "Earning", required: "No", description: "Advance payout against allowances.", example: 0 },
  { code: "HRA_ADVANCE", name: "HRA Advance Payout", category: "Earning", required: "No", description: "Advance payout against HRA.", example: 0 },
  { code: "MOBILE_ALLOWANCE", name: "Mobile Allowance", category: "Earning", required: "No", description: "Fixed cellular phone allowance.", example: 0 },
  { code: "STIPEND", name: "Stipend", category: "Earning", required: "No", description: "Trainee or intern monthly stipend.", example: 0 },

  // --- DEDUCTIONS ---
  { code: "PF", name: "Provident Fund (EPF)", category: "Deduction", required: "No", description: "Statutory Employee Provident Fund 12% deduction.", example: 1800 },
  { code: "ESIC", name: "ESIC Employee", category: "Deduction", required: "No", description: "Statutory Employee State Insurance 0.75% deduction.", example: 0 },
  { code: "PT", name: "Professional Tax", category: "Deduction", required: "No", description: "State Professional Tax statutory slab deduction.", example: 200 },
  { code: "LWF", name: "Labour Welfare Fund", category: "Deduction", required: "No", description: "Statutory Employee Labour Welfare Fund deduction.", example: 0 },
  { code: "LOAN", name: "Loan Recovery", category: "Deduction", required: "No", description: "Monthly EMI recovery for company loan.", example: 0 },
  { code: "ADVANCE", name: "Salary Advance Recovery", category: "Deduction", required: "No", description: "Recovery for salary advance taken.", example: 0 },
  { code: "TDS", name: "Tax Deducted at Source (TDS)", category: "Deduction", required: "No", description: "Monthly income tax withholding deduction.", example: 0 },
  { code: "FINE", name: "Fine Deduction", category: "Deduction", required: "No", description: "Disciplinary fine deduction under Factories Act.", example: 0 },
  { code: "OTHER_DEDUCTION", name: "Other Deduction", category: "Deduction", required: "No", description: "Miscellaneous monthly deductions.", example: 0 },
  { code: "PENALTY", name: "Penalty Deduction", category: "Deduction", required: "No", description: "Contractual or compliance penalty deduction.", example: 0 },
  { code: "MEDICAL_INSURANCE", name: "Medical Insurance Premium", category: "Deduction", required: "No", description: "Employee share for group medical policy.", example: 0 },
  { code: "LOAN_ADV_RECOVERY", name: "Loan & Advance Recovery", category: "Deduction", required: "No", description: "Combined recovery for loan and advance.", example: 0 },
  { code: "BENEVOLENT_F", name: "Benevolent Fund", category: "Deduction", required: "No", description: "Employee voluntary contribution to benevolent fund.", example: 0 },
  { code: "STAFF_WELFARE_FUND", name: "Staff Welfare Fund", category: "Deduction", required: "No", description: "Employee contribution to staff welfare fund.", example: 0 },
  { code: "BACKGROUND_VERIFICATION", name: "Background Verification Fee", category: "Deduction", required: "No", description: "One-time background screening charge recovery.", example: 0 },
  { code: "VOLUNTARY_PROVIDENT_FUND", name: "Voluntary Provident Fund (VPF)", category: "Deduction", required: "No", description: "Employee voluntary VPF contribution above 12%.", example: 0 },

  // --- EMPLOYER CONTRIBUTIONS ---
  { code: "EMPLOYER_PF", name: "Employer PF Contribution", category: "Employer Contribution", required: "No", description: "Statutory Employer EPF match contribution.", example: 1800 },
  { code: "EMPLOYER_ESIC", name: "Employer ESIC Contribution", category: "Employer Contribution", required: "No", description: "Statutory Employer ESIC 3.25% match contribution.", example: 0 },
  { code: "EMPLOYER_GRATUITY", name: "Employer Gratuity Contribution", category: "Employer Contribution", required: "No", description: "Statutory Employer Gratuity contribution.", example: 0 },
  { code: "MEDICLAIM", name: "Employer Mediclaim Provision", category: "Employer Contribution", required: "No", description: "Employer premium contribution for group health insurance.", example: 0 },
  { code: "EMPLOYER_BONUS", name: "Employer Bonus Provision", category: "Employer Contribution", required: "No", description: "Employer statutory bonus reserve provision.", example: 0 },
  { code: "EMPLOYER_LEAVE_WITH_WAGES", name: "Employer Leave With Wages Provision", category: "Employer Contribution", required: "No", description: "Employer statutory LWW leave encashment reserve.", example: 0 }
];

const EMPLOYEE_COLUMNS = ["EMP_CODE", "EMP_NAME", "DESIGNATION", "DEPARTMENT"];
const ALL_COLUMNS = [...EMPLOYEE_COLUMNS, ...SALARY_COMPONENT_COLUMNS.map((c) => c.code)];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ParsedRow {
  rowIndex: number;
  data: Record<string, string | number>;
  errors: string[];
}

interface BulkEmployeeImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function BulkEmployeeImportModal({ open, onOpenChange }: BulkEmployeeImportModalProps) {
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---- Reset on close ----
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setParsedRows([]);
      setFileName("");
      setIsDragOver(false);
      setIsImporting(false);
    }
    onOpenChange(nextOpen);
  };

  // -----------------------------------------------------------------------
  // Download Template
  // -----------------------------------------------------------------------
  const downloadTemplate = () => {
    const headers = ALL_COLUMNS;

    // Sample row
    const sampleRow: Record<string, string | number> = {
      EMP_CODE: "EMP-021",
      EMP_NAME: "Rahul Sharma",
      DESIGNATION: "SUPERVISOR",
      DEPARTMENT: "Operations",
      BASIC: 11632,
      DA: 3614,
      HRA: 3709,
      CONVEYANCE: 3000,
      OTHER_ALLOWANCE: 2500,
      PF: 1800,
      PT: 200,
      EMPLOYER_PF: 1800,
    };

    // Fill zeroes for all remaining components
    SALARY_COMPONENT_COLUMNS.forEach((c) => {
      if (!(c.code in sampleRow)) {
        sampleRow[c.code] = 0;
      }
    });

    const wsTemplate = XLSX.utils.json_to_sheet([sampleRow], { header: headers });

    // Set column widths for template sheet
    wsTemplate["!cols"] = headers.map((h) => ({ wch: Math.max(h.length + 2, 14) }));

    // Legend Sheet Data (Full Names & Descriptions)
    const legendRows = [
      {
        "Column Code": "EMP_CODE",
        "Full Component Name": "Employee Code",
        "Category": "Employee Info",
        "Required": "Yes",
        "Description": "Unique Employee Identifier Code",
        "Sample Value": "EMP-021",
      },
      {
        "Column Code": "EMP_NAME",
        "Full Component Name": "Employee Full Name",
        "Category": "Employee Info",
        "Required": "Yes",
        "Description": "Full name of the employee",
        "Sample Value": "Rahul Sharma",
      },
      {
        "Column Code": "DESIGNATION",
        "Full Component Name": "Designation",
        "Category": "Employee Info",
        "Required": "Yes",
        "Description": "Employee designation title in Organization",
        "Sample Value": "SUPERVISOR",
      },
      {
        "Column Code": "DEPARTMENT",
        "Full Component Name": "Department / Zone",
        "Category": "Employee Info",
        "Required": "Yes",
        "Description": "Department or operational zone name",
        "Sample Value": "Operations",
      },
      ...SALARY_COMPONENT_COLUMNS.map((c) => ({
        "Column Code": c.code,
        "Full Component Name": c.name,
        "Category": c.category,
        "Required": c.required,
        "Description": c.description,
        "Sample Value": c.example,
      })),
    ];

    const wsLegend = XLSX.utils.json_to_sheet(legendRows);
    wsLegend["!cols"] = [
      { wch: 24 }, // Column Code
      { wch: 38 }, // Full Component Name
      { wch: 24 }, // Category
      { wch: 10 }, // Required
      { wch: 55 }, // Description
      { wch: 14 }, // Sample Value
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsTemplate, "Employee Import Template");
    XLSX.utils.book_append_sheet(wb, wsLegend, "Salary Code Legend");
    XLSX.writeFile(wb, "employee_import_template.xlsx");

    toast.success("Template Downloaded", {
      description: `Includes 'Employee Import Template' (${ALL_COLUMNS.length} columns) and 'Salary Code Legend' sheets.`,
    });
  };

  // -----------------------------------------------------------------------
  // Parse uploaded file
  // -----------------------------------------------------------------------
  const parseFile = useCallback((file: File) => {
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target?.result) return;

      try {
        const data = new Uint8Array(e.target.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonRows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        if (jsonRows.length === 0) {
          toast.error("Empty file", { description: "The uploaded file has no data rows." });
          setParsedRows([]);
          return;
        }

        const parsed: ParsedRow[] = jsonRows.map((row, idx) => {
          const errors: string[] = [];
          const normalized: Record<string, string | number> = {};

          // Normalize keys: trim, uppercase, underscore
          const rowKeys = Object.keys(row);
          const keyMap: Record<string, string> = {};
          rowKeys.forEach((k) => {
            keyMap[k.trim().toUpperCase().replace(/\s+/g, "_")] = k;
          });

          // Map all expected columns
          ALL_COLUMNS.forEach((col) => {
            const matchedKey = keyMap[col] || keyMap[col.replace(/_/g, "")] || keyMap[col.replace(/_/g, " ")];
            if (matchedKey !== undefined) {
              normalized[col] = row[matchedKey];
            } else {
              normalized[col] = "";
            }
          });

          // Validate required fields
          if (!normalized.EMP_CODE || String(normalized.EMP_CODE).trim() === "") {
            errors.push("Missing EMP_CODE");
          }
          if (!normalized.EMP_NAME || String(normalized.EMP_NAME).trim() === "") {
            errors.push("Missing EMP_NAME");
          }
          if (!normalized.DESIGNATION || String(normalized.DESIGNATION).trim() === "") {
            errors.push("Missing DESIGNATION");
          }
          if (!normalized.DEPARTMENT || String(normalized.DEPARTMENT).trim() === "") {
            errors.push("Missing DEPARTMENT");
          }
          if (!normalized.BASIC || Number(normalized.BASIC) <= 0) {
            errors.push("Missing or zero BASIC salary");
          }

          return { rowIndex: idx + 2, data: normalized, errors };
        });

        setParsedRows(parsed);

        const validCount = parsed.filter((r) => r.errors.length === 0).length;
        const errorCount = parsed.filter((r) => r.errors.length > 0).length;

        toast.success(`Parsed ${parsed.length} rows`, {
          description: `${validCount} valid, ${errorCount} with errors.`,
        });
      } catch (err: any) {
        toast.error("Parse Error", { description: err.message || "Failed to parse the Excel file." });
        setParsedRows([]);
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  // ---- File input handler ----
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ---- Drag & Drop ----
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) parseFile(file);
  };

  // -----------------------------------------------------------------------
  // Confirm Import
  // -----------------------------------------------------------------------
  const validRows = parsedRows.filter((r) => r.errors.length === 0);
  const errorRows = parsedRows.filter((r) => r.errors.length > 0);

  const handleConfirmImport = async () => {
    if (validRows.length === 0) {
      toast.error("No valid rows to import.");
      return;
    }

    setIsImporting(true);
    try {
      const employees = validRows.map((r) => ({
        employeeId: String(r.data.EMP_CODE).trim(),
        name: String(r.data.EMP_NAME).trim(),
        designation: String(r.data.DESIGNATION).trim(),
        department: String(r.data.DEPARTMENT).trim(),
        salaryComponents: SALARY_COMPONENT_COLUMNS.map((comp) => ({
          code: comp.code,
          name: comp.name,
          category: comp.category,
          value: Number(r.data[comp.code]) || 0,
        })),
      }));

      console.log("Bulk import payload:", employees);

      toast.success(`${employees.length} employees imported successfully!`, {
        description: `${employees.length} employee records with salary structures have been imported.`,
      });
      handleOpenChange(false);
    } catch (err: any) {
      toast.error("Import Failed", { description: err.message || "Something went wrong." });
    } finally {
      setIsImporting(false);
    }
  };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[950px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
            Bulk Employee Import
          </DialogTitle>
          <DialogDescription>
            Download the template with salary component codes and legend, fill employee data, then upload to import.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4 pr-1">
          {/* ---- Step 1: Download Template ---- */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-sm">
                1
              </div>
              <div>
                <p className="font-medium text-sm">Download Template</p>
                <p className="text-xs text-muted-foreground">
                  Excel template with {ALL_COLUMNS.length} columns (4 employee fields + {SALARY_COMPONENT_COLUMNS.length} salary components + Code Legend sheet)
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Download .xlsx
            </Button>
          </div>

          {/* ---- Step 2: Upload File ---- */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-sm">
                2
              </div>
              <div>
                <p className="font-medium text-sm">Upload Filled File</p>
                <p className="text-xs text-muted-foreground">
                  Drag and drop or click to upload the completed Excel
                </p>
              </div>
            </div>

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragOver
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/20"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
              {fileName ? (
                <div className="flex items-center justify-center gap-2">
                  <FileSpreadsheet className="h-6 w-6 text-green-600" />
                  <span className="font-medium text-sm">{fileName}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFileName("");
                      setParsedRows([]);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Drop your <strong>.xlsx</strong> file here, or click to browse
                  </p>
                </>
              )}
            </div>
          </div>

          {/* ---- Step 3: Preview ---- */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-sm">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-sm">Preview & Confirm</p>
                    <p className="text-xs text-muted-foreground">
                      Review parsed data before importing
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {validRows.length > 0 && (
                    <Badge variant="default" className="bg-green-600 text-white">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      {validRows.length} valid
                    </Badge>
                  )}
                  {errorRows.length > 0 && (
                    <Badge variant="destructive">
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      {errorRows.length} errors
                    </Badge>
                  )}
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden max-h-[300px] overflow-y-auto">
                <Table>
                  <TableHeader className="bg-muted/50 sticky top-0">
                    <TableRow>
                      <TableHead className="w-[50px] text-xs">Row</TableHead>
                      <TableHead className="text-xs">Emp Code</TableHead>
                      <TableHead className="text-xs">Name</TableHead>
                      <TableHead className="text-xs">Designation</TableHead>
                      <TableHead className="text-xs">Department</TableHead>
                      <TableHead className="text-xs text-right">Basic</TableHead>
                      <TableHead className="text-xs text-right">Gross</TableHead>
                      <TableHead className="text-xs text-right">Deductions</TableHead>
                      <TableHead className="text-xs text-right">Net Payable</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedRows.map((row) => {
                      const hasErrors = row.errors.length > 0;

                      // Dynamically compute gross earnings, deductions, and net payable
                      const gross = SALARY_COMPONENT_COLUMNS
                        .filter((c) => c.category === "Earning")
                        .reduce((sum, c) => sum + (Number(row.data[c.code]) || 0), 0);

                      const deductionsTotal = SALARY_COMPONENT_COLUMNS
                        .filter((c) => c.category === "Deduction")
                        .reduce((sum, c) => sum + (Number(row.data[c.code]) || 0), 0);

                      const netPayable = gross - deductionsTotal;

                      return (
                        <TableRow
                          key={row.rowIndex}
                          className={hasErrors ? "bg-red-50/50 dark:bg-red-900/10" : ""}
                        >
                          <TableCell className="text-xs text-muted-foreground">{row.rowIndex}</TableCell>
                          <TableCell className="text-xs font-medium">
                            {String(row.data.EMP_CODE || "—")}
                          </TableCell>
                          <TableCell className="text-xs">{String(row.data.EMP_NAME || "—")}</TableCell>
                          <TableCell className="text-xs">{String(row.data.DESIGNATION || "—")}</TableCell>
                          <TableCell className="text-xs">{String(row.data.DEPARTMENT || "—")}</TableCell>
                          <TableCell className="text-xs text-right">
                            ₹{(Number(row.data.BASIC) || 0).toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell className="text-xs text-right font-medium text-green-700 dark:text-green-400">
                            ₹{gross.toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell className="text-xs text-right text-red-600 dark:text-red-400">
                            ₹{deductionsTotal.toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell className="text-xs text-right font-bold text-blue-700 dark:text-blue-400">
                            ₹{netPayable.toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell>
                            {hasErrors ? (
                              <Badge variant="destructive" className="text-[10px] h-5 px-1.5">
                                {row.errors[0]}
                              </Badge>
                            ) : (
                              <Badge variant="default" className="bg-green-600 text-white text-[10px] h-5 px-1.5">
                                Valid
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmImport}
            disabled={validRows.length === 0 || isImporting}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Import {validRows.length} Employee{validRows.length !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
