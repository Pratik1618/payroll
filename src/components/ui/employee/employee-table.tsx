"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Eye, User, Info } from "lucide-react"
import { withBasePath } from "@/lib/base-path"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

// Backend (employee_history module) only models id/empId/name/designation/
// joiningDate/salaryRecordCount - there is no bank details, UAN/ESIC/aadhar,
// tax regime, or per-component salary structure endpoint. Those fields have
// been dropped rather than faked.
interface Employee {
  id: string
  empId: string
  name: string
  designation: string | null
  joiningDate: string | null
  salaryRecordCount: number
}

interface EmployeeTableProps {
  searchTerm: string
  filterSite: string
}

export function EmployeeTable({ searchTerm, filterSite }: EmployeeTableProps) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (filterSite && filterSite !== "all") params.set("siteId", filterSite)
        const res = await fetch(withBasePath(`/api/employees${params.toString() ? `?${params}` : ""}`), {
          credentials: "include",
          cache: "no-store",
        })
        const json = await res.json()
        if (res.ok) {
          setEmployees(json?.results?.data ?? [])
        } else {
          setEmployees([])
        }
      } catch (error) {
        console.error("Error loading employees:", error)
        setEmployees([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [filterSite])

  const filteredEmployees = employees.filter((employee) => {
    const term = searchTerm.toLowerCase()
    return (
      employee.name.toLowerCase().includes(term) ||
      employee.empId.toLowerCase().includes(term) ||
      (employee.designation ?? "").toLowerCase().includes(term)
    )
  })

  const handleEdit = (employee: Employee) => {
    console.log("Edit employee:", employee)
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Employee</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Code</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Designation</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Salary Records</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.map((employee) => (
            <tr key={employee.id} className="border-b border-border hover:bg-accent/50">
              <td className="py-3 px-4 font-medium text-foreground">{employee.name}</td>
              <td className="py-3 px-4 text-muted-foreground">{employee.empId}</td>
              <td className="py-3 px-4 text-foreground">{employee.designation ?? "-"}</td>
              <td className="py-3 px-4 text-foreground">{employee.salaryRecordCount}</td>
              <td className="py-3 px-4">
                <div className="flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg rounded-xl shadow-lg border border-border bg-background">
                      <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <User className="h-7 w-7 text-primary" />
                          <div>
                            <DialogTitle className="text-xl">{employee.name}</DialogTitle>
                            <DialogDescription className="text-base">{employee.designation ?? "-"}</DialogDescription>
                          </div>
                        </div>
                      </DialogHeader>
                      <div className="rounded-lg bg-muted/50 p-4 border text-sm">
                        <div className="flex items-center gap-2 mb-2 text-primary font-semibold">
                          <Info className="h-4 w-4" /> Employee Info
                        </div>
                        <div><span className="font-medium">Employee Code:</span> {employee.empId}</div>
                        <div><span className="font-medium">Joining Date:</span> {employee.joiningDate ?? "-"}</div>
                        <div><span className="font-medium">Salary Records:</span> {employee.salaryRecordCount}</div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(employee)} className="h-8 w-8">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!loading && filteredEmployees.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">No employees found matching your criteria.</div>
      )}
      {loading && (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      )}
    </div>
  )
}
