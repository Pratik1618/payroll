"use client"


import { useState } from "react"
import { MainLayout } from "@/components/ui/layout/main-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Eye, Lock, AlertCircle } from "lucide-react"

export default function LeavePage() {
  const [activeTab, setActiveTab] = useState("summary")
  const [expandedEmployee, setExpandedEmployee] = useState("")
  const [selectedBranch, setSelectedBranch] = useState("all")
  const [selectedLeaveType, setSelectedLeaveType] = useState("all")
  const [selectedFY, setSelectedFY] = useState("2024-25")
  const [search, setSearch] = useState("")

  /* ===================== DATA ===================== */

  const leaveSummary = [
    {
      empId: "EMP001",
      empName: "Rajesh Kumar",
      leaveType: "PL",
      totalEarned: 21,
      totalAvailed: 8,
      totalLapsed: 0.75,
      currentBalance: 2,
      lopDays: 3,
    },
    {
      empId: "EMP002",
      empName: "Priya Singh",
      leaveType: "PL",
      totalEarned: 21,
      totalAvailed: 12,
      totalLapsed: 0,
      currentBalance: 9,
      lopDays: 2,
    },
  ]

  const yearlyLedger: Record<
    string,
    {
      month: string
      opening: number
      earned: number
      availed: number
      lapsed: number
      closing: number
    }[]
  > = {
    EMP001: [
      { month: "Apr 2024", opening: 2, earned: 1.75, availed: 1, lapsed: 0, closing: 2.75 },
      { month: "May 2024", opening: 2.75, earned: 1.75, availed: 0.5, lapsed: 0, closing: 4 },
      { month: "Jun 2024", opening: 4, earned: 1.75, availed: 2, lapsed: 0, closing: 3.75 },
      { month: "Jul 2024", opening: 3.75, earned: 1.75, availed: 1, lapsed: 0, closing: 4.5 },
      { month: "Aug 2024", opening: 4.5, earned: 1.75, availed: 0, lapsed: 0, closing: 6.25 },
      { month: "Sep 2024", opening: 6.25, earned: 1.75, availed: 1, lapsed: 0, closing: 7 },
      { month: "Oct 2024", opening: 7, earned: 1.75, availed: 2, lapsed: 0, closing: 6.75 },
      { month: "Nov 2024", opening: 6.75, earned: 1.75, availed: 0.5, lapsed: 0, closing: 8 },

      // December lapse & reset
      { month: "Dec 2024", opening: 8, earned: 1.75, availed: 1, lapsed: 0.75, closing: 0 },

      // New year starts fresh
      { month: "Jan 2025", opening: 0, earned: 1.75, availed: 2, lapsed: 0, closing: 0 },
      { month: "Feb 2025", opening: 0, earned: 1.75, availed: 1, lapsed: 0, closing: 0.75 },
      { month: "Mar 2025", opening: 0.75, earned: 1.75, availed: 0.5, lapsed: 0, closing: 2 },
    ],
    EMP002: [],
  }

  const lopData = [
    {
      empId: "EMP001",
      month: "Jan 2025",
      monthDays: 26,
      presentDays: 20,
      paidLeave: 1,
      weeklyOffsHolidays: 5,
      derivedLOP: 3,
      payrollStatus: "Locked",
    },
  ]

  /* ===================== FILTERED SUMMARY ===================== */

  const filteredSummary = leaveSummary.filter((emp) => {
    return (
      (search === "" ||
        emp.empId.toLowerCase().includes(search.toLowerCase()) ||
        emp.empName.toLowerCase().includes(search.toLowerCase())) &&
      (selectedLeaveType === "all" || emp.leaveType.toLowerCase() === selectedLeaveType)
    )
  })

  /* ===================== UI ===================== */

  return (
    <MainLayout>
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="summary">Leave Summary</TabsTrigger>
            <TabsTrigger value="lop">LOP Visibility</TabsTrigger>
          </TabsList>

          {/* ===================== LEAVE SUMMARY ===================== */}
          <TabsContent value="summary" className="space-y-4">
            {/* Filters */}
            <div className="grid grid-cols-5 gap-3">
              <Input
                placeholder="Search Employee Code / Name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger>
                  <SelectValue placeholder="Branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  <SelectItem value="mum">Mumbai</SelectItem>
                  <SelectItem value="del">Delhi</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedLeaveType} onValueChange={setSelectedLeaveType}>
                <SelectTrigger>
                  <SelectValue placeholder="Leave Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pl">Paid Leave (PL)</SelectItem>
                  <SelectItem value="cl">Casual Leave (CL)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedFY} onValueChange={setSelectedFY}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-25">FY 2024-25</SelectItem>
                  <SelectItem value="2023-24">FY 2023-24</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline">Filter</Button>
            </div>

            {/* Summary Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Emp Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Leave</TableHead>
                      <TableHead className="text-right">Earned</TableHead>
                      <TableHead className="text-right">Availed</TableHead>
                      <TableHead className="text-right">Lapsed (Dec)</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead className="text-right">LOP</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredSummary.map((emp) => (
                      <>
                        <TableRow key={emp.empId}>
                          <TableCell>{emp.empId}</TableCell>
                          <TableCell>{emp.empName}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{emp.leaveType}</Badge>
                          </TableCell>
                          <TableCell className="text-right">{emp.totalEarned}</TableCell>
                          <TableCell className="text-right">{emp.totalAvailed}</TableCell>
                          <TableCell className="text-right text-orange-600 font-medium">
                            {emp.totalLapsed}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-green-600">
                            {emp.currentBalance}
                          </TableCell>
                          <TableCell className="text-right text-red-600 font-semibold">
                            {emp.lopDays}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                setExpandedEmployee(
                                  expandedEmployee === emp.empId ? "" : emp.empId
                                )
                              }
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>

                        {expandedEmployee === emp.empId && (
                          <TableRow>
                            <TableCell colSpan={9} className="bg-muted/30">
                              <div className="p-4">
                                <h4 className="font-semibold mb-3">
                                  12-Month Leave Ledger
                                </h4>

                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Month</TableHead>
                                      <TableHead className="text-right">Opening</TableHead>
                                      <TableHead className="text-right">Earned</TableHead>
                                      <TableHead className="text-right">Availed</TableHead>
                                      <TableHead className="text-right">Lapsed</TableHead>
                                      <TableHead className="text-right">Closing</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {yearlyLedger[emp.empId]?.map((m, i) => (
                                      <TableRow key={i}>
                                        <TableCell>{m.month}</TableCell>
                                        <TableCell className="text-right">{m.opening}</TableCell>
                                        <TableCell className="text-right text-green-600">
                                          {m.earned}
                                        </TableCell>
                                        <TableCell className="text-right text-red-600">
                                          {m.availed}
                                        </TableCell>
                                        <TableCell className="text-right text-orange-600">
                                          {m.lapsed}
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
                                          {m.closing}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

                    {/* ===================== LOP VISIBILITY ===================== */}
                    {/* ===================== LOP VISIBILITY (PAYROLL POV – READ ONLY) ===================== */}
                    <TabsContent value="lop" className="space-y-4">
                        {/* Info Banner */}
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-3">
                            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                            <div>
                                <p className="font-semibold text-amber-900">
                                    LOP is system-derived and payroll locked
                                </p>
                                <p className="text-sm text-amber-800">
                                    LOP is calculated from attendance and approved leave. Manual edits are not allowed.
                                </p>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="grid grid-cols-5 gap-3">
                            <Input placeholder="Search Employee Code / Name" />
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Month" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="2025-01">January 2025</SelectItem>
                                    <SelectItem value="2024-12">December 2024</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Branch" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Branches</SelectItem>
                                    <SelectItem value="mum">Mumbai</SelectItem>
                                    <SelectItem value="del">Delhi</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="FY" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="2024-25">FY 2024-25</SelectItem>
                                    <SelectItem value="2023-24">FY 2023-24</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline">Filter</Button>
                        </div>

                        {/* LOP Table */}
                        <Card className="bg-card border-border">
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead>Employee Code</TableHead>
                                            <TableHead>Month</TableHead>
                                            <TableHead className="text-right">Month Days</TableHead>
                                            <TableHead className="text-right">Present Days</TableHead>
                                            <TableHead className="text-right">Approved Paid Leave</TableHead>
                                            <TableHead className="text-right">Weekly Offs + Holidays</TableHead>
                                            <TableHead className="text-right">Derived LOP Days</TableHead>
                                            <TableHead>Payroll Status</TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {lopData.map((record, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell className="font-medium">{record.empId}</TableCell>
                                                <TableCell>{record.month}</TableCell>
                                                <TableCell className="text-right">{record.monthDays}</TableCell>
                                                <TableCell className="text-right">{record.presentDays}</TableCell>
                                                <TableCell className="text-right">{record.paidLeave}</TableCell>
                                                <TableCell className="text-right">
                                                    {record.weeklyOffsHolidays}
                                                </TableCell>
                                                <TableCell className="text-right text-red-600 font-semibold">
                                                    {record.derivedLOP}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className="flex w-fit items-center gap-1 bg-green-100 text-green-800">
                                                        <Lock className="h-3 w-3" />
                                                        {record.payrollStatus}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* Formula Card */}
                        <Card className="bg-slate-50 border border-slate-200">
                            <CardContent className="p-4 space-y-2 text-sm">
                                <p className="font-semibold">LOP Calculation Formula</p>
                                <p>
                                    <span className="font-medium">LOP Days =</span>{" "}
                                    Month Days − Present Days − Approved Paid Leave − (Weekly Offs + Holidays)
                                </p>
                                <p className="text-muted-foreground">
                                    LOP changes only when attendance, leave approval, DOJ, or LWD is corrected.
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                </Tabs>
                </div>
            
        </MainLayout>
    )
}
