"use client"

import { useEffect, useMemo, useState } from "react"
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
  Plus,
  Trash2,
  UserRound,
  Users,
  Building,
} from "lucide-react"
import { AddStateModal } from "../organization/components/AddStateModal"
import { AddCityModal } from "../organization/components/AddCityModal"
import { SafeDeleteDepartmentModal } from "../organization/components/SafeDeleteDepartmentModal"
import { BranchGeofenceModal } from "../organization/components/BranchGeofenceModal"
import { OrganizationNode } from "../organization/mock/organization"
import { fetchOrgTree, createDepartmentApi } from "../organization/services/masterDataService"
import { toast } from "sonner"

interface BranchFormState {
  name: string
  head: string
  description: string
}

interface DepartmentFormState {
  name: string
  head: string
  description: string
  branchId: string
}

const emptyBranchForm: BranchFormState = {
  name: "",
  head: "",
  description: "",
}

const emptyDepartmentForm: DepartmentFormState = {
  name: "",
  head: "",
  description: "",
  branchId: "",
}

export default function OrganizationManagementPage() {
  const [root, setRoot] = useState<OrganizationNode | null>(null)
  const [selectedBranchId, setSelectedBranchId] = useState<string>("")
  const [loading, setLoading] = useState(true)

  const [branchDialogOpen, setBranchDialogOpen] = useState(false)
  const [departmentDialogOpen, setDepartmentDialogOpen] = useState(false)
  const [stateDialogOpen, setStateDialogOpen] = useState(false)
  const [cityDialogOpen, setCityDialogOpen] = useState(false)

  const [deleteTargetNode, setDeleteTargetNode] = useState<OrganizationNode | null>(null)
  const [geofenceTargetBranch, setGeofenceTargetBranch] = useState<OrganizationNode | null>(null)
  const [branchForm, setBranchForm] = useState<BranchFormState>(emptyBranchForm)
  const [departmentForm, setDepartmentForm] = useState<DepartmentFormState>(emptyDepartmentForm)
  const [saving, setSaving] = useState(false)

  const branches = useMemo(() => root?.children ?? [], [root])
  const selectedBranch = branches.find((branch) => branch.id === selectedBranchId) ?? null
  const departments = selectedBranch?.children ?? []

  useEffect(() => {
    void loadTree()
  }, [])

  const loadTree = async (preserveSelection = true) => {
    setLoading(true)
    const data = await fetchOrgTree()
    const newRoot = data[0] ?? null
    setRoot(newRoot)
    const newBranches = newRoot?.children ?? []
    setSelectedBranchId((prev) => {
      if (preserveSelection && newBranches.some((b) => b.id === prev)) {
        return prev
      }
      return newBranches[0]?.id ?? ""
    })
    setLoading(false)
  }

  const totals = useMemo(() => {
    const totalDepartments = branches.reduce((sum, branch) => sum + (branch.children?.length ?? 0), 0)
    const totalEmployees = branches.reduce((sum, branch) => sum + (branch.employeeCount ?? 0), 0)

    return {
      totalBranches: branches.length,
      totalDepartments,
      totalEmployees,
    }
  }, [branches])

  const resetBranchDialog = () => {
    setBranchDialogOpen(false)
    setBranchForm(emptyBranchForm)
  }

  const resetDepartmentDialog = () => {
    setDepartmentDialogOpen(false)
    setDepartmentForm(emptyDepartmentForm)
  }

  const openCreateBranchDialog = () => {
    setBranchForm(emptyBranchForm)
    setBranchDialogOpen(true)
  }

  const openCreateDepartmentDialog = () => {
    setDepartmentForm({ ...emptyDepartmentForm, branchId: selectedBranchId })
    setDepartmentDialogOpen(true)
  }

  // "Branch" has no dedicated backend entity - it maps onto a top-level
  // department node (parentId = the org root). There is also no PUT
  // endpoint for a department's basic name/head/description fields
  // (router_departments.py only exposes designations/zones/geofence PUTs
  // and DELETE), so editing an existing branch/department is not
  // supported here - only create and (safe) delete.
  const handleBranchSave = async () => {
    const trimmedName = branchForm.name.trim()
    if (!trimmedName || !root) {
      return
    }

    setSaving(true)
    const created = await createDepartmentApi({
      name: trimmedName,
      head: branchForm.head.trim() || undefined,
      description: branchForm.description.trim() || undefined,
      parentId: root.id,
    })
    setSaving(false)

    if (created) {
      toast.success(`Department "${trimmedName}" created.`)
      await loadTree(false)
      setSelectedBranchId(created.id)
      resetBranchDialog()
    } else {
      toast.error("Failed to create department.")
    }
  }

  const handleDepartmentSave = async () => {
    const targetBranchId = departmentForm.branchId || selectedBranch?.id
    const trimmedName = departmentForm.name.trim()
    if (!trimmedName || !targetBranchId) {
      return
    }

    setSaving(true)
    const created = await createDepartmentApi({
      name: trimmedName,
      head: departmentForm.head.trim() || undefined,
      description: departmentForm.description.trim() || undefined,
      parentId: targetBranchId,
    })
    setSaving(false)

    if (created) {
      toast.success(`Sub-Department "${trimmedName}" created.`)
      if (targetBranchId !== selectedBranchId) {
        setSelectedBranchId(targetBranchId)
      }
      await loadTree(true)
      resetDepartmentDialog()
    } else {
      toast.error("Failed to create sub-department.")
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Organization Management</h1>
            <p className="text-sm text-muted-foreground">
              Manage departments and sub-departments separately from salary operations.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={openCreateBranchDialog}>
              <Plus className="h-4 w-4" />
              Add Department
            </Button>
            <Button onClick={openCreateDepartmentDialog} disabled={!selectedBranch}>
              <Plus className="h-4 w-4" />
              Add Sub-Department
            </Button>
            <Button variant="outline" onClick={() => setStateDialogOpen(true)}>
              <MapPin className="h-4 w-4" />
              Add State
            </Button>
            <Button variant="outline" onClick={() => setCityDialogOpen(true)}>
              <Building className="h-4 w-4" />
              Add City
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Card>
            <CardHeader className="space-y-0 pb-2">
              <CardDescription>Total Departments</CardDescription>
              <CardTitle className="text-3xl">{totals.totalBranches}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                Top-level org units
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="space-y-0 pb-2">
              <CardDescription>Total Sub-Departments</CardDescription>
              <CardTitle className="text-3xl">{totals.totalDepartments}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FolderTree className="h-4 w-4" />
                Across all departments
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
        </div>

        <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          <Card className="py-0">
            <CardHeader className="border-b py-6">
              <CardTitle>Departments</CardTitle>
              <CardDescription>Select a department to manage its sub-departments.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 py-6">
              {loading ? (
                <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                  Loading...
                </div>
              ) : branches.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                  No departments available. Create a department to begin.
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
                          <p className="truncate font-semibold text-foreground">{branch.name}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {branch.employeeCount ?? 0} employee(s)
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={(event) => {
                              event.stopPropagation()
                              setGeofenceTargetBranch(branch)
                            }}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <MapPin className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={(event) => {
                              event.stopPropagation()
                              setDeleteTargetNode(branch)
                            }}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{branch.description || "No description added."}</p>
                      {branch.latitude != null && branch.longitude != null ? (
                        <a
                          href={`https://www.google.com/maps?q=${branch.latitude},${branch.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(event) => event.stopPropagation()}
                          className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <MapPin className="h-3 w-3" />
                          {Number(branch.latitude).toFixed(4)}, {Number(branch.longitude).toFixed(4)} · {branch.geofenceRadiusMeters ?? 200}m radius
                        </a>
                      ) : (
                        <p className="mt-2 text-xs text-muted-foreground">No location set.</p>
                      )}
                      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                        <span>{branch.children?.length ?? 0} sub-department(s)</span>
                        <span>{branch.head || "No department head"}</span>
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
                  <CardTitle>{selectedBranch ? `${selectedBranch.name} Sub-Departments` : "Sub-Departments"}</CardTitle>
                  <CardDescription>
                    {selectedBranch
                      ? "Create or remove sub-departments under the selected department."
                      : "Select a department to manage sub-departments."}
                  </CardDescription>
                </div>
                {selectedBranch && (
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <UserRound className="h-4 w-4" />
                      {selectedBranch.head || "No department head"}
                    </span>
                    <span>{selectedBranch.children?.length ?? 0} sub-department(s)</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 py-6">
              {!selectedBranch ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  Select a department from the left panel.
                </div>
              ) : departments.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  No sub-departments in this department yet.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sub-Department</TableHead>
                      <TableHead>Head</TableHead>
                      <TableHead>Employees</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departments.map((department) => (
                      <TableRow key={department.id}>
                        <TableCell className="font-medium">{department.name}</TableCell>
                        <TableCell>{department.head || "-"}</TableCell>
                        <TableCell>{department.employeeCount ?? 0}</TableCell>
                        <TableCell className="max-w-[320px] truncate">{department.description || "-"}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTargetNode(department)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
        onOpenChange={(open) => (open ? setBranchDialogOpen(true) : resetBranchDialog())}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add Department</DialogTitle>
            <DialogDescription>Departments are top-level organization units.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="branch-name">Department Name</Label>
              <Input
                id="branch-name"
                value={branchForm.name}
                onChange={(event) => setBranchForm((current) => ({ ...current, name: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch-head">Department Head</Label>
              <Input
                id="branch-head"
                value={branchForm.head}
                onChange={(event) => setBranchForm((current) => ({ ...current, head: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
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
            <Button onClick={handleBranchSave} disabled={saving || !branchForm.name.trim()}>
              Create Department
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={departmentDialogOpen}
        onOpenChange={(open) => (open ? setDepartmentDialogOpen(true) : resetDepartmentDialog())}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add Sub-Department</DialogTitle>
            <DialogDescription>
              {selectedBranch ? `Add a sub-department under ${selectedBranch.name}.` : "Select a department first."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="department-branch">Department</Label>
              <select
                id="department-branch"
                value={departmentForm.branchId}
                onChange={(event) =>
                  setDepartmentForm((current) => ({ ...current, branchId: event.target.value }))
                }
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
              >
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department-name">Sub-Department Name</Label>
              <Input
                id="department-name"
                value={departmentForm.name}
                onChange={(event) => setDepartmentForm((current) => ({ ...current, name: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department-head">Sub-Department Head</Label>
              <Input
                id="department-head"
                value={departmentForm.head}
                onChange={(event) => setDepartmentForm((current) => ({ ...current, head: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
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
            <Button onClick={handleDepartmentSave} disabled={saving || !departmentForm.name.trim() || !selectedBranch}>
              Create Sub-Department
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddStateModal open={stateDialogOpen} onOpenChange={setStateDialogOpen} />
      <AddCityModal open={cityDialogOpen} onOpenChange={setCityDialogOpen} />

      <SafeDeleteDepartmentModal
        open={!!deleteTargetNode}
        onOpenChange={(open) => !open && setDeleteTargetNode(null)}
        node={deleteTargetNode}
        onDeleteSuccess={async () => {
          setDeleteTargetNode(null)
          await loadTree(true)
        }}
      />

      <BranchGeofenceModal
        open={!!geofenceTargetBranch}
        onOpenChange={(open) => !open && setGeofenceTargetBranch(null)}
        branch={geofenceTargetBranch}
        onSaved={() => loadTree(true)}
      />
    </MainLayout>
  )
}
