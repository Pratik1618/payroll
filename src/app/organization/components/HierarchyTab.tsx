"use client";

import { Card, CardContent } from "@/components/ui/card";
import { employeesData } from "../mock/employees";
import { ArrowDown } from "lucide-react";

export function HierarchyTab() {
  // Sort employees by hierarchy level
  const sortedEmployees = [...employeesData].sort((a, b) => a.hierarchyLevel - b.hierarchyLevel);
  
  // To simulate a tree structure visually we will just display them in a centered column
  // grouping by level, then drawing arrows between levels.
  
  const levels = Array.from(new Set(sortedEmployees.map(e => e.hierarchyLevel))).sort();

  return (
    <div className="mt-4 p-8 flex flex-col items-center bg-muted/20 rounded-md border min-h-[500px]">
      {levels.map((level, index) => {
        const levelEmployees = sortedEmployees.filter(e => e.hierarchyLevel === level);
        
        return (
          <div key={level} className="flex flex-col items-center w-full">
            <div className="flex flex-wrap justify-center gap-6 w-full">
              {levelEmployees.map((emp) => (
                <Card key={emp.id} className="w-64 shadow-sm border-muted">
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg mb-3">
                      {emp.name.split(" ").map((n) => n[0]).join("").substring(0, 2)}
                    </div>
                    <h3 className="font-semibold text-sm">{emp.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{emp.designation}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{emp.department}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Draw arrow to next level if it's not the last level */}
            {index < levels.length - 1 && (
              <div className="my-4 flex justify-center">
                <ArrowDown className="text-muted-foreground opacity-50" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
