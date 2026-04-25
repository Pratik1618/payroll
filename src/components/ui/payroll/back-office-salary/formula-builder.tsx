"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronsUpDown } from "lucide-react"

export interface FormulaComponent {
  name: string
}

interface FormulaBuilderProps {
  availableComponents: string[]
  selectedComponents: FormulaComponent[]
  commonPercent: number
  onComponentsChange: (components: FormulaComponent[]) => void
  onPercentChange: (percent: number) => void
  calculatedValue: number
}

export function FormulaBuilder({
  availableComponents,
  selectedComponents,
  commonPercent,
  onComponentsChange,
  onPercentChange,
  calculatedValue,
}: FormulaBuilderProps) {
  const selectedNames = selectedComponents.map((component) => component.name)

  const toggleComponent = (name: string, checked: boolean) => {
    if (checked) {
      if (selectedNames.includes(name)) return
      onComponentsChange([...selectedComponents, { name }])
      return
    }

    onComponentsChange(selectedComponents.filter((component) => component.name !== name))
  }

  return (
    <div className="space-y-4">
      <Card className="border-dashed">
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 md:grid-cols-[1fr_180px]">
            <div className="space-y-2">
              <Label className="text-xs">Select Components</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" className="w-full justify-between bg-background font-normal">
                    <span className="truncate">
                      {selectedNames.length > 0
                        ? `${selectedNames.length} component${selectedNames.length > 1 ? "s" : ""} selected`
                        : "Select components"}
                    </span>
                    <ChevronsUpDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-[320px] p-3">
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">
                      Choose one or more components
                    </div>
                    <div className="max-h-56 space-y-2 overflow-y-auto">
                      {availableComponents.map((component) => {
                        const id = `formula-component-${component.toLowerCase().replace(/\s+/g, "-")}`
                        return (
                          <label
                            key={component}
                            htmlFor={id}
                            className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/60"
                          >
                            <Checkbox
                              id={id}
                              checked={selectedNames.includes(component)}
                              onCheckedChange={(checked) => toggleComponent(component, Boolean(checked))}
                            />
                            <span className="text-sm">{component}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {selectedNames.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedNames.map((name) => (
                    <Badge key={name} variant="secondary">
                      {name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Common Percentage (%)</Label>
              <Input
                type="number"
                min="0"
                step="0.5"
                value={commonPercent}
                onChange={(event) => onPercentChange(Math.max(0, parseFloat(event.target.value) || 0))}
                placeholder="0"
              />
            </div>
          </div>

          <div className="rounded-md border border-blue-200 bg-blue-50 p-3 space-y-2">
            <div className="text-xs font-semibold text-blue-900">
              Formula:{" "}
              {selectedNames.length > 0 && commonPercent > 0
                ? `(${selectedNames.join(" + ")}) x ${commonPercent}%`
                : "Select components and enter one common percentage"}
            </div>
            <div className="text-sm font-semibold text-blue-900">
              Calculated Value: Rs. {calculatedValue.toFixed(2)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
