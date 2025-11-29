"use client"

import { useState } from "react"
import { MainLayout } from "@/components/ui/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { MapPin, Plus, Trash2 } from "lucide-react"

const mockCycles = [
  { id: "1", name: "7 to 7", startDate: "7", endDate: "7" },
  { id: "2", name: "10 to 10", startDate: "10", endDate: "10" },
  { id: "3", name: "15 to 15", startDate: "15", endDate: "15" },
  { id: "4", name: "1 to 30", startDate: "1", endDate: "30" },
]

const mockSites = [
  { id: "1", name: "Site A", client: "Acme Corp" },
  { id: "2", name: "Site B", client: "Acme Corp" },
  { id: "3", name: "Site C", client: "TechFlow Inc" },
  { id: "4", name: "Site D", client: "TechFlow Inc" },
  { id: "5", name: "Site E", client: "Global Services" },
]

export default function CycleMappingPage() {
  const [mappingMode, setMappingMode] = useState<"predefined" | "custom">("predefined")
  const [selectedCycle, setSelectedCycle] = useState<string>("")
  const [fromDate, setFromDate] = useState<number>(0)
  const [toDate, setToDate] = useState<number>(0)
  const [siteSearchQuery, setSiteSearchQuery] = useState<string>("")
  const [mappedSites, setMappedSites] = useState<string[]>([])
  const [mappings, setMappings] = useState<
    Array<{ id: string; cycleId: string; cycleName: string; fromDate: number; toDate: number; sites: string[] }>
  >([
    {
      id: "map-1",
      cycleId: "1",
      cycleName: "7 to 7",
      fromDate: 7,
      toDate: 7,
      sites: ["1", "2", "5"],
    },
  ])

  const handleFromDateSelect = (day: number) => {
    setFromDate(day)
    if (day) {
      const toDateCalculated = day + 29 // +29 to make it 30 days inclusive
      setToDate(toDateCalculated > 31 ? toDateCalculated - 31 : toDateCalculated)
    }
  }

  const filteredSites = mockSites.filter(
    (site) =>
      site.name.toLowerCase().includes(siteSearchQuery.toLowerCase()) ||
      site.client.toLowerCase().includes(siteSearchQuery.toLowerCase()),
  )

  const handleSiteToggle = (siteId: string) => {
    const updatedSites = mappedSites.includes(siteId)
      ? mappedSites.filter((id) => id !== siteId)
      : [...mappedSites, siteId]
    setMappedSites(updatedSites)
  }

  const handleCreateMapping = () => {
    if (mappingMode === "predefined") {
      if (!selectedCycle) {
        toast.error("Please select a salary cycle")
        return
      }
    } else {
      if (fromDate === 0 || toDate === 0) {
        toast.error("Please select from and to dates")
        return
      }
    }

    if (!mappedSites.length) {
      toast.error("Please select at least one site")
      return
    }

    let cycleId = selectedCycle
    let cycleName = ""
    let finalFromDate = fromDate
    let finalToDate = toDate

    if (mappingMode === "predefined") {
      const cycle = mockCycles.find((c) => c.id === selectedCycle)
      cycleId = cycle?.id || ""
      cycleName = cycle?.name || ""
      finalFromDate = Number.parseInt(cycle?.startDate || "0")
      finalToDate = Number.parseInt(cycle?.endDate || "0")
    } else {
      cycleName = `Day ${fromDate} to Day ${toDate}`
    }

    const newMapping = {
      id: `map-${Date.now()}`,
      cycleId: cycleId,
      cycleName: cycleName,
      fromDate: finalFromDate,
      toDate: finalToDate,
      sites: [...mappedSites],
    }

    setMappings([...mappings, newMapping])
    setSelectedCycle("")
    setFromDate(0)
    setToDate(0)
    setMappedSites([])
    setSiteSearchQuery("")
    const siteNames = [...mappedSites].map((id) => mockSites.find((s) => s.id === id)?.name).join(", ")
    toast.success(`Mapping created: ${siteNames} mapped to ${cycleName}`)
  }

  const getSiteNamesWithClient = (siteIds: string[]) => {
    return siteIds
      .map((id) => {
        const site = mockSites.find((s) => s.id === id)
        return `${site?.name} (${site?.client})`
      })
      .filter(Boolean)
      .join(", ")
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cycle Mapping</h1>
          <p className="text-muted-foreground mt-1">Map salary cycles to multiple sites</p>
        </div>

        {/* Create Mapping Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Create New Mapping
            </CardTitle>
            <CardDescription>Select a salary cycle and assign it to multiple sites</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mode Selection Tabs */}
            <div className="flex gap-2 border-b border-border">
              <button
                onClick={() => setMappingMode("predefined")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${mappingMode === "predefined"
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Predefined Cycles
              </button>
              <button
                onClick={() => setMappingMode("custom")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${mappingMode === "custom"
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Custom Dates
              </button>
            </div>

            {/* Conditional Rendering based on Mode */}
            {mappingMode === "predefined" ? (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-foreground">Select Salary Cycle</label>
                <Select value={selectedCycle} onValueChange={setSelectedCycle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a cycle..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCycles.map((cycle) => (
                      <SelectItem key={cycle.id} value={cycle.id}>
                        {cycle.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <>
                {/* Custom Date Inputs */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-foreground">From Date (Day of Month)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={fromDate === 0 ? "" : fromDate}
                      onChange={(e) => {
                        const day = Number.parseInt(e.target.value)
                        if (day >= 1 && day <= 31) {
                          handleFromDateSelect(day)
                        }
                      }}
                      placeholder="1-31"
                      className="w-24 px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-sm text-muted-foreground">of month</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-foreground">To Date (Auto-calculated)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={toDate === 0 ? "" : toDate}
                      disabled
                      className="w-24 px-3 py-2 border border-input rounded-md bg-muted text-foreground cursor-not-allowed"
                    />
                    <span className="text-sm text-muted-foreground">of month (30-day cycle)</span>
                  </div>
                </div>
              </>
            )}

            {/* Sites Selection - Multi-select dropdown */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-foreground">Select Sites</label>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Search sites by name or client..."
                  value={siteSearchQuery}
                  onChange={(e) => setSiteSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />

                {/* Multi-select checkboxes with filtered results */}
                <div className="border border-input rounded-md max-h-64 overflow-y-auto space-y-1 p-2">
                  {filteredSites.length > 0 ? (
                    filteredSites.map((site) => (
                      <div
                        key={site.id}
                        className="flex items-center gap-2 px-2 py-2 hover:bg-accent rounded cursor-pointer transition-colors"
                        onClick={() => handleSiteToggle(site.id)}
                      >
                        <input
                          type="checkbox"
                          checked={mappedSites.includes(site.id)}
                          onChange={() => { }}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <label className="flex-1 cursor-pointer text-sm">
                          {site.name} <span className="text-muted-foreground">({site.client})</span>
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground p-2 text-center">No sites found</p>
                  )}
                </div>
              </div>

              {/* Display mapped sites */}
              {mappedSites.length > 0 && (
                <div className="border border-border rounded-lg p-3 space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">Mapped Sites:</p>
                  <div className="flex flex-wrap gap-2">
                    {mappedSites.map((siteId) => {
                      const site = mockSites.find((s) => s.id === siteId)
                      return (
                        <Badge key={siteId} variant="secondary" className="flex items-center gap-1">
                          {site?.name}
                          <button onClick={() => handleSiteToggle(siteId)} className="ml-1 hover:text-destructive">
                            ×
                          </button>
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              )}
              <div className="text-sm text-muted-foreground">{mappedSites.length} site(s) selected</div>
            </div>

            {/* Create Button */}
            <Button
              onClick={handleCreateMapping}
              className="w-full"
              disabled={
                mappedSites.length === 0 ||
                (mappingMode === "predefined" ? !selectedCycle : fromDate === 0 || toDate === 0)
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Mapping
            </Button>
          </CardContent>
        </Card>

        {/* Existing Mappings */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Active Mappings</h2>
          {mappings.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No cycle mappings created yet
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {mappings.map((mapping) => (
                <Card key={mapping.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{mapping.cycleName}</Badge>
                          <Badge variant="secondary">{mapping.sites.length} sites</Badge>
                          <Badge variant="outline" className="text-xs">
                            Day {mapping.fromDate} - Day {mapping.toDate}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <span className="font-medium">Assigned to:</span>
                          <div className="flex flex-col gap-1 mt-1">
                            {mapping.sites.map((siteId) => {
                              const site = mockSites.find((s) => s.id === siteId)
                              return (
                                <span key={siteId}>
                                  {site?.name} ({site?.client})
                                </span>
                              )
                            })}
                          </div>
                        </div>

                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setMappings(mappings.filter((m) => m.id !== mapping.id))
                          toast.success("Mapping deleted")
                        }}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
