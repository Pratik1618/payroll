export function calculateHraExemption(
  basic: number,
  hra: number,
  rentPaid: number,
  isMetro: boolean,
) {
  if (!hra || !rentPaid) return 0

  const rentMinus10 = Math.max(rentPaid - basic * 0.1, 0)
  const percentOfBasic = basic * (isMetro ? 0.5 : 0.4)

  return Math.min(hra, rentMinus10, percentOfBasic)
}
