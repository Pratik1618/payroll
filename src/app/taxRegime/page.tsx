"use client";

import React, { useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MainLayout } from "@/components/ui/layout/main-layout";

interface Employee {
  empId: string;
  name: string;
  grossSalary: number; // monthly
  deductions: number;  // annual deductions for Old regime
  taxRegime: "Old" | "New";
  pan: string;
  clientId?: string;
  siteId?: string;
}

const mockClients = [
  { id: "client-1", name: "ABC Corporation" },
  { id: "client-2", name: "XYZ Industries" },
  { id: "client-3", name: "Global Tech" },
];

const mockSites = [
  { id: "site-a", name: "Corporate Office", clientId: "client-1" },
  { id: "site-b", name: "Manufacturing Unit", clientId: "client-1" },
  { id: "site-c", name: "Warehouse", clientId: "client-2" },
  { id: "site-d", name: "Distribution Center", clientId: "client-2" },
  { id: "site-e", name: "Tech Hub", clientId: "client-3" },
];

const dummyEmployees: Employee[] = [
  { empId: "EMP001", name: "John Doe", grossSalary: 50000, deductions: 100000, taxRegime: "Old", pan: "ABCDE1234F", clientId: "client-1", siteId: "site-a" },
  { empId: "EMP002", name: "Jane Smith", grossSalary: 70000, deductions: 120000, taxRegime: "New", pan: "XYZAB5678K", clientId: "client-2", siteId: "site-c" },
  { empId: "EMP003", name: "Mike Johnson", grossSalary: 45000, deductions: 80000, taxRegime: "Old", pan: "LMNOP2345Q", clientId: "client-1", siteId: "site-b" },
];

// Tax slabs
// Updated Tax slabs for FY 2025-26
const taxSlabs = {
  Old: [
    { upto: 250000, rate: 0 },          // Up to ₹2.5 lakh
    { upto: 500000, rate: 5 },          // ₹2.5 lakh – ₹5 lakh
    { upto: 1000000, rate: 20 },        // ₹5 lakh – ₹10 lakh
    { upto: Infinity, rate: 30 },       // Above ₹10 lakh
  ],
  New: [
    { upto: 400000, rate: 0 },          // Up to ₹4 lakh
    { upto: 800000, rate: 5 },          // ₹4 lakh – ₹8 lakh
    { upto: 1200000, rate: 10 },        // ₹8 lakh – ₹12 lakh
    { upto: 1600000, rate: 15 },        // ₹12 lakh – ₹16 lakh
    { upto: 2000000, rate: 20 },        // ₹16 lakh – ₹20 lakh
    { upto: 2400000, rate: 25 },        // ₹20 lakh – ₹24 lakh
    { upto: Infinity, rate: 30 },       // Above ₹24 lakh
  ],
};

// Calculate annual tax
const calculateAnnualTax = (annualIncome: number, regime: "Old" | "New", deductions: number) => {
  const taxableIncome = regime === "Old" ? Math.max(annualIncome - deductions, 0) : annualIncome;
  const slabs = taxSlabs[regime];
  let tax = 0;
  let previousLimit = 0;

  for (let slab of slabs) {
    if (taxableIncome > slab.upto) {
      tax += (slab.upto - previousLimit) * (slab.rate / 100);
      previousLimit = slab.upto;
    } else {
      tax += (taxableIncome - previousLimit) * (slab.rate / 100);
      break;
    }
  }
  return Math.round(tax);
};

export default function TaxRegimePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState(dummyEmployees);

  // New state for client/site filters
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedSite, setSelectedSite] = useState<string>("");

  const getSitesForClient = (clientId: string) =>
    mockSites.filter((s) => s.clientId === clientId);

  const filteredEmployees = employees.filter(emp =>
    (emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.empId.toLowerCase().includes(searchTerm.toLowerCase())) &&
    // client filter
    (selectedClient === "" || emp.clientId === selectedClient) &&
    // site filter
    (selectedSite === "" || emp.siteId === selectedSite)
  );

  const handleUpdateRegime = (empId: string, newRegime: Employee["taxRegime"]) => {
    setEmployees(employees.map(emp =>
      emp.empId === empId ? { ...emp, taxRegime: newRegime } : emp
    ));
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tax Regime</h1>
          <p className="text-muted-foreground">Manage employees' tax regime and see estimated tax impact.</p>
        </div>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(["Old", "New"] as const).map(regime => (
            <Card key={regime} className="p-4">
              <CardTitle className="text-lg font-semibold">{regime} Regime Slabs</CardTitle>
              <ul className="mt-2 text-sm">
                {taxSlabs[regime].map((slab, idx) => (
                  <li key={idx}>
                    Up to ₹{slab.upto === Infinity ? "∞" : slab.upto.toLocaleString()} → {slab.rate}%
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-4 items-start sm:items-center">
              <Input
                type="text"
                placeholder="Search employee..."
                className="w-full sm:max-w-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {/* Client filter */}
              <div className="w-full sm:w-auto">
             
                <select
                  value={selectedClient}
                  onChange={(e) => {
                    setSelectedClient(e.target.value);
                    // reset site when client changes
                    setSelectedSite("");
                  }}
                  className="rounded-md border px-2 py-1"
                >
                  <option value="">All Clients</option>
                  {mockClients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Site filter */}
              <div className="w-full sm:w-auto">
               
                <select
                  value={selectedSite}
                  onChange={(e) => setSelectedSite(e.target.value)}
                  className="rounded-md border px-2 py-1"
                  disabled={!selectedClient}
                >
                  <option value="">All Sites</option>
                  {(selectedClient ? getSitesForClient(selectedClient) : mockSites).map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Gross Salary (Monthly)</TableHead>
                    <TableHead>Gross Salary (Annual)</TableHead>
                    <TableHead>Deductions (Annual)</TableHead>
                    <TableHead>Tax Regime</TableHead>
                    <TableHead>Tax (Old)</TableHead>
                    <TableHead>Tax (New)</TableHead>
                    <TableHead>Monthly TDS</TableHead>
                    <TableHead>Better Regime</TableHead>
                    <TableHead>PAN</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-6 text-muted-foreground">
                        No records found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEmployees.map(emp => {
                      const annualIncome = emp.grossSalary * 12;
                      const taxOld = calculateAnnualTax(annualIncome, "Old", emp.deductions);
                      const taxNew = calculateAnnualTax(annualIncome, "New", emp.deductions);
                      const annualTax = emp.taxRegime === "Old" ? taxOld : taxNew;
                      const monthlyTDS = Math.round(annualTax / 12);

                      const betterRegime = taxOld < taxNew ? "Old" : taxNew < taxOld ? "New" : "Equal";
                      const saving = Math.abs(taxOld - taxNew);

                      return (
                        <TableRow key={emp.empId}>
                          <TableCell>
                            <div className="font-medium">{emp.name}</div>
                            <div className="text-xs text-muted-foreground">{emp.empId}</div>
                            <div className="text-xs text-muted-foreground">
                              {emp.clientId ? mockClients.find(c => c.id === emp.clientId)?.name : ""}{" "}
                              {emp.siteId ? `• ${mockSites.find(s => s.id === emp.siteId)?.name}` : ""}
                            </div>
                          </TableCell>
                          <TableCell>₹{emp.grossSalary.toLocaleString()}</TableCell>
                          <TableCell>₹{annualIncome.toLocaleString()}</TableCell>
                          <TableCell>₹{emp.deductions.toLocaleString()}</TableCell>
                          <TableCell>
                            <select
                              className="rounded-md border px-2 py-1"
                              value={emp.taxRegime}
                              onChange={(e) =>
                                handleUpdateRegime(emp.empId, e.target.value as Employee["taxRegime"])
                              }
                            >
                              <option value="Old">Old</option>
                              <option value="New">New</option>
                            </select>
                          </TableCell>
                          <TableCell>
                            <Card className={`p-2 text-center ${taxOld <= taxNew ? "bg-green-100" : "bg-red-100"}`}>
                              <CardTitle className="text-sm font-medium">₹{taxOld.toLocaleString()}</CardTitle>
                              <div className="text-xs text-muted-foreground">Annual</div>
                            </Card>
                          </TableCell>
                          <TableCell>
                            <Card className={`p-2 text-center ${taxNew <= taxOld ? "bg-green-100" : "bg-red-100"}`}>
                              <CardTitle className="text-sm font-medium">₹{taxNew.toLocaleString()}</CardTitle>
                              <div className="text-xs text-muted-foreground">Annual</div>
                            </Card>
                          </TableCell>
                          <TableCell>₹{monthlyTDS.toLocaleString()}</TableCell>
                          <TableCell>
                            {betterRegime === "Equal" ? "Equal" : `${betterRegime} (₹${saving.toLocaleString()} saved)`}
                          </TableCell>
                          <TableCell>{emp.pan}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Slabs info */}
        
      </div>
    </MainLayout>
  );
}
