"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { designations } from "../mock/designations";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Settings2, ShieldCheck } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DesignationMasterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DesignationMasterModal({ open, onOpenChange }: DesignationMasterModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b bg-slate-50 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">Designation Master</DialogTitle>
              <DialogDescription className="mt-1">
                Global directory of standardized job titles.
              </DialogDescription>
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
        </DialogHeader>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
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
      </DialogContent>
    </Dialog>
  );
}
