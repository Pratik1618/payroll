"use client"

import { useState } from "react"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface SubDepartment {
  id: string
  name: string
}

interface Department {
  id: string
  name: string
  subDepartments: SubDepartment[]
}

interface Branch {
  id: string
  name: string
  departments: Department[]
}

interface SidebarTreeProps {
  branches: Branch[]
  selectedSubDepartments: string[]
  onSelectSubDepartments: (subDepIds: string[], depNames: string[], branchName: string) => void
  onSelectBranch?: (branchName: string) => void
}

export function SidebarTree({ 
  branches, 
  selectedSubDepartments, 
  onSelectSubDepartments, 
  onSelectBranch 
}: SidebarTreeProps) {
  const [expandedBranch, setExpandedBranch] = useState<string>("")
  const [expandedDepartment, setExpandedDepartment] = useState<Record<string, boolean>>({})

  const toggleDepartment = (deptId: string) => {
    setExpandedDepartment((prev) => ({
      ...prev,
      [deptId]: !prev[deptId],
    }))
  }

  const handleSubDepartmentToggle = (subDepId: string, depName: string, branchName: string, isChecked: boolean) => {
    let updatedIds: string[]
    let updatedDepNames: string[]

    if (isChecked) {
      updatedIds = [...selectedSubDepartments, subDepId]
      updatedDepNames = [depName]
    } else {
      updatedIds = selectedSubDepartments.filter((id) => id !== subDepId)
      updatedDepNames = updatedIds.length > 0 ? [depName] : []
    }

    onSelectSubDepartments(updatedIds, updatedDepNames, branchName)
  }

  return (
    <div className="w-64 border-r border-border bg-card h-full overflow-auto">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-sm text-foreground">Organization Structure</h3>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {branches.map((branch) => (
          <AccordionItem key={branch.id} value={branch.id}>
            <AccordionTrigger 
              className="px-4 hover:bg-muted/50"
              onClick={() => onSelectBranch?.(branch.name)}
            >
              {branch.name}
            </AccordionTrigger>
            <AccordionContent className="px-0 py-0">
              <div className="space-y-0">
                {branch.departments.map((dept) => (
                  <div key={dept.id} className="bg-muted/30">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleDepartment(dept.id)}
                      className="w-full justify-start pl-8 py-2 h-auto text-xs hover:bg-muted"
                    >
                      <ChevronRight
                        className={cn(
                          "h-3 w-3 mr-1 flex-shrink-0 transition-transform",
                          expandedDepartment[dept.id] ? "rotate-90" : "",
                        )}
                      />
                      <span className="font-medium">{dept.name}</span>
                    </Button>

                    {expandedDepartment[dept.id] && (
                      <div className="space-y-2 bg-muted/20 p-2">
                        {dept.subDepartments.map((subDept) => (
                          <div
                            key={subDept.id}
                            className="flex items-center gap-2 pl-8"
                          >
                            <Checkbox
                              id={subDept.id}
                              checked={selectedSubDepartments.includes(subDept.id)}
                              onCheckedChange={(checked) =>
                                handleSubDepartmentToggle(
                                  subDept.id,
                                  dept.name,
                                  branch.name,
                                  checked as boolean,
                                )
                              }
                            />
                            <label
                              htmlFor={subDept.id}
                              className="text-xs cursor-pointer flex-1"
                            >
                              {subDept.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
