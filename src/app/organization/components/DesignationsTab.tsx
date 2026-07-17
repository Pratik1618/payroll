"use client";

import { designations } from "../mock/designations";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Settings2, ShieldCheck } from "lucide-react";

export function DesignationsTab() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Designation Master</h3>
          <p className="text-sm text-muted-foreground">Global directory of standardized job titles.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings2 className="mr-2 h-4 w-4" />
            Manage Levels
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Designation
          </Button>
        </div>
      </div>

      <div className="border rounded-md overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[80px]">#</TableHead>
              <TableHead>Designation Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {designations.map((d, index) => (
              <TableRow key={d}>
                <TableCell className="font-medium text-slate-500">{index + 1}</TableCell>
                <TableCell className="font-medium text-slate-900">{d}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-50 border border-green-200">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <span className="sr-only">Edit</span>
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
