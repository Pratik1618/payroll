"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Users, Clock, Calendar, Calculator, FileText, Receipt, CreditCard, UserX, BarChart3, Home, HistoryIcon,Lock, Percent } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Employee Master", href: "/employee", icon: Users },
  // { name: "Attendance", href: "/attendance", icon: Clock },
  // { name: "Leave & LOP", href: "/leave", icon: Calendar },
  { name: "Payroll Processing", href: "/payroll", icon: Calculator },
  {name: 'Payroll History',href :"/payroll-history",icon:HistoryIcon},
  { name: "Statutory Reports", href: "/statutory", icon: FileText },
  { name: "Payslip Viewer", href: "/payslip", icon: Receipt },
  { name: "Bank Disbursement", href: "/bank", icon: CreditCard },
  { name: "F&F Settlement", href: "/fnf", icon: UserX },
  {name: "Salary Status",href:"/salary-status",icon:Lock},
  {name :"Tax Declartions", href:"/taxRegime",icon:Percent},
  { name: "Reports", href: "/reports", icon: BarChart3 },

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
