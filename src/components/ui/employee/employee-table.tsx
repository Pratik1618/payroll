"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Eye, Trash2, Banknote, User, Info, Wallet, CalendarDays } from "lucide-react"
import axios from "axios"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface Employee {
  id: string
  name: string
  employeeCode: string
  designation: string
  site: string
  contractType: string
 
  status: "active" | "inactive"
  uan?: string
  esic?: string
  aadhar?: string
  address?: string
  basic?: number
  da?: number
  hra?: number
  pfDeduction?: number
  esicDeduction?: number
  ptDeduction?: number
  employerPf?: number
  employerEsic?: number
  employerLwf?: number
  // Bank details
  bankName?: string
  accountNumber?: string
  ifsc?: string
  leavesRemaining?: number

  // New fields for last salary credited
  lastSalaryAmount?: number
  lastSalaryDate?: string // ISO date string preferred
}

const mockEmployees: Employee[] = [
  {
    id: "1",
    name: "Rajesh Kumar",
    employeeCode: "EMP001",
    designation: "Manager",
    site: "site-a",
    contractType: "permanent",
    
    status: "active",
    uan: "100200300400",
    esic: "ESIC123456",
    aadhar: "1234-5678-9012",
    address: "123 Main St, Mumbai",
    basic: 30000,
    da: 5000,
    hra: 10000,
    pfDeduction: 1800,
    esicDeduction: 500,
    ptDeduction: 200,
    employerPf: 1800,
    employerEsic: 500,
    employerLwf: 50,
    
    bankName: "State Bank of India",
    accountNumber: "12345678901",
    ifsc: "SBIN0001234",
    leavesRemaining: 12,
    lastSalaryAmount: 67000,
    lastSalaryDate: "2025-09-30",
  },
  {
    id: "2",
    name: "Priya Sharma",
    employeeCode: "EMP002",
    designation: "Supervisor",
    site: "site-b",
    contractType: "contract",

    status: "active",
    uan: "200300400500",
    esic: "ESIC654321",
    aadhar: "2345-6789-0123",
    address: "456 Park Ave, Pune",
    basic: 18000,
    da: 3000,
    hra: 6000,
    pfDeduction: 1200,
    esicDeduction: 300,
    ptDeduction: 100,
    employerPf: 1200,
    employerEsic: 300,
    employerLwf: 50,
    bankName: "HDFC Bank",
    accountNumber: "98765432109",
    ifsc: "HDFC0005678",
    leavesRemaining: 8,
    lastSalaryAmount: 38000,
    lastSalaryDate: "2025-09-28",
  },
]

interface EmployeeTableProps {
  searchTerm: string
  filterSite: string
}

export function EmployeeTable({ searchTerm, filterSite }: EmployeeTableProps) {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees)

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.designation.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSite = filterSite === "all" || employee.site === filterSite

    return matchesSearch && matchesSite
  })
const calculateMonthlyCost = (employee: Employee) => {
  const {
    basic = 0,
    da = 0,
    hra = 0,
    employerPf = 0,
    employerEsic = 0,
    employerLwf = 0,
  } = employee

  return basic + da + hra + employerPf + employerEsic + employerLwf
}

const calculateCTC = (employee: Employee) => {
  const monthlyCost = calculateMonthlyCost(employee)
  return monthlyCost * 12
}

  const getSiteName = (siteCode: string) => {
    const siteMap: Record<string, string> = {
      "site-a": "Site A - Corporate",
      "site-b": "Site B - Manufacturing",
      "site-c": "Site C - Warehouse",
    }
    return siteMap[siteCode] || siteCode
  }

  const formatCurrency = (amount?: number) => {
    if (typeof amount !== "number") return "-"
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleEdit = (employee: Employee) => {
    console.log("Edit employee:", employee)
  }

  const handleDelete = async (employeeId: string) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      try {
        await axios.delete(`/api/employees/${employeeId}`)
        setEmployees((prev) => prev.filter((emp) => emp.id !== employeeId))
      } catch (error) {
        console.error("Error deleting employee:", error)
      }
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Employee</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Code</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Designation</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Site</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Contract</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">CTC</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.map((employee) => (
            <tr key={employee.id} className="border-b border-border hover:bg-accent/50">
              <td className="py-3 px-4 font-medium text-foreground">{employee.name}</td>
              <td className="py-3 px-4 text-muted-foreground">{employee.employeeCode}</td>
              <td className="py-3 px-4 text-foreground">{employee.designation}</td>
              <td className="py-3 px-4 text-muted-foreground">{getSiteName(employee.site)}</td>
              <td className="py-3 px-4">
                <Badge
                  variant={employee.contractType === "permanent" ? "default" : "secondary"}
                  className={
                    employee.contractType === "permanent"
                      ? "bg-green-100 text-green-800"
                      : employee.contractType === "contract"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-orange-100 text-orange-800"
                  }
                >
                  {employee.contractType}
                </Badge>
              </td>
              <td className="py-3 px-4 text-foreground">{formatCurrency(calculateCTC(employee))}</td>
              <td className="py-3 px-4">
                <Badge
                  variant={employee.status === "active" ? "default" : "secondary"}
                  className={employee.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                >
                  {employee.status}
                </Badge>
              </td>
              <td className="py-3 px-4">
                <div className="flex space-x-2">
                  {/* 👇 Dialog for full detail view */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-lg border border-border bg-background">
                      <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <User className="h-7 w-7 text-primary" />
                          <div>
                            <DialogTitle className="text-xl">{employee.name}</DialogTitle>
                            <DialogDescription className="text-base">{employee.designation}</DialogDescription>
                          </div>
                        </div>
                      </DialogHeader>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm mt-2">
                        {/* Personal Info */}
                        <div className="rounded-lg bg-muted/50 p-4 border">
                          <div className="flex items-center gap-2 mb-2 text-primary font-semibold">
                            <Info className="h-4 w-4" /> Personal Info
                          </div>
                          <div><span className="font-medium">Employee Code:</span> {employee.employeeCode}</div>
                          <div><span className="font-medium">Site:</span> {getSiteName(employee.site)}</div>
                          <div><span className="font-medium">Contract Type:</span> {employee.contractType}</div>
                          <div><span className="font-medium">Status:</span> {employee.status}</div>
                          <div><span className="font-medium">UAN:</span> {employee.uan || "-"}</div>
                          <div><span className="font-medium">ESIC:</span> {employee.esic || "-"}</div>
                          <div><span className="font-medium">Aadhar:</span> {employee.aadhar || "-"}</div>
                          <div><span className="font-medium">Address:</span> {employee.address || "-"}</div>
                        </div>

                        {/* Bank Details */}
                        <div className="rounded-lg bg-muted/50 p-4 border">
                          <div className="flex items-center gap-2 mb-2 text-primary font-semibold">
                            <Banknote className="h-4 w-4" /> Bank Details
                          </div>
                          <div><span className="font-medium">Bank Name:</span> {employee.bankName || "-"}</div>
                          <div><span className="font-medium">Account Number:</span> {employee.accountNumber || "-"}</div>
                          <div><span className="font-medium">IFSC:</span> {employee.ifsc || "-"}</div>
                        </div>

                        {/* Salary Details (includes deductions and employer side) */}
                        <div className="rounded-lg bg-muted/50 p-4 border col-span-1 md:col-span-2">
                          <div className="flex items-center gap-2 mb-2 text-primary font-semibold">
                            <Wallet className="h-4 w-4" /> Salary Details
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="font-medium mb-1">Earnings</div>
                              <div>Basic: {formatCurrency(employee.basic)}</div>
                              <div>DA: {formatCurrency(employee.da)}</div>
                              <div>HRA: {formatCurrency(employee.hra)}</div>
                              <div>CTC: {formatCurrency(calculateCTC(employee))}</div>
                            </div>
                            <div>
                              <div className="font-medium mb-1">Deductions</div>
                              <div>PF: {formatCurrency(employee.pfDeduction)}</div>
                              <div>ESIC: {formatCurrency(employee.esicDeduction)}</div>
                              <div>PT: {formatCurrency(employee.ptDeduction)}</div>
                              <div className="font-medium mt-2 mb-1">Employer Contributions</div>
                              <div>Employer PF: {formatCurrency(employee.employerPf)}</div>
                              <div>Employer ESIC: {formatCurrency(employee.employerEsic)}</div>
                              <div>Employer LWF: {formatCurrency(employee.employerLwf)}</div>
                            </div>
                          </div>
                        </div>

                        {/* Leaves */}
                        <div className="rounded-lg bg-muted/50 p-4 border col-span-1 md:col-span-2">
                          <div className="flex items-center gap-2 mb-2 text-primary font-semibold">
                            <CalendarDays className="h-4 w-4" /> Leave Details
                          </div>
                          <div>
                            <span className="font-medium">Leaves Remaining:</span> {employee.leavesRemaining ?? "-"}
                          </div>
                        </div>

                        {/* Last Salary Credited */}
                        <div className="rounded-lg bg-muted/50 p-4 border col-span-1 md:col-span-2">
                          <div className="flex items-center gap-2 mb-2 text-primary font-semibold">
                            <Banknote className="h-4 w-4" /> Last Salary Credited
                          </div>
                          <div>
                            <div>
                              <span className="font-medium">Amount:</span> {formatCurrency(employee.lastSalaryAmount)}
                            </div>
                            <div>
                              <span className="font-medium">Date:</span>{" "}
                              {employee.lastSalaryDate
                                ? new Date(employee.lastSalaryDate).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "-"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button variant="ghost" size="icon" onClick={() => handleEdit(employee)} className="h-8 w-8">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(employee.id)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredEmployees.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">No employees found matching your criteria.</div>
      )}
    </div>
  )
}
