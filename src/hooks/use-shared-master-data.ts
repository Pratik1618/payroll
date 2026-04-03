'use client'

import { useEffect, useMemo, useState } from 'react'
import { withBasePath } from '@/lib/base-path'

export type BranchOption = {
  id: string
  name: string
}

export type SiteOption = {
  id: string
  name: string
}

export function useBranches(fallback: BranchOption[] = []) {
  const [branches, setBranches] = useState<BranchOption[]>(fallback)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let active = true

    const loadBranches = async () => {
      setIsLoading(true)

      try {
        const res = await fetch(withBasePath('/api/branches'), {
          cache: 'no-store',
        })
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data?.message || 'Failed to fetch branches')
        }

        const items = Array.isArray(data?.results?.data)
          ? data.results.data
          : Array.isArray(data?.data)
            ? data.data
            : []

        if (!active || items.length === 0) return

        setBranches(
          items.map((item: any) => ({
            id: String(item?.branchId ?? item?.id ?? item?.branchName ?? ''),
            name: String(item?.branchName ?? item?.name ?? item?.branchId ?? ''),
          }))
        )
      } catch {
        if (!active) return
        setBranches(fallback)
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    loadBranches()

    return () => {
      active = false
    }
  }, [])

  return { branches, isLoading }
}

export function useClientSites(
  clientId: string,
  fallbackSites: Array<{ id: string; name: string; clientId?: string }> = []
) {
  const filteredFallback = useMemo(
    () => fallbackSites.filter((site) => !clientId || site.clientId === clientId),
    [clientId, fallbackSites]
  )
  const [sites, setSites] = useState<SiteOption[]>(
    filteredFallback.map((site) => ({ id: site.id, name: site.name }))
  )
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let active = true

    if (!clientId) {
      setSites(filteredFallback.map((site) => ({ id: site.id, name: site.name })))
      return
    }

    const loadSites = async () => {
      setIsLoading(true)

      try {
        const res = await fetch(
          withBasePath(`/api/clients/${encodeURIComponent(clientId)}/sites`),
          { cache: 'no-store' }
        )
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data?.message || 'Failed to fetch sites')
        }

        const items = Array.isArray(data?.results?.data)
          ? data.results.data
          : Array.isArray(data?.data)
            ? data.data
            : []

        if (!active) return

        if (items.length === 0) {
          setSites(filteredFallback.map((site) => ({ id: site.id, name: site.name })))
          return
        }

        setSites(
          items.map((item: any) => ({
            id: String(item?.siteId ?? item?.id ?? item?.siteName ?? ''),
            name: String(item?.siteName ?? item?.name ?? item?.siteId ?? ''),
          }))
        )
      } catch {
        if (!active) return
        setSites(filteredFallback.map((site) => ({ id: site.id, name: site.name })))
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    loadSites()

    return () => {
      active = false
    }
  }, [clientId, filteredFallback])

  return { sites, isLoading }
}
