"use client"

import { useMemo, useState } from "react"
import { MainLayout } from "@/components/ui/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Building2,
  FolderTree,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  UserRound,
  Users,
} from "lucide-react"

interface Department {
  id: string
  name: string
  code: string
  manager: string
  employeeCount: number
  status: "Active" | "Inactive"
  description: string
}

interface Branch {
  id: string
  name: string
  code: string
  city: string
  manager: string
  status: "Active" | "Inactive"
  description: string
  departments: Department[]
}

interface BranchFormState {
  name: string
  code: string
  city: string
  manager: string
  status: "Active" | "Inactive"
  description: string
}

interface DepartmentFormState {
  name: string
  code: string
  manager: string
  employeeCount: string
  status: "Active" | "Inactive"
  description: string
}

const initialBranches: Branch[] = [
  {
    id: "branch-mumbai",
    name: "Mumbai Head Office",
    code: "MHO",
    city: "Mumbai",
    manager: "Ritu Sharma",
    status: "Active",
    description: "Corporate back office and central payroll coordination.",
    departments: [
      {
        id: "dept-finance",
        name: "Finance",
        code: "FIN",
        manager: "Anil Mehra",
        employeeCount: 18,
        status: "Active",
        description: "Accounts, treasury, and statutory reconciliation.",
      },
      {
        id: "dept-payroll",
        name: "Payroll",
        code: "PAY",
        manager: "Suhani Kapoor",
        employeeCount: 12,
        status: "Active",
        description: "Salary processing, compliance, and employee payouts.",
      },
    ],
  },
  {
    id: "branch-delhi",
    name: "Delhi Regional Office",
    code: "DRO",
    city: "Delhi",
    manager: "Prakash Rao",
    status: "Active",
    description: "Regional coordination for north zone support teams.",
    departments: [
      {
        id: "dept-ops",
        name: "Operations",
        code: "OPS",
        manager: "Neha Arora",
        employeeCount: 26,
        status: "Active",
        description: "Operations planning and service delivery support.",
      },
      {
        id: "dept-admin",
        name: "Administration",
        code: "ADM",
        manager: "Deepak Sethi",
        employeeCount: 9,
        status: "Inactive",
        description: "Facilities, travel, and vendor administration.",
      },
    ],
  },
]

const emptyBranchForm: BranchFormState = {
  name: "",
  code: "",
  city: "",
  manager: "",
  status: "Active",
  description: "",
}

const emptyDepartmentForm: DepartmentFormState = {
  name: "",
  code: "",
  manager: "",
  employeeCount: "",
  status: "Active",
  description: "",
}

export default function OrganizationManagementPage() {
  const [branches, setBranches] = useState<Branch[]>(initialBranches)
  const [selectedBranchId, setSelectedBranchId] = useState(initialBranches[0]?.id ?? "")
  const [branchDialogOpen, setBranchDialogOpen] = useState(false)
  const [departmentDialogOpen, setDepartmentDialogOpen] = useState(false)
  const [branchMode, setBranchMode] = useState<"create" | "edit">("create")
  const [departmentMode, setDepartmentMode] = useState<"create" | "edit">("create")
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null)
  const [editingDepartmentId, setEditingDepartmentId] = useState<string | null>(null)
  const [branchForm, setBranchForm] = useState<BranchFormState>(emptyBranchForm)
  const [departmentForm, setDepartmentForm] = useState<DepartmentFormState>(emptyDepartmentForm)

  const selectedBranch = branches.find((branch) => branch.id === selectedBranchId) ?? null

  const totals = useMemo(() => {
    const totalDepartments = branches.reduce((sum, branch) => sum + branch.departments.length, 0)
    const totalEmployees = branches.reduce(
      (sum, branch) =>
        sum + branch.departments.reduce((departmentTotal, department) => departmentTotal + department.employeeCount, 0),
      0,
    )
    const activeBranches = branches.filter((branch) => branch.status === "Active").length

    return {
      totalBranches: branches.length,
      totalDepartments,
      totalEmployees,
      activeBranches,
    }
  }, [branches])

  const resetBranchDialog = () => {
    setBranchDialogOpen(false)
    setEditingBranchId(null)
    setBranchForm(emptyBranchForm)
  }

  const resetDepartmentDialog = () => {
    setDepartmentDialogOpen(false)
    setEditingDepartmentId(null)
    setDepartmentForm(emptyDepartmentForm)
  }

  const openCreateBranchDialog = () => {
    setBranchMode("create")
    setEditingBranchId(null)
    setBranchForm(emptyBranchForm)
    setBranchDialogOpen(true)
  }

  const openEditBranchDialog = (branch: Branch) => {
    setBranchMode("edit")
    setEditingBranchId(branch.id)
    setBranchForm({
      name: branch.name,
      code: branch.code,
      city: branch.city,
      manager: branch.manager,
      status: branch.status,
      description: branch.description,
    })
    setBranchDialogOpen(true)
  }

  const openCreateDepartmentDialog = () => {
    setDepartmentMode("create")
    setEditingDepartmentId(null)
    setDepartmentForm(emptyDepartmentForm)
    setDepartmentDialogOpen(true)
  }

  const openEditDepartmentDialog = (department: Department) => {
    setDepartmentMode("edit")
    setEditingDepartmentId(department.id)
    setDepartmentForm({
      name: department.name,
      code: department.code,
      manager: department.manager,
      employeeCount: String(department.employeeCount),
      status: department.status,
      description: department.description,
    })
    setDepartmentDialogOpen(true)
  }

  const handleBranchSave = () => {
    const trimmedName = branchForm.name.trim()
    const trimmedCode = branchForm.code.trim().toUpperCase()

    if (!trimmedName || !trimmedCode || !branchForm.city.trim()) {
      return
    }

    if (branchMode === "create") {
      const newBranch: Branch = {
        id: `branch-${Date.now()}`,
        name: trimmedName,
        code: trimmedCode,
        city: branchForm.city.trim(),
        manager: branchForm.manager.trim(),
        status: branchForm.status,
        description: branchForm.description.trim(),
        departments: [],
      }

      setBranches((current) => [...current, newBranch])
      setSelectedBranchId(newBranch.id)
    } else if (editingBranchId) {
      setBranches((current) =>
        current.map((branch) =>
          branch.id === editingBranchId
            ? {
                ...branch,
                name: trimmedName,
                code: trimmedCode,
                city: branchForm.city.trim(),
                manager: branchForm.manager.trim(),
                status: branchForm.status,
                description: branchForm.description.trim(),
              }
            : branch,
        ),
      )
    }

    resetBranchDialog()
  }

  const handleDepartmentSave = () => {
    if (!selectedBranch) {
      return
    }

    const trimmedName = departmentForm.name.trim()
    const trimmedCode = departmentForm.code.trim().toUpperCase()
    const parsedEmployeeCount = Number(departmentForm.employeeCount)

    if (!trimmedName || !trimmedCode || Number.isNaN(parsedEmployeeCount) || parsedEmployeeCount < 0) {
      return
    }

    setBranches((current) =>
      current.map((branch) => {
        if (branch.id !== selectedBranch.id) {
          return branch
        }

        if (departmentMode === "create") {
          return {
            ...branch,
            departments: [
              ...branch.departments,
              {
                id: `department-${Date.now()}`,
                name: trimmedName,
                code: trimmedCode,
                manager: departmentForm.manager.trim(),
                employeeCount: parsedEmployeeCount,
                status: departmentForm.status,
                description: departmentForm.description.trim(),
              },
            ],
          }
        }

        return {
          ...branch,
          departments: branch.departments.map((department) =>
            department.id === editingDepartmentId
              ? {
                  ...department,
                  name: trimmedName,
                  code: trimmedCode,
                  manager: departmentForm.manager.trim(),
                  employeeCount: parsedEmployeeCount,
                  status: departmentForm.status,
                  description: departmentForm.description.trim(),
                }
              : department,
          ),
        }
      }),
    )

    resetDepartmentDialog()
  }

  const handleDeleteBranch = (branchId: string) => {
    const nextBranches = branches.filter((branch) => branch.id !== branchId)
    setBranches(nextBranches)

    if (selectedBranchId === branchId) {
      setSelectedBranchId(nextBranches[0]?.id ?? "")
    }
  }

  const handleDeleteDepartment = (departmentId: string) => {
    if (!selectedBranch) {
      return
    }

    setBranches((current) =>
      current.map((branch) =>
        branch.id === selectedBranch.id
          ? {
              ...branch,
              departments: branch.departments.filter((department) => department.id !== departmentId),
            }
          : branch,
      ),
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Organization Management</h1>
            <p className="text-sm text-muted-foreground">
              Manage branches and departments separately from salary operations.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={openCreateBranchDialog}>
              <Plus className="h-4 w-4" />
              Add Branch
            </Button>
            <Button onClick={openCreateDepartmentDialog} disabled={!selectedBranch}>
              <Plus className="h-4 w-4" />
              Add Department
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="space-y-0 pb-2">
              <CardDescription>Total Branches</CardDescription>
              <CardTitle className="text-3xl">{totals.totalBranches}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                {totals.activeBranches} active branches
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="space-y-0 pb-2">
              <CardDescription>Total Departments</CardDescription>
              <CardTitle className="text-3xl">{totals.totalDepartments}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FolderTree className="h-4 w-4" />
                Across all branches
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="space-y-0 pb-2">
              <CardDescription>Mapped Employees</CardDescription>
              <CardTitle className="text-3xl">{totals.totalEmployees}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                Department headcount total
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="space-y-0 pb-2">
              <CardDescription>Selected Branch</CardDescription>
              <CardTitle className="truncate text-2xl">{selectedBranch?.code ?? "-"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {selectedBranch?.city ?? "No branch selected"}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          <Card className="py-0">
            <CardHeader className="border-b py-6">
              <CardTitle>Branches</CardTitle>
              <CardDescription>Select a branch to manage its departments.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 py-6">
              {branches.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                  No branches available. Create a branch to begin.
                </div>
              ) : (
                branches.map((branch) => {
                  const isSelected = branch.id === selectedBranchId

                  return (
                    <button
                      key={branch.id}
                      type="button"
                      onClick={() => setSelectedBranchId(branch.id)}
                      className={`w-full rounded-xl border p-4 text-left transition-colors ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border bg-background hover:bg-accent/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-semibold text-foreground">{branch.name}</p>
                            <Badge variant={branch.status === "Active" ? "default" : "secondary"}>{branch.status}</Badge>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {branch.code} · {branch.city}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={(event) => {
                              event.stopPropagation()
                              openEditBranchDialog(branch)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={(event) => {
                              event.stopPropagation()
                              handleDeleteBranch(branch.id)
                            }}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{branch.description || "No description added."}</p>
                      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                        <span>{branch.departments.length} department(s)</span>
                        <span>{branch.manager || "No branch manager"}</span>
                      </div>
                    </button>
                  )
                })
              )}
            </CardContent>
          </Card>

          <Card className="py-0">
            <CardHeader className="border-b py-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle>{selectedBranch ? `${selectedBranch.name} Departments` : "Departments"}</CardTitle>
                  <CardDescription>
                    {selectedBranch
                      ? "Create, edit, or remove departments under the selected branch."
                      : "Select a branch to manage departments."}
                  </CardDescription>
                </div>
                {selectedBranch && (
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <UserRound className="h-4 w-4" />
                      {selectedBranch.manager || "No branch manager"}
                    </span>
                    <span>{selectedBranch.departments.length} department(s)</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 py-6">
              {!selectedBranch ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  Select a branch from the left panel.
                </div>
              ) : selectedBranch.departments.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  No departments in this branch yet.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Department</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Manager</TableHead>
                      <TableHead>Employees</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedBranch.departments.map((department) => (
                      <TableRow key={department.id}>
                        <TableCell className="font-medium">{department.name}</TableCell>
                        <TableCell>{department.code}</TableCell>
                        <TableCell>{department.manager || "-"}</TableCell>
                        <TableCell>{department.employeeCount}</TableCell>
                        <TableCell>
                          <Badge variant={department.status === "Active" ? "default" : "secondary"}>
                            {department.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[320px] truncate">{department.description || "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditDepartmentDialog(department)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteDepartment(department.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog
        open={branchDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            resetBranchDialog()
            return
          }
          setBranchDialogOpen(true)
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{branchMode === "create" ? "Add Branch" : "Edit Branch"}</DialogTitle>
            <DialogDescription>Maintain branch-level master data outside salary workflows.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="branch-name">Branch Name</Label>
              <Input
                id="branch-name"
                value={branchForm.name}
                onChange={(event) => setBranchForm((current) => ({ ...current, name: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch-code">Branch Code</Label>
              <Input
                id="branch-code"
                value={branchForm.code}
                onChange={(event) => setBranchForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch-city">City</Label>
              <Input
                id="branch-city"
                value={branchForm.city}
                onChange={(event) => setBranchForm((current) => ({ ...current, city: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch-manager">Branch Manager</Label>
              <Input
                id="branch-manager"
                value={branchForm.manager}
                onChange={(event) => setBranchForm((current) => ({ ...current, manager: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch-status">Status</Label>
              <select
                id="branch-status"
                value={branchForm.status}
                onChange={(event) =>
                  setBranchForm((current) => ({
                    ...current,
                    status: event.target.value as BranchFormState["status"],
                  }))
                }
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="branch-description">Description</Label>
              <Textarea
                id="branch-description"
                rows={4}
                value={branchForm.description}
                onChange={(event) => setBranchForm((current) => ({ ...current, description: event.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetBranchDialog}>
              Cancel
            </Button>
            <Button onClick={handleBranchSave}>{branchMode === "create" ? "Create Branch" : "Save Branch"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={departmentDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            resetDepartmentDialog()
            return
          }
          setDepartmentDialogOpen(true)
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{departmentMode === "create" ? "Add Department" : "Edit Department"}</DialogTitle>
            <DialogDescription>
              {selectedBranch ? `Manage departments under ${selectedBranch.name}.` : "Select a branch first."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="department-name">Department Name</Label>
              <Input
                id="department-name"
                value={departmentForm.name}
                onChange={(event) => setDepartmentForm((current) => ({ ...current, name: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department-code">Department Code</Label>
              <Input
                id="department-code"
                value={departmentForm.code}
                onChange={(event) =>
                  setDepartmentForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department-manager">Department Manager</Label>
              <Input
                id="department-manager"
                value={departmentForm.manager}
                onChange={(event) => setDepartmentForm((current) => ({ ...current, manager: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department-count">Employee Count</Label>
              <Input
                id="department-count"
                type="number"
                min="0"
                value={departmentForm.employeeCount}
                onChange={(event) =>
                  setDepartmentForm((current) => ({ ...current, employeeCount: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department-status">Status</Label>
              <select
                id="department-status"
                value={departmentForm.status}
                onChange={(event) =>
                  setDepartmentForm((current) => ({
                    ...current,
                    status: event.target.value as DepartmentFormState["status"],
                  }))
                }
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="department-description">Description</Label>
              <Textarea
                id="department-description"
                rows={4}
                value={departmentForm.description}
                onChange={(event) =>
                  setDepartmentForm((current) => ({ ...current, description: event.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetDepartmentDialog}>
              Cancel
            </Button>
            <Button onClick={handleDepartmentSave} disabled={!selectedBranch}>
              {departmentMode === "create" ? "Create Department" : "Save Department"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}
