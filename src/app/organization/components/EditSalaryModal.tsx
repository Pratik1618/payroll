"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Employee } from "../mock/employees";
import { SalaryComp, DEFAULT_COMPONENTS } from "../types/salary";
import { useSalaryEngine } from "../hooks/useSalaryEngine";
import { SalaryStructureBuilder } from "./SalaryStructureBuilder";

interface EditSalaryModalProps {
  employee: Employee | null;
  onOpenChange: (open: boolean) => void;
  onSave: (newSalary: number) => void;
}

export function EditSalaryModal({ employee, onOpenChange, onSave }: EditSalaryModalProps) {
  const [components, setComponents] = useState<SalaryComp[]>(DEFAULT_COMPONENTS);

  useEffect(() => {
    if (employee) {
      // If we stored the components in the Employee object, we would load them here.
      // For now, we load DEFAULT_COMPONENTS but scale the Basic to roughly match their current salary
      const scaledComponents = DEFAULT_COMPONENTS.map(c => {
        if (c.id === "c_basic") {
          return { ...c, value: employee.monthlySalary * 0.4 }; // Assume Basic is 40% of current salary
        }
        return c;
      });
      setComponents(scaledComponents);
    }
  }, [employee]);

  const calculations = useSalaryEngine(components);

  const handleSave = () => {
    if (calculations.unresolvedComps.length > 0) {
      toast.error("Please fix circular dependencies before saving.");
      return;
    }
    onSave(calculations.grossMonthly);
    toast.success("Salary structure updated successfully.");
    onOpenChange(false);
  };

  return (
    <Dialog open={!!employee} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1200px] sm:max-w-[1200px] w-[95vw] h-[90vh] p-0 overflow-hidden flex flex-col bg-slate-50">
        <DialogHeader className="px-6 py-4 border-b bg-white shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">Edit Salary Structure</DialogTitle>
              <DialogDescription className="text-base mt-1">
                Editing salary components for <span className="font-semibold">{employee?.name}</span> ({employee?.employeeId})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden relative">
          <SalaryStructureBuilder 
            components={components} 
            onChange={setComponents} 
            calculations={calculations} 
          />
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-white shrink-0 items-center justify-between sm:justify-between w-full">
          <div className="text-sm text-slate-500">
            Current Gross: ₹{employee?.monthlySalary.toLocaleString("en-IN")} → New Gross: <strong className="text-slate-900">₹{calculations.grossMonthly.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</strong>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="px-6 shadow-sm" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button className="px-8 shadow-md bg-blue-600 hover:bg-blue-700" onClick={handleSave}>
              Save Salary Structure
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
