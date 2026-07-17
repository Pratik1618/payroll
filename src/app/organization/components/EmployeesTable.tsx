"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { employeesData, removeEmployee, transferEmployee, updateEmployee, Employee } from "../mock/employees";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit2, Replace, Trash2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { organizationData } from "../mock/organization";
import { EditSalaryModal } from "./EditSalaryModal";

const AvatarPlaceholder = ({ name }: { name: string }) => {
  const initials = name.split(" ").map((n) => n[0]).join("").substring(0, 2);
  return (
    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
      {initials}
    </div>
  );
};

export function EmployeesTable({ nodeId }: { nodeId?: string }) {
  // We use local state to trigger re-renders since we mutate the array directly
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [editingSalaryEmp, setEditingSalaryEmp] = useState<Employee | null>(null);
  const [transferringEmp, setTransferringEmp] = useState<Employee | null>(null);

  // Edit State
  const [editDesignation, setEditDesignation] = useState("");
  const [editSalary, setEditSalary] = useState(0);
  const [editZones, setEditZones] = useState<string[]>([]);

  // Transfer State
  const [transferDeptId, setTransferDeptId] = useState("");
  const [transferSubDeptId, setTransferSubDeptId] = useState("");
  const [transferZoneId, setTransferZoneId] = useState("");

  const AVAILABLE_ZONES = ["West", "East", "North", "South"];

  const forceUpdate = () => setRefreshKey(prev => prev + 1);

  const filteredEmployees = nodeId 
    ? employeesData.filter((emp) => emp.nodeId === nodeId)
    : employeesData;

  const handleRemove = (empId: string) => {
    removeEmployee(empId);
    toast.success("Employee removed and sent back to unassigned pool.");
    forceUpdate();
  };

  const openEdit = (emp: Employee) => {
    setEditingEmp(emp);
    setEditDesignation(emp.designation);
    setEditSalary(emp.monthlySalary);
    setEditZones(emp.coveredZones ? [...emp.coveredZones] : []);
  };

  const saveEdit = () => {
    if (editingEmp) {
      updateEmployee(editingEmp.id, { 
        designation: editDesignation, 
        monthlySalary: editSalary,
        coveredZones: editZones.length > 0 ? editZones : undefined
      });
      toast.success("Employee details updated.");
      setEditingEmp(null);
      forceUpdate();
    }
  };

  const openTransfer = (emp: Employee) => {
    setTransferringEmp(emp);
    setTransferDeptId("");
    setTransferSubDeptId("");
    setTransferZoneId("");
  };

  const saveTransfer = () => {
    if (transferringEmp && transferDeptId) {
      const depts = organizationData[0].children || [];
      const dept = depts.find(d => d.id === transferDeptId);
      
      let targetId = transferDeptId;
      let targetName = dept?.name || "Unknown";

      if (transferZoneId && transferZoneId !== "none") {
        const zone = dept?.children?.find(z => z.id === transferZoneId);
        if (zone) {
          targetId = zone.id;
          targetName = zone.name;
        }
      } else if (transferSubDeptId && transferSubDeptId !== "none") {
        const subDept = dept?.children?.find(s => s.id === transferSubDeptId);
        if (subDept) {
          targetId = subDept.id;
          targetName = subDept.name;
        }
      }
      
      transferEmployee(transferringEmp.id, targetId, targetName);
      toast.success("Employee transferred successfully.");
      setTransferringEmp(null);
      forceUpdate();
    }
  };

  if (filteredEmployees.length === 0) {
    return (
      <div className="mt-8 text-center p-8 border border-dashed rounded-lg text-muted-foreground">
        No employees assigned directly to this organizational unit.
      </div>
    );
  }

  const departments = organizationData[0]?.children || [];
  
  const transferSubDepartments = transferDeptId 
    ? departments.find(d => d.id === transferDeptId)?.children?.filter(c => !c.name.includes("Zone")) || [] 
    : [];

  const transferZones = transferDeptId === "operations"
    ? departments.find(d => d.id === "operations")?.children?.filter(c => c.name.includes("Zone")) || []
    : [];

  return (
    <div className="mt-4 border rounded-md overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Employee ID</TableHead>
            <TableHead>Designation</TableHead>
            <TableHead>Department / Zones</TableHead>
            <TableHead className="text-right">Monthly Salary</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEmployees.map((emp) => (
            <TableRow key={emp.id} className="hover:bg-muted/20">
              <TableCell className="flex items-center gap-3 py-3">
                <AvatarPlaceholder name={emp.name} />
                <span className="font-medium">{emp.name}</span>
              </TableCell>
              <TableCell className="text-muted-foreground">{emp.employeeId}</TableCell>
              <TableCell>{emp.designation}</TableCell>
              <TableCell>
                {emp.coveredZones && emp.coveredZones.length > 0 ? (
                  <div className="flex gap-1 flex-wrap">
                    {emp.coveredZones.map(z => (
                      <Badge key={z} variant="outline" className="text-[10px] h-5 px-1.5">{z}</Badge>
                    ))}
                  </div>
                ) : (
                  emp.department
                )}
              </TableCell>
              <TableCell className="text-right font-medium">₹{emp.monthlySalary.toLocaleString("en-IN")}</TableCell>
              <TableCell>
                <Badge variant={emp.status === "Active" ? "default" : "secondary"} className="font-normal">
                  {emp.status}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(emp)}>
                      <Edit2 className="mr-2 h-4 w-4" /> Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setEditingSalaryEmp(emp)}>
                      <Wallet className="mr-2 h-4 w-4" /> Edit Salary
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openTransfer(emp)}>
                      <Replace className="mr-2 h-4 w-4" /> Transfer
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRemove(emp.id)} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" /> Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit Dialog */}
      <Dialog open={!!editingEmp} onOpenChange={(open) => !open && setEditingEmp(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Employee Details</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Designation</Label>
              <Input value={editDesignation} onChange={(e) => setEditDesignation(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Monthly Salary</Label>
              <Input type="number" value={editSalary} onChange={(e) => setEditSalary(Number(e.target.value))} />
            </div>
            {editingEmp?.coveredZones !== undefined && (
              <div className="grid gap-2 mt-2">
                <Label>Covered Zones</Label>
                <div className="flex flex-wrap gap-4 mt-1">
                  {AVAILABLE_ZONES.map(zone => (
                    <div key={zone} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`edit-zone-${zone}`}
                        checked={editZones.includes(zone)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setEditZones(prev => [...prev, zone]);
                          } else {
                            setEditZones(prev => prev.filter(z => z !== zone));
                          }
                        }}
                      />
                      <Label htmlFor={`edit-zone-${zone}`} className="font-normal cursor-pointer text-sm">
                        {zone}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingEmp(null)}>Cancel</Button>
            <Button onClick={saveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={!!transferringEmp} onOpenChange={(open) => !open && setTransferringEmp(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Employee</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Select New Department</Label>
              <Select 
                value={transferDeptId} 
                onValueChange={(val) => {
                  setTransferDeptId(val);
                  setTransferSubDeptId("");
                  setTransferZoneId("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {transferSubDepartments.length > 0 && (
              <div className="grid gap-2">
                <Label>Select Sub Department (Optional)</Label>
                <Select value={transferSubDeptId} onValueChange={setTransferSubDeptId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Sub Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {transferSubDepartments.map(sub => (
                      <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {transferDeptId === "operations" && transferZones.length > 0 && (
              <div className="grid gap-2">
                <Label>Select Zone (Optional)</Label>
                <Select value={transferZoneId} onValueChange={setTransferZoneId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Zone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {transferZones.map(zone => (
                      <SelectItem key={zone.id} value={zone.id}>{zone.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferringEmp(null)}>Cancel</Button>
            <Button onClick={saveTransfer}>Transfer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditSalaryModal
        employee={editingSalaryEmp}
        onOpenChange={(open) => !open && setEditingSalaryEmp(null)}
        onSave={(newSalary) => {
          if (editingSalaryEmp) {
            updateEmployee(editingSalaryEmp.id, { monthlySalary: newSalary });
            forceUpdate();
          }
        }}
      />
    </div>
  );
}
