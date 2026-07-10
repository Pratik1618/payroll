"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrganizationNode } from "../mock/organization";

interface OverviewTabProps {
  node: OrganizationNode;
}

export function OverviewTab({ node }: OverviewTabProps) {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-4">
      <Card className="col-span-1 md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Organization Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{node.description || "No description provided."}</p>
        </CardContent>
      </Card>

      {node.coveredZones && node.coveredZones.length > 0 && (
        <Card className="col-span-1 md:col-span-2 lg:col-span-3 border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-primary">Zones Covered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {node.coveredZones.map((zone) => (
                <span key={zone} className="px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full shadow-sm">
                  {zone} Zone
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Department Head</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-semibold">{node.head || "N/A"}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Total Employees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-semibold">{node.employeeCount?.toLocaleString() || 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Monthly Payroll</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-semibold">₹{(node.monthlyPayroll || 0).toLocaleString()}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Employer Cost</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-semibold">₹{(node.employerCost || 0).toLocaleString()}</div>
        </CardContent>
      </Card>
      
    </div>
  );
}
