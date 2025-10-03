"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Upload, Download, FileSpreadsheet } from "lucide-react"

interface VariableUploadProps {
  onClose: () => void
}

export function VariableUpload({ onClose }: VariableUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadType, setUploadType] = useState("")
  const [selectedSite, setSelectedSite] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !uploadType || !selectedSite) {
      alert("Please fill all required fields")
      return
    }

    // API call to upload variables
    console.log("Uploading variables:", { selectedFile, uploadType, selectedSite })
    onClose()
  }

  const downloadTemplate = (type: string) => {
    // Download template file
    console.log("Downloading template for:", type)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">Upload Variable Components</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Type */}
          <div>
            <Label htmlFor="uploadType" className="text-foreground">
              Variable Type *
            </Label>
            <Select value={uploadType} onValueChange={setUploadType}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select variable type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="incentives">Incentives & Bonuses</SelectItem>
                <SelectItem value="allowances">Special Allowances</SelectItem>
                <SelectItem value="deductions">Additional Deductions</SelectItem>
                <SelectItem value="reimbursements">Reimbursements</SelectItem>
                <SelectItem value="arrears">Salary Arrears</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Site Selection */}
          <div>
            <Label htmlFor="site" className="text-foreground">
              Site *
            </Label>
            <Select value={selectedSite} onValueChange={setSelectedSite}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select site" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="site-a">Site A - Corporate</SelectItem>
                <SelectItem value="site-b">Site B - Manufacturing</SelectItem>
                <SelectItem value="site-c">Site C - Warehouse</SelectItem>
                <SelectItem value="all">All Sites</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* File Upload */}
          <div>
            <Label htmlFor="file" className="text-foreground">
              Upload File *
            </Label>
            <div className="mt-2 space-y-4">
              <Input
                id="file"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="bg-background"
              />
              {selectedFile && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>{selectedFile.name}</span>
                  <span>({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                </div>
              )}
            </div>
          </div>

          {/* Template Downloads */}
          <div className="bg-accent/50 rounded-lg p-4">
            <h4 className="font-medium text-foreground mb-3">Download Templates</h4>
            <div className="grid gap-2 md:grid-cols-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadTemplate("incentives")}
                className="justify-start"
              >
                <Download className="mr-2 h-4 w-4" />
                Incentives Template
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadTemplate("allowances")}
                className="justify-start"
              >
                <Download className="mr-2 h-4 w-4" />
                Allowances Template
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadTemplate("deductions")}
                className="justify-start"
              >
                <Download className="mr-2 h-4 w-4" />
                Deductions Template
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadTemplate("reimbursements")}
                className="justify-start"
              >
                <Download className="mr-2 h-4 w-4" />
                Reimbursements Template
              </Button>
            </div>
          </div>

          {/* Upload Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Upload Instructions</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Use the provided templates for consistent data format</li>
              <li>• Employee codes must match existing records</li>
              <li>• Amount columns should contain numeric values only</li>
              <li>• Maximum file size: 5MB</li>
              <li>• Supported formats: Excel (.xlsx, .xls) and CSV</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleUpload} className="bg-primary text-primary-foreground">
              <Upload className="mr-2 h-4 w-4" />
              Upload Variables
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
