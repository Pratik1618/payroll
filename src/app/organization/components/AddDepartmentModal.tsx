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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { organizationData, addDepartment } from "../mock/organization";
import { toast } from "sonner";

interface AddDepartmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddDepartmentModal({ open, onOpenChange }: AddDepartmentModalProps) {
  const [deptName, setDeptName] = useState("");
  const [deptHead, setDeptHead] = useState("");
  const [description, setDescription] = useState("");
  const [deptType, setDeptType] = useState<"root" | "sub">("root");
  const [parentDeptId, setParentDeptId] = useState("");

  // Reset form when opened
  useEffect(() => {
    if (open) {
      setDeptName("");
      setDeptHead("");
      setDescription("");
      setDeptType("root");
      setParentDeptId("");
    }
  }, [open]);

  // Top level departments (children of Company)
  const departments = useMemo(() => {
    return organizationData[0]?.children || [];
  }, [open]); // Refresh when opened

  const handleSave = () => {
    if (!deptName.trim()) {
      toast.error("Department Name is required.");
      return;
    }
    
    if (deptType === "sub" && !parentDeptId) {
      toast.error("Please select a parent department.");
      return;
    }

    addDepartment({
      name: deptName,
      head: deptHead || "TBD",
      description: description,
    }, deptType === "root" ? "company" : parentDeptId);

    toast.success(`${deptName} has been added successfully!`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Department</DialogTitle>
          <DialogDescription>
            Create a new department or sub-department in the organization.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          
          <div className="grid gap-2">
            <Label htmlFor="deptName">Department Name *</Label>
            <Input 
              id="deptName" 
              placeholder="e.g. Quality Assurance" 
              value={deptName} 
              onChange={(e) => setDeptName(e.target.value)} 
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="deptHead">Department Head</Label>
            <Input 
              id="deptHead" 
              placeholder="e.g. Jane Doe" 
              value={deptHead} 
              onChange={(e) => setDeptHead(e.target.value)} 
            />
          </div>

          <div className="grid gap-2 py-2">
            <Label>Department Level</Label>
            <RadioGroup 
              value={deptType} 
              onValueChange={(val) => {
                setDeptType(val as "root" | "sub");
                setParentDeptId("");
              }}
              className="flex items-center space-x-4 mt-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="root" id="r1" />
                <Label htmlFor="r1" className="font-normal cursor-pointer">Root Department</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sub" id="r2" />
                <Label htmlFor="r2" className="font-normal cursor-pointer">Sub-Department</Label>
              </div>
            </RadioGroup>
          </div>

          {deptType === "sub" && (
            <div className="grid gap-2">
              <Label htmlFor="parentDept">Parent Department *</Label>
              <Select value={parentDeptId} onValueChange={setParentDeptId}>
                <SelectTrigger id="parentDept">
                  <SelectValue placeholder="Select parent department" />
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
          )}

          <div className="grid gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea 
              id="description" 
              placeholder="Brief description of this department's role..." 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Create Department</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
