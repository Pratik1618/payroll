// TaxRegimePage.tsx
"use client";

import React, { useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/ui/layout/main-layout";
import { Eye } from "lucide-react";
import { TaxRegimeModal } from "@/components/ui/taxRegime/taxRegimeModal";

interface Employee {
  empId: string;
  name: string;
  grossSalary: number;
  deductions: number;
  tdsDeducted: number;
  taxRegime: "Old" | "New";
  pan: string;
}

const dummyEmployees: Employee[] = [
  { empId: "EMP001", name: "John Doe", grossSalary: 50000, deductions: 10000, tdsDeducted: 5000, taxRegime: "Old", pan: "ABCDE1234F" },
  { empId: "EMP002", name: "Jane Smith", grossSalary: 70000, deductions: 12000, tdsDeducted: 8000, taxRegime: "New", pan: "XYZAB5678K" },
  { empId: "EMP003", name: "Mike Johnson", grossSalary: 45000, deductions: 8000, tdsDeducted: 4000, taxRegime: "Old", pan: "LMNOP2345Q" },
];

export default function TaxRegimePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employees, setEmployees] = useState(dummyEmployees);

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.empId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateRegime = (empId: string, newRegime: Employee["taxRegime"]) => {
    setEmployees(employees.map(emp =>
      emp.empId === empId ? { ...emp, taxRegime: newRegime } : emp
    ));
    if (selectedEmployee?.empId === empId) {
      setSelectedEmployee({ ...selectedEmployee, taxRegime: newRegime });
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tax Regime</h1>
          <p className="text-muted-foreground">Manage employees' tax regime and TDS details.</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <Input
                type="text"
                placeholder="Search employee..."
                className="w-full sm:max-w-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Gross Salary</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>TDS Deducted</TableHead>
                    <TableHead>Tax Regime</TableHead>
                    <TableHead>PAN</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        No records found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEmployees.map(emp => (
                      <TableRow key={emp.empId}>
                        <TableCell>
                          <div className="font-medium">{emp.name}</div>
                          <div className="text-xs text-muted-foreground">{emp.empId}</div>
                        </TableCell>
                        <TableCell>₹{emp.grossSalary.toLocaleString()}</TableCell>
                        <TableCell>₹{emp.deductions.toLocaleString()}</TableCell>
                        <TableCell>₹{emp.tdsDeducted.toLocaleString()}</TableCell>
                        <TableCell>{emp.taxRegime}</TableCell>
                        <TableCell>{emp.pan}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedEmployee(emp)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedEmployee && (
        <TaxRegimeModal
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          onUpdateRegime={handleUpdateRegime}
        />
      )}
    </MainLayout>
  );
}
