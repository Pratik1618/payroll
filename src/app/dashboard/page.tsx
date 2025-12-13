"use client"

import { MainLayout } from "@/components/ui/layout/main-layout" 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Clock, Calculator, FileText, Download } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

const stats = [
  {
    title: "Total Employees",
    value: "1,247",
    change: "+12%",
    icon: Users,
    color: "text-blue-500",
  },
  {
    title: "Present Today",
    value: "1,156",
    change: "92.7%",
    icon: Clock,
    color: "text-green-500",
  },
  {
    title: "Payroll Processed",
    value: "₹45.2L",
    change: "+8.2%",
    icon: Calculator,
    color: "text-purple-500",
  },
  {
    title: "Pending Approvals",
    value: "23",
    change: "-15%",
    icon: FileText,
    color: "text-orange-500",
  },
]

export default function DashboardPage() {
  const [wageRegisterPeriod, setWageRegisterPeriod] = useState<string>("")
  const [wageRegisterMonth, setWageRegisterMonth] = useState<string>("")
  const [wageRegisterYear, setWageRegisterYear] = useState<string>("")

  const handleWageRegisterDownload = () => {
    if (!wageRegisterPeriod) {
      toast.error("Please select a period")
      return
    }

    if (wageRegisterPeriod === "monthly" && (!wageRegisterMonth || !wageRegisterYear)) {
      toast.error("Please select month and year for monthly report")
      return
    }

    if (wageRegisterPeriod === "yearly" && !wageRegisterYear) {
      toast.error("Please select year for yearly report")
      return
    }

    const csvContent = `Employee ID,Employee Name,Basic,HRA,DA,CCA,Total Earnings,PF,ESIC,PT,Total Deductions,Net Pay\n1001,John Doe,25000,10000,5000,2000,42000,3000,315,200,3515,38485\n1002,Jane Smith,30000,12000,6000,2400,50400,3600,378,200,4178,46222`

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    const filename =
      wageRegisterPeriod === "monthly"
        ? `Wage_Register_${wageRegisterMonth}_${wageRegisterYear}.csv`
        : `Wage_Register_${wageRegisterYear}.csv`
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)

    toast.success(`Wage Register downloaded successfully`)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your payroll management system</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={stat.change.startsWith("+") ? "text-green-500" : "text-red-500"}>{stat.change}</span>{" "}
                  from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: "Payroll processed for Site A", time: "2 hours ago" },
                  { action: "New employee onboarded", time: "4 hours ago" },
                  { action: "Leave approved for John Doe", time: "6 hours ago" },
                  { action: "Attendance synced", time: "8 hours ago" },
                ].map((activity, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-foreground">{activity.action}</span>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {[
                  "Process Monthly Payroll",
                  "Generate Statutory Reports",
                  "Sync Attendance Data",
                  "Review Pending Approvals",
                ].map((action, index) => (
                  <button
                    key={index}
                    className="flex items-center justify-start p-3 text-sm bg-accent hover:bg-accent/80 rounded-md transition-colors text-foreground"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Download className="h-5 w-5" />
              Download Wage Register
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 items-end flex-wrap">
              <div className="flex-1 min-w-[150px]">
                <label className="text-sm font-medium text-foreground mb-2 block">Select Period</label>
                <Select value={wageRegisterPeriod} onValueChange={setWageRegisterPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {wageRegisterPeriod === "monthly" && (
                <div className="flex-1 min-w-[150px]">
                  <label className="text-sm font-medium text-foreground mb-2 block">Month</label>
                  <Select value={wageRegisterMonth} onValueChange={setWageRegisterMonth}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="January">January</SelectItem>
                      <SelectItem value="February">February</SelectItem>
                      <SelectItem value="March">March</SelectItem>
                      <SelectItem value="April">April</SelectItem>
                      <SelectItem value="May">May</SelectItem>
                      <SelectItem value="June">June</SelectItem>
                      <SelectItem value="July">July</SelectItem>
                      <SelectItem value="August">August</SelectItem>
                      <SelectItem value="September">September</SelectItem>
                      <SelectItem value="October">October</SelectItem>
                      <SelectItem value="November">November</SelectItem>
                      <SelectItem value="December">December</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {wageRegisterPeriod && (
                <div className="flex-1 min-w-[150px]">
                  <label className="text-sm font-medium text-foreground mb-2 block">Year</label>
                  <Select value={wageRegisterYear} onValueChange={setWageRegisterYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2022">2022</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button
                onClick={handleWageRegisterDownload}
                disabled={
                  !wageRegisterPeriod ||
                  (wageRegisterPeriod === "monthly" && (!wageRegisterMonth || !wageRegisterYear)) ||
                  (wageRegisterPeriod === "yearly" && !wageRegisterYear)
                }
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
