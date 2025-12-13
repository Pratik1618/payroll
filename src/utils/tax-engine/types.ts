export type Regime = "old" | "new"
export type AgeCategory = "normal" | "senior" | "super_senior"

export interface SalaryInput {
  basic: number
  hra: number
  special: number
  conveyance: number
  other: number
}

export interface DeductionInput {
  pf: number
  other80c: number
  sec80d: number
  sec80ccd1b?: number
}

export interface HraInput {
  rentPaid: number
  isMetro: boolean
}

export interface OtherIncome {
  interest?: number
  rental?: number
}

export interface PreviousEmployment {
  income: number
  tds: number
}

export interface TaxInput {
  salary: SalaryInput
  deductions: DeductionInput
  hra?: HraInput
  otherIncome?: OtherIncome
  professionalTax?: number
  previousEmployment?: PreviousEmployment
  ageCategory: AgeCategory
  regime: Regime
}
