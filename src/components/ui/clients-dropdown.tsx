import React, { useState, useRef, useEffect } from "react"

export interface ClientOption {
  id: string
  name: string
  employees?: number
}

interface ClientsDropdownProps {
  clients: ClientOption[]
  selectedClients: string[]
  setSelectedClients: (ids: string[]) => void
  placeholder?: string
  label?: string
  className?: string
}

export const ClientsDropdown: React.FC<ClientsDropdownProps> = ({
  clients,
  selectedClients,
  setSelectedClients,
  placeholder = "Select clients",
  label,
  className = "",
}) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Filter clients by search
  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(search.toLowerCase())
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

  const allSelected = clients.length > 0 && selectedClients.length === clients.length
  const someSelected = selectedClients.length > 0 && selectedClients.length < clients.length

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedClients([])
    } else {
      setSelectedClients(clients.map((client) => client.id))
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
        {selectedClients.length === 0
          ? placeholder
          : selectedClients.length === 1
          ? clients.find((c) => c.id === selectedClients[0])?.name
          : `${selectedClients.length} clients selected`}
      </button>
      {open && (
        <div className="absolute z-20 mt-2 w-full bg-popover border rounded-md shadow-lg max-h-64 overflow-y-auto">
          <div className="p-2 border-b">
            <input
              type="text"
              placeholder="Search clients..."
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
              id="select-all-clients"
            />
            <label htmlFor="select-all-clients" className="text-sm cursor-pointer">
              Select All
            </label>
          </div>
          <div>
            {filteredClients.length === 0 && (
              <div className="p-2 text-muted-foreground text-sm">No clients found</div>
            )}
            {filteredClients.map((client) => (
              <label
                key={client.id}
                className="flex items-center px-2 py-1 cursor-pointer hover:bg-accent"
              >
                <input
                  type="checkbox"
                  checked={selectedClients.includes(client.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedClients([...selectedClients, client.id])
                    } else {
                      setSelectedClients(selectedClients.filter((id) => id !== client.id))
                    }
                  }}
                  className="mr-2"
                />
                <span className="text-sm">
                  {client.name}
                  {typeof client.employees === "number" && ` (${client.employees} employees)`}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}