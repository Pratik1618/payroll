"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, Eye } from "lucide-react"
import { toast } from "sonner"
import { MainLayout } from "@/components/ui/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EmployeeAutocomplete } from "@/components/ui/payroll/employee-autocomplete"

type Employee = {
  id: string
  name: string
  branch: string
  client: string
  site: string
  designation: string
  doj: string
  status: "Active" | "Resigned"
}

type TransferHistoryItem = {
  date: string
  fromSite: string
  toSite: string
  fromClient: string
  toClient: string
  doneBy: string
  reason: string
}

const mockEmployees: Employee[] = [
  {
    id: "EMP001",
    name: "Rajesh Kumar",
    branch: "Mumbai",
    client: "Acme Corp",
    site: "Site A",
    designation: "Security Guard",
    doj: "2023-01-15",
    status: "Active",
  },
  {
    id: "EMP002",
    name: "Amit Singh",
    branch: "Mumbai",
    client: "Globex Ltd",
    site: "Plant 1",
    designation: "Supervisor",
    doj: "2022-06-10",
    status: "Resigned",
  },
]

const initialTransferHistory: TransferHistoryItem[] = [
  {
    date: "2024-12-01",
    fromSite: "Site A",
    toSite: "Site B",
    fromClient: "Acme Corp",
    toClient: "Acme Corp",
    doneBy: "HR Admin",
    reason: "Manpower Adjustment",
  },
]

export default function TransferEmployeesPage() {
  const [selectedEmpId, setSelectedEmpId] = useState("")
  const [effectiveDate, setEffectiveDate] = useState<Date | undefined>()
  const [transferType, setTransferType] = useState("")
  const [newBranch, setNewBranch] = useState("")
  const [newClient, setNewClient] = useState("")
  const [newSite, setNewSite] = useState("")
  const [reason, setReason] = useState("")
  const [remarks, setRemarks] = useState("")
  const [previewOpen, setPreviewOpen] = useState(false)
  const [transferHistory, setTransferHistory] = useState<TransferHistoryItem[]>(initialTransferHistory)

  const selectedEmployee = mockEmployees.find((e) => e.id === selectedEmpId)

  const handleSave = () => {
    if (!selectedEmployee) {
      toast.error("Please select employee")
      return
    }

    if (!effectiveDate) {
      toast.error("Effective date required")
      return
    }

    if (!transferType || !newBranch || !newClient || !newSite || !reason) {
      toast.error("Please fill all transfer details")
      return
    }

    const doj = new Date(selectedEmployee.doj)
    if (effectiveDate < doj) {
      toast.error("Effective date cannot be before DOJ")
      return
    }

    setTransferHistory((prev) => [
      {
        date: format(effectiveDate, "yyyy-MM-dd"),
        fromSite: selectedEmployee.site,
        toSite: newSite,
        fromClient: selectedEmployee.client,
        toClient: newClient,
        doneBy: "HR Admin",
        reason,
      },
      ...prev,
    ])

    toast.success("Employee transfer saved successfully")
    setTransferType("")
    setNewBranch("")
    setNewClient("")
    setNewSite("")
    setReason("")
    setRemarks("")
    setEffectiveDate(undefined)
    setPreviewOpen(false)
  }

  const employeeOptions = mockEmployees.map((emp) => ({
    code: emp.id,
    name: emp.name,
    designation: emp.designation,
    site: emp.site,
  }))

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Transfer Employees</h1>
          <p className="text-muted-foreground ">
            Transfer employee between site, client, branch or department with effective date
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Employee Selection</CardTitle>
            <CardDescription>Search and select employee before creating transfer request</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-4 gap-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mumbai">Mumbai</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="acme">Acme Corp</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Site" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="siteA">Site A</SelectItem>
              </SelectContent>
            </Select>

            <EmployeeAutocomplete
              value={selectedEmpId}
              onChange={setSelectedEmpId}
              employees={employeeOptions}
              placeholder="Search employee..."
            />
          </CardContent>
        </Card>

        {selectedEmployee && (
          <Card>
            <CardHeader>
              <CardTitle>Current Employee Details</CardTitle>
              <CardDescription>Current assignment and payroll attributes</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-4 gap-4 text-sm">
              <div className="space-y-1 rounded-md border p-3">
                <Label>Name</Label>
                <p>{selectedEmployee.name}</p>
              </div>
              <div className="space-y-1 rounded-md border p-3">
                <Label>Employee ID</Label>
                <p>{selectedEmployee.id}</p>
              </div>
              <div className="space-y-1 rounded-md border p-3">
                <Label>Branch</Label>
                <p>{selectedEmployee.branch}</p>
              </div>
              <div className="space-y-1 rounded-md border p-3">
                <Label>Client</Label>
                <p>{selectedEmployee.client}</p>
              </div>
              <div className="space-y-1 rounded-md border p-3">
                <Label>Site</Label>
                <p>{selectedEmployee.site}</p>
              </div>
              <div className="space-y-1 rounded-md border p-3">
                <Label>Designation</Label>
                <p>{selectedEmployee.designation}</p>
              </div>
              <div className="space-y-1 rounded-md border p-3">
                <Label>DOJ</Label>
                <p>{selectedEmployee.doj}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedEmployee && (
          <Card>
            <CardHeader>
              <CardTitle>Transfer Details</CardTitle>
              <CardDescription>Provide new branch, client and site details for transfer</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>New Branch</Label>
                <Select value={newBranch} onValueChange={setNewBranch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mumbai">Mumbai</SelectItem>
                    <SelectItem value="Delhi">Delhi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>New Client</Label>
                <Select value={newClient} onValueChange={setNewClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Acme Corp">Acme Corp</SelectItem>
                    <SelectItem value="Globex Ltd">Globex Ltd</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>New Site</Label>
                <Select value={newSite} onValueChange={setNewSite}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Site" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Site A">Site A</SelectItem>
                    <SelectItem value="Site B">Site B</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Transfer Type</Label>
                <Select value={transferType} onValueChange={setTransferType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="site">Site</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="branch">Branch</SelectItem>
                    <SelectItem value="department">Department</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Effective Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {effectiveDate ? format(effectiveDate, "PPP") : "Pick Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <Calendar mode="single" selected={effectiveDate} onSelect={setEffectiveDate} />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Reason</Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manpower Adjustment">Manpower Adjustment</SelectItem>
                    <SelectItem value="Promotion">Promotion</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-3">
                <Label>Remarks</Label>
                <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} />
              </div>

              <div className="md:col-span-3 flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setPreviewOpen(true)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button onClick={handleSave}>Save Transfer</Button>
                <Button variant="ghost">Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedEmployee && (
          <Card>
            <CardHeader>
              <CardTitle>Payroll Impact</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <ul className="list-disc space-y-1 pl-5">
                <li>Attendance will shift from effective date.</li>
                <li>Payroll mapping will change to new site and client.</li>
                <li>Compliance branch mapping will update.</li>
                <li>Past payroll data remains unchanged.</li>
              </ul>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Transfer History</CardTitle>
            <CardDescription>Recent transfer records including from and to client/site mapping</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Date</TableHead>
                    <TableHead>From Client</TableHead>
                    <TableHead>From Site</TableHead>
                    <TableHead>To Client</TableHead>
                    <TableHead>To Site</TableHead>
                    <TableHead>Done By</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transferHistory.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No transfer history available
                      </TableCell>
                    </TableRow>
                  )}
                  {transferHistory.map((item, index) => (
                    <TableRow key={`${item.date}-${item.fromSite}-${item.toSite}-${index}`}>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{item.fromClient}</TableCell>
                      <TableCell>{item.fromSite}</TableCell>
                      <TableCell>{item.toClient}</TableCell>
                      <TableCell>{item.toSite}</TableCell>
                      <TableCell>{item.doneBy}</TableCell>
                      <TableCell>{item.reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Transfer Preview</DialogTitle>
            </DialogHeader>
            <div className="text-sm space-y-2">
              <p>
                <strong>Employee:</strong> {selectedEmployee?.name}
              </p>
              <p>
                <strong>From:</strong> {selectedEmployee?.client} / {selectedEmployee?.site}
              </p>
              <p>
                <strong>To:</strong> {newClient || "-"} / {newSite || "-"}
              </p>
              <p>
                <strong>Effective Date:</strong> {effectiveDate ? format(effectiveDate, "PPP") : "-"}
              </p>
              <p>
                <strong>Reason:</strong> {reason || "-"}
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
