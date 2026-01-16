"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Users, Clock, Calendar, Calculator, FileText, Receipt, CreditCard,
  UserX, BarChart3, Home, HistoryIcon, Lock, Percent, Webhook,
  OctagonPause, BookLock, Upload, DollarSign, StickyNote,
  UserPenIcon, Users2, History, Shuffle, ChartPieIcon,
  BadgeCheck, Radar, AtSign,
  Diff,
  Gift,
  CalendarRange
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Manual Attendance Upload", href: "/manualAttendance", icon: Upload },
  { name: "Attendance Verification", href: "/attendance-verification", icon: BadgeCheck },
  { name: "Payroll Processing", href: "/payroll", icon: Calculator },
  { name: "Payroll History", href: "/payroll-history", icon: HistoryIcon },
  { name: "Salary Status", href: "/salary-status", icon: Lock },
  { name: "Lock Salary", href: "/lockSalary", icon: BookLock },
  { name: "Arreras", href: "/arreras", icon: AtSign },
  { name: "Bonus Working", href: "/bonus-working", icon: Gift },  
  {name:"Leave Provision",href:"/leave-provision",icon:CalendarRange},
  { name: "Earning/Deduction", href: "/earnDed", icon: Diff },
  { name: "Statutory Reports", href: "/statutory", icon: FileText },
  { name: "PF ESIC reconciliation", href: "/pf-esic-reconciliation", icon: Radar },
  { name: "F&F Settlement", href: "/fnf", icon: UserX },
  { name: "MIS Reports", href: "/reports", icon: BarChart3 },
  { name: "Cycle Mapping", href: "/mapping", icon: Webhook },
  { name: "Salary Hold/Unhold", href: "/salaryhold", icon: OctagonPause },
  { name: "Tax calculator", href: "/taxCalculator", icon: DollarSign },
  { name: "Form 16", href: "/form16", icon: StickyNote },
  { name: "Employee IT declaration", href: "/it-declaration", icon: UserPenIcon },
  { name: "IT Declarations", href: "/hr-itdeclarations", icon: Users2 },
  { name: "Employee History", href: "/empHistory", icon: History },
  { name: "Employee Transfer", href: "/emptransfer", icon: Shuffle },
  { name: "Analytics", href: "/analytics", icon: ChartPieIcon },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-64 flex-col bg-card border-r border-border">
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-border">
        <h1 className="text-xl font-semibold text-foreground">
          Payroll ERP
        </h1>
      </div>

      {/* Scrollable Menu */}
      <nav className="flex-1 overflow-y-auto  no-scrollbar space-y-1 px-3 py-4">
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
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <item.icon className="mr-3 h-5 w-5 shrink-0" />
              <span className="truncate">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
