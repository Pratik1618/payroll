"use client"

import { useState } from "react"
import { MainLayout } from "@/components/ui/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { Trash2, Plus } from "lucide-react"
import { EmployeeAutocomplete } from "@/components/ui/payroll/employee-autocomplete"

interface ScheduledEntry {
  id: string
  month: string
  type: "Earning" | "Deduction"
  component: string
  amount: number
  reference: string
  status: "Scheduled" | "Applied" | "Cancelled"
}

const earningComponents = [
  "Incentive",
  "Mobile Allowance",
  "Arrears",
  "Bonus",
  "Performance Bonus",
  "Travel Allowance",
  "Other Allowance",
]

const deductionComponents = [
  "Advance",
  "Uniform",
  "Penalty",
  "Recovery",
  "Loan Repayment",
  "Damage Recovery",
  "Other Deduction",
]

export default function EarningDeductionPage() {
  const [selectedBranch, setSelectedBranch] = useState("")
  const [selectedClient, setSelectedClient] = useState("")
  const [selectedSite, setSelectedSite] = useState("")
  const [employeeCode, setEmployeeCode] = useState("")
  const [entryType, setEntryType] = useState<"Earning" | "Deduction">("Earning")
  const [selectedComponent, setSelectedComponent] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("")
  const [amount, setAmount] = useState("")
  const [reference, setReference] = useState("")
  const [scheduledEntries, setScheduledEntries] = useState<ScheduledEntry[]>([])

  // Mock employee data for context filtering
  const mockEmployees = [
    { code: "EMP001", name: "John Doe", designation: "Software Engineer", site: "Mumbai" },
    { code: "EMP002", name: "Jane Smith", designation: "Product Manager", site: "Bangalore" },
    { code: "EMP003", name: "Raj Kumar", designation: "Data Analyst", site: "Delhi" },
    { code: "EMP004", name: "Priya Patel", designation: "Designer", site: "Mumbai" },
    { code: "EMP005", name: "Amit Singh", designation: "QA Engineer", site: "Hyderabad" },
  ]

  const selectedEmployee = mockEmployees.find((emp) => emp.code === employeeCode)
    ? {
        name: mockEmployees.find((emp) => emp.code === employeeCode)?.name || "Unknown",
        designation: mockEmployees.find((emp) => emp.code === employeeCode)?.designation || "N/A",
        site: mockEmployees.find((emp) => emp.code === employeeCode)?.site || "N/A",
      }
    : null

  const handleAddEntry = () => {
    if (!employeeCode) {
      toast.error("Please select an employee first")
      return
    }

    if (!selectedMonth || !amount) {
      toast.error("Please fill in all required fields")
      return
    }

    const amountNum = Number.parseFloat(amount)
    if (amountNum <= 0) {
      toast.error("Amount must be greater than zero")
      return
    }

    // Validate month is future
    const [year, month] = selectedMonth.split("-")
    const selectedDate = new Date(Number.parseInt(year), Number.parseInt(month) - 1, 1)
    if (selectedDate <= new Date()) {
      toast.error("Only future months are allowed")
      return
    }

    const newEntry: ScheduledEntry = {
      id: Math.random().toString(),
      month: selectedMonth,
      type: entryType,
      component: selectedComponent,
      amount: amountNum,
      reference,
      status: "Scheduled",
    }

    setScheduledEntries([...scheduledEntries, newEntry])
    toast.success(`${entryType} added successfully`)

    // Reset form
    setSelectedComponent("")
    setSelectedMonth("")
    setAmount("")
    setReference("")
  }

  const handleReset = () => {
    setSelectedComponent("")
    setSelectedMonth("")
    setAmount("")
    setReference("")
  }

  const handleDelete = (id: string) => {
    setScheduledEntries(scheduledEntries.filter((entry) => entry.id !== id))
    toast.success("Entry removed")
  }

  const components = entryType === "Earning" ? earningComponents : deductionComponents

  // Generate future months (next 12 months)
  const futureMonths = Array.from({ length: 12 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() + i + 1)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    return {
      value: `${year}-${month}`,
      label: `${date.toLocaleDateString("en-US", { month: "short", year: "numeric" })}`,
    }
  })

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Employee Earning & Deduction</h1>
          <p className="text-muted-foreground mt-1">
            Add or schedule extra earnings or deductions for future payroll month
          </p>
        </div>

        {/* Employee Context */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Context</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Branch <span className="text-destructive">*</span>
                </label>
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mumbai">Mumbai</SelectItem>
                    <SelectItem value="delhi">Delhi</SelectItem>
                    <SelectItem value="bangalore">Bangalore</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Client</label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client1">Client A</SelectItem>
                    <SelectItem value="client2">Client B</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Site</label>
                <Select value={selectedSite} onValueChange={setSelectedSite}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Site" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="site1">Site A</SelectItem>
                    <SelectItem value="site2">Site B</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Employee Code <span className="text-destructive">*</span>
                </label>
                <EmployeeAutocomplete
                  value={employeeCode}
                  onChange={setEmployeeCode}
                  employees={mockEmployees}
                  placeholder="Search by code or name..."
                />
              </div>
            </div>

            {/* Employee Details Display */}
            {selectedEmployee && (
              <div className="mt-4 p-4 bg-accent rounded-lg border">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="font-medium text-foreground">{selectedEmployee.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Designation</p>
                    <p className="font-medium text-foreground">{selectedEmployee.designation}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Site</p>
                    <p className="font-medium text-foreground">{selectedEmployee.site}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Entry Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add Entry</CardTitle>
            <CardDescription>Schedule earnings or deductions for future months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Entry Type */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-3">Entry Type</label>
                <RadioGroup value={entryType} onValueChange={(value: any) => setEntryType(value)}>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Earning" id="earning" />
                      <label htmlFor="earning" className="text-sm font-medium cursor-pointer">
                        Earning
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Deduction" id="deduction" />
                      <label htmlFor="deduction" className="text-sm font-medium cursor-pointer">
                        Deduction
                      </label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Component Selection */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Component <span className="text-destructive">*</span>
                </label>
                <Select value={selectedComponent} onValueChange={setSelectedComponent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Component" />
                  </SelectTrigger>
                  <SelectContent>
                    {components.map((comp) => (
                      <SelectItem key={comp} value={comp}>
                        {comp}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Month & Amount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Month <span className="text-destructive">*</span>
                  </label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {futureMonths.map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Amount <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                    <Input
                      placeholder="Enter amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-6"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Reference */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Reference</label>
                <Input
                  placeholder="e.g., Client approval, Loan recovery"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button onClick={handleAddEntry} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scheduled Entries Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Scheduled Entries</CardTitle>
            <CardDescription>
              All future earnings and deductions for {employeeCode || "selected employee"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {scheduledEntries.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No scheduled entries yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Component</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scheduledEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.month}</TableCell>
                        <TableCell>
                          <Badge variant={entry.type === "Earning" ? "default" : "destructive"}>{entry.type}</Badge>
                        </TableCell>
                        <TableCell>{entry.component}</TableCell>
                        <TableCell>₹{entry.amount.toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{entry.reference || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{entry.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="text-destructive hover:text-destructive/80 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
