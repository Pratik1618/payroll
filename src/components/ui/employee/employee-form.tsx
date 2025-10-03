"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { X, Save } from "lucide-react"
import axios from "axios"

interface EmployeeFormProps {
  onClose: () => void
  employee?: any
}

export function EmployeeForm({ onClose, employee }: EmployeeFormProps) {
  const [formData, setFormData] = useState({
    name: employee?.name || "",
    employeeCode: employee?.employeeCode || `EMP${Date.now().toString().slice(-6)}`,
    designation: employee?.designation || "",
    site: employee?.site || "",
    shift: employee?.shift || "",
    contractType: employee?.contractType || "",
    ctc: employee?.ctc || "",
    pan: employee?.pan || "",
    aadhaar: employee?.aadhaar || "",
    uan: employee?.uan || "",
    esic: employee?.esic || "",
    bankName: employee?.bankName || "",
    accountNumber: employee?.accountNumber || "",
    ifscCode: employee?.ifscCode || "",
    address: employee?.address || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (employee) {
        await axios.put(`/api/employees/${employee.id}`, formData)
      } else {
        await axios.post("/api/employees", formData)
      }
      onClose()
    } catch (error) {
      console.error("Error saving employee:", error)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">{employee ? "Edit Employee" : "Add New Employee"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Personal Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="name" className="text-foreground">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                    className="bg-background"
                  />
                </div>
                <div>
                  <Label htmlFor="employeeCode" className="text-foreground">
                    Employee Code
                  </Label>
                  <Input
                    id="employeeCode"
                    value={formData.employeeCode}
                    onChange={(e) => handleChange("employeeCode", e.target.value)}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div>
                  <Label htmlFor="designation" className="text-foreground">
                    Designation *
                  </Label>
                  <Select value={formData.designation} onValueChange={(value) => handleChange("designation", value)}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select designation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                      <SelectItem value="technician">Technician</SelectItem>
                      <SelectItem value="operator">Operator</SelectItem>
                      <SelectItem value="helper">Helper</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="site" className="text-foreground">
                    Site *
                  </Label>
                  <Select value={formData.site} onValueChange={(value) => handleChange("site", value)}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select site" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="site-a">Site A - Corporate</SelectItem>
                      <SelectItem value="site-b">Site B - Manufacturing</SelectItem>
                      <SelectItem value="site-c">Site C - Warehouse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Employment Details */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Employment Details</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="shift" className="text-foreground">
                    Shift
                  </Label>
                  <Select value={formData.shift} onValueChange={(value) => handleChange("shift", value)}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select shift" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Day Shift (9 AM - 6 PM)</SelectItem>
                      <SelectItem value="night">Night Shift (10 PM - 7 AM)</SelectItem>
                      <SelectItem value="general">General Shift</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="contractType" className="text-foreground">
                    Contract Type
                  </Label>
                  <Select value={formData.contractType} onValueChange={(value) => handleChange("contractType", value)}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select contract type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="permanent">Permanent</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="temporary">Temporary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ctc" className="text-foreground">
                    CTC (Annual)
                  </Label>
                  <Input
                    id="ctc"
                    type="number"
                    value={formData.ctc}
                    onChange={(e) => handleChange("ctc", e.target.value)}
                    placeholder="₹ 0"
                    className="bg-background"
                  />
                </div>
              </div>
            </div>

            {/* Statutory Information */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Statutory Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="pan" className="text-foreground">
                    PAN Number
                  </Label>
                  <Input
                    id="pan"
                    value={formData.pan}
                    onChange={(e) => handleChange("pan", e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F"
                    maxLength={10}
                    className="bg-background"
                  />
                </div>
                <div>
                  <Label htmlFor="aadhaar" className="text-foreground">
                    Aadhaar Number
                  </Label>
                  <Input
                    id="aadhaar"
                    value={formData.aadhaar}
                    onChange={(e) => handleChange("aadhaar", e.target.value)}
                    placeholder="1234 5678 9012"
                    maxLength={12}
                    className="bg-background"
                  />
                </div>
                <div>
                  <Label htmlFor="uan" className="text-foreground">
                    UAN Number
                  </Label>
                  <Input
                    id="uan"
                    value={formData.uan}
                    onChange={(e) => handleChange("uan", e.target.value)}
                    placeholder="123456789012"
                    maxLength={12}
                    className="bg-background"
                  />
                </div>
                <div>
                  <Label htmlFor="esic" className="text-foreground">
                    ESIC Number
                  </Label>
                  <Input
                    id="esic"
                    value={formData.esic}
                    onChange={(e) => handleChange("esic", e.target.value)}
                    placeholder="1234567890123456"
                    className="bg-background"
                  />
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Bank Details</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="bankName" className="text-foreground">
                    Bank Name
                  </Label>
                  <Input
                    id="bankName"
                    value={formData.bankName}
                    onChange={(e) => handleChange("bankName", e.target.value)}
                    placeholder="State Bank of India"
                    className="bg-background"
                  />
                </div>
                <div>
                  <Label htmlFor="accountNumber" className="text-foreground">
                    Account Number
                  </Label>
                  <Input
                    id="accountNumber"
                    value={formData.accountNumber}
                    onChange={(e) => handleChange("accountNumber", e.target.value)}
                    placeholder="1234567890"
                    className="bg-background"
                  />
                </div>
                <div>
                  <Label htmlFor="ifscCode" className="text-foreground">
                    IFSC Code
                  </Label>
                  <Input
                    id="ifscCode"
                    value={formData.ifscCode}
                    onChange={(e) => handleChange("ifscCode", e.target.value.toUpperCase())}
                    placeholder="SBIN0001234"
                    className="bg-background"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <Label htmlFor="address" className="text-foreground">
                Address
              </Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Enter complete address"
                rows={3}
                className="bg-background"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary text-primary-foreground">
                <Save className="mr-2 h-4 w-4" />
                {employee ? "Update" : "Save"} Employee
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
