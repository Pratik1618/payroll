import * as XLSX from "xlsx"
import { toast } from "sonner"

export type StatutoryComponent = "interest" | "damage" | "both"
export type Params = {
  component: StatutoryComponent
  fromMonth: string
  toMonth: string
  year: string
  branch: string
  onlyDelayed: boolean
}

function parseDDMMYYYY(dateStr: string): Date {
  const [dd, mm, yyyy] = dateStr.split("-").map(Number)
  return new Date(yyyy, mm - 1, dd)
}


export function downloadStatutoryDamageInterest(params: Params) {
  // 🔹 Mock data (replace with API later)
  const rows = [
    {
      WageMonth: "04-2024",
      Branch: "Mumbai",
      PFAmount: 120000,
      DueDate: "15-05-2024",
      PaymentDate: "28-05-2024",
    },
  ]

  const result = rows.map(r => {
  const delayMonths = calculateDelayMonths(
  parseDDMMYYYY(r.DueDate),
  parseDDMMYYYY(r.PaymentDate)
)

    const interest = calculateInterest(r.PFAmount, delayMonths)
    const damageRate = getDamageRate(delayMonths)
    const damage = r.PFAmount * damageRate * (delayMonths / 12)

    return {
      WageMonth: r.WageMonth,
      Branch: r.Branch,
      "PF Amount": r.PFAmount,
      "Due Date": r.DueDate,
      "Payment Date": r.PaymentDate,
      "Delay (Months)": delayMonths,
      "Interest @12% (7Q)": params.component !== "damage" ? interest : "",
      "Damage % (14B)": params.component !== "interest" ? damageRate * 100 + "%" : "",
      "Damage Amount (14B)": params.component !== "interest" ? damage : "",
    }
  })

  const sheet = XLSX.utils.json_to_sheet(result)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, sheet, "Statutory")

  XLSX.writeFile(wb, "PF_Damage_Interest_Report.xlsx")
  toast.success("Statutory damage & interest report downloaded")
}

function calculateDelayMonths(due: Date, paid: Date) {
  const diffDays = (paid.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays <= 0 ? 0 : Math.ceil(diffDays / 30)
}

function calculateInterest(pfAmount: number, delayMonths: number) {
  return pfAmount * 0.12 * (delayMonths / 12)
}

function getDamageRate(delayMonths: number) {
  if (delayMonths < 2) return 0.05
  if (delayMonths < 4) return 0.10
  if (delayMonths < 6) return 0.15
  return 0.25
}
