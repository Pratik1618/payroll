/**
 * Month Utility - Handle YYYY-MM format months and arrears period calculations
 */

export interface MonthOption {
  value: string // YYYY-MM format
  label: string // Human-readable format (e.g., "Jan 2024")
}

/**
 * Generate month options for a given year range
 * @param startYear - Start year (e.g., 2024)
 * @param endYear - End year (e.g., 2025)
 * @returns Array of month options with YYYY-MM values and readable labels
 */
export function generateMonthOptions(startYear: number, endYear: number): MonthOption[] {
  const options: MonthOption[] = []
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  for (let year = startYear; year <= endYear; year++) {
    for (let month = 0; month < 12; month++) {
      const monthStr = String(month + 1).padStart(2, "0")
      options.push({
        value: `${year}-${monthStr}`,
        label: `${monthNames[month]} ${year}`,
      })
    }
  }

  return options
}

/**
 * Calculate arrears months between effective and approval months
 * @param effectiveMonth - YYYY-MM format (e.g., "2024-01")
 * @param approvalMonth - YYYY-MM format (e.g., "2024-06")
 * @returns Array of YYYY-MM values from effective month up to (but not including) approval month
 */
export function calculateArrearsMonths(effectiveMonth: string, approvalMonth: string): string[] {
  const arrears: string[] = []

  if (!effectiveMonth || !approvalMonth) return arrears

  const [effYear, effMonth] = effectiveMonth.split("-").map(Number)
  const [appYear, appMonth] = approvalMonth.split("-").map(Number)

  // Validation: approval month must be strictly after effective month
  const effDate = new Date(effYear, effMonth - 1, 1)
  const appDate = new Date(appYear, appMonth - 1, 1)

  if (appDate <= effDate) return arrears

  let currentYear = effYear
  let currentMonth = effMonth

  while (currentYear < appYear || (currentYear === appYear && currentMonth < appMonth)) {
    const monthStr = String(currentMonth).padStart(2, "0")
    arrears.push(`${currentYear}-${monthStr}`)

    currentMonth++
    if (currentMonth > 12) {
      currentMonth = 1
      currentYear++
    }
  }

  return arrears
}

/**
 * Format YYYY-MM to readable string
 * @param monthValue - YYYY-MM format
 * @returns Human-readable format (e.g., "January 2024")
 */
export function formatMonthLabel(monthValue: string): string {
  if (!monthValue) return ""

  const [year, month] = monthValue.split("-")
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  return `${monthNames[Number.parseInt(month) - 1]} ${year}`
}

/**
 * Get period display string
 * @param effectiveMonth - YYYY-MM format
 * @param approvalMonth - YYYY-MM format
 * @returns Display string (e.g., "Jan 2024 – May 2024 (5 months)")
 */
export function getPeriodDisplay(effectiveMonth: string, approvalMonth: string): string {
  const arrears = calculateArrearsMonths(effectiveMonth, approvalMonth)
  if (arrears.length === 0) return ""

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const [effYear, effMonth] = effectiveMonth.split("-").map(Number)
  const lastMonth = arrears[arrears.length - 1]
  const [lastYear, lastMonthNum] = lastMonth.split("-").map(Number)

  return `${monthNames[effMonth - 1]} ${effYear} – ${monthNames[lastMonthNum - 1]} ${lastYear} (${arrears.length} months)`
}
