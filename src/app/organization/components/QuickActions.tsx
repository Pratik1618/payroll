"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Download, Upload, FileText } from "lucide-react";
import { AddEmployeeModal } from "./AddEmployeeModal";
import { AddDepartmentModal } from "./AddDepartmentModal";
import { GenerateOfferModal } from "./GenerateOfferModal";
import { DesignationMasterModal } from "./DesignationMasterModal";
import { useRouter } from "next/navigation";

export function QuickActions() {
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false);
  const [isGenerateOfferOpen, setIsGenerateOfferOpen] = useState(false);
  const [isDesignationMasterOpen, setIsDesignationMasterOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" className="hidden lg:flex">
        <Download className="mr-2 h-4 w-4" />
        Export
      </Button>
      <Button variant="outline" size="sm" className="hidden lg:flex" onClick={() => setIsDesignationMasterOpen(true)}>
        <FileText className="mr-2 h-4 w-4" />
        Designations
      </Button>
      <Button size="sm" variant="secondary" onClick={() => setIsGenerateOfferOpen(true)}>
        <FileText className="mr-2 h-4 w-4" />
        Generate Offer
      </Button>
      <Button size="sm" onClick={() => setIsAddEmployeeOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Employee
      </Button>
      <Button size="sm" onClick={() => setIsAddDeptOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Department
      </Button>

      <GenerateOfferModal
        open={isGenerateOfferOpen}
        onOpenChange={setIsGenerateOfferOpen}
      />

      <AddEmployeeModal 
        open={isAddEmployeeOpen} 
        onOpenChange={setIsAddEmployeeOpen} 
      />
      
      <AddDepartmentModal
        open={isAddDeptOpen}
        onOpenChange={(open) => {
          setIsAddDeptOpen(open);
          if (!open) {
            router.refresh();
          }
        }}
      />
      
      <DesignationMasterModal 
        open={isDesignationMasterOpen}
        onOpenChange={setIsDesignationMasterOpen}
      />
    </div>
  );
}
