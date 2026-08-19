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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { AlertTriangle, Users, FolderTree, ShieldAlert, ArrowRight } from "lucide-react";
import { OrganizationNode } from "../mock/organization";

import { inspectDepartmentDependenciesApi, safeDeleteDepartmentApi, fetchOrgTree, DepartmentDependenciesResult } from "../services/masterDataService";

interface SafeDeleteDepartmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  node: OrganizationNode | null;
  onDeleteSuccess?: () => void;
}

export function SafeDeleteDepartmentModal({
  open,
  onOpenChange,
  node,
  onDeleteSuccess,
}: SafeDeleteDepartmentModalProps) {
  const [confirmName, setConfirmName] = useState("");
  const [employeeAction, setEmployeeAction] = useState<"reassign" | "unassign">("reassign");
  const [targetDeptId, setTargetDeptId] = useState("");
  const [dependencies, setDependencies] = useState<DepartmentDependenciesResult>({
    departmentId: "",
    departmentName: "",
    assignedEmployeesCount: 0,
    childDepartmentsCount: 0,
    childDepartmentNames: [],
  });
  const [dependenciesLoadFailed, setDependenciesLoadFailed] = useState(false);
  const [availableTargetDepartments, setAvailableTargetDepartments] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (open && node) {
      setConfirmName("");
      setEmployeeAction("reassign");
      setTargetDeptId("");
      setDependenciesLoadFailed(false);
      loadDependencies(node.id);
      loadTargetDepartments(node.id);
    }
  }, [open, node]);

  const loadDependencies = async (deptId: string) => {
    const res = await inspectDepartmentDependenciesApi(deptId);
    if (res) {
      setDependencies(res);
    } else {
      // Don't fabricate a dependency count on API failure - that could
      // make a delete look safe when we actually don't know the real
      // impact. Block the confirm-name flow via dependenciesLoadFailed
      // instead.
      setDependenciesLoadFailed(true);
    }
  };

  // Flatten all departments except the current node for target reassignment dropdown
  const loadTargetDepartments = async (deptId: string) => {
    const tree = await fetchOrgTree();
    const result: { id: string; name: string }[] = [];

    const traverse = (nodes: OrganizationNode[]) => {
      for (const n of nodes) {
        if (n.id !== deptId && n.id !== "company") {
          result.push({ id: n.id, name: n.name });
        }
        if (n.children) {
          traverse(n.children);
        }
      }
    };

    traverse(tree);
    setAvailableTargetDepartments(result);
  };

  if (!node) return null;

  const isNameMatched = confirmName.trim() === node.name.trim();
  const requiresReassignTarget = dependencies.assignedEmployeesCount > 0 && employeeAction === "reassign";
  const isTargetSelected = !requiresReassignTarget || targetDeptId !== "";
  const isDeleteEnabled = isNameMatched && isTargetSelected && !dependenciesLoadFailed;

  const handleDelete = async () => {
    if (!isDeleteEnabled) return;

    const success = await safeDeleteDepartmentApi(node.id, {
      confirmName: confirmName.trim(),
      employeeAction,
      targetDeptId: employeeAction === "reassign" ? targetDeptId : undefined,
    });

    if (success) {
      toast.success(`Department '${node.name}' safely deleted.`);
      onOpenChange(false);
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } else {
      toast.error("Failed to delete department. Root organization node cannot be deleted.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <div className="p-2 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-destructive">Delete Department Safeguard</DialogTitle>
              <DialogDescription className="text-xs">
                Manage dependencies and confirm deletion for <span className="font-semibold text-foreground">{node.name}</span>.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          {dependenciesLoadFailed && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-destructive text-xs font-medium">
              Could not load real dependency data for this department. Deletion is disabled until this can be verified.
            </div>
          )}
          {/* Impact Warning Banner */}
          <div className="rounded-lg border border-amber-200 bg-amber-50/80 dark:bg-amber-950/30 p-3 text-amber-800 dark:text-amber-200 space-y-2">
            <div className="flex items-center gap-2 font-medium text-xs">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
              Dependency Inspection Impact:
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs pl-6">
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-amber-700" />
                <span>Assigned Employees: <strong>{dependencies.assignedEmployeesCount}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <FolderTree className="h-3.5 w-3.5 text-amber-700" />
                <span>Sub-departments: <strong>{dependencies.childDepartmentsCount}</strong></span>
              </div>
            </div>
          </div>

          {/* Child Sub-departments Handling */}
          {dependencies.childDepartmentsCount > 0 && (
            <div className="p-3 bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 rounded-md text-xs text-blue-800 dark:text-blue-200">
              <span className="font-semibold">Sub-department Preservation:</span> {dependencies.childDepartmentNames.join(", ")} will automatically be re-parented to the parent level to prevent broken tree links.
            </div>
          )}

          {/* Employee Action Options */}
          {dependencies.assignedEmployeesCount > 0 && (
            <div className="space-y-3 p-3 bg-muted/30 rounded-md border">
              <Label className="font-semibold text-xs flex items-center gap-1.5">
                <Users className="h-4 w-4 text-primary" />
                How should the {dependencies.assignedEmployeesCount} employees be handled? *
              </Label>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="empAction"
                    checked={employeeAction === "reassign"}
                    onChange={() => setEmployeeAction("reassign")}
                    className="accent-primary"
                  />
                  <span>Reassign employees to another department</span>
                </label>

                {employeeAction === "reassign" && (
                  <div className="pl-6 pt-1">
                    <Select value={targetDeptId} onValueChange={setTargetDeptId}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Select target department..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTargetDepartments.map((d) => (
                          <SelectItem key={d.id} value={d.id} className="text-xs">
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <label className="flex items-center gap-2 cursor-pointer text-xs pt-1">
                  <input
                    type="radio"
                    name="empAction"
                    checked={employeeAction === "unassign"}
                    onChange={() => setEmployeeAction("unassign")}
                    className="accent-primary"
                  />
                  <span>Move employees to Unassigned Pool</span>
                </label>
              </div>
            </div>
          )}

          {/* Type Department Name Confirmation */}
          <div className="space-y-2 pt-2 border-t">
            <Label htmlFor="confirmDeptName" className="text-xs font-medium">
              To prevent accidental deletion, type <span className="font-bold text-destructive">{node.name}</span> to confirm:
            </Label>
            <Input
              id="confirmDeptName"
              placeholder={`Type "${node.name}"...`}
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={!isDeleteEnabled}
            onClick={handleDelete}
            className="gap-1.5"
          >
            Confirm Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
