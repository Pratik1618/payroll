"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  id: number
  title: string
  description: string
  completed: boolean
  current?: boolean
}

interface StepperProps {
  steps: Step[]
  currentStep: number
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium",
                step.completed
                  ? "border-primary bg-primary text-primary-foreground"
                  : step.current || currentStep === step.id
                    ? "border-primary bg-background text-primary"
                    : "border-muted bg-background text-muted-foreground",
              )}
            >
              {step.completed ? <Check className="h-5 w-5" /> : step.id}
            </div>
            <div className="mt-2 text-center">
              <div
                className={cn(
                  "text-sm font-medium",
                  step.completed || step.current || currentStep === step.id
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {step.title}
              </div>
              <div className="text-xs text-muted-foreground">{step.description}</div>
            </div>
          </div>
          {index < steps.length - 1 && (
            <div className={cn("mx-4 h-0.5 w-16 bg-border", step.completed ? "bg-primary" : "bg-border")} />
          )}
        </div>
      ))}
    </div>
  )
}
