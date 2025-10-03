"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Option = { id: string; name: string }

export default function LeaveFilters({
  clientId,
  onClientChange,
  siteId,
  onSiteChange,
  clients,
  sites,
}: {
  clientId: string
  onClientChange: (v: string) => void
  siteId: string
  onSiteChange: (v: string) => void
  clients: Option[]
  sites: Option[]
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="space-y-1.5">
        <label htmlFor="client" className="text-sm font-medium text-foreground">
          Client
        </label>
        <Select value={clientId} onValueChange={onClientChange}>
          <SelectTrigger id="client" className="w-full">
            <SelectValue placeholder="Select client" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="site" className="text-sm font-medium text-foreground">
          Site
        </label>
        <Select value={siteId} onValueChange={onSiteChange} disabled={!sites.length}>
          <SelectTrigger id="site" className="w-full">
            <SelectValue placeholder={sites.length ? "Select site" : "No sites"} />
          </SelectTrigger>
          <SelectContent>
            {sites.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
