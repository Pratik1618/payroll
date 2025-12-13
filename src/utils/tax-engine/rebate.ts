export function applyRebate(taxableIncome: number, tax: number, regime: "old" | "new") {
  if (regime === "old" && taxableIncome <= 500000) return 0
  if (regime === "new" && taxableIncome <= 700000) return 0
  return tax
}
