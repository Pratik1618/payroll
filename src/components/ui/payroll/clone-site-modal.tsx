"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Copy } from "lucide-react"

interface CloneSiteModalProps {
  onClose: () => void
}

const siteOptions = [
  { id: "site-a", name: "Site A - Corporate", employees: 450 },
  { id: "site-b", name: "Site B - Manufacturing", employees: 520 },
  { id: "site-c", name: "Site C - Warehouse", employees: 277 },
]

const cloneOptions = [
  { id: "salary-structure", label: "Salary Structure", description: "Basic, HRA, DA components" },
  { id: "allowances", label: "Allowances", description: "Special allowances and benefits" },
  { id: "deductions", label: "Deductions", description: "Standard deductions and policies" },
  { id: "overtime-rates", label: "Overtime Rates", description: "OT calculation rules" },
  { id: "statutory-settings", label: "Statutory Settings", description: "PF, ESI, PT configurations" },
  { id: "leave-policies", label: "Leave Policies", description: "Leave encashment rules" },
]

export function CloneSiteModal({ onClose }: CloneSiteModalProps) {
  const [sourceSite, setSourceSite] = useState("")
  const [targetSite, setTargetSite] = useState("")
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  const handleClone = async () => {
    if (!sourceSite || !targetSite || selectedOptions.length === 0) {
      alert("Please select source site, target site, and at least one option to clone")
      return
    }

    if (sourceSite === targetSite) {
      alert("Source and target sites cannot be the same")
      return
    }

    // API call to clone site settings
    console.log("Cloning site settings:", { sourceSite, targetSite, selectedOptions })
    onClose()
  }

  const toggleOption = (optionId: string) => {
    setSelectedOptions((prev) => (prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]))
  }

  const selectAll = () => {
    setSelectedOptions(cloneOptions.map((option) => option.id))
  }

  const clearAll = () => {
    setSelectedOptions([])
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">Clone Site Settings</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Source Site */}
          <div>
            <Label htmlFor="sourceSite" className="text-foreground">
              Source Site *
            </Label>
            <Select value={sourceSite} onValueChange={setSourceSite}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select source site to copy from" />
              </SelectTrigger>
              <SelectContent>
                {siteOptions.map((site) => (
                  <SelectItem key={site.id} value={site.id}>
                    {site.name} ({site.employees} employees)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target Site */}
          <div>
            <Label htmlFor="targetSite" className="text-foreground">
              Target Site *
            </Label>
            <Select value={targetSite} onValueChange={setTargetSite}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select target site to copy to" />
              </SelectTrigger>
              <SelectContent>
                {siteOptions
                  .filter((site) => site.id !== sourceSite)
                  .map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.name} ({site.employees} employees)
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clone Options */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-foreground">Settings to Clone *</Label>
              <div className="space-x-2">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={clearAll}>
                  Clear All
                </Button>
              </div>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {cloneOptions.map((option) => (
                <div key={option.id} className="flex items-start space-x-3 p-3 border border-border rounded-lg">
                  <Checkbox
                    checked={selectedOptions.includes(option.id)}
                    onCheckedChange={() => toggleOption(option.id)}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{option.label}</div>
                    <div className="text-sm text-muted-foreground">{option.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Warning */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <div className="text-orange-600">⚠️</div>
              <div className="text-sm text-orange-800">
                <p className="font-medium">Important Notice</p>
                <p>
                  Cloning will overwrite existing settings in the target site. This action cannot be undone. Please
                  ensure you have backed up the target site configuration if needed.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleClone} className="bg-primary text-primary-foreground">
              <Copy className="mr-2 h-4 w-4" />
              Clone Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
