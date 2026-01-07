"use client"

import { MainLayout } from "@/components/ui/layout/main-layout"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { SiteLicenseApplicabilityTable } from "@/components/ui/mis/site-license-applicability/site-license-applicability-table"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download } from "lucide-react"
import * as XLSX from "xlsx"

export default function SiteLicenseApplicabilityPage() {
  const router = useRouter()

  const handleExport = () => {
    // ⚠️ replace later with real table data / API
    const data = [
      {
        Branch: "HYD",
        Client: "ABC",
        Site: "Plant A",
        State: "Telangana",
        Applicability: "STATE",
        Threshold: 10,
        Employees: 18,
        Status: "EXCEEDED",
      },
      {
        Branch: "MUM",
        Client: "XYZ",
        Site: "Warehouse",
        State: "Maharashtra",
        Applicability: "STATE",
        Threshold: 50,
        Employees: 45,
        Status: "OK",
      },
    ]

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "License Applicability")
    XLSX.writeFile(wb, "Site_License_Applicability.xlsx")
  }

  return (
    <MainLayout>
      <Card>
        {/* 🔹 HEADER */}
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Site License Applicability</CardTitle>
            <CardDescription>
              Review state / central license applicability against manpower
            </CardDescription>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleExport}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
        </CardHeader>

        {/* 🔹 CONTENT */}
        <CardContent>
          <SiteLicenseApplicabilityTable />
        </CardContent>
      </Card>
    </MainLayout>
  )
}
