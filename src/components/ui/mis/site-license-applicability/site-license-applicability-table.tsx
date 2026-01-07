"use client"

import { useState } from "react"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { CLRA_THRESHOLD } from "./clra-threshold"

type Applicability = "STATE" | "CENTRAL"

type SiteRow = {
  Branch: string
  Client: string
  Site: string
  State: string
  Employees: number
  Applicability: Applicability
}

const initialSites: SiteRow[] = [
  {
    Branch: "HYD",
    Client: "ABC",
    Site: "Plant A",
    State: "Telangana",
    Employees: 18,
    Applicability: "STATE",
  },
  {
    Branch: "MUM",
    Client: "XYZ",
    Site: "Warehouse",
    State: "Maharashtra",
    Employees: 45,
    Applicability: "STATE",
  },
]

export function SiteLicenseApplicabilityTable() {
  const [sites, setSites] = useState<SiteRow[]>(initialSites)

  const updateApplicability = (index: number, value: Applicability) => {
    const updated = [...sites]
    updated[index].Applicability = value
    setSites(updated)
  }

  return (
    <div className="border rounded-md overflow-auto">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-muted sticky top-0 z-10">
          <tr>
            <th className="p-3 text-left">Branch</th>
            <th className="p-3 text-left">Client</th>
            <th className="p-3 text-left">Site</th>
            <th className="p-3 text-left">State</th>
            <th className="p-3 text-left">Applicability</th>
            <th className="p-3 text-right">Threshold</th>
            <th className="p-3 text-right">Employees</th>
            <th className="p-3 text-center">Status</th>
          </tr>
        </thead>

        <tbody>
          {sites.map((row, idx) => {
            const threshold =
              row.Applicability === "STATE"
                ? CLRA_THRESHOLD[row.State]?.state
                : CLRA_THRESHOLD[row.State]?.central

            const exceeded =
              threshold !== undefined &&
              row.Employees > threshold

            return (
              <tr
                key={`${row.Branch}-${row.Site}`}
                className={`border-t ${
                  exceeded ? "bg-red-50" : ""
                }`}
              >
                <td className="p-3">{row.Branch}</td>
                <td className="p-3">{row.Client}</td>
                <td className="p-3">{row.Site}</td>
                <td className="p-3">{row.State}</td>

                {/* Applicability */}
                <td className="p-2">
                  <Select
                    value={row.Applicability}
                    onValueChange={(v) =>
                      updateApplicability(
                        idx,
                        v as Applicability
                      )
                    }
                  >
                    <SelectTrigger className="h-8 w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STATE">State</SelectItem>
                      <SelectItem value="CENTRAL">
                        Central
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </td>

                {/* Threshold with Tooltip */}
                <td className="p-3 text-right">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help underline decoration-dotted">
                          {threshold ?? "N/A"}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {row.Applicability === "STATE" ? (
                          <p>
                            State CLRA threshold for{" "}
                            {row.State}
                          </p>
                        ) : (
                          <p>
                            Central CLRA threshold (Pan India)
                          </p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </td>

                <td className="p-3 text-right">
                  {row.Employees}
                </td>

                <td
                  className={`p-3 text-center font-semibold ${
                    exceeded
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {exceeded ? "❌ EXCEEDED" : "✅ OK"}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
