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
            <span className="text-sm font-medium">{data.payrollBudgetUsedPercent}%</span>
          </div>
          <Progress value={data.payrollBudgetUsedPercent} className="h-3" />
        </CardContent>
      </Card>
    </div>
  );
}
