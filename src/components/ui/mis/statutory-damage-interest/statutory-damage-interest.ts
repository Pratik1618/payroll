import * as XLSX from "xlsx"
import { toast } from "sonner"

export type StatutoryType = "PF" | "ESIC"
export type StatutoryComponent = "interest" | "damage" | "both"

export type Params = {
  statutoryType: StatutoryType
  component: StatutoryComponent
  fromMonth: string
  toMonth: string
  year: string
  branch: string
  onlyDelayed: boolean
}

/* ----------------------------- helpers ----------------------------- */

function parseDDMMYYYY(dateStr: string): Date {
  const [dd, mm, yyyy] = dateStr.split("-").map(Number)
  return new Date(yyyy, mm - 1, dd)
}

function calculateDelayMonths(due: Date, paid: Date) {
  const diffDays =
    (paid.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays <= 0 ? 0 : Math.ceil(diffDays / 30)
}

function calculateInterest(amount: number, delayMonths: number) {
  return amount * 0.12 * (delayMonths / 12)
}

function getDamageRate(delayMonths: number) {
  if (delayMonths < 2) return 0.05
  if (delayMonths < 4) return 0.10
  if (delayMonths < 6) return 0.15
  return 0.25
}

function getSection(
  statutory: StatutoryType,
  component: "interest" | "damage"
) {
  if (statutory === "PF") {
    return component === "interest" ? "7Q" : "14B"
  }
  return component === "interest" ? "39(5)(a)" : "85B"
}

/* ----------------------------- main ----------------------------- */

export function downloadStatutoryDamageInterest(params: Params) {
  // 🔹 Mock data – replace with API later
  const rows = [
    {
      WageMonth: "04-2024",
      Branch: "Mumbai",
      Amount: params.statutoryType === "PF" ? 120000 : 45000,
      DueDate: "15-05-2024",
      PaymentDate: "28-05-2024",
    },
  ]

  const result = rows.map((r) => {
    const delayMonths = calculateDelayMonths(
      parseDDMMYYYY(r.DueDate),
      parseDDMMYYYY(r.PaymentDate)
    )

    const interest = calculateInterest(r.Amount, delayMonths)
    const damageRate = getDamageRate(delayMonths)
    const damage = r.Amount * damageRate * (delayMonths / 12)

    return {
      Statutory: params.statutoryType,
      "Wage Month": r.WageMonth,
      Branch: r.Branch,
      "Contribution Amount": r.Amount,
      "Due Date": r.DueDate,
      "Payment Date": r.PaymentDate,
      "Delay (Months)": delayMonths,

      "Interest Amount":
        params.component !== "damage" ? interest : null,

      "Interest Section":
        params.component !== "damage"
          ? getSection(params.statutoryType, "interest")
          : null,

      "Damage %":
        params.component !== "interest"
          ? damageRate * 100 + "%"
          : null,

      "Damage Amount":
        params.component !== "interest" ? damage : null,

      "Damage Section":
        params.component !== "interest"
          ? getSection(params.statutoryType, "damage")
          : null,
    }
  })

  const sheet = XLSX.utils.json_to_sheet(result)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, sheet, "Statutory")

  const fileName =
    params.statutoryType === "PF"
      ? "PF_Damage_Interest_Report.xlsx"
      : "ESIC_Damage_Interest_Report.xlsx"

  XLSX.writeFile(wb, fileName)
  toast.success(
    `${params.statutoryType} damage & interest report downloaded`
  )
}
