"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { X, Save, CalendarIcon } from "lucide-react"
import { format, differenceInDays } from "date-fns"
import { cn } from "@/lib/utils"

interface LeaveApplicationFormProps {
  onClose: () => void
}

export function LeaveApplicationForm({ onClose }: LeaveApplicationFormProps) {
  const [formData, setFormData] = useState({
    leaveType: "",
    fromDate: undefined as Date | undefined,
    toDate: undefined as Date | undefined,
    reason: "",
    emergencyContact: "",
    handoverTo: "",
  })

  const calculateLeaveDays = () => {
    if (formData.fromDate && formData.toDate) {
      return differenceInDays(formData.toDate, formData.fromDate) + 1
    }
    return 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // API call to submit leave application
    console.log("Submitting leave application:", formData)
    onClose()
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">Apply for Leave</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Leave Type */}
            <div>
              <Label htmlFor="leaveType" className="text-foreground">
                Leave Type *
              </Label>
              <Select value={formData.leaveType} onValueChange={(value) => handleChange("leaveType", value)}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="annual">Annual Leave</SelectItem>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="casual">Casual Leave</SelectItem>
                  <SelectItem value="maternity">Maternity Leave</SelectItem>
                  <SelectItem value="paternity">Paternity Leave</SelectItem>
                  <SelectItem value="emergency">Emergency Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-foreground">From Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-background",
                        !formData.fromDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.fromDate ? format(formData.fromDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.fromDate}
                      onSelect={(date) => handleChange("fromDate", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className="text-foreground">To Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-background",
                        !formData.toDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.toDate ? format(formData.toDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.toDate}
                      onSelect={(date) => handleChange("toDate", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Leave Duration */}
            {calculateLeaveDays() > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Total Leave Days: {calculateLeaveDays()}</strong>
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  This will be deducted from your {formData.leaveType} balance.
                </p>
              </div>
            )}

            {/* Reason */}
            <div>
              <Label htmlFor="reason" className="text-foreground">
                Reason for Leave *
              </Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => handleChange("reason", e.target.value)}
                placeholder="Please provide a brief reason for your leave"
                rows={3}
                className="bg-background"
                required
              />
            </div>

            {/* Emergency Contact */}
            <div>
              <Label htmlFor="emergencyContact" className="text-foreground">
                Emergency Contact
              </Label>
              <Input
                id="emergencyContact"
                value={formData.emergencyContact}
                onChange={(e) => handleChange("emergencyContact", e.target.value)}
                placeholder="Contact number during leave"
                className="bg-background"
              />
            </div>

            {/* Handover */}
            <div>
              <Label htmlFor="handoverTo" className="text-foreground">
                Work Handover To
              </Label>
              <Select value={formData.handoverTo} onValueChange={(value) => handleChange("handoverTo", value)}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select colleague for work handover" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="emp001">Rajesh Kumar (Manager)</SelectItem>
                  <SelectItem value="emp002">Priya Sharma (Supervisor)</SelectItem>
                  <SelectItem value="emp003">Amit Singh (Technician)</SelectItem>
                  <SelectItem value="emp004">Sunita Devi (Operator)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary text-primary-foreground">
                <Save className="mr-2 h-4 w-4" />
                Submit Application
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
