"use client"

import { Bell, Search, User,UserCog, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { toast } from "sonner"

export function Header() {
   const [currentRole, setCurrentRole] = useState<"Payroll Team" | "Employee">("Payroll Team")

  const handleRoleChange = (role: "Payroll Team" | "Employee") => {
    setCurrentRole(role)
    toast.success(`Role switched to ${role}`)
  }
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search employees, payroll..." className="w-80 pl-10 bg-background" />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
         <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleRoleChange("Payroll Team")}
              className={currentRole === "Payroll Team" ? "bg-accent" : ""}
            >
              <UserCog className="mr-2 h-4 w-4" />
              Payroll Team
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleRoleChange("Employee")}
              className={currentRole === "Employee" ? "bg-accent" : ""}
            >
              <Users className="mr-2 h-4 w-4" />
              Employee
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
