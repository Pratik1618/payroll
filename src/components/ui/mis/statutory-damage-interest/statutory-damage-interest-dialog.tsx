"use client"

import { useState } from "react"
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download, Info } from "lucide-react"
import { toast } from "sonner"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import {
  downloadStatutoryDamageInterest,
  type StatutoryComponent,
} from "./statutory-damage-interest"

type StatutoryType = "PF" | "ESIC"

export function StatutoryDamageInterestDialog() {
  const [statutoryType, setStatutoryType] =
    useState<StatutoryType>("PF")

  const [component, setComponent] =
    useState<StatutoryComponent>("both")

  const [fromMonth, setFromMonth] = useState("")
  const [toMonth, setToMonth] = useState("")
  const [year, setYear] = useState("")
  const [branch, setBranch] = useState("")
  const [onlyDelayed, setOnlyDelayed] = useState(true)

  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ]

  const years = ["2024", "2025", "2026"]
  const branches = ["All Branches", "Mumbai", "Pune", "Delhi"]

  const handleDownload = () => {
    if (!fromMonth || !toMonth || !year || !branch) {
      toast.error("Please select all mandatory filters")
      return
    }

    downloadStatutoryDamageInterest({
      statutoryType,
      component,
      fromMonth,
      toMonth,
      year,
      branch,
      onlyDelayed,
    })
  }

  return (
    <>
      {/* ---------- HEADER ---------- */}
      <DialogHeader>
        <div className="flex items-center gap-2">
          <DialogTitle>
            Statutory Damage & Interest
          </DialogTitle>

          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 cursor-pointer text-muted-foreground" />
            </TooltipTrigger>

            <TooltipContent side="right" className="max-w-sm p-3 text-sm">
              <div className="space-y-3">

                {/* PF */}
                <div>
                  <p className="font-medium">PF Interest — Section 7Q</p>
                  <p className="text-muted-foreground">
                    • 12% p.a. (mandatory)
                  </p>
                </div>

                <div>
                  <p className="font-medium">PF Damages — Section 14B</p>
                  <p className="text-muted-foreground">
                    • 5% – 25% p.a. (slab-based)
                  </p>
                </div>

                {/* ESIC */}
                <div>
                  <p className="font-medium">
                    ESIC Interest — Section 39(5)(a)
                  </p>
                  <p className="text-muted-foreground">
                    • 12% p.a. (mandatory)
                  </p>
                </div>

                <div>
                  <p className="font-medium">
                    ESIC Damages — Section 85B
                  </p>
                  <p className="text-muted-foreground">
                    • 5% – 25% p.a. (slab-based)
                  </p>
                </div>

                <p className="text-xs text-muted-foreground">
                  Note: Damage rates are per annum and applied proportionately
                  based on delay months.
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>

        <DialogDescription>
          PF & ESIC — Interest and Damages
        </DialogDescription>
      </DialogHeader>

      {/* ---------- BODY ---------- */}
      <div className="space-y-4">

        {/* Statutory Type */}
        <Select
          value={statutoryType}
          onValueChange={(v) => setStatutoryType(v as StatutoryType)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Statutory" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PF">Provident Fund (PF)</SelectItem>
            <SelectItem value="ESIC">ESIC</SelectItem>
          </SelectContent>
        </Select>

        {/* Component */}
        <Select
          value={component}
          onValueChange={(v) => setComponent(v as StatutoryComponent)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Component" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="interest">Interest</SelectItem>
            <SelectItem value="damage">Damages</SelectItem>
            <SelectItem value="both">Both</SelectItem>
          </SelectContent>
        </Select>

        {/* Month Range */}
        <div className="grid grid-cols-2 gap-2">
          <Select value={fromMonth} onValueChange={setFromMonth}>
            <SelectTrigger>
              <SelectValue placeholder="From Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map(m => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={toMonth} onValueChange={setToMonth}>
            <SelectTrigger>
              <SelectValue placeholder="To Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map(m => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Year */}
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger>
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map(y => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Branch */}
        <Select value={branch} onValueChange={setBranch}>
          <SelectTrigger>
            <SelectValue placeholder="Select Branch" />
          </SelectTrigger>
          <SelectContent>
            {branches.map(b => (
              <SelectItem key={b} value={b}>
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Checkbox */}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={onlyDelayed}
            onChange={() => setOnlyDelayed(!onlyDelayed)}
          />
          Show only delayed records
        </label>

        {/* Download */}
        <Button className="w-full gap-2" onClick={handleDownload}>
          <Download className="h-4 w-4" />
          Download Excel
        </Button>
      </div>
    </>
  )
}
