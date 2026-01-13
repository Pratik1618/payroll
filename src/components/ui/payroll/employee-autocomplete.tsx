"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

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

// Mock employee data - replace with real data from your API
const mockEmployees: Employee[] = [
  { code: "EMP001", name: "John Doe", designation: "Software Engineer", site: "Mumbai" },
  { code: "EMP002", name: "Jane Smith", designation: "Product Manager", site: "Bangalore" },
  { code: "EMP003", name: "Raj Kumar", designation: "Data Analyst", site: "Delhi" },
  { code: "EMP004", name: "Priya Patel", designation: "Designer", site: "Mumbai" },
  { code: "EMP005", name: "Amit Singh", designation: "QA Engineer", site: "Hyderabad" },
]

export function EmployeeAutocomplete({
  value,
  onChange,
  employees = mockEmployees,
  placeholder = "Search by code or name...",
}: EmployeeAutocompleteProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  const selectedEmployee = employees.find((emp) => emp.code === value)

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.code.toLowerCase().includes(searchValue.toLowerCase()) ||
      emp.name.toLowerCase().includes(searchValue.toLowerCase()),
  )

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
            {selectedEmployee ? (
              <>
                <span className="text-sm font-medium">{selectedEmployee.code}</span>
                <span className="text-sm text-muted-foreground truncate">{selectedEmployee.name}</span>
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
          <CommandEmpty>No employee found.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {filteredEmployees.map((emp) => (
                <CommandItem
                  key={emp.code}
                  value={emp.code}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue)
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
