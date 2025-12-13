export function calculate80C(pf: number, other: number) {
  return Math.min(pf + other, 150000)
}

export function calculate80D(amount: number) {
  return Math.min(amount, 100000)
}
