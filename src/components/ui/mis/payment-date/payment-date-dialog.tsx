"use client"

import { useState } from "react"
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import * as XLSX from "xlsx"

const branches = [
  "Hyderabad",
  "Mumbai",
  "Delhi",
  "Pune",
]

export function PaymentDateDialog() {
  const [selected, setSelected] = useState<string[]>(["PAN"])

  const toggle = (value: string) => {
    if (value === "PAN") {
      setSelected(["PAN"])
      return
    }

    let updated = selected.filter(v => v !== "PAN")

    if (updated.includes(value)) {
      updated = updated.filter(v => v !== value)
    } else {
      updated.push(value)
    }

    if (updated.length === 0) {
      updated = ["PAN"]
    }

    setSelected(updated)
  }

  const handleDownload = () => {
    const scope =
      selected.includes("PAN")
        ? "PAN"
        : "BRANCH"

    // mock data
  const data = [
  {
    Branch: "Hyderabad",
    ClientName: "ABC Industries Pvt Ltd",
    SiteName: "ABC Plant – HYD",
    SiteCode: "HYD001",
    PaymentDate: "05-Dec-2024",
  },
  {
    Branch: "Mumbai",
    ClientName: "XYZ Services Ltd",
    SiteName: "XYZ Warehouse – MUM",
    SiteCode: "MUM002",
    PaymentDate: "07-Dec-2024",
  },
].filter(row => {
  if (scope === "PAN") return true
  return selected.includes(row.Branch)
})
  

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "PaymentDate")
    XLSX.writeFile(wb, "Payment_Date_Report.xlsx")

    toast.success("Payment date report downloaded")
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Payment Date Report</DialogTitle>
        <DialogDescription>
          Branch-wise salary payment dates
        </DialogDescription>
      </DialogHeader>

      {/* 🔹 Single dropdown with checkbox */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="justify-between">
            {selected.includes("PAN")
              ? "PAN India"
              : `${selected.length} Branch Selected`}
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-64">
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Checkbox
              checked={selected.includes("PAN")}
              onCheckedChange={() => toggle("PAN")}
            />
            <span className="ml-2">PAN India</span>
          </DropdownMenuItem>

          <div className="border-t my-1" />

          {branches.map(branch => (
            <DropdownMenuItem
              key={branch}
              onSelect={(e) => e.preventDefault()}
            >
              <Checkbox
                checked={selected.includes(branch)}
                onCheckedChange={() => toggle(branch)}
              />
              <span className="ml-2">{branch}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button onClick={handleDownload} className="w-full gap-2 mt-3">
        <Download className="h-4 w-4" />
        Download Excel
      </Button>
    </>
  )
}
