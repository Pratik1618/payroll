"use client"

import { useMemo, useState } from "react"
import { MainLayout } from "@/components/ui/layout/main-layout"
import { SidebarTree } from "@/components/ui/payroll/back-office-salary/sidebar-tree"
import { EmployeeTable } from "@/components/ui/payroll/back-office-salary/employee-table"
import { BranchSummaryCards } from "@/components/ui/payroll/back-office-salary/branch-summary-cards"
import { SalaryForm, SalaryStructure } from "@/components/ui/payroll/back-office-salary/salary-form"
import { SalaryUpload } from "@/components/ui/payroll/back-office-salary/salary-upload"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

interface Employee {
  id: string
  name: string
  code: string
  department: string
  grossSalary: number
  netSalary: number
  salaryStructure?: SalaryStructure
  attendanceEntries?: AttendanceEntry[]
}

interface AttendanceEntry {
  date: string
  status: "present" | "weekly-off" | "leave"
  location: string
  shift: string
  remark?: string
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

type SalarySheetMode = "add" | "edit"
type SalarySheetTab = "manual" | "upload"
type ModuleKey = "back-office" | "reliever"

interface ModuleConfig {
  id: ModuleKey
  label: string
  description: string
  branches: Branch[]
  employeesBySubDepartment: Record<string, Employee[]>
  selectionHint: string
}

interface ModuleState {
  selectedSubDepartments: string[]
  selectedDepartments: string[]
  selectedBranch: string
  employees: Employee[]
  isLoading: boolean
  showSalarySheet: boolean
  salaryMode: SalarySheetMode
  salarySheetTab: SalarySheetTab
  selectedEmployee: Employee | null
}

interface UploadedSalaryPayload {
  basic: number
  hra: number
  specialAllowance: number
  conveyanceAllowance: number
  medicalAllowance: number
  pfDeduction: number
  esicDeduction: number
  professionalTax: number
  tds: number
  pfEmployer: number
  esicEmployer: number
  gratuity: number
}

const buildSalaryStructureFromUpload = (salary: UploadedSalaryPayload): SalaryStructure => ({
  basic: salary.basic,
  hra: salary.hra,
  specialAllowance: salary.specialAllowance,
  conveyanceAllowance: salary.conveyanceAllowance,
  medicalAllowance: salary.medicalAllowance,
  pfDeduction: salary.pfDeduction,
  esicDeduction: salary.esicDeduction,
  professionalTax: salary.professionalTax,
  tds: salary.tds,
  pfEmployer: salary.pfEmployer,
  esicEmployer: salary.esicEmployer,
  gratuity: salary.gratuity,
  customEarnings: [],
  customDeductions: [],
  applyESIC: salary.esicDeduction > 0,
})

const calculateSalaryTotals = (salary: SalaryStructure) => {
  const customEarningsTotal = salary.customEarnings?.reduce((sum, item) => sum + item.amount, 0) ?? 0
  const customDeductionsTotal = salary.customDeductions?.reduce((sum, item) => sum + item.amount, 0) ?? 0

  const grossSalary =
    salary.basic +
    salary.hra +
    salary.specialAllowance +
    salary.conveyanceAllowance +
    salary.medicalAllowance +
    customEarningsTotal

  const netSalary =
    grossSalary -
    (salary.pfDeduction + salary.esicDeduction + salary.professionalTax + salary.tds + customDeductionsTotal)

  return { grossSalary, netSalary }
}

const INITIAL_MODULE_STATE: ModuleState = {
  selectedSubDepartments: [],
  selectedDepartments: [],
  selectedBranch: "",
  employees: [],
  isLoading: false,
  showSalarySheet: false,
  salaryMode: "add",
  salarySheetTab: "manual",
  selectedEmployee: null,
}

const createAttendanceEntries = (
  entries: Array<{ day: number; status: AttendanceEntry["status"]; location: string; shift: string; remark?: string }>,
): AttendanceEntry[] => {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()

  return entries.map((entry) => ({
    date: new Date(year, month, entry.day).toISOString(),
    status: entry.status,
    location: entry.location,
    shift: entry.shift,
    remark: entry.remark,
  }))
}

const MODULE_CONFIGS: Record<ModuleKey, ModuleConfig> = {
  "back-office": {
    id: "back-office",
    label: "Back Office",
    description: "Manage salary structures and compliance for back office employees.",
    selectionHint: "Select a branch and department to begin back office salary management.",
    branches: [
      {
        id: "bo-br-001",
        name: "Mumbai Head Office",
        departments: [
          {
            id: "bo-dept-001",
            name: "Finance",
            subDepartments: [
              { id: "bo-sub-001", name: "Accounts Payable" },
              { id: "bo-sub-002", name: "Accounts Receivable" },
              { id: "bo-sub-003", name: "General Accounting" },
            ],
          },
          {
            id: "bo-dept-002",
            name: "HR",
            subDepartments: [
              { id: "bo-sub-004", name: "Recruitment" },
              { id: "bo-sub-005", name: "Payroll" },
              { id: "bo-sub-006", name: "Training" },
            ],
          },
        ],
      },
      {
        id: "bo-br-002",
        name: "Delhi Regional Office",
        departments: [
          {
            id: "bo-dept-003",
            name: "Operations",
            subDepartments: [
              { id: "bo-sub-007", name: "Production Support" },
              { id: "bo-sub-008", name: "Quality Assurance" },
            ],
          },
        ],
      },
    ],
    employeesBySubDepartment: {
      "bo-sub-001": [
        { id: "bo-emp-001", name: "Rajesh Kumar", code: "AP001", department: "Accounts Payable", grossSalary: 50000, netSalary: 42000 },
        { id: "bo-emp-002", name: "Priya Singh", code: "AP002", department: "Accounts Payable", grossSalary: 45000, netSalary: 38000 },
      ],
      "bo-sub-002": [
        { id: "bo-emp-003", name: "Amit Patel", code: "AR001", department: "Accounts Receivable", grossSalary: 55000, netSalary: 46000 },
      ],
      "bo-sub-003": [
        { id: "bo-emp-004", name: "Neha Sharma", code: "GA001", department: "General Accounting", grossSalary: 60000, netSalary: 51000 },
        { id: "bo-emp-005", name: "Vikram Joshi", code: "GA002", department: "General Accounting", grossSalary: 58000, netSalary: 49000 },
      ],
      "bo-sub-004": [
        { id: "bo-emp-006", name: "Ananya Verma", code: "REC001", department: "Recruitment", grossSalary: 50000, netSalary: 42000 },
      ],
      "bo-sub-005": [
        { id: "bo-emp-007", name: "Suresh Rao", code: "PAY001", department: "Payroll", grossSalary: 52000, netSalary: 44000 },
      ],
      "bo-sub-007": [
        { id: "bo-emp-008", name: "Arjun Kumar", code: "OPS001", department: "Production Support", grossSalary: 35000, netSalary: 29000 },
        { id: "bo-emp-009", name: "Divya Nair", code: "OPS002", department: "Production Support", grossSalary: 38000, netSalary: 32000 },
      ],
    },
  },
  reliever: {
    id: "reliever",
    label: "Reliever",
    description: "Manage reliever salary setup, uploads, and edit cycles across relief pools.",
    selectionHint: "Select a branch and department to begin reliever salary management.",
    branches: [
      {
        id: "rel-br-001",
        name: "West Relief Pool",
        departments: [
          {
            id: "rel-dept-001",
            name: "Operations Relief",
            subDepartments: [
              { id: "rel-sub-001", name: "Site Relievers" },
              { id: "rel-sub-002", name: "Night Shift Relievers" },
            ],
          },
          {
            id: "rel-dept-002",
            name: "Admin Relief",
            subDepartments: [
              { id: "rel-sub-003", name: "Front Desk Relievers" },
              { id: "rel-sub-004", name: "Transport Desk" },
            ],
          },
        ],
      },
      {
        id: "rel-br-002",
        name: "North Relief Pool",
        departments: [
          {
            id: "rel-dept-003",
            name: "Field Replacement",
            subDepartments: [
              { id: "rel-sub-005", name: "Mobile Relief Team" },
              { id: "rel-sub-006", name: "Emergency Backup" },
            ],
          },
        ],
      },
    ],
    employeesBySubDepartment: {
      "rel-sub-001": [
        {
          id: "rel-emp-001",
          name: "Kunal Shah",
          code: "REL001",
          department: "Site Relievers",
          grossSalary: 28000,
          netSalary: 23750,
          attendanceEntries: createAttendanceEntries([
            { day: 1, status: "present", location: "HDFC Bank - Fort Gate", shift: "Day", remark: "Main gate cover" },
            { day: 2, status: "present", location: "Axis House - Lobby Desk", shift: "Day" },
            { day: 3, status: "weekly-off", location: "Weekly Off", shift: "Off" },
            { day: 4, status: "present", location: "ICICI Plaza - Dock Entry", shift: "Night" },
            { day: 7, status: "present", location: "HDFC Bank - Cash Van Escort", shift: "Day" },
          ]),
        },
        {
          id: "rel-emp-002",
          name: "Meena Yadav",
          code: "REL002",
          department: "Site Relievers",
          grossSalary: 29500,
          netSalary: 24980,
          attendanceEntries: createAttendanceEntries([
            { day: 1, status: "present", location: "Infosys Campus - Reception", shift: "Day" },
            { day: 2, status: "leave", location: "Sick Leave", shift: "Off", remark: "Medical leave" },
            { day: 5, status: "present", location: "Infosys Campus - Visitor Gate", shift: "Evening" },
            { day: 6, status: "present", location: "TCS Tower - Help Desk", shift: "Day" },
            { day: 8, status: "present", location: "TCS Tower - Parking Bay", shift: "Night" },
          ]),
        },
      ],
      "rel-sub-002": [
        {
          id: "rel-emp-003",
          name: "Shubham Das",
          code: "REL003",
          department: "Night Shift Relievers",
          grossSalary: 32000,
          netSalary: 27160,
          attendanceEntries: createAttendanceEntries([
            { day: 1, status: "present", location: "Phoenix Mall - Night Patrol", shift: "Night" },
            { day: 2, status: "present", location: "Phoenix Mall - Control Room", shift: "Night" },
            { day: 4, status: "present", location: "Phoenix Mall - Loading Dock", shift: "Night" },
            { day: 6, status: "weekly-off", location: "Weekly Off", shift: "Off" },
          ]),
        },
      ],
      "rel-sub-003": [
        {
          id: "rel-emp-004",
          name: "Pooja Saini",
          code: "REL004",
          department: "Front Desk Relievers",
          grossSalary: 26500,
          netSalary: 22520,
          attendanceEntries: createAttendanceEntries([
            { day: 1, status: "present", location: "Embassy One - Front Desk", shift: "Day" },
            { day: 3, status: "present", location: "Embassy One - Visitor Lounge", shift: "Day" },
            { day: 4, status: "leave", location: "Casual Leave", shift: "Off", remark: "Approved CL" },
          ]),
        },
      ],
      "rel-sub-004": [
        {
          id: "rel-emp-005",
          name: "Harish Babu",
          code: "REL005",
          department: "Transport Desk",
          grossSalary: 31000,
          netSalary: 26260,
          attendanceEntries: createAttendanceEntries([
            { day: 2, status: "present", location: "Transport Hub - Dispatch Counter", shift: "Day" },
            { day: 3, status: "present", location: "Transport Hub - Yard Exit", shift: "Evening" },
            { day: 5, status: "present", location: "Airport Cargo - Dispatch Desk", shift: "Night" },
          ]),
        },
      ],
      "rel-sub-005": [
        {
          id: "rel-emp-006",
          name: "Tenzin Lama",
          code: "REL006",
          department: "Mobile Relief Team",
          grossSalary: 33500,
          netSalary: 28280,
          attendanceEntries: createAttendanceEntries([
            { day: 1, status: "present", location: "Vodafone Site - Tower Access", shift: "Day" },
            { day: 2, status: "present", location: "Airtel Hub - Perimeter Patrol", shift: "Night" },
            { day: 7, status: "present", location: "Jio Node - Emergency Cover", shift: "Day", remark: "Short notice deployment" },
          ]),
        },
        {
          id: "rel-emp-007",
          name: "Nazia Khan",
          code: "REL007",
          department: "Mobile Relief Team",
          grossSalary: 34200,
          netSalary: 28850,
          attendanceEntries: createAttendanceEntries([
            { day: 1, status: "present", location: "Capgemini Park - Gate 2", shift: "Day" },
            { day: 3, status: "present", location: "Capgemini Park - Admin Block", shift: "Evening" },
            { day: 5, status: "weekly-off", location: "Weekly Off", shift: "Off" },
            { day: 9, status: "present", location: "Wipro Campus - Visitor Gate", shift: "Day" },
          ]),
        },
      ],
      "rel-sub-006": [
        {
          id: "rel-emp-008",
          name: "Ravi Shekhar",
          code: "REL008",
          department: "Emergency Backup",
          grossSalary: 36000,
          netSalary: 30320,
          attendanceEntries: createAttendanceEntries([
            { day: 2, status: "present", location: "Reliance DC - Server Room Access", shift: "Night" },
            { day: 4, status: "present", location: "Reliance DC - Emergency Exit", shift: "Night" },
            { day: 6, status: "present", location: "Reliance DC - Main Gate", shift: "Day" },
          ]),
        },
      ],
    },
  },
}

const formatCurrency = (value: number) => `Rs. ${value.toLocaleString("en-IN")}`

export default function BackOfficeSalaryPage() {
  const [activeModule, setActiveModule] = useState<ModuleKey>("back-office")
  const [moduleState, setModuleState] = useState<Record<ModuleKey, ModuleState>>({
    "back-office": { ...INITIAL_MODULE_STATE },
    reliever: { ...INITIAL_MODULE_STATE },
  })

  const currentConfig = MODULE_CONFIGS[activeModule]
  const currentState = moduleState[activeModule]

  const updateActiveState = (updater: (state: ModuleState) => ModuleState) => {
    setModuleState((prev) => ({
      ...prev,
      [activeModule]: updater(prev[activeModule]),
    }))
  }

  const calculateBranchStats = (config: ModuleConfig, branchName: string) => {
    const branch = config.branches.find((item) => item.name === branchName)
    if (!branch) return { totalEmployees: 0, totalDepartments: 0, totalBudget: 0 }

    let totalEmployees = 0
    let totalBudget = 0

    branch.departments.forEach((department) => {
      department.subDepartments.forEach((subDepartment) => {
        const employees = config.employeesBySubDepartment[subDepartment.id] || []
        totalEmployees += employees.length
        totalBudget += employees.reduce((sum, employee) => sum + employee.grossSalary, 0)
      })
    })

    return {
      totalEmployees,
      totalDepartments: branch.departments.length,
      totalBudget,
    }
  }

  const branchStats = useMemo(() => {
    if (!currentState.selectedBranch) return null
    return calculateBranchStats(currentConfig, currentState.selectedBranch)
  }, [currentConfig, currentState.selectedBranch])

  const handleSelectSubDepartments = (subDepartmentIds: string[], departmentNames: string[], branchName: string) => {
    const employees =
      subDepartmentIds.length > 0
        ? subDepartmentIds.flatMap((subDepartmentId) => currentConfig.employeesBySubDepartment[subDepartmentId] || [])
        : []

    updateActiveState((state) => ({
      ...state,
      selectedSubDepartments: subDepartmentIds,
      selectedDepartments: departmentNames,
      selectedBranch: branchName,
      employees,
    }))
  }

  const handleSelectBranch = (branchName: string) => {
    updateActiveState((state) => ({
      ...state,
      selectedBranch: branchName,
    }))
  }

  const handleAddSalary = (employee: Employee) => {
    updateActiveState((state) => ({
      ...state,
      selectedEmployee: employee,
      salaryMode: "add",
      salarySheetTab: "manual",
      showSalarySheet: true,
    }))
  }

  const handleUploadSalary = (employee: Employee) => {
    updateActiveState((state) => ({
      ...state,
      selectedEmployee: employee,
      salaryMode: "add",
      salarySheetTab: "upload",
      showSalarySheet: true,
    }))
  }

  const handleEditSalary = (employee: Employee) => {
    updateActiveState((state) => ({
      ...state,
      selectedEmployee: employee,
      salaryMode: "edit",
      salarySheetTab: "manual",
      showSalarySheet: true,
    }))
  }

  const handleSalaryUpload = (salary: UploadedSalaryPayload) => {
    const selectedEmployee = currentState.selectedEmployee

    if (!selectedEmployee) {
      toast.error("Select an employee before uploading salary")
      return
    }

    const salaryStructure = buildSalaryStructureFromUpload(salary)
    const { grossSalary, netSalary } = calculateSalaryTotals(salaryStructure)

    updateActiveState((state) => ({
      ...state,
      employees: state.employees.map((employee) =>
        employee.id === selectedEmployee.id ? { ...employee, grossSalary, netSalary, salaryStructure } : employee,
      ),
      showSalarySheet: false,
    }))

    toast.success(`${currentConfig.label} salary uploaded for ${selectedEmployee.name}`)
  }

  const handleSalarySubmit = (salary: SalaryStructure) => {
    const selectedEmployee = currentState.selectedEmployee
    if (!selectedEmployee) return

    const { grossSalary, netSalary } = calculateSalaryTotals(salary)

    updateActiveState((state) => ({
      ...state,
      employees: state.employees.map((employee) =>
        employee.id === selectedEmployee.id ? { ...employee, grossSalary, netSalary, salaryStructure: salary } : employee,
      ),
      showSalarySheet: false,
    }))

    toast.success(
      currentState.salaryMode === "add"
        ? `${currentConfig.label} salary added for ${selectedEmployee.name}`
        : `${currentConfig.label} salary updated for ${selectedEmployee.name}`,
      {
        description: `Gross: ${formatCurrency(grossSalary)} | Net: ${formatCurrency(netSalary)}`,
      },
    )
  }

  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="space-y-3">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Salary Management</h1>
            <p className="text-muted-foreground">
              Manage back office and reliever salary structures, uploads, edits, and compliance in one module.
            </p>
          </div>

          <Tabs value={activeModule} onValueChange={(value) => setActiveModule(value as ModuleKey)} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="back-office">Back Office</TabsTrigger>
              <TabsTrigger value="reliever">Reliever</TabsTrigger>
            </TabsList>

            {(["back-office", "reliever"] as ModuleKey[]).map((moduleKey) => {
              const config = MODULE_CONFIGS[moduleKey]
              const state = moduleState[moduleKey]
              const stats =
                state.selectedBranch.length > 0 ? calculateBranchStats(config, state.selectedBranch) : null

              return (
                <TabsContent key={moduleKey} value={moduleKey} forceMount className={moduleKey !== activeModule ? "hidden" : ""}>
                  <div className="space-y-4">
                    {stats && state.selectedBranch && (
                      <BranchSummaryCards
                        branchName={state.selectedBranch}
                        totalEmployees={stats.totalEmployees}
                        totalDepartments={stats.totalDepartments}
                        totalBudget={stats.totalBudget}
                      />
                    )}

                    <div className="flex h-[calc(100vh-270px)] gap-4">
                      <SidebarTree
                        branches={config.branches}
                        selectedSubDepartments={state.selectedSubDepartments}
                        onSelectSubDepartments={
                          moduleKey === activeModule
                            ? handleSelectSubDepartments
                            : (subDepartmentIds, departmentNames, branchName) => {
                                const employees =
                                  subDepartmentIds.length > 0
                                    ? subDepartmentIds.flatMap(
                                        (subDepartmentId) => config.employeesBySubDepartment[subDepartmentId] || [],
                                      )
                                    : []

                                setModuleState((prev) => ({
                                  ...prev,
                                  [moduleKey]: {
                                    ...prev[moduleKey],
                                    selectedSubDepartments: subDepartmentIds,
                                    selectedDepartments: departmentNames,
                                    selectedBranch: branchName,
                                    employees,
                                  },
                                }))
                              }
                        }
                        onSelectBranch={
                          moduleKey === activeModule
                            ? handleSelectBranch
                            : (branchName) =>
                                setModuleState((prev) => ({
                                  ...prev,
                                  [moduleKey]: {
                                    ...prev[moduleKey],
                                    selectedBranch: branchName,
                                  },
                                }))
                        }
                      />

                      <div className="flex flex-1 flex-col gap-4">
                        <div className="rounded-lg border border-border p-4">
                          <div className="text-sm text-muted-foreground">
                            {state.selectedSubDepartments.length > 0 ? (
                              <>
                                Showing <span className="font-semibold text-foreground">{state.employees.length}</span>{" "}
                                employee{state.employees.length !== 1 ? "s" : ""} for{" "}
                                <span className="font-semibold text-foreground">{state.selectedDepartments.join(", ")}</span>
                              </>
                            ) : (
                              config.selectionHint
                            )}
                          </div>
                        </div>

                        {state.selectedSubDepartments.length > 0 && (
                          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                            <p className="mb-2 text-xs font-semibold text-blue-900">
                              Selected Departments: {state.selectedDepartments.join(", ")}
                            </p>
                            <p className="text-xs text-blue-700">
                              Showing {state.employees.length} employee{state.employees.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                        )}

                        <EmployeeTable
                          employees={state.employees}
                          isLoading={state.isLoading}
                          showAttendanceCalendar={moduleKey === "reliever"}
                          onAddSalary={
                            moduleKey === activeModule
                              ? handleAddSalary
                              : (employee) =>
                                  setModuleState((prev) => ({
                                    ...prev,
                                    [moduleKey]: {
                                      ...prev[moduleKey],
                                      selectedEmployee: employee,
                                      salaryMode: "add",
                                      salarySheetTab: "manual",
                                      showSalarySheet: true,
                                    },
                                  }))
                          }
                          onEditSalary={
                            moduleKey === activeModule
                              ? handleEditSalary
                              : (employee) =>
                                  setModuleState((prev) => ({
                                    ...prev,
                                    [moduleKey]: {
                                      ...prev[moduleKey],
                                      selectedEmployee: employee,
                                      salaryMode: "edit",
                                      salarySheetTab: "manual",
                                      showSalarySheet: true,
                                    },
                                  }))
                          }
                          onUploadSalary={
                            moduleKey === activeModule
                              ? handleUploadSalary
                              : (employee) =>
                                  setModuleState((prev) => ({
                                    ...prev,
                                    [moduleKey]: {
                                      ...prev[moduleKey],
                                      selectedEmployee: employee,
                                      salaryMode: "add",
                                      salarySheetTab: "upload",
                                      showSalarySheet: true,
                                    },
                                  }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              )
            })}
          </Tabs>
        </div>
      </div>

      <Sheet
        open={currentState.showSalarySheet}
        onOpenChange={(open) => updateActiveState((state) => ({ ...state, showSalarySheet: open }))}
      >
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>{currentState.salaryMode === "add" ? `${currentConfig.label} Salary Management` : `Edit ${currentConfig.label} Salary`}</SheetTitle>
            <SheetDescription>
              {currentState.selectedEmployee
                ? `${currentState.selectedEmployee.name} (${currentState.selectedEmployee.code})`
                : "Add salary data manually or upload from file"}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6">
            {currentState.salaryMode === "add" ? (
              <Tabs
                value={currentState.salarySheetTab}
                onValueChange={(value) =>
                  updateActiveState((state) => ({ ...state, salarySheetTab: value as SalarySheetTab }))
                }
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                  <TabsTrigger value="upload">Upload Excel</TabsTrigger>
                </TabsList>
                <TabsContent value="manual" className="mt-4">
                  <SalaryForm
                    mode="add"
                    initialValues={currentState.selectedEmployee?.salaryStructure}
                    onCancel={() => updateActiveState((state) => ({ ...state, showSalarySheet: false }))}
                    onSubmit={handleSalarySubmit}
                  />
                </TabsContent>
                <TabsContent value="upload" className="mt-4">
                  <SalaryUpload selectedEmployee={currentState.selectedEmployee ?? undefined} onUpload={handleSalaryUpload} />
                </TabsContent>
              </Tabs>
            ) : (
              <SalaryForm
                mode="edit"
                initialValues={currentState.selectedEmployee?.salaryStructure}
                onCancel={() => updateActiveState((state) => ({ ...state, showSalarySheet: false }))}
                onSubmit={handleSalarySubmit}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </MainLayout>
  )
}
