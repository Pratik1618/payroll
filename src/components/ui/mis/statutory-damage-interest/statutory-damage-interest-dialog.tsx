"use client"

import { useState } from "react"
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { toast } from "sonner"
import { downloadStatutoryDamageInterest } from "./statutory-damage-interest"
import { StatutoryContributionDialog } from "../statutory-contribution/statutory-contribution-dialog"
import type { StatutoryComponent } from "./statutory-damage-interest"

import { Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function StatutoryDamageInterestDialog() {
  const [component, setComponent] = useState<StatutoryComponent>("both")
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
      <DialogHeader>
        <DialogTitle>Statutory Damage & Interest</DialogTitle>
<Tooltip>
  <TooltipTrigger asChild>
    <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
  </TooltipTrigger>

  <TooltipContent side="right" className="max-w-sm p-3 text-sm">
    <div className="space-y-3">
      {/* PF Interest */}
      <div>
        <p className="font-medium">
          PF Interest — Section 7Q
        </p>
        <p className="text-muted-foreground">
          • 12% per annum<br />
          • Mandatory<br />
          • Calculated month-wise
        </p>
      </div>

      {/* PF Damages */}
      <div>
        <p className="font-medium">
          PF Damages — Section 14B
        </p>

        <ul className="mt-1 space-y-1 text-muted-foreground">
          <li>• Delay &lt; 2 months → 5% p.a.</li>
          <li>• Delay 2 – 4 months → 10% p.a.</li>
          <li>• Delay 4 – 6 months → 15% p.a.</li>
          <li>• Delay &gt; 6 months → 25% p.a.</li>
        </ul>
      </div>

      <p className="text-xs text-muted-foreground">
        Note: Rates are per annum and applied proportionately based on delay months.
      </p>
    </div>
  </TooltipContent>
</Tooltip>
        <DialogDescription>
          PF Interest (7Q) & PF Damages (14B)
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <Select value={component}  onValueChange={(value) => setComponent(value as StatutoryComponent)}>
          <SelectTrigger>
            <SelectValue placeholder="Select Component" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="interest">PF Interest (7Q)</SelectItem>
            <SelectItem value="damage">PF Damages (14B)</SelectItem>
            <SelectItem value="both">Both</SelectItem>
          </SelectContent>
        </Select>

        <div className="grid grid-cols-2 gap-2">
          <Select value={fromMonth} onValueChange={setFromMonth}>
            <SelectTrigger>
              <SelectValue placeholder="From Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map(m => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={toMonth} onValueChange={setToMonth}>
            <SelectTrigger>
              <SelectValue placeholder="To Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map(m => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Select value={year} onValueChange={setYear}>
          <SelectTrigger>
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map(y => (
              <SelectItem key={y} value={y}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={branch} onValueChange={setBranch}>
          <SelectTrigger>
            <SelectValue placeholder="Select Branch" />
          </SelectTrigger>
          <SelectContent>
            {branches.map(b => (
              <SelectItem key={b} value={b}>{b}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={onlyDelayed}
            onChange={() => setOnlyDelayed(!onlyDelayed)}
          />
          Show only delayed records
        </label>

        <Button className="w-full gap-2" onClick={handleDownload}>
          <Download className="h-4 w-4" />
          Download Excel
        </Button>
      </div>
    </>
  )
}
