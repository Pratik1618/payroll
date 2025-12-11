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
  // data contains computed annual numbers and tax computations
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.title}>FORM 16 — PART B (ESTIMATE)</Text>
          <Text>{periodLabel}</Text>
        </View>

        <View style={pdfStyles.section}>
          <Text style={{ fontSize: 11, fontWeight: "bold" }}>Employee Details</Text>
          <View style={{ marginTop: 6 }}>
            <View style={pdfStyles.tableRow}>
              <Text style={pdfStyles.label}>Name</Text>
              <Text style={pdfStyles.value}>{data.empName}</Text>
            </View>
            <View style={pdfStyles.tableRow}>
              <Text style={pdfStyles.label}>PAN</Text>
              <Text style={pdfStyles.value}>{data.pan || "-"}</Text>
            </View>
            <View style={pdfStyles.tableRow}>
              <Text style={pdfStyles.label}>Employee Code</Text>
              <Text style={pdfStyles.value}>{data.empCode || "-"}</Text>
            </View>
            <View style={pdfStyles.tableRow}>
              <Text style={pdfStyles.label}>Designation</Text>
              <Text style={pdfStyles.value}>{data.designation || "-"}</Text>
            </View>
            <View style={pdfStyles.tableRow}>
              <Text style={pdfStyles.label}>Site</Text>
              <Text style={pdfStyles.value}>{data.site || "-"}</Text>
            </View>
          </View>
        </View>

        <View style={pdfStyles.section}>
          <Text style={{ fontSize: 11, fontWeight: "bold" }}>Salary (Annual)</Text>
          <View style={{ marginTop: 6 }}>
            <View style={pdfStyles.tableRow}>
              <Text style={pdfStyles.label}>Basic</Text>
              <Text style={pdfStyles.value}>₹{data.basic.toLocaleString()}</Text>
            </View>
            <View style={pdfStyles.tableRow}>
              <Text style={pdfStyles.label}>HRA</Text>
              <Text style={pdfStyles.value}>₹{data.hra.toLocaleString()}</Text>
            </View>
            <View style={pdfStyles.tableRow}>
              <Text style={pdfStyles.label}>Conveyance</Text>
              <Text style={pdfStyles.value}>₹{data.conveyance.toLocaleString()}</Text>
            </View>
            <View style={pdfStyles.tableRow}>
              <Text style={pdfStyles.label}>Special Allowance</Text>
              <Text style={pdfStyles.value}>₹{data.special.toLocaleString()}</Text>
            </View>
            <View style={pdfStyles.tableRow}>
              <Text style={pdfStyles.label}>Other Allowances (incl. medical, bonus)</Text>
              <Text style={pdfStyles.value}>₹{data.other.toLocaleString()}</Text>
            </View>
            <View style={pdfStyles.tableRow}>
              <Text style={{ fontWeight: "bold" }}>Gross Total Income</Text>
              <Text style={{ fontWeight: "bold" }}>₹{data.gross.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        <View style={pdfStyles.section}>
          <Text style={{ fontSize: 11, fontWeight: "bold" }}>Deductions (Annual)</Text>
          <View style={{ marginTop: 6 }}>
            <View style={pdfStyles.tableRow}>
              <Text style={pdfStyles.label}>Employee PF</Text>
              <Text style={pdfStyles.value}>₹{data.pfAnnual.toLocaleString()}</Text>
            </View>
            <View style={pdfStyles.tableRow}>
              <Text style={pdfStyles.label}>ESIC</Text>
              <Text style={pdfStyles.value}>₹{data.esicAnnual.toLocaleString()}</Text>
            </View>
            <View style={pdfStyles.tableRow}>
              <Text style={pdfStyles.label}>Professional Tax</Text>
              <Text style={pdfStyles.value}>₹{data.ptAnnual.toLocaleString()}</Text>
            </View>
            <View style={pdfStyles.tableRow}>
              <Text style={pdfStyles.label}>LWF</Text>
              <Text style={pdfStyles.value}>₹{data.lwfAnnual.toLocaleString()}</Text>
            </View>
            <View style={pdfStyles.tableRow}>
              <Text style={{ fontWeight: "bold" }}>Total Deductions</Text>
              <Text style={{ fontWeight: "bold" }}>₹{data.totalDeductions.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        <View style={pdfStyles.section}>
          <Text style={{ fontSize: 11, fontWeight: "bold" }}>Tax Computation</Text>
          <View style={{ marginTop: 6 }}>
            <View style={pdfStyles.tableRow}>
              <Text style={pdfStyles.label}>Gross Total Income</Text>
              <Text style={pdfStyles.value}>₹{data.gross.toLocaleString()}</Text>
            </View>
            <View style={pdfStyles.tableRow}>
              <Text style={pdfStyles.label}>Less: Deductions</Text>
              <Text style={pdfStyles.value}>₹{data.totalDeductions.toLocaleString()}</Text>
            </View>
            <View style={pdfStyles.tableRow}>
              <Text style={{ fontWeight: "bold" }}>Taxable Income</Text>
              <Text style={{ fontWeight: "bold" }}>₹{data.taxableIncome.toLocaleString()}</Text>
            </View>

            <View style={{ marginTop: 6, marginBottom: 4 }}>
              <Text style={{ fontSize: 10, fontWeight: "bold" }}>Tax under Old Regime</Text>
              <View style={pdfStyles.tableRow}>
                <Text style={pdfStyles.label}>Tax Liability (incl. cess)</Text>
                <Text style={pdfStyles.value}>₹{data.oldTax.toLocaleString()}</Text>
              </View>
              <View style={pdfStyles.tableRow}>
                <Text style={pdfStyles.label}>Monthly TDS (approx)</Text>
                <Text style={pdfStyles.value}>₹{Math.round(data.oldTax / 12).toLocaleString()}</Text>
              </View>
            </View>

            <View style={{ marginTop: 6 }}>
              <Text style={{ fontSize: 10, fontWeight: "bold" }}>Tax under New Regime</Text>
              <View style={pdfStyles.tableRow}>
                <Text style={pdfStyles.label}>Tax Liability (incl. cess)</Text>
                <Text style={pdfStyles.value}>₹{data.newTax.toLocaleString()}</Text>
              </View>
              <View style={pdfStyles.tableRow}>
                <Text style={pdfStyles.label}>Monthly TDS (approx)</Text>
                <Text style={pdfStyles.value}>₹{Math.round(data.newTax / 12).toLocaleString()}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={pdfStyles.footer}>
          <Text>Amount in words: {toWords(data.taxableIncome || 0)} rupees only.</Text>
          <Text style={{ marginTop: 8 }}>For employer use only. This is a system-generated estimate based on payroll data.</Text>
          <Text style={{ marginTop: 12 }}>Place: ___________________      Signature: ___________________</Text>
        </View>
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

              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Employee</div>
                    <div className="font-medium">{previewData.empName}</div>
                    <div className="text-xs text-muted-foreground">{previewData.designation} • {previewData.site}</div>
                    <div className="mt-3 text-sm">
                      <div>Employee Code: <strong>{previewData.empCode}</strong></div>
                      <div>PAN: <strong>{previewData.pan}</strong></div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Period</div>
                    <div className="font-medium">{periodLabel}</div>
                    <div className="mt-3 text-sm text-muted-foreground">Generated on {format(new Date(), "dd MMM yyyy, HH:mm")}</div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="grid gap-2 md:grid-cols-2">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Salary (Annual)</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between"><span>Basic</span><span>₹{previewData.basic.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span>HRA</span><span>₹{previewData.hra.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span>Conveyance</span><span>₹{previewData.conveyance.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span>Special Allowance</span><span>₹{previewData.special.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span>Other Allowances</span><span>₹{previewData.other.toLocaleString()}</span></div>
                      <div className="border-t pt-2 flex justify-between font-semibold"><span>Gross Total</span><span>₹{previewData.gross.toLocaleString()}</span></div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Deductions (Annual)</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between"><span>Employee PF</span><span>₹{previewData.pfAnnual.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span>ESIC</span><span>₹{previewData.esicAnnual.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span>Professional Tax</span><span>₹{previewData.ptAnnual.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span>LWF</span><span>₹{previewData.lwfAnnual.toLocaleString()}</span></div>
                      <div className="border-t pt-2 flex justify-between font-semibold"><span>Total Deductions</span><span>₹{previewData.totalDeductions.toLocaleString()}</span></div>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <div className="text-xs text-muted-foreground">Taxable Income</div>
                    <div className="text-lg font-medium">₹{previewData.taxableIncome.toLocaleString()}</div>

                    <div className="mt-3 text-sm">
                      <div className="font-medium">Old Regime</div>
                      <div className="flex justify-between"><span>Tax (incl. cess)</span><span>₹{previewData.oldTax.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span>Monthly (approx)</span><span>₹{Math.round(previewData.oldTax/12).toLocaleString()}</span></div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground">Comparison</div>
                    <div className="mt-2 text-sm">
                      <div className="font-medium">New Regime</div>
                      <div className="flex justify-between"><span>Tax (incl. cess)</span><span>₹{previewData.newTax.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span>Monthly (approx)</span><span>₹{Math.round(previewData.newTax/12).toLocaleString()}</span></div>
                    </div>

                    <div className="mt-3">
                      <Badge className="bg-indigo-100 text-indigo-800">
                        Recommended: {previewData.oldTax <= previewData.newTax ? "Old" : "New"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <PDFDownloadLink
                    document={<Form16PDF data={previewData} periodLabel={periodLabel} />}
                    fileName={`Form16_PartB_${previewData.empName.replace(/\s+/g,'_')}_${periodLabel}.pdf`}
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
