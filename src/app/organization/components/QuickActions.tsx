"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Download, Upload, FileText, MapPin, Building, Layers } from "lucide-react";
import { AddEmployeeModal } from "./AddEmployeeModal";
import { AddDepartmentModal } from "./AddDepartmentModal";
import { AddStateModal } from "./AddStateModal";
import { AddCityModal } from "./AddCityModal";
import { DesignationMasterModal } from "./DesignationMasterModal";
import { SalaryComponentsMasterModal } from "./SalaryComponentsMasterModal";
import { BulkEmployeeImportModal } from "./BulkEmployeeImportModal";
import { useRouter } from "next/navigation";

export function QuickActions() {
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false);
  const [isAddStateOpen, setIsAddStateOpen] = useState(false);
  const [isAddCityOpen, setIsAddCityOpen] = useState(false);
  const [isDesignationMasterOpen, setIsDesignationMasterOpen] = useState(false);
  const [isSalaryCompMasterOpen, setIsSalaryCompMasterOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button variant="outline" size="sm" className="hidden lg:flex">
        <Download className="mr-2 h-4 w-4" />
        Export
      </Button>
      <Button variant="outline" size="sm" className="hidden lg:flex" onClick={() => setIsBulkImportOpen(true)}>
        <Upload className="mr-2 h-4 w-4 text-green-600" />
        Import Employees
      </Button>
      <Button variant="outline" size="sm" className="hidden lg:flex" onClick={() => setIsDesignationMasterOpen(true)}>
        <FileText className="mr-2 h-4 w-4" />
        Designations
      </Button>
      <Button variant="outline" size="sm" className="hidden lg:flex" onClick={() => setIsSalaryCompMasterOpen(true)}>
        <Layers className="mr-2 h-4 w-4 text-purple-600" />
        Salary Components
      </Button>
      <Button size="sm" onClick={() => setIsAddEmployeeOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Employee
      </Button>
      <Button size="sm" onClick={() => setIsAddDeptOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Department
      </Button>
      <Button size="sm" variant="outline" onClick={() => setIsAddStateOpen(true)}>
        <MapPin className="mr-2 h-4 w-4" />
        Add State
      </Button>
      <Button size="sm" variant="outline" onClick={() => setIsAddCityOpen(true)}>
        <Building className="mr-2 h-4 w-4" />
        Add City
      </Button>

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

      <AddStateModal
        open={isAddStateOpen}
        onOpenChange={(open) => {
          setIsAddStateOpen(open);
          if (!open) {
            router.refresh();
          }
        }}
      />

      <AddCityModal
        open={isAddCityOpen}
        onOpenChange={(open) => {
          setIsAddCityOpen(open);
          if (!open) {
            router.refresh();
          }
        }}
      />

      <DesignationMasterModal
        open={isDesignationMasterOpen}
        onOpenChange={setIsDesignationMasterOpen}
      />

      <SalaryComponentsMasterModal
        open={isSalaryCompMasterOpen}
        onOpenChange={setIsSalaryCompMasterOpen}
      />

      <BulkEmployeeImportModal
        open={isBulkImportOpen}
        onOpenChange={(open) => {
          setIsBulkImportOpen(open);
          if (!open) {
            router.refresh();
          }
        }}
      />
    </div>
  );
}
