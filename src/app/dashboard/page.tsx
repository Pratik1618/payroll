"use client"


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MainLayout } from "@/components/ui/layout/main-layout"
import { Users, Clock, Calculator, FileText } from "lucide-react"

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
      </div>
    </MainLayout>
  )
}
