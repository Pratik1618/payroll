"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { employeesData } from "../mock/employees";

// Simple Avatar replacement since we don't have shadcn Avatar installed
const AvatarPlaceholder = ({ name }: { name: string }) => {
  const initials = name.split(" ").map((n) => n[0]).join("").substring(0, 2);
  return (
    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
      {initials}
    </div>
  );
};

export function EmployeesTable({ nodeId }: { nodeId?: string }) {
  const filteredEmployees = nodeId 
    ? employeesData.filter((emp) => emp.nodeId === nodeId)
    : employeesData;

  if (filteredEmployees.length === 0) {
    return (
      <div className="mt-8 text-center p-8 border border-dashed rounded-lg text-muted-foreground">
        No employees assigned directly to this organizational unit.
      </div>
    );
  }

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
              <TableCell className="text-right font-medium">₹{emp.monthlySalary.toLocaleString()}</TableCell>
              <TableCell>
                <Badge variant={emp.status === "Active" ? "default" : "secondary"} className="font-normal">
                  {emp.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
