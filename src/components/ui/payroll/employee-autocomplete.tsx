"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { withBasePath } from "@/lib/base-path"

interface Employee {
  code: string
  name: string
  designation: string
  site: string
}

interface EmployeeAutocompleteProps {
  value: string
  onChange: (value: string) => void
  employees?: Employee[]
  placeholder?: string
}

export function EmployeeAutocomplete({
  value,
  onChange,
  employees,
  placeholder = "Search by code or name...",
}: EmployeeAutocompleteProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")
  const [fetchedEmployees, setFetchedEmployees] = React.useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | null>(null)

  // Only hit the real backend when the caller doesn't supply its own list.
  React.useEffect(() => {
    if (employees) return
    if (searchValue.trim().length < 2) {
      setFetchedEmployees([])
      return
    }

    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch(
          withBasePath(`/api/employees/search?query=${encodeURIComponent(searchValue)}`),
          { credentials: "include", cache: "no-store" }
        )
        const json = await res.json()
        if (!cancelled && res.ok) {
          const data = json?.results?.data ?? []
          setFetchedEmployees(
            data.map((item: any) => ({
              code: item.empCode,
              name: item.empName,
              designation: item.designation,
              site: item.site,
            }))
          )
        }
      } catch (error) {
        console.error("Error searching employees:", error)
      }
    }
    const timer = setTimeout(load, 250)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [searchValue, employees])

  const sourceEmployees = employees ?? fetchedEmployees

  const filteredEmployees = employees
    ? employees.filter(
        (emp) =>
          emp.code.toLowerCase().includes(searchValue.toLowerCase()) ||
          emp.name.toLowerCase().includes(searchValue.toLowerCase())
      )
    : sourceEmployees

  const displayed = selectedEmployee && selectedEmployee.code === value
    ? selectedEmployee
    : sourceEmployees.find((emp) => emp.code === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-transparent"
        >
          <div className="flex items-center gap-2 truncate">
            {displayed ? (
              <>
                <span className="text-sm font-medium">{displayed.code}</span>
                <span className="text-sm text-muted-foreground truncate">{displayed.name}</span>
              </>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder={placeholder} value={searchValue} onValueChange={setSearchValue} />
          <CommandEmpty>
            {!employees && searchValue.trim().length < 2 ? "Type at least 2 characters..." : "No employee found."}
          </CommandEmpty>
          <CommandList>
            <CommandGroup>
              {filteredEmployees.map((emp) => (
                <CommandItem
                  key={emp.code}
                  value={emp.code}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue)
                    setSelectedEmployee(emp)
                    setOpen(false)
                    setSearchValue("")
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === emp.code ? "opacity-100" : "opacity-0")} />
                  <div className="flex items-center gap-2 flex-1">
                    <span className="font-medium">{emp.code}</span>
                    <span className="text-muted-foreground text-sm">{emp.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{emp.site}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
