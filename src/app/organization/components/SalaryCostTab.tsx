"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getSalaryCostForNode } from "../mock/salary";
import { OrganizationNode } from "../mock/organization";

interface SalaryCostTabProps {
  node: OrganizationNode;
}

export function SalaryCostTab({ node }: SalaryCostTabProps) {
  const data = getSalaryCostForNode(node.id);

  return (
    <div className="mt-4">

      <Card>
        <CardHeader>
          <CardTitle>Payroll Budget Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Budget Consumed</span>
            <span className="text-sm font-semibold">
              ₹{((node.monthlyPayroll || 0) * 12).toLocaleString("en-IN")} 
              <span className="text-muted-foreground font-normal ml-1">({data.payrollBudgetUsedPercent}%)</span>
            </span>
          </div>
          <Progress value={data.payrollBudgetUsedPercent} className="h-3" />
          <div className="text-xs text-muted-foreground text-right mt-3">
            Budget Allotted for FY: <span className="font-semibold text-foreground">₹{Math.round(((node.monthlyPayroll || 0) * 12) / (data.payrollBudgetUsedPercent / 100)).toLocaleString("en-IN")}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
