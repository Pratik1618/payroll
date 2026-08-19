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
import { OrganizationNode, DesignationQuantity } from "../mock/organization";
import { createDepartmentApi, fetchDesignations, fetchOrgTree } from "../services/masterDataService";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AddDepartmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDepartmentCreated?: () => void;
}

export function AddDepartmentModal({ open, onOpenChange, onDepartmentCreated }: AddDepartmentModalProps) {
  const [deptName, setDeptName] = useState("");
  const [deptHead, setDeptHead] = useState("");
  const [description, setDescription] = useState("");
  const [deptType, setDeptType] = useState<"root" | "sub">("root");
  const [parentDeptId, setParentDeptId] = useState("");
  const [designationQuantities, setDesignationQuantities] = useState<DesignationQuantity[]>([]);
  const [selectedDesignation, setSelectedDesignation] = useState("");
  const [designationQty, setDesignationQty] = useState<number>(1);
  const [availableDesignations, setAvailableDesignations] = useState<string[]>([]);
  const [departments, setDepartments] = useState<OrganizationNode[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when opened
  useEffect(() => {
    if (open) {
      setDeptName("");
      setDeptHead("");
      setDescription("");
      setDeptType("root");
      setParentDeptId("");
      setDesignationQuantities([]);
      setSelectedDesignation("");
      setDesignationQty(1);
      loadDesignationsList();
      loadDepartmentsList();
    }
  }, [open]);

  const loadDesignationsList = async () => {
    const list = await fetchDesignations();
    setAvailableDesignations(list);
  };

  // Top level departments (children of Company), from the real org tree.
  const loadDepartmentsList = async () => {
    const tree = await fetchOrgTree();
    setDepartments(tree[0]?.children || []);
  };

  const handleAddDesignationQty = () => {
    if (!selectedDesignation) {
      toast.error("Please select a designation.");
      return;
    }
    if (designationQty <= 0) {
      toast.error("Quantity must be at least 1.");
      return;
    }

    if (designationQuantities.some(d => d.designation === selectedDesignation)) {
      toast.error("This designation has already been added.");
      return;
    }

    setDesignationQuantities(prev => [...prev, { designation: selectedDesignation, quantity: designationQty }]);
    setSelectedDesignation("");
    setDesignationQty(1);
  };

  const handleRemoveDesignationQty = (designationName: string) => {
    setDesignationQuantities(prev => prev.filter(d => d.designation !== designationName));
  };

  const handleSave = async () => {
    if (!deptName.trim()) {
      toast.error("Department Name is required.");
      return;
    }
    
    if (deptType === "sub" && !parentDeptId) {
      toast.error("Please select a parent department.");
      return;
    }

    setIsSubmitting(true);
    const created = await createDepartmentApi({
      name: deptName.trim(),
      head: deptHead.trim() || "TBD",
      parentId: deptType === "root" ? "company" : parentDeptId,
      description: description.trim() || undefined,
      designationQuantities: designationQuantities.length > 0 ? designationQuantities : undefined,
    });
    setIsSubmitting(false);

    if (created) {
      toast.success(`Department '${deptName.trim()}' has been added successfully!`);
      if (onDepartmentCreated) onDepartmentCreated();
      onOpenChange(false);
    } else {
      toast.error("Failed to create department. Please try again.");
    }
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

          {/* Designation Headcount Quantity Allocation */}
          <div className="grid gap-2 pt-2 border-t">
            <Label className="font-semibold text-xs">Set Designation Headcount Quantities</Label>
            <div className="flex items-center gap-2">
              <Select value={selectedDesignation} onValueChange={setSelectedDesignation}>
                <SelectTrigger className="flex-1 text-xs">
                  <SelectValue placeholder="Select Designation" />
                </SelectTrigger>
                <SelectContent>
                  {availableDesignations.map((d) => (
                    <SelectItem key={d} value={d} className="text-xs">
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min={1}
                value={designationQty}
                onChange={(e) => setDesignationQty(Number(e.target.value))}
                className="w-20 text-xs"
                placeholder="Qty"
              />
              <Button type="button" size="sm" variant="secondary" onClick={handleAddDesignationQty} className="h-9 px-3">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {designationQuantities.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2 max-h-28 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-900 border rounded-md">
                {designationQuantities.map((item) => (
                  <div key={item.designation} className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-800 border rounded-md text-xs font-medium shadow-sm">
                    <span>{item.designation}</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">({item.quantity})</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDesignationQty(item.designation)}
                      className="text-slate-400 hover:text-red-600 transition-colors ml-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Create Department"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
