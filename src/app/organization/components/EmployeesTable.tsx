import { useState, useEffect, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Employee } from "../mock/employees";
import { fetchEmployeesApi, editEmployeeApi, transferEmployeeApi, unassignEmployeeApi, fetchOrgTree } from "../services/masterDataService";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit2, Replace, Trash2, Wallet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { OrganizationNode } from "../mock/organization";
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
  const [employeesList, setEmployeesList] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
  const [departments, setDepartments] = useState<OrganizationNode[]>([]);

  useEffect(() => {
    loadEmployees();
    void fetchOrgTree().then((tree) => setDepartments(tree[0]?.children || []));
  }, [nodeId]);

  const loadEmployees = async () => {
    setIsLoading(true);
    const data = await fetchEmployeesApi(nodeId);
    setEmployeesList(data);
    setIsLoading(false);
  };

  const handleRemove = async (empId: string) => {
    const success = await unassignEmployeeApi(empId);
    if (success) {
      toast.success("Employee removed and sent back to unassigned pool.");
      loadEmployees();
    } else {
      toast.error("Failed to unassign employee.");
    }
  };

  const openEdit = (emp: Employee) => {
    setEditingEmp(emp);
    setEditDesignation(emp.designation);
    setEditSalary(emp.monthlySalary);
    setEditZones(emp.coveredZones ? [...emp.coveredZones] : []);
  };

  const saveEdit = async () => {
    if (editingEmp) {
      const payload: Partial<Employee> = {
        designation: editDesignation,
        monthlySalary: editSalary,
        coveredZones: editZones.length > 0 ? editZones : undefined,
      };

      const success = await editEmployeeApi(editingEmp.id, payload);
      if (success) {
        toast.success("Employee details updated.");
        setEditingEmp(null);
        loadEmployees();
      } else {
        toast.error("Failed to update employee details.");
      }
    }
  };

  const openTransfer = (emp: Employee) => {
    setTransferringEmp(emp);
    setTransferDeptId("");
    setTransferSubDeptId("");
    setTransferZoneId("");
  };

  const saveTransfer = async () => {
    if (transferringEmp && transferDeptId) {
      const payload = {
        targetDepartmentId: transferDeptId,
        targetSubDepartmentId: transferSubDeptId && transferSubDeptId !== "none" ? transferSubDeptId : null,
        targetZone: transferZoneId && transferZoneId !== "none" ? transferZoneId : null,
      };

      const success = await transferEmployeeApi(transferringEmp.id, payload);
      if (success) {
        toast.success("Employee transferred successfully.");
        setTransferringEmp(null);
        loadEmployees();
      } else {
        toast.error("Failed to transfer employee.");
      }
    }
  };

  // Map every department-tree node id to the name of its top-level branch
  // ancestor, so each employee's Branch column can be derived from the
  // department/zone they're actually assigned to (nodeId) - branches have
  // no separate assignment field, they're just the tree's root children.
  const nodeToBranchName = useMemo(() => {
    const map = new Map<string, string>();
    const walk = (node: OrganizationNode, branchName: string) => {
      map.set(node.id, branchName);
      node.children?.forEach((child) => walk(child, branchName));
    };
    departments.forEach((branch) => walk(branch, branch.name));
    return map;
  }, [departments]);

  const transferSubDepartments = transferDeptId
    ? departments.find(d => d.id === transferDeptId)?.children?.filter(c => !c.name.includes("Zone")) || []
    : [];

  const transferZones = transferDeptId === "operations"
    ? departments.find(d => d.id === "operations")?.children?.filter(c => c.name.includes("Zone")) || []
    : [];

  return (
    <div className="mt-4 border rounded-md overflow-hidden bg-background shadow-sm">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Employee ID</TableHead>
            <TableHead>Branch</TableHead>
            <TableHead>Designation</TableHead>
            <TableHead>Department / Zones</TableHead>
            <TableHead className="text-right">Monthly Salary</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                Loading employees...
              </TableCell>
            </TableRow>
          ) : employeesList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                No employees assigned directly to this organizational unit.
              </TableCell>
            </TableRow>
          ) : (
            employeesList.map((emp) => (
            <TableRow key={emp.id} className="hover:bg-muted/20">
              <TableCell className="flex items-center gap-3 py-3">
                <AvatarPlaceholder name={emp.name} />
                <span className="font-medium">{emp.name}</span>
              </TableCell>
              <TableCell className="text-muted-foreground">{emp.employeeId}</TableCell>
              <TableCell>{nodeToBranchName.get(emp.nodeId) ?? "-"}</TableCell>
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
          )))}
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
        onSave={() => {
          // EditSalaryModal already persists the real salary structure via
          // updateEmployeeSalaryStructureApi before calling onSave - refresh
          // from the real API instead of mutating the disconnected mock array.
          void loadEmployees();
        }}
      />
    </div>
  );
}
