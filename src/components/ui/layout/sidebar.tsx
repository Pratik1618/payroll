"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Users, Clock, Calendar, Calculator, FileText, Receipt, CreditCard, UserX, BarChart3, Home, HistoryIcon, Lock, Percent, Webhook, OctagonPause, BookLock, Upload, DollarSign, StickyNote, UserPenIcon, Users2, History, Shuffle, ChartPieIcon } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  // { name: "Employee Master", href: "/employee", icon: Users },
  // { name: "Attendance", href: "/attendance", icon: Clock },
  // { name: "Leave & LOP", href: "/leave", icon: Calendar },
  { name: "Manual Attendance Upload", href: "/manualAttendance", icon: Upload },
  { name: "Payroll Processing", href: "/payroll", icon: Calculator },
  { name: 'Payroll History', href: "/payroll-history", icon: HistoryIcon },
   { name: "Salary Status", href: "/salary-status", icon: Lock },
  { name: "Lock Salary", href: "/lockSalary", icon: BookLock },
  { name: "Statutory Reports", href: "/statutory", icon: FileText },
  // { name: "Payslip Viewer", href: "/payslip", icon: Receipt },
  // { name: "Bank Disbursement", href: "/bank", icon: CreditCard },
  { name: "F&F Settlement", href: "/fnf", icon: UserX },
 
  // {name :"Tax Declartions", href:"/taxRegime",icon:Percent},
  { name: "MIS Reports", href: "/reports", icon: BarChart3 },
  { name: "Cycle Mapping", href: "/mapping", icon: Webhook },
  { name: "Salary Hold/Unhold", href: "/salaryhold", icon: OctagonPause },
  { name: "Tax calculator", href: "/taxCalculator", icon: DollarSign },
  { name: "Form 16", href: "/form16", icon: StickyNote },
  { name: "Employee IT declaration", href: "/it-declaration", icon: UserPenIcon },
  { name: "IT Decarations", href: "/hr-itdeclarations", icon: Users2 },
  { name: "Employee History", href: "/empHistory", icon: History },
  { name: "Employee Transfer", href: "/emptransfer", icon: Shuffle },
  {name:"Analytics",href:"/analytics",icon:ChartPieIcon}








]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r border-border">
      <div className="flex h-16 items-center px-6 border-b border-border">
        <h1 className="text-xl font-semibold text-foreground">Payroll ERP</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
