import { OLD_SLABS, NEW_SLABS } from "./slabs"
import { calculateHraExemption } from "./hra"
import { calculate80C, calculate80D } from "./deductions"
import { calculateSurcharge } from "./surcharge"
import { applyRebate } from "./rebate"
import { TaxInput } from "./types"

export function calculateTax(input: TaxInput) {
  const { salary, deductions, hra, otherIncome, professionalTax = 0, previousEmployment } = input

  const annualSalary =
    salary.basic + salary.hra + salary.special + salary.conveyance + salary.other

  const standardDeduction = 50000

  let taxable =
    annualSalary -
    standardDeduction -
    professionalTax +
    (otherIncome?.interest || 0) +
    (otherIncome?.rental || 0) +
    (previousEmployment?.income || 0)

  if (input.regime === "old") {
    taxable -= calculate80C(deductions.pf, deductions.other80c)
    taxable -= calculate80D(deductions.sec80d)

    if (hra) {
      taxable -= calculateHraExemption(
        salary.basic,
        salary.hra,
        hra.rentPaid,
        hra.isMetro,
      )
    }
  }

  taxable = Math.max(Math.round(taxable / 10) * 10, 0)

  // slab calculation
  let tax = 0
  let slabs =
    input.regime === "old"
      ? OLD_SLABS[input.ageCategory]
      : NEW_SLABS

  let lastLimit = 0
  for (const slab of slabs) {
    if (taxable <= lastLimit) break
    const amount = Math.min(taxable, slab.upto) - lastLimit
    tax += amount * slab.rate
    lastLimit = slab.upto
  }

  tax = applyRebate(taxable, tax, input.regime)

  const surcharge = calculateSurcharge(taxable, tax, input.regime)
  const cess = (tax + surcharge) * 0.04

  const totalTax = Math.round(tax + surcharge + cess)
  const netTax = totalTax - (previousEmployment?.tds || 0)

  return {
    taxableIncome: taxable,
    incomeTax: tax,
    surcharge,
    cess,
    totalTax,
    netTax,
    monthlyTds: Math.round(netTax / 12),
  }
}
