"use client"

import { useState } from "react"
import { MainLayout } from "@/components/ui/layout/main-layout" 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Download } from "lucide-react"
import { EmployeeForm } from "@/components/ui/employee/employee-form"
import { EmployeeTable } from "@/components/ui/employee/employee-table"

export default function EmployeePage() {
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSite, setFilterSite] = useState("all")

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Employee Master</h1>
            <p className="text-muted-foreground">Manage employee information and records</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="bg-primary text-primary-foreground">
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Employees</p>
                  <p className="text-2xl font-bold text-foreground">1,247</p>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">New This Month</p>
                  <p className="text-2xl font-bold text-foreground">23</p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  +12%
                </Badge>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Contract</p>
                  <p className="text-2xl font-bold text-foreground">892</p>
                </div>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  71.6%
                </Badge>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Permanent</p>
                  <p className="text-2xl font-bold text-foreground">355</p>
                </div>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  28.4%
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Employee Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, employee code, or designation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background"
                />
              </div>
              <Select value={filterSite} onValueChange={setFilterSite}>
                <SelectTrigger className="w-48 bg-background">
                  <SelectValue placeholder="Filter by site" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sites</SelectItem>
                  <SelectItem value="site-a">Site A - Corporate</SelectItem>
                  <SelectItem value="site-b">Site B - Manufacturing</SelectItem>
                  <SelectItem value="site-c">Site C - Warehouse</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="border-border bg-transparent">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>

            <EmployeeTable searchTerm={searchTerm} filterSite={filterSite} />
          </CardContent>
        </Card>

        {/* Employee Form Modal */}
        {showForm && <EmployeeForm onClose={() => setShowForm(false)} />}
      </div>
    </MainLayout>
  )
}
