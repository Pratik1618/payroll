// Utility function to calculate the number of days in a given month
// Handles leap years automatically
export const getMonthDays = (month: string): number => {
  if (!month) return 0

  const [year, m] = month.split("-").map(Number)

  // Create a date object for the first day of next month, then subtract 1 day
  // This automatically handles leap years
  return new Date(year, m, 0).getDate()
}
