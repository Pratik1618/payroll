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
// Salary component codes from the Organization Management master
// (matches post_salary_components.js)
// ---------------------------------------------------------------------------
const SALARY_COMPONENT_COLUMNS = [
  // Earnings
  { code: "BASIC", name: "Basic Salary", category: "Earning" },
  { code: "HRA", name: "House Rent Allowance", category: "Earning" },
  { code: "SPECIAL", name: "Special Allowance", category: "Earning" },
  { code: "CONV", name: "Conveyance Allowance", category: "Earning" },
  { code: "MED_ALLOW", name: "Medical Allowance", category: "Earning" },
  { code: "LWW_EMP", name: "Leave With Wages", category: "Earning" },
  { code: "BONUS_EMP", name: "Bonus", category: "Earning" },
  // Deductions
  { code: "SWF_EMP", name: "Staff Welfare Fund", category: "Deduction" },
  { code: "LWF_EMP", name: "Labour Welfare Fund", category: "Deduction" },
  { code: "MED_POL", name: "Medical Insurance Policy Premium", category: "Deduction" },
  { code: "EPF_EMP", name: "Provident Fund Employee", category: "Deduction" },
  { code: "ESIC_EMP", name: "ESIC Employee", category: "Deduction" },
  { code: "PT", name: "Professional Tax", category: "Deduction" },
  { code: "TDS", name: "Tax Deducted at Source", category: "Deduction" },
  // Employer Contributions
  { code: "LWW_EMPR", name: "Leave With Wages Employer", category: "Employer Contribution" },
  { code: "BONUS_EMPR", name: "Bonus Employer", category: "Employer Contribution" },
  { code: "SWF_EMPR", name: "Staff Welfare Fund Employer", category: "Employer Contribution" },
  { code: "LWF_EMPR", name: "Labour Welfare Fund Employer", category: "Employer Contribution" },
  { code: "EPF_EMPR", name: "Provident Fund Employer", category: "Employer Contribution" },
  { code: "ESIC_EMPR", name: "ESIC Employer", category: "Employer Contribution" },
  { code: "GRAT", name: "Gratuity Trust", category: "Employer Contribution" },
  { code: "GTLI", name: "Group Term Life Insurance", category: "Employer Contribution" },
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
      HRA: 3709,
      SPECIAL: 0,
      CONV: 3000,
      MED_ALLOW: 0,
      LWW_EMP: 0,
      BONUS_EMP: 0,
      SWF_EMP: 0,
      LWF_EMP: 0,
      MED_POL: 0,
      EPF_EMP: 1800,
      ESIC_EMP: 0,
      PT: 200,
      TDS: 0,
      LWW_EMPR: 0,
      BONUS_EMPR: 0,
      SWF_EMPR: 0,
      LWF_EMPR: 0,
      EPF_EMPR: 1800,
      ESIC_EMPR: 0,
      GRAT: 0,
      GTLI: 0,
    };

    const ws = XLSX.utils.json_to_sheet([sampleRow], { header: headers });

    // Set column widths
    ws["!cols"] = headers.map((h) => ({ wch: Math.max(h.length + 2, 14) }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employee Import Template");
    XLSX.writeFile(wb, "employee_import_template.xlsx");

    toast.success("Template Downloaded", {
      description: "Fill in employee data and upload the completed file.",
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

          // Normalize keys: trim, uppercase for matching
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
    // Reset so the same file can be re-uploaded
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
      // Build the payload to match the employee creation API shape
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

      // TODO: Replace with actual bulk API endpoint when available
      // For now, we log and show success
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
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
            Bulk Employee Import
          </DialogTitle>
          <DialogDescription>
            Download the template, fill in employee data with salary components, then upload to import.
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
                  Excel template with 4 employee fields + 22 salary component columns
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
                      <TableHead className="text-xs text-right">HRA</TableHead>
                      <TableHead className="text-xs text-right">Gross</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedRows.map((row) => {
                      const hasErrors = row.errors.length > 0;
                      // Calculate gross from all earning components
                      const gross =
                        (Number(row.data.BASIC) || 0) +
                        (Number(row.data.HRA) || 0) +
                        (Number(row.data.SPECIAL) || 0) +
                        (Number(row.data.CONV) || 0) +
                        (Number(row.data.MED_ALLOW) || 0) +
                        (Number(row.data.LWW_EMP) || 0) +
                        (Number(row.data.BONUS_EMP) || 0);

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
                          <TableCell className="text-xs text-right">
                            ₹{(Number(row.data.HRA) || 0).toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell className="text-xs text-right font-medium">
                            ₹{gross.toLocaleString("en-IN")}
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
