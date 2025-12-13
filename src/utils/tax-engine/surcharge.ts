export function calculateSurcharge(taxableIncome: number, tax: number, regime: "old" | "new") {
  let rate = 0

  if (taxableIncome > 50000000) rate = regime === "old" ? 0.37 : 0.25
  else if (taxableIncome > 20000000) rate = 0.25
  else if (taxableIncome > 10000000) rate = 0.15
  else if (taxableIncome > 5000000) rate = 0.1

  return tax * rate
}
