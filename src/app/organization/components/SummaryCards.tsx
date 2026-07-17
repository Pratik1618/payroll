"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCircle, IndianRupee, PieChart, Network, TrendingUp } from "lucide-react";
import { OrganizationNode } from "../mock/organization";
import { getSalaryCostForNode } from "../mock/salary";

interface SummaryCardsProps {
  node: OrganizationNode;
}

export function SummaryCards({ node }: SummaryCardsProps) {
  const salaryData = getSalaryCostForNode(node.id);
  const averageSalary = node.employeeCount && node.employeeCount > 0 
    ? salaryData.totalCost / node.employeeCount 
    : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Employees</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{node.employeeCount?.toLocaleString("en-IN") || 0}</div>
          <p className="text-xs text-muted-foreground mt-1">Active headcount</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
          <IndianRupee className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{(node.monthlyPayroll || 0).toLocaleString("en-IN")}</div>
          <p className="text-xs text-muted-foreground mt-1">Total salary payout</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Employer Cost</CardTitle>
          <PieChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{(node.employerCost || 0).toLocaleString("en-IN")}</div>
          <p className="text-xs text-muted-foreground mt-1">PF, ESIC, etc.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Departments</CardTitle>
          <Network className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{node.children?.length || 0}</div>
          <p className="text-xs text-muted-foreground mt-1">Direct child nodes</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Salary</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{Math.round(averageSalary).toLocaleString("en-IN")}</div>
          <p className="text-xs text-muted-foreground mt-1">Per employee</p>
        </CardContent>
      </Card>
    </div>
  );
}
