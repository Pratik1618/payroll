"use client"

import { useState } from "react"
import { MainLayout } from "@/components/ui/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, ArrowRight } from "lucide-react"

// Mock data for employees who worked at multiple sites
const mockTransferData = [
  {
    empId: "EMP001",
    empName: "Rahul Sharma",
    designation: "Security Guard",
    month: "December 2024",
    transfers: [
      { fromSite: "Site A - Mumbai", toSite: "Site B - Pune", servingDays: 10, dateRange: "01-10 Dec" },
      { fromSite: "Site B - Pune", toSite: "Site C - Thane", servingDays: 15, dateRange: "11-25 Dec" },
    ],
    totalDays: 25,
  },
  {
    empId: "EMP002",
    empName: "Priya Patel",
    designation: "Supervisor",
    month: "December 2024",
    transfers: [
      { fromSite: "Site C - Delhi", toSite: "Site D - Noida", servingDays: 18, dateRange: "01-18 Dec" },
      { fromSite: "Site D - Noida", toSite: "Site E - Gurgaon", servingDays: 7, dateRange: "19-25 Dec" },
    ],
    totalDays: 25,
  },
  {
    empId: "EMP003",
    empName: "Amit Kumar",
    designation: "Housekeeping",
    month: "December 2024",
    transfers: [
      { fromSite: "Site E - Bangalore", toSite: "Site F - Mysore", servingDays: 12, dateRange: "01-12 Dec" },
      { fromSite: "Site F - Mysore", toSite: "Site G - Hubli", servingDays: 8, dateRange: "13-20 Dec" },
      { fromSite: "Site G - Hubli", toSite: "Site H - Mangalore", servingDays: 5, dateRange: "21-25 Dec" },
    ],
    totalDays: 25,
  },
]

const months = [
  "January 2024",
  "February 2024",
  "March 2024",
  "April 2024",
  "May 2024",
  "June 2024",
  "July 2024",
  "August 2024",
  "September 2024",
  "October 2024",
  "November 2024",
  "December 2024",
]

export default function EmployeeTransferPage() {
  const [selectedMonth, setSelectedMonth] = useState("December 2024")

  const filteredData = mockTransferData.filter((emp) => emp.month === selectedMonth)

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Employee Transfer</h1>
              <p className="text-sm text-muted-foreground">
                Employees who worked at multiple sites in the current month
              </p>
            </div>
          </div>
        </div>

        {/* Filter Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4" />
              Select Month
            </CardTitle>
            <CardDescription>Choose a month to view multi-site employee records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-64">
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month} value={month}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Badge variant="outline" className="text-sm">
                {filteredData.length} employee{filteredData.length !== 1 ? "s" : ""} found
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Transfer Records Table */}
        <Card>
          <CardHeader>
            <CardTitle>Multi-Site Working Records</CardTitle>
            <CardDescription>Each employee shown once with all their site transfers and serving days</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Site Transfers</TableHead>
                  <TableHead className="text-center">Total Days</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No multi-site employees found for {selectedMonth}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((emp) => (
                    <TableRow key={emp.empId}>
                      <TableCell className="font-medium">{emp.empId}</TableCell>
                      <TableCell className="font-medium">{emp.empName}</TableCell>
                      <TableCell>{emp.designation}</TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          {emp.transfers.map((transfer, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <span className="text-muted-foreground">{transfer.fromSite}</span>
                              <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                              <span className="text-muted-foreground">{transfer.toSite}</span>
                              <Badge variant="secondary" className="ml-2 flex-shrink-0">
                                {transfer.servingDays} days
                              </Badge>
                              <span className="text-xs text-muted-foreground">({transfer.dateRange})</span>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">{emp.totalDays} days</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
