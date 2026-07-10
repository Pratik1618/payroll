"use client";

import { Button } from "@/components/ui/button";
import { Plus, Download, Upload } from "lucide-react";

export function QuickActions() {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" className="hidden lg:flex">
        <Download className="mr-2 h-4 w-4" />
        Export
      </Button>
      <Button variant="outline" size="sm" className="hidden lg:flex">
        <Upload className="mr-2 h-4 w-4" />
        Import
      </Button>
      <Button size="sm">
        <Plus className="mr-2 h-4 w-4" />
        Add Department
      </Button>
      <Button size="sm">
        <Plus className="mr-2 h-4 w-4" />
        Add Zone
      </Button>
    </div>
  );
}
