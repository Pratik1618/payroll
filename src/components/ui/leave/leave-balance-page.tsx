"use client"

import { useMemo, useState } from "react"
import LeaveFilters from "./leave-filters" 
import LeaveBalanceTable from "./leave-balance-table"
import { clients, getSitesByClient, filterBalances, type LeaveBalance } from "./data"

export default function LeaveBalancesPage() {
  const [clientId, setClientId] = useState<string>(clients[0]?.id ?? "")
  const sites = useMemo(() => getSitesByClient(clientId), [clientId])
  const [siteId, setSiteId] = useState<string>(sites[0]?.id ?? "")

  // keep site valid when client changes
  const safeSiteId = useMemo(() => {
    if (!sites.length) return ""
    return sites.some((s) => s.id === siteId) ? siteId : sites[0].id
  }, [sites, siteId])

  const balances: LeaveBalance[] = useMemo(() => filterBalances(clientId, safeSiteId), [clientId, safeSiteId])

  return (
    <section className="space-y-4">
      <header className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-foreground text-pretty">Leave Balances</h2>
        <p className="text-sm text-muted-foreground">
          Select Client and Site to view every individual’s leave balance.
        </p>
      </header>

      <LeaveFilters
        clientId={clientId}
        onClientChange={setClientId}
        siteId={safeSiteId}
        onSiteChange={setSiteId}
        clients={clients}
        sites={sites}
      />

      <LeaveBalanceTable rows={balances} />
    </section>
  )
}
