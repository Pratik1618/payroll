// TaxRegimeModal.tsx
"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Employee {
  empId: string;
  name: string;
  grossSalary: number;
  deductions: number;
  tdsDeducted: number;
  taxRegime: "Old" | "New";
  pan: string;
}

interface Props {
  employee: Employee;
  onClose: () => void;
  onUpdateRegime: (empId: string, newRegime: Employee["taxRegime"]) => void;
}

export function TaxRegimeModal({ employee, onClose, onUpdateRegime }: Props) {
  const [selectedRegime, setSelectedRegime] = useState<Employee["taxRegime"]>(employee.taxRegime);

  const handleSave = () => {
    onUpdateRegime(employee.empId, selectedRegime);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tax Details - {employee.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p><strong>Employee ID:</strong> {employee.empId}</p>
            <p><strong>Gross Salary:</strong> ₹{employee.grossSalary.toLocaleString()}</p>
            <p><strong>Deductions:</strong> ₹{employee.deductions.toLocaleString()}</p>
            <p><strong>TDS Deducted:</strong> ₹{employee.tdsDeducted.toLocaleString()}</p>
            <p><strong>PAN:</strong> {employee.pan}</p>
          </div>

          <div>
            <label className="block mb-1 font-medium">Tax Regime</label>
            <select
              className="w-full rounded-md border px-3 py-2"
              value={selectedRegime}
              onChange={(e) => setSelectedRegime(e.target.value as Employee["taxRegime"])}
            >
              <option value="Old">Old</option>
              <option value="New">New</option>
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
