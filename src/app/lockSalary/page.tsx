"use client"

import { useState } from "react"
import { MainLayout } from "@/components/ui/layout/main-layout" 
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Lock, Eye, Users, DollarSign, TrendingDown } from "lucide-react"
import { toast } from "sonner"

interface BranchPeriod {
  id: string
  branchName: string
  month: string
  year: string
  isLocked: boolean
  lockedAt?: string
}

interface LockedBranch {
  id: string
  branchName: string
  salaryMonth: string
  lockedTimestamp: string
  totalEmployees: number
  totalGrossSalary: number
  totalDeductions: number
  totalNetSalary: number
}

export default function LockSalaryPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("B001-Nov-2025")
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedLockedBranch, setSelectedLockedBranch] = useState<LockedBranch | null>(null)

  const unlockedPeriods: BranchPeriod[] = [
    { id: "B001-Nov-2025", branchName: "Delhi Branch", month: "November", year: "2025", isLocked: false },
    { id: "B002-Nov-2025", branchName: "Mumbai Branch", month: "November", year: "2025", isLocked: false },
    { id: "B004-Nov-2025", branchName: "Pune Branch", month: "November", year: "2025", isLocked: false },
    { id: "B001-Oct-2025", branchName: "Delhi Branch", month: "October", year: "2025", isLocked: false },
  ]

  const lockedBranches: LockedBranch[] = [
    {
      id: "B001-Sep-2025",
      branchName: "Delhi Branch",
      salaryMonth: "September 2025",
      lockedTimestamp: "2025-11-29 14:30:00",
      totalEmployees: 245,
      totalGrossSalary: 8750000,
      totalDeductions: 1250000,
      totalNetSalary: 7500000,
    },
    {
      id: "B003-Nov-2025",
      branchName: "Bangalore Branch",
      salaryMonth: "November 2025",
      lockedTimestamp: "2025-11-28 10:15:00",
      totalEmployees: 189,
      totalGrossSalary: 7200000,
      totalDeductions: 950000,
      totalNetSalary: 6250000,
    },
    {
      id: "B002-Oct-2025",
      branchName: "Mumbai Branch",
      salaryMonth: "October 2025",
      lockedTimestamp: "2025-11-27 09:45:00",
      totalEmployees: 312,
      totalGrossSalary: 10500000,
      totalDeductions: 1450000,
      totalNetSalary: 9050000,
    },
  ]

  const currentPeriod = unlockedPeriods.find((p) => p.id === selectedPeriod)

  const handleLockClick = () => {
    if (currentPeriod) {
      toast.success(
        `Salary for ${currentPeriod.branchName} - ${currentPeriod.month} ${currentPeriod.year} has been locked`,
      )
      setSelectedPeriod("")
    }
  }

  const handleViewClick = (branch: LockedBranch) => {
    setSelectedLockedBranch(branch)
    setViewModalOpen(true)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-3xl font-bold text-foreground">Lock Salary</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and finalize branch salary for specific periods</p>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Select Branch & Period to Lock</CardTitle>
            <CardDescription>Only showing branches/periods that are not yet locked</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Branch / Salary Period</label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a branch and period" />
                  </SelectTrigger>
                  <SelectContent>
                    {unlockedPeriods.map((period) => (
                      <SelectItem key={period.id} value={period.id}>
                        {period.branchName} - {period.month} {period.year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPeriod && currentPeriod && (
                <Button onClick={handleLockClick} className="w-full gap-2 bg-primary hover:bg-primary/90">
                  <Lock className="w-4 h-4" />
                  Lock Salary for {currentPeriod.branchName}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Locked Salary Records</CardTitle>
            <CardDescription>View details of finalized branch payroll</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="font-semibold">Branch Name</TableHead>
                    <TableHead className="font-semibold">Salary Month</TableHead>
                    <TableHead className="font-semibold">Locked Timestamp</TableHead>
                    <TableHead className="text-right font-semibold">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lockedBranches.map((branch) => (
                    <TableRow key={branch.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{branch.branchName}</TableCell>
                      <TableCell>{branch.salaryMonth}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{branch.lockedTimestamp}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleViewClick(branch)} className="gap-2">
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Salary Summary</DialogTitle>
            <DialogDescription>
              {selectedLockedBranch?.branchName} - {selectedLockedBranch?.salaryMonth}
            </DialogDescription>
          </DialogHeader>

          {selectedLockedBranch && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">Total Employees</span>
                  </div>
                  <div className="text-2xl font-bold">{selectedLockedBranch.totalEmployees}</div>
                </div>

                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">Gross Salary</span>
                  </div>
                  <div className="text-xl font-bold">
                    ₹{(selectedLockedBranch.totalGrossSalary / 100000).toFixed(1)}L
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">Deductions</span>
                  </div>
                  <div className="text-xl font-bold">
                    ₹{(selectedLockedBranch.totalDeductions / 100000).toFixed(1)}L
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-medium text-green-700">Net Salary</span>
                  </div>
                  <div className="text-xl font-bold text-green-700">
                    ₹{(selectedLockedBranch.totalNetSalary / 100000).toFixed(1)}L
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 text-xs text-muted-foreground">
                <p>
                  Locked on: <strong>{selectedLockedBranch.lockedTimestamp}</strong>
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}
