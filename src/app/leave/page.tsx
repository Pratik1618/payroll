"use client"

import { useState } from "react"
import { MainLayout } from "@/components/ui/layout/main-layout" 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar, Clock, AlertCircle } from "lucide-react"
import { LeaveApplicationForm } from "@/components/ui/leave/leave-application-form" 
import { LeaveHistoryTable } from "@/components/ui/leave/leave-history-table"
import { LOPCalculation } from "@/components/ui/leave/lop-calculation" 
import LeaveBalancesPage from "@/components/ui/leave/leave-balance-page" 

export default function LeavePage() {
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [showLOPDetails, setShowLOPDetails] = useState(false)

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Leave & LOP Management</h1>
            <p className="text-muted-foreground">Manage employee leave applications and Loss of Pay calculations</p>
          </div>
          <Button onClick={() => setShowApplicationForm(true)} className="bg-primary text-primary-foreground">
            <Plus className="mr-2 h-4 w-4" />
            Apply for Leave
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Applications</p>
                  <p className="text-2xl font-bold text-foreground">12</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
              <div className="mt-2">
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  Needs Review
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved This Month</p>
                  <p className="text-2xl font-bold text-foreground">45</p>
                </div>
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
              <div className="mt-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  +15% from last month
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">LOP Days</p>
                  <p className="text-2xl font-bold text-foreground">23</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <div className="mt-2">
                <Button variant="outline" size="sm" onClick={() => setShowLOPDetails(true)} className="text-xs">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Leave Balance</p>
                  <p className="text-2xl font-bold text-foreground">18.5</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
              <div className="mt-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Out of 21 days
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <LeaveBalancesPage />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-3">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Recent Leave Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <LeaveHistoryTable />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Leave Application Form Modal */}
        {showApplicationForm && <LeaveApplicationForm onClose={() => setShowApplicationForm(false)} />}

        {/* LOP Details Modal */}
        {showLOPDetails && <LOPCalculation onClose={() => setShowLOPDetails(false)} />}
      </div>
    </MainLayout>
  )
}
