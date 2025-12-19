"use client"
import React, {  useEffect, useMemo, useState } from "react";

import { MainLayout } from "@/components/ui/layout/main-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PDFDownloadLink, Document, Page, View, Text, StyleSheet, Font } from "@react-pdf/renderer";
import { format } from "date-fns";
//@ts-ignore
import { toWords } from "number-to-words";

// ---------- helper types ----------
type FinalSalaryRow = any;

type Form16Model = {
  empId: string;
  empName: string;
  empCode?: string;
  pan?: string;
  designation?: string;
  site?: string;
  monthly: {
    basic: number;
    hra: number;
    conveyance: number;
    splAllowance: number;
    otherAllowance: number;
    medical?: number;
    bonus?: number;
  };
  monthlyPF: number;
  monthlyESIC: number;
  monthlyPT: number;
  monthlyLWF: number;
};

// ---------- tax helpers (both regimes) ----------
// Keep these simple / consistent with your tax calculator.
// Feel free to replace with more exact FY slabs.
function calcOldRegimeTax(taxable: number) {
  // Using previous simple slabs (annual)
  let tax = 0;
  if (taxable <= 250000) tax = 0;
  else if (taxable <= 500000) tax = (taxable - 250000) * 0.05;
  else if (taxable <= 1000000) tax = 250000 * 0.05 + (taxable - 500000) * 0.2;
  else tax = 250000 * 0.05 + 500000 * 0.2 + (taxable - 1000000) * 0.3;
  // rebate check (87A simplified)
  if (taxable <= 500000) return 0;
  const cess = tax * 0.04;
  return Math.round(tax + cess);
}

function calcNewRegimeTax(taxable: number) {
  // Simplified new-regime slabs (annual)
  let tax = 0;
  if (taxable <= 300000) tax = 0;
  else if (taxable <= 600000) tax = (taxable - 300000) * 0.05;
  else if (taxable <= 900000) tax = 300000 * 0.05 + (taxable - 600000) * 0.1;
  else if (taxable <= 1200000) tax = 300000 * 0.05 + 300000 * 0.1 + (taxable - 900000) * 0.15;
  else if (taxable <= 1500000) tax = 300000 * 0.05 + 300000 * 0.1 + 300000 * 0.15 + (taxable - 1200000) * 0.2;
  else tax = 300000 * 0.05 + 300000 * 0.1 + 300000 * 0.15 + 300000 * 0.2 + (taxable - 1500000) * 0.3;
  // rebate simplified
  if (taxable <= 700000) return 0;
  const cess = tax * 0.04;
  return Math.round(tax + cess);
}

// ---------- PDF styles ----------
const pdfStyles = StyleSheet.create({
  page: { padding: 20, fontSize: 10, fontFamily: "Helvetica" },
  header: { marginBottom: 10, flexDirection: "row", justifyContent: "space-between" },
  title: { fontSize: 14, fontWeight: "bold" },
  section: { marginTop: 8, marginBottom: 6 },
  tableRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3, borderBottomWidth: 0.5, borderBottomColor: "#eee" },
  label: { width: "60%" },
  value: { width: "35%", textAlign: "right" },
  smallMuted: { fontSize: 8, color: "#555" },
  footer: { marginTop: 10, fontSize: 9 }
});

// ---------- PDF Document Component ----------
function Form16PDF({ data, periodLabel }: { data: any; periodLabel: string }) {
  return (
    <Document>
      <Page size="A4" style={{ padding: 24, fontSize: 9, lineHeight: 1.4 }}>

        {/* ================= FORM 16 HEADER ================= */}
        <Text style={{ textAlign: "center", fontWeight: "bold" }}>
          FORM NO.16
        </Text>
        <Text style={{ textAlign: "center" }}>
          [See rule 31 (1) (a)]
        </Text>

        <Text style={{ textAlign: "center", fontWeight: "bold", marginTop: 6 }}>
          Part A
        </Text>

        <Text style={{ marginTop: 6 }}>
          Certificate under section 203 of the Income Tax Act, 1961 for tax deducted
          at source from income chargeable under the head “Salaries”
        </Text>

        {/* ================= STATIC PART A (FILLED + EMPTY TABLES) ================= */}

        <Text style={{ marginTop: 8 }}>
          Name and address of the employer
        </Text>
        <Text>I Smart Facitech Private Ltd</Text>
        <Text>Mumbai – 400037</Text>

        <Text style={{ marginTop: 6 }}>
          Name and Designation of the employee
        </Text>
        <Text>{data.empName}</Text>
        <Text>{data.designation}</Text>

        <Text style={{ marginTop: 6 }}>
          PAN of the Deductor : AAKCC4528J
        </Text>
        <Text>
          TAN of the Deductor : MUMC28808D
        </Text>
        <Text>
          PAN of the Employee : {data.pan || "-"}
        </Text>

        <Text style={{ marginTop: 6 }}>
          Assessment Year : {periodLabel.replace("FY ", "")}
        </Text>

        <Text style={{ marginTop: 10, fontWeight: "bold" }}>
          Summary of amount paid / credited and tax deducted at source
        </Text>

        {["Quarter 1", "Quarter 2", "Quarter 3", "Quarter 4"].map((q) => (
          <Text key={q}>{q} : -</Text>
        ))}

        {/* ================= PART B ================= */}

        <Text style={{ marginTop: 12, fontWeight: "bold" }}>
          Part B (Annexure)
        </Text>

        <Text style={{ marginTop: 4 }}>
          DETAILS OF SALARY PAID AND ANY OTHER INCOME AND TAX DEDUCTED
        </Text>

        {/* 1. Gross Salary */}
        <Text style={{ marginTop: 6 }}>
          1. Gross Salary
        </Text>
        <Text>(a) Salary as per section 17(1) : ₹ {data.gross.toLocaleString("en-IN")}</Text>
        <Text>(b) Value of perquisites u/s 17(2) : -</Text>
        <Text>(c) Profits in lieu of salary u/s 17(3) : -</Text>
        <Text>(d) Total : ₹ {data.gross.toLocaleString("en-IN")}</Text>

        {/* 2. Exemptions */}
        <Text style={{ marginTop: 6 }}>
          2. Less : Allowance exempt under section 10 : -
        </Text>

        {/* 3. Balance */}
        <Text style={{ marginTop: 6 }}>
          3. Balance (1 - 2) : ₹ {data.gross.toLocaleString("en-IN")}
        </Text>

        {/* 4. Deductions */}
        <Text style={{ marginTop: 6 }}>
          4. Deductions
        </Text>
        <Text>(a) Standard Deduction : ₹ 50,000</Text>
        <Text>(b) Entertainment Allowance : -</Text>
        <Text>(c) Tax on Employment : ₹ {data.ptAnnual.toLocaleString("en-IN")}</Text>

        <Text>
          5. Aggregate of 4(a to c) : ₹ {(50000 + data.ptAnnual).toLocaleString("en-IN")}
        </Text>

        {/* 6. Income under Salary */}
        <Text style={{ marginTop: 6 }}>
          6. Income chargeable under the head Salaries :
          ₹ {data.taxableIncome.toLocaleString("en-IN")}
        </Text>

        {/* 7 & 8 */}
        <Text style={{ marginTop: 6 }}>
          7. Add : Any other income : -
        </Text>
        <Text>
          8. Gross Total Income : ₹ {data.taxableIncome.toLocaleString("en-IN")}
        </Text>

        {/* 9. Chapter VI-A */}
        <Text style={{ marginTop: 6 }}>
          9. Deductions under Chapter VI-A
        </Text>
        <Text>Section 80C (PF) : ₹ {data.pfAnnual.toLocaleString("en-IN")}</Text>

        {/* 10 - 20 */}
        <Text style={{ marginTop: 6 }}>
          10. Total deductions : ₹ {data.pfAnnual.toLocaleString("en-IN")}
        </Text>
        <Text>
          11. Total Income : ₹ {(data.taxableIncome - data.pfAnnual).toLocaleString("en-IN")}
        </Text>
        <Text>12. Tax on total income : ₹ {data.oldTax.toLocaleString("en-IN")}</Text>
        <Text>13. Rebate u/s 87A : -</Text>
        <Text>14. Tax payable : ₹ {data.oldTax.toLocaleString("en-IN")}</Text>
        <Text>15. Education & Health Cess @4% : Included</Text>
        <Text>16. Tax payable : ₹ {data.oldTax.toLocaleString("en-IN")}</Text>
        <Text>19. Tax deducted at source u/s 192 : ₹ {data.oldTax.toLocaleString("en-IN")}</Text>
        <Text>20. Tax payable / refundable : -</Text>

        {/* ================= VERIFICATION ================= */}
        <Text style={{ marginTop: 12 }}>
          I hereby certify that the information given above is true and correct.
        </Text>

        <Text style={{ marginTop: 16 }}>
          Signature & Seal of the person responsible for deduction of tax
        </Text>

      </Page>
    </Document>
  );
}

// ---------- Main Page Component ----------
export default function Form16PartBPage() {
  const [payrollRows, setPayrollRows] = useState<FinalSalaryRow[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState<string>("");
  const [previewData, setPreviewData] = useState<any | null>(null);

  // load finalSalaryData from localStorage on client
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("finalSalaryData") || localStorage.getItem("reviewData") || "[]";
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) setPayrollRows(parsed);
      else setPayrollRows([]);
    } catch (e) {
      console.error("Failed loading finalSalaryData:", e);
      setPayrollRows([]);
    }
  }, []);

  const employeesForSelect = useMemo(() => {
    return payrollRows.map((r: any) => ({
      id: String(r.EMPLOYEEID ?? r.empId ?? r.EMPCODE ?? r.EMPCODE),
      label: r.EMPNAME ?? r.EMPLOYEENAME ?? r.name ?? "Unknown",
      raw: r
    }));
  }, [payrollRows]);

  // build annual model for selected employee
  useEffect(() => {
    if (!selectedEmpId) {
      setPreviewData(null);
      return;
    }
    const row = payrollRows.find((r: any) => {
      const id = String(r.EMPLOYEEID ?? r.empId ?? r.EMPLOYEECODE ?? r.EMPCODE ?? "");
      return id === selectedEmpId;
    });
    if (!row) {
      setPreviewData(null);
      return;
    }

    // helper: safe numeric
    const n = (v: any) => {
      if (v === undefined || v === null || v === "") return 0;
      const parsed = Number(v);
      return isNaN(parsed) ? 0 : parsed;
    };

    // monthly components may be in row.calculatedSalary or top-level fields
    const monthly = {
      basic: n(row.calculatedSalary?.basic ?? row.earnedBasic ?? row.basic ?? row.BASIC),
      hra: n(row.calculatedSalary?.hra ?? row.hra ?? row.HRA),
      conveyance: n(row.calculatedSalary?.conveyance ?? row.CONV ?? row.conveyance),
      splAllowance: n(row.calculatedSalary?.splAllowance ?? row.splAllowance ?? row["SPL ALLOWANCE"]),
      otherAllowance: n(row.calculatedSalary?.otherAllowance ?? row.otherAllowance ?? row["OTHER ALW"]),
      medical: n(row.calculatedSalary?.medical ?? row.medical ?? row["MEDICAL ALLOWANCE"]),
      bonus: n(row.calculatedSalary?.bonus ?? row.bonus ?? row.BONUS),
    };

    const monthlyPF = n(row.finalPF ?? row.pf ?? row.PF);
    const monthlyESIC = n(row.finalESIC ?? row.esic ?? row.ESIC);
    const monthlyPT = n(row.pt ?? row.PROFESSIONALTAX ?? row.ptTax);
    const monthlyLWF = n(row.lwf ?? row.LWF);

    // build annual
  const yearly = {
  basic: Math.round(monthly.basic * 12),
  hra: Math.round(monthly.hra * 12),
  conveyance: Math.round(monthly.conveyance * 12),
  special: Math.round(monthly.splAllowance * 12),
  other: Math.round((monthly.otherAllowance + monthly.medical + monthly.bonus) * 12),
  gross: 0, // we put placeholder so TS knows `gross` exists
};

yearly.gross =
  yearly.basic +
  yearly.hra +
  yearly.conveyance +
  yearly.special +
  yearly.other;


    const pfAnnual = Math.round(monthlyPF * 12);
    const esicAnnual = Math.round(monthlyESIC * 12);
    const ptAnnual = Math.round(monthlyPT * 12);
    const lwfAnnual = Math.round(monthlyLWF * 12);
    const totalDeductions = pfAnnual + esicAnnual + ptAnnual + lwfAnnual;

    const taxableIncome = Math.max(0, yearly.gross - totalDeductions);

    const oldTax = calcOldRegimeTax(taxableIncome);
    const newTax = calcNewRegimeTax(taxableIncome);

    const built = {
      empId: String(row.EMPLOYEEID ?? row.empId ?? row.EMPLOYEECODE ?? ""),
      empName: row.EMPNAME ?? row.EMPLOYEENAME ?? row.name ?? "Unknown",
      empCode: row.EMPLOYEECODE ?? row.EMPCODE ?? "",
      pan: row.PAN ?? row.PANNO ?? row.PANNO ?? "",
      designation: row.DESIGNATIONNAME ?? row.designation ?? "",
      site: row.SITENAME ?? row.site ?? "",
      basic: yearly.basic,
      hra: yearly.hra,
      conveyance: yearly.conveyance,
      special: yearly.special,
      other: yearly.other,
      gross: yearly.gross,
      pfAnnual,
      esicAnnual,
      ptAnnual,
      lwfAnnual,
      totalDeductions,
      taxableIncome,
      oldTax,
      newTax,
    };

    setPreviewData(built);
  }, [selectedEmpId, payrollRows]);

  const periodLabel = `FY ${new Date().getFullYear() - 1}-${String(new Date().getFullYear()).slice(-2)}`;

  return (
    <MainLayout>
      <div className="space-y-6 max-w-5xl mx-auto py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Form 16 — Part B (Generator)</h1>
            <p className="text-sm text-muted-foreground">
              Generate Form 16 Part B (annual estimate) from final salary data. Shows both Old & New regime.
            </p>
          </div>
          <Badge>Estimate · Part B</Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select employee</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 items-center">
              <div className="flex-1">
                <Select value={selectedEmpId} onValueChange={(v) => setSelectedEmpId(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder={employeesForSelect.length ? "Choose employee" : "No payroll data found"} />
                  </SelectTrigger>
                  <SelectContent>
                    {employeesForSelect.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => {
                  // quick auto-select first if none
                  if (!selectedEmpId && employeesForSelect.length) setSelectedEmpId(employeesForSelect[0].id);
                  // otherwise preview already computed in effect
                }}>
                  Load
                </Button>

                {previewData && (
                  <PDFDownloadLink
                    document={<Form16PDF data={previewData} periodLabel={periodLabel} />}
                    fileName={`Form16_PartB_${previewData.empName.replace(/\s+/g,'_')}_${periodLabel}.pdf`}
                  >
                    {({ loading }) => (
                      <Button>{loading ? "Preparing PDF..." : "Download PDF"}</Button>
                    )}
                  </PDFDownloadLink>
                  
                )}
                <Button
  variant="outline"
  onClick={() => downloadForm16Excel(previewData)}
>
  Download Form 16 (Excel)
</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div>
          {!previewData && (
            <Card>
              <CardContent>
                <div className="py-6 text-center text-muted-foreground">Select an employee to preview Form 16 Part B</div>
              </CardContent>
            </Card>
          )}

          {previewData && (
            <Card>
              <CardHeader>
                <CardTitle>Preview — Form 16 Part B (Estimate)</CardTitle>
              </CardHeader>

              <CardContent className="space-y-6 text-sm">

  {/* Employee Header */}
  <div className="grid md:grid-cols-2 gap-4">
    <div>
      <div className="font-medium">{previewData.empName}</div>
      <div className="text-xs text-muted-foreground">
        {previewData.designation} • {previewData.site}
      </div>
      <div className="mt-2">
        Emp Code: <strong>{previewData.empCode}</strong><br />
        PAN: <strong>{previewData.pan}</strong>
      </div>
    </div>

    <div className="text-right">
      <div className="font-medium">{periodLabel}</div>
      <div className="text-xs text-muted-foreground">
        Generated on {format(new Date(), "dd MMM yyyy")}
      </div>
      <Badge className="mt-2">Form 16 – Part B</Badge>
    </div>
  </div>

  <Separator />

  {/* A. Gross Salary */}
  <Section title="A. Gross Salary">
    <Row label="Basic Salary" value={previewData.basic} />
    <Row label="House Rent Allowance" value={previewData.hra} />
    <Row label="Conveyance Allowance" value={previewData.conveyance} />
    <Row label="Special Allowance" value={previewData.special} />
    <Row label="Other Allowances" value={previewData.other} />
    <Row bold label="Gross Salary (A)" value={previewData.gross} />
  </Section>

  {/* B. Exemptions */}
  <Section title="B. Less: Exemptions">
    <Row label="Exemptions (HRA / others)" value={0} />
  </Section>

  {/* C. Gross Total Income */}
  <Section title="C. Gross Total Income">
    <Row bold label="Gross Total Income (C)" value={previewData.gross} />
  </Section>

  {/* D. Chapter VI-A */}
  <Section title="D. Deductions under Chapter VI-A">
    <Row label="Employee Provident Fund" value={previewData.pfAnnual} />
    <Row label="ESIC" value={previewData.esicAnnual} />
    <Row label="Professional Tax" value={previewData.ptAnnual} />
    <Row label="Labour Welfare Fund" value={previewData.lwfAnnual} />
    <Row bold label="Total Deductions (D)" value={previewData.totalDeductions} />
  </Section>

  {/* E. Taxable Income */}
  <Section title="E. Taxable Income">
    <Row bold label="Taxable Income (E)" value={previewData.taxableIncome} />
  </Section>

  {/* F. Tax Computation */}
  <Section title="F. Tax Computation">
    <Row label="Tax as per Old Regime" value={previewData.oldTax} />
    <Row label="Tax as per New Regime" value={previewData.newTax} />
    <Row
      bold
      label="Recommended Regime"
      valueText={previewData.oldTax <= previewData.newTax ? "OLD REGIME" : "NEW REGIME"}
    />
  </Section>

  <Separator />

  {/* Footer */}
  <div className="text-xs text-muted-foreground">
    This is a system-generated Form 16 Part B based on final payroll data.
    No physical or digital signature is required.
  </div>

  <div className="flex justify-end">
    <PDFDownloadLink
      document={<Form16PDF data={previewData} periodLabel={periodLabel} />}
      fileName={`Form16_PartB_${previewData.empName.replace(/\s+/g, "_")}.pdf`}
    >
      {({ loading }) => (
        <Button>{loading ? "Preparing PDF..." : "Download PDF"}</Button>
      )}
    </PDFDownloadLink>
  </div>
</CardContent>

            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold uppercase text-muted-foreground">
        {title}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

function Row({
  label,
  value,
  bold,
  valueText,
}: {
  label: string
  value?: number
  valueText?: string
  bold?: boolean
}) {
  return (
    <div className="flex justify-between">
      <span className={bold ? "font-medium" : ""}>{label}</span>
      <span className={bold ? "font-medium" : ""}>
        {valueText ?? `₹${value?.toLocaleString("en-IN")}`}
      </span>
    </div>
  )
}


import ExcelJS from "exceljs";

async function downloadForm16Excel(previewData: any) {
  const response = await fetch("/templates/Form16_FIXED.xlsx");
  const buffer = await response.arrayBuffer();

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const sheet = workbook.worksheets[0]
  const dataSheet = workbook.getWorksheet("DATA");
  if (!dataSheet) throw new Error("DATA sheet not found");

  // ✅ Fill values (styles remain untouched)
  sheet.getCell("G8").value = previewData.empName;        // 👈 employee name
  sheet.getCell("G9").value = previewData.designation;
  dataSheet.getCell("B2").value = previewData.gross;
  dataSheet.getCell("B3").value = previewData.ptAnnual;
  dataSheet.getCell("B4").value = previewData.pfAnnual;
  dataSheet.getCell("B5").value = 0;
  dataSheet.getCell("B6").value = previewData.oldTax;
  dataSheet.getCell("B7").value = previewData.oldTax;

  // 🔽 Export
  const outBuffer = await workbook.xlsx.writeBuffer();

  const blob = new Blob([outBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Form16_${previewData.empName.replace(/\s+/g, "_")}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}


