"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchUnassignedEmployeesApi, assignEmployeeApi, UnassignedEmployeeItem } from "../services/masterDataService";
import { assignEmployee } from "../mock/employees";
import { organizationData } from "../mock/organization";
import { designations } from "../mock/designations";
import { toast } from "sonner";

interface AddEmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmployeeAssigned?: () => void;
}

export function AddEmployeeModal({ open, onOpenChange, onEmployeeAssigned }: AddEmployeeModalProps) {
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [subDepartmentId, setSubDepartmentId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [unassignedList, setUnassignedList] = useState<UnassignedEmployeeItem[]>([]);

  // Reset form when opened
  useEffect(() => {
    if (open) {
      setSelectedEmpId("");
      setDepartmentId("");
      setSubDepartmentId("");
      setZoneId("");
      loadUnassignedPool();
    }
  }, [open]);

  const loadUnassignedPool = async () => {
    const data = await fetchUnassignedEmployeesApi();
    setUnassignedList(data);
  };

  // Top level departments (children of Company)
  const departments = useMemo(() => {
    return organizationData[0]?.children || [];
  }, []);

  // Sub-departments of the selected department
  const subDepartments = useMemo(() => {
    if (!departmentId) return [];
    const dept = departments.find(d => d.id === departmentId);
    // For Operations, we treat 'ops_heads' and the zones as children.
    // But the user specifically asked for "Zone" as a separate dropdown if Operations is selected.
    // So if Operations is selected, sub-departments could just be the functional sub-groups.
    // Since 'ops_heads' is the only functional subgroup, we can just list it.
    // For others like HR, Finance, Marketing, they have normal children.
    return dept?.children?.filter(c => !c.name.includes("Zone")) || [];
  }, [departmentId, departments]);

  // Zones (only applicable if Operations is selected)
  const zones = useMemo(() => {
    if (departmentId !== "operations") return [];
    const ops = departments.find(d => d.id === "operations");
    return ops?.children?.filter(c => c.name.includes("Zone")) || [];
  }, [departmentId, departments]);

  const handleSave = async () => {
    if (!selectedEmpId || !departmentId) {
      toast.error("Please select at least an employee and a department.");
      return;
    }

    const payload = {
      departmentId,
      subDepartmentId: subDepartmentId || null,
      zoneId: zoneId || null,
      reportingManager: "TBD",
      monthlySalary: 60000,
    };

    const success = await assignEmployeeApi(selectedEmpId, payload);
    if (success) {
      toast.success("Employee assigned successfully!");
      if (onEmployeeAssigned) onEmployeeAssigned();
      onOpenChange(false);
    } else {
      toast.error("Failed to assign employee.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Employee</DialogTitle>
          <DialogDescription>
            Map an unassigned employee from HRMS to a department in the organization.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          
          <div className="grid gap-2">
            <Label htmlFor="employee">Choose Employee</Label>
            <Select value={selectedEmpId} onValueChange={setSelectedEmpId}>
              <SelectTrigger id="employee">
                <SelectValue placeholder="Select an employee" />
              </SelectTrigger>
              <SelectContent>
                {unassignedList.length === 0 ? (
                  <SelectItem value="none" disabled>No unassigned employees available</SelectItem>
                ) : (
                  unassignedList.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name} - {emp.designation}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="department">Choose Department</Label>
            <Select 
              value={departmentId} 
              onValueChange={(val) => {
                setDepartmentId(val);
                setSubDepartmentId("");
                setZoneId("");
              }}
            >
              <SelectTrigger id="department">
                <SelectValue placeholder="Select a department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {subDepartments.length > 0 && (
            <div className="grid gap-2">
              <Label htmlFor="subDepartment">Choose Sub Department (Optional)</Label>
              <Select value={subDepartmentId} onValueChange={setSubDepartmentId}>
                <SelectTrigger id="subDepartment">
                  <SelectValue placeholder="Select a sub department" />
                </SelectTrigger>
                <SelectContent>
                  {/* Radix UI Select requires all items to have value, use "none" for reset */}
                  <SelectItem value="none">None</SelectItem>
                  {subDepartments.map(sub => (
                    <SelectItem key={sub.id} value={sub.id}>
                      {sub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {departmentId === "operations" && zones.length > 0 && (
            <div className="grid gap-2">
              <Label htmlFor="zone">Choose Zone (Optional)</Label>
              <Select value={zoneId} onValueChange={setZoneId}>
                <SelectTrigger id="zone">
                  <SelectValue placeholder="Select a zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {zones.map(zone => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Assignment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
