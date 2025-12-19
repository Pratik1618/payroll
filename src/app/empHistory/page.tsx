"use client"

import { useState } from "react"
import { MainLayout } from "@/components/ui/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, Calendar, TrendingUp, Users } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"

type SalaryComponent = {
  name: string
  amount: number
}

type SalaryRecord = {
  id: string
  month: string
  year: number
  grossSalary: number
  deductions: number
  netSalary: number
  earnings: SalaryComponent[]
  deductionsList: SalaryComponent[]
  status: "Paid" | "Pending" | "Hold"
  client: string
  site: string
}

type Employee = {
  id: string
  name: string
  empId: string
  designation: string
  joiningDate: string
  salaryHistory: SalaryRecord[]
}

// Mock data
const mockEmployees: Employee[] = [
  {
    id: "1",
    name: "Rajesh Kumar",
    empId: "EMP001",
    designation: "Senior Developer",
    joiningDate: "2023-01-15",
    salaryHistory: [
      {
        id: "s1",
        month: "January",
        year: 2024,
        grossSalary: 75000,
        deductions: 8500,
        netSalary: 66500,
        earnings: [
          { name: "Basic", amount: 35000 },
          { name: "HRA", amount: 17500 },
          { name: "DA", amount: 10500 },
          { name: "Special Allowance", amount: 12000 },
        ],
        deductionsList: [
          { name: "PF", amount: 4200 },
          { name: "ESIC", amount: 1500 },
          { name: "PT", amount: 200 },
          { name: "TDS", amount: 2600 },
        ],
        status: "Paid",
        client: "ABC Corp",
        site: "Mumbai",
      },
      {
        id: "s2",
        month: "February",
        year: 2024,
        grossSalary: 75000,
        deductions: 8500,
        netSalary: 66500,
        earnings: [
          { name: "Basic", amount: 35000 },
          { name: "HRA", amount: 17500 },
          { name: "DA", amount: 10500 },
          { name: "Special Allowance", amount: 12000 },
        ],
        deductionsList: [
          { name: "PF", amount: 4200 },
          { name: "ESIC", amount: 1500 },
          { name: "PT", amount: 200 },
          { name: "TDS", amount: 2600 },
        ],
        status: "Paid",
        client: "ABC Corp",
        site: "Mumbai",
      },
      {
        id: "s3",
        month: "March",
        year: 2024,
        grossSalary: 80000,
        deductions: 9000,
        netSalary: 71000,
        earnings: [
          { name: "Basic", amount: 37000 },
          { name: "HRA", amount: 18500 },
          { name: "DA", amount: 11500 },
          { name: "Special Allowance", amount: 13000 },
        ],
        deductionsList: [
          { name: "PF", amount: 4440 },
          { name: "ESIC", amount: 1600 },
          { name: "PT", amount: 200 },
          { name: "TDS", amount: 2760 },
        ],
        status: "Paid",
        client: "XYZ Ltd",
        site: "Delhi",
      },
    ],
  },
  {
    id: "2",
    name: "Priya Sharma",
    empId: "EMP002",
    designation: "HR Manager",
    joiningDate: "2022-06-01",
    salaryHistory: [
      {
        id: "s4",
        month: "January",
        year: 2024,
        grossSalary: 65000,
        deductions: 7500,
        netSalary: 57500,
        earnings: [
          { name: "Basic", amount: 30000 },
          { name: "HRA", amount: 15000 },
          { name: "DA", amount: 9000 },
          { name: "Special Allowance", amount: 11000 },
        ],
        deductionsList: [
          { name: "PF", amount: 3600 },
          { name: "ESIC", amount: 1300 },
          { name: "PT", amount: 200 },
          { name: "TDS", amount: 2400 },
        ],
        status: "Paid",
        client: "DEF Inc",
        site: "Bangalore",
      },
    ],
  },
]

export default function EmployeeHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [selectedSalary, setSelectedSalary] = useState<SalaryRecord | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const filteredEmployees = searchTerm
    ? mockEmployees.filter(
        (emp) =>
          emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.empId.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : mockEmployees

  const handleSelectEmployee = (employee: Employee) => {
    setSelectedEmployee(employee)
    toast.success(`Selected employee: ${employee.name}`)
  }

  const handleViewDetails = (salary: SalaryRecord) => {
    setSelectedSalary(salary)
    setDialogOpen(true)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Employee History</h1>
            <p className="text-muted-foreground mt-1">
              View complete salary history of employees from joining to current
            </p>
          </div>
        </div>

        {/* Search Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Search Employee
            </CardTitle>
            <CardDescription>Search by employee name or employee ID</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Enter employee name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </CardContent>
        </Card>

        {!selectedEmployee && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                All Employees
              </CardTitle>
              <CardDescription>
                {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? "s" : ""} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className="border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => handleSelectEmployee(employee)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{employee.name}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>ID: {employee.empId}</span>
                          <span>•</span>
                          <span>{employee.designation}</span>
                          <span>•</span>
                          <span>Joined: {employee.joiningDate}</span>
                        </div>
                      </div>
                      <Badge variant="outline">{employee.salaryHistory.length} salary records</Badge>
                    </div>
                  </div>
                ))}
                {filteredEmployees.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No employees found matching "{searchTerm}"
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Employee Details & Salary History */}
        {selectedEmployee && (
          <>
            <Button variant="outline" onClick={() => setSelectedEmployee(null)}>
              ← Back to Employee List
            </Button>

            {/* Employee Info */}
            <Card>
              <CardHeader>
                <CardTitle>Employee Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedEmployee.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Employee ID</p>
                    <p className="font-medium">{selectedEmployee.empId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Designation</p>
                    <p className="font-medium">{selectedEmployee.designation}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Joining Date</p>
                    <p className="font-medium">{selectedEmployee.joiningDate}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Salary History Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Salary History
                </CardTitle>
                <CardDescription>Complete salary history from joining to current month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedEmployee.salaryHistory.map((salary) => (
                    <div key={salary.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">
                              {salary.month} {salary.year}
                            </h3>
                            <Badge
                              variant={
                                salary.status === "Paid"
                                  ? "default"
                                  : salary.status === "Pending"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {salary.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Gross Salary</p>
                              <p className="font-medium">₹{salary.grossSalary.toLocaleString("en-IN")}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Deductions</p>
                              <p className="font-medium">₹{salary.deductions.toLocaleString("en-IN")}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Net Salary</p>
                              <p className="font-medium text-primary">₹{salary.netSalary.toLocaleString("en-IN")}</p>
                            </div>
                          </div>
                          <div className="flex gap-4 text-sm mt-2">
                            <div>
                              <p className="text-muted-foreground">Client</p>
                              <p className="font-medium">{salary.client}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Site</p>
                              <p className="font-medium">{salary.site}</p>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(salary)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Salary Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Salary Details - {selectedSalary?.month} {selectedSalary?.year}
            </DialogTitle>
            <DialogDescription>Complete breakdown of salary components</DialogDescription>
          </DialogHeader>

          {selectedSalary && (
            <div className="space-y-6 py-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-accent/50 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Gross Salary</p>
                  <p className="text-2xl font-bold">₹{selectedSalary.grossSalary.toLocaleString("en-IN")}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Total Deductions</p>
                  <p className="text-2xl font-bold text-destructive">
                    - ₹{selectedSalary.deductions.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Net Salary</p>
                  <p className="text-2xl font-bold text-primary">₹{selectedSalary.netSalary.toLocaleString("en-IN")}</p>
                </div>
              </div>
              <div className="flex justify-center gap-8 p-4 bg-accent/50 rounded-lg mt-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Client</p>
                  <p className="text-lg font-semibold">{selectedSalary.client}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Site</p>
                  <p className="text-lg font-semibold">{selectedSalary.site}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Earnings */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Earnings
                  </h3>
                  <div className="space-y-2">
                    {selectedSalary.earnings.map((earning) => (
                      <div
                        key={earning.name}
                        className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-md"
                      >
                        <span className="text-sm font-medium">{earning.name}</span>
                        <span className="font-semibold">₹{earning.amount.toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between p-3 bg-green-100 dark:bg-green-900/30 rounded-md font-bold">
                      <span>Total Earnings</span>
                      <span>₹{selectedSalary.grossSalary.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-red-600 rotate-180" />
                    Deductions
                  </h3>
                  <div className="space-y-2">
                    {selectedSalary.deductionsList.map((deduction) => (
                      <div
                        key={deduction.name}
                        className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-md"
                      >
                        <span className="text-sm font-medium">{deduction.name}</span>
                        <span className="font-semibold">₹{deduction.amount.toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between p-3 bg-red-100 dark:bg-red-900/30 rounded-md font-bold">
                      <span>Total Deductions</span>
                      <span>₹{selectedSalary.deductions.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}
