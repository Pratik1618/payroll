"use client"

import { useState } from "react"
import { MainLayout } from "@/components/ui/layout/main-layout"
import { SidebarTree } from "@/components/ui/payroll/back-office-salary/sidebar-tree"
import { EmployeeTable } from "@/components/ui/payroll/back-office-salary/employee-table"
import { BranchSummaryCards } from "@/components/ui/payroll/back-office-salary/branch-summary-cards"
import { SalaryForm, SalaryStructure } from "@/components/ui/payroll/back-office-salary/salary-form"
import { SalaryUpload } from "@/components/ui/payroll/back-office-salary/salary-upload"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Employee {
  id: string
  name: string
  code: string
  department: string
  grossSalary: number
  netSalary: number
}

interface SubDepartment {
  id: string
  name: string
}

interface Department {
  id: string
  name: string
  subDepartments: SubDepartment[]
}

interface Branch {
  id: string
  name: string
  departments: Department[]
}

// Mock data
const MOCK_BRANCHES: Branch[] = [
  {
    id: "br-001",
    name: "Mumbai Head Office",
    departments: [
      {
        id: "dept-001",
        name: "Finance",
        subDepartments: [
          { id: "sub-001", name: "Accounts Payable" },
          { id: "sub-002", name: "Accounts Receivable" },
          { id: "sub-003", name: "General Accounting" },
        ],
      },
      {
        id: "dept-002",
        name: "HR",
        subDepartments: [
          { id: "sub-004", name: "Recruitment" },
          { id: "sub-005", name: "Payroll" },
          { id: "sub-006", name: "Training" },
        ],
      },
    ],
  },
  {
    id: "br-002",
    name: "Delhi Regional Office",
    departments: [
      {
        id: "dept-003",
        name: "Operations",
        subDepartments: [
          { id: "sub-007", name: "Production" },
          { id: "sub-008", name: "Quality Assurance" },
        ],
      },
    ],
  },
]

// Mock employees data
const MOCK_EMPLOYEES: Record<string, Employee[]> = {
  "sub-001": [
    { id: "emp-001", name: "Rajesh Kumar", code: "AP001", department: "Accounts Payable", grossSalary: 50000, netSalary: 42000 },
    { id: "emp-002", name: "Priya Singh", code: "AP002", department: "Accounts Payable", grossSalary: 45000, netSalary: 38000 },
  ],
  "sub-002": [
    { id: "emp-003", name: "Amit Patel", code: "AR001", department: "Accounts Receivable", grossSalary: 55000, netSalary: 46000 },
  ],
  "sub-003": [
    { id: "emp-004", name: "Neha Sharma", code: "GA001", department: "General Accounting", grossSalary: 60000, netSalary: 51000 },
    { id: "emp-005", name: "Vikram Joshi", code: "GA002", department: "General Accounting", grossSalary: 58000, netSalary: 49000 },
  ],
  "sub-004": [
    { id: "emp-006", name: "Ananya Verma", code: "REC001", department: "Recruitment", grossSalary: 50000, netSalary: 42000 },
  ],
  "sub-005": [
    { id: "emp-007", name: "Suresh Rao", code: "PAY001", department: "Payroll", grossSalary: 52000, netSalary: 44000 },
  ],
  "sub-007": [
    { id: "emp-008", name: "Arjun Kumar", code: "PROD001", department: "Production", grossSalary: 35000, netSalary: 29000 },
    { id: "emp-009", name: "Divya Nair", code: "PROD002", department: "Production", grossSalary: 38000, netSalary: 32000 },
  ],
}

export default function BackOfficeSalaryPage() {
  const [selectedSubDepartments, setSelectedSubDepartments] = useState<string[]>([])
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])
  const [selectedBranch, setSelectedBranch] = useState<string>("")
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSalarySheet, setShowSalarySheet] = useState(false)
  const [salaryMode, setSalaryMode] = useState<"add" | "edit">("add")
  const [salarySheetTab, setSalarySheetTab] = useState<"manual" | "upload">("manual")
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)

  // Calculate branch statistics
  const calculateBranchStats = (branchId: string) => {
    const branch = MOCK_BRANCHES.find((b) => b.id === branchId)
    if (!branch) return { totalEmployees: 0, totalDepartments: 0, totalBudget: 0 }

    let totalEmployees = 0
    let totalBudget = 0

    branch.departments.forEach((dept) => {
      dept.subDepartments.forEach((subDept) => {
        const emps = MOCK_EMPLOYEES[subDept.id] || []
        totalEmployees += emps.length
        totalBudget += emps.reduce((sum, emp) => sum + emp.grossSalary, 0)
      })
    })

    return {
      totalEmployees,
      totalDepartments: branch.departments.length,
      totalBudget,
    }
  }

  const branchStats = selectedBranch
    ? calculateBranchStats(MOCK_BRANCHES.find((b) => b.name === selectedBranch)?.id || "")
    : null

  const handleSelectSubDepartments = (subDepIds: string[], depNames: string[], branchName: string) => {
    setSelectedSubDepartments(subDepIds)
    setSelectedDepartments(depNames)
    setSelectedBranch(branchName)

    // Load employees from selected departments
    if (subDepIds.length > 0) {
      const employeesList: Employee[] = []
      subDepIds.forEach((subDepId) => {
        const emps = MOCK_EMPLOYEES[subDepId] || []
        employeesList.push(...emps)
      })
      setEmployees(employeesList)
    } else {
      setEmployees([])
    }
  }

  const handleSalaryUpload = (salary: any) => {
    try {
      if (!selectedEmployee) {
        toast.error("Select an employee before uploading salary")
        return
      }

      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === selectedEmployee.id
            ? {
                ...emp,
                grossSalary:
                  salary.basic +
                  salary.hra +
                  salary.specialAllowance +
                  salary.conveyanceAllowance +
                  salary.medicalAllowance,
                netSalary:
                  salary.basic +
                  salary.hra +
                  salary.specialAllowance +
                  salary.conveyanceAllowance +
                  salary.medicalAllowance -
                  (salary.pfDeduction + salary.esicDeduction + salary.professionalTax + salary.tds),
              }
            : emp,
        ),
      )

      setShowSalarySheet(false)
      toast.success(`Salary uploaded for ${selectedEmployee.name}`)
    } catch (error) {
      toast.error("Failed to process salary upload")
    }
  }

  const handleAddSalary = (employee: Employee) => {
    setSelectedEmployee(employee)
    setSalaryMode("add")
    setSalarySheetTab("manual")
    setShowSalarySheet(true)
  }

  const handleUploadSalary = (employee: Employee) => {
    setSelectedEmployee(employee)
    setSalaryMode("add")
    setSalarySheetTab("upload")
    setShowSalarySheet(true)
  }

  const handleEditSalary = (employee: Employee) => {
    setSelectedEmployee(employee)
    setSalaryMode("edit")
    setSalarySheetTab("manual")
    setShowSalarySheet(true)
  }

  const handleSalarySubmit = (salary: SalaryStructure) => {
    if (!selectedEmployee) return

    toast.success(
      salaryMode === "add"
        ? `Salary added for ${selectedEmployee.name}`
        : `Salary updated for ${selectedEmployee.name}`,
      {
        description: `Gross: ₹${salary.basic + salary.hra + salary.specialAllowance + salary.conveyanceAllowance + salary.medicalAllowance} | Net: ₹${(salary.basic + salary.hra + salary.specialAllowance + salary.conveyanceAllowance + salary.medicalAllowance) - (salary.pfDeduction + salary.esicDeduction + salary.professionalTax + salary.tds)}`,
      },
    )

    setShowSalarySheet(false)
  }

  return (
    <MainLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Back Office Salary Management</h1>
          <p className="text-muted-foreground">Manage salary structures and compliance for all employees</p>
        </div>

        {/* Branch Summary Cards */}
        {branchStats && selectedBranch && (
          <BranchSummaryCards
            branchName={selectedBranch}
            totalEmployees={branchStats.totalEmployees}
            totalDepartments={branchStats.totalDepartments}
            totalBudget={branchStats.totalBudget}
          />
        )}

        <div className="flex gap-4 h-[calc(100vh-200px)]">
          {/* Left Sidebar with Tree */}
          <SidebarTree
            branches={MOCK_BRANCHES}
            selectedSubDepartments={selectedSubDepartments}
            onSelectSubDepartments={handleSelectSubDepartments}
            onSelectBranch={setSelectedBranch}
          />

          {/* Right Panel with Employee Table */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="rounded-lg border border-border p-4 bg-surface">
              <div className="text-sm text-muted-foreground">
                {selectedSubDepartments.length > 0 ? (
                  <>
                    Showing <span className="font-semibold text-foreground">{employees.length}</span> employee{employees.length !== 1 ? "s" : ""} for <span className="font-semibold text-foreground">{selectedDepartments.join(", ")}</span>
                  </>
                ) : (
                  "Select a branch and department to begin salary management."
                )}
              </div>
            </div>

            {/* Selected Filters Display */}
            {selectedSubDepartments.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-900 font-semibold mb-2">
                  Selected Departments: {selectedDepartments.join(", ")}
                </p>
                <p className="text-xs text-blue-700">
                  Showing {employees.length} employee{employees.length !== 1 ? "s" : ""}
                </p>
              </div>
            )}
            <EmployeeTable
              employees={employees}
              isLoading={isLoading}
              onAddSalary={handleAddSalary}
              onEditSalary={handleEditSalary}
              onUploadSalary={handleUploadSalary}
            />
          </div>
        </div>
      </div>

      {/* Salary Sheet */}
      <Sheet open={showSalarySheet} onOpenChange={setShowSalarySheet}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{salaryMode === "add" ? "Salary Management" : "Edit Salary"}</SheetTitle>
            <SheetDescription>
              {selectedEmployee
                ? `${selectedEmployee.name} (${selectedEmployee.code})`
                : "Add salary data manually or upload from file"}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6">
            {salaryMode === "add" ? (
              <Tabs
                value={salarySheetTab}
                onValueChange={(value) => setSalarySheetTab(value as "manual" | "upload")}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                  <TabsTrigger value="upload">Upload Excel</TabsTrigger>
                </TabsList>
                <TabsContent value="manual" className="mt-4">
                  <SalaryForm mode="add" onSubmit={handleSalarySubmit} />
                </TabsContent>
                <TabsContent value="upload" className="mt-4">
                  <SalaryUpload selectedEmployee={selectedEmployee ?? undefined} onUpload={handleSalaryUpload} />
                </TabsContent>
              </Tabs>
            ) : (
              <SalaryForm mode="edit" onSubmit={handleSalarySubmit} />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </MainLayout>
  )
}
