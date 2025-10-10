import React, { useState, useRef, useEffect } from "react"

export interface SiteOption {
  id: string
  name: string
  employees?: number
}

interface SitesDropdownProps {
  sites: SiteOption[]
  selectedSites: string[]
  setSelectedSites: (ids: string[]) => void
  placeholder?: string
  label?: string
  className?: string
}

export const SitesDropdown: React.FC<SitesDropdownProps> = ({
  sites,
  selectedSites,
  setSelectedSites,
  placeholder = "Select sites",
  label,
  className = "",
}) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Filter sites by search
  const filteredSites = sites.filter((site) =>
    site.name.toLowerCase().includes(search.toLowerCase())
  )

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  const allSelected = sites.length > 0 && selectedSites.length === sites.length
  const someSelected = selectedSites.length > 0 && selectedSites.length < sites.length

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedSites([])
    } else {
      setSelectedSites(sites.map((site) => site.id))
    }
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && <label className="text-sm font-medium mb-1 block">{label}</label>}
      <button
        type="button"
        className="w-full border rounded-md px-3 py-2 text-left bg-background "
    
        onClick={() => setOpen((v) => !v)}
      >
        {selectedSites.length === 0
          ? placeholder
          : selectedSites.length === 1
          ? sites.find((s) => s.id === selectedSites[0])?.name
          : `${selectedSites.length} sites selected`}
      </button>
      {open && (
        <div className="absolute z-20 mt-2 w-full bg-popover border rounded-md shadow-lg max-h-64 overflow-y-auto">
          <div className="p-2 border-b">
            <input
              type="text"
              placeholder="Search sites..."
              className="w-full px-2 py-1 border rounded text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="p-2 border-b flex items-center">
            <input
              type="checkbox"
              checked={allSelected}
              ref={el => {
                if (el) el.indeterminate = someSelected
              }}
              onChange={handleSelectAll}
              className="mr-2"
              id="select-all-sites"
            />
            <label htmlFor="select-all-sites" className="text-sm cursor-pointer">
              Select All
            </label>
          </div>
          <div>
            {filteredSites.length === 0 && (
              <div className="p-2 text-muted-foreground text-sm">No sites found</div>
            )}
            {filteredSites.map((site) => (
              <label
                key={site.id}
                className="flex items-center px-2 py-1 cursor-pointer hover:bg-accent"
              >
                <input
                  type="checkbox"
                  checked={selectedSites.includes(site.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedSites([...selectedSites, site.id])
                    } else {
                      setSelectedSites(selectedSites.filter((id) => id !== site.id))
                    }
                  }}
                  className="mr-2"
                />
                <span className="text-sm">
                  {site.name}
                  {typeof site.employees === "number" && ` (${site.employees} employees)`}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}