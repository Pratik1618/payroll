import * as XLSX from "xlsx"
import { toast } from "sonner"

/* -------------------------------------------------------------------------- */
/*                               HELPERS                                      */
/* -------------------------------------------------------------------------- */

// Calculate completed years of service
function calculateYearsOfService(doj: string) {
  const joining = new Date(doj)
  const today = new Date()

  let years = today.getFullYear() - joining.getFullYear()

  if (
    today.getMonth() < joining.getMonth() ||
    (today.getMonth() === joining.getMonth() &&
      today.getDate() < joining.getDate())
  ) {
    years--
  }

  return Math.max(years, 0)
}

// Gratuity formula as per Act
function calculateGratuity(salary: number, years: number) {
  return Math.round((salary / 26) * 15 * years)
}

// Vesting rule (India)
function isVested(years: number) {
  return years >= 5
}

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type GratuityEmployee = {
  EmpCode: string
  DOB: string
  DOJ: string
  salaryAct: number
  salaryScheme?: number
  office?: string
  name?: string
  col3?: string
}

/* -------------------------------------------------------------------------- */
/*                              MAIN FUNCTION                                 */
/* -------------------------------------------------------------------------- */

export function downloadGratuityValuation() {
const employees: GratuityEmployee[] = [
  // ❌ Non-Vested (2 years)
  {
    EmpCode: "ACT0001",
    DOB: "12-May-1995",
    DOJ: "01-Mar-2023",
    salaryAct: 14000,
    office: "Mumbai",
    name: "RAVI PATEL",
  },

  // ❌ Non-Vested (4 years)
  {
    EmpCode: "ACT0002",
    DOB: "08-Aug-1991",
    DOJ: "15-Feb-2021",
    salaryAct: 18000,
    office: "Pune",
    name: "NEHA JOSHI",
  },

  // ✅ Just Vested (5 years)
  {
    EmpCode: "ACT0003",
    DOB: "22-Nov-1989",
    DOJ: "01-Jan-2020",
    salaryAct: 22000,
    office: "Bangalore",
    name: "SURESH KUMAR",
  },

  // ✅ Vested (7 years)pol
  {
    EmpCode: "ACT0004",
    DOB: "05-Jul-1986",
    DOJ: "10-Jun-2018",
    salaryAct: 28000,
    office: "Hyderabad",
    name: "ANITA REDDY",
  },

  // ✅ Senior Employee (12+ years)
  {
    EmpCode: "ACT0005",
    DOB: "18-Mar-1980",
    DOJ: "01-Apr-2012",
    salaryAct: 42000,
    office: "Chennai",
    name: "KARTHIK S",
  },

  // ❌ Very Recent Joiner
  {
    EmpCode: "ACT0006",
    DOB: "30-Sep-1998",
    DOJ: "01-Oct-2024",
    salaryAct: 16000,
    office: "Delhi",
    name: "ROHIT MEENA",
  },
]

  const rows = employees.map((emp, index) => {
    const years = calculateYearsOfService(emp.DOJ)
    const vested = isVested(years)

    const gratuity = vested
      ? calculateGratuity(emp.salaryAct, years)
      : 0

    return {
      "Sr. No": index + 1,
      "Employee Code": emp.EmpCode,
      "Name": emp.name ?? "",
      "Office": emp.office ?? "",
      "Date of Birth (dd mmm yy)": emp.DOB,
      "Date of Joining (dd mmm yy)": emp.DOJ,
      "Monthly Salary for Gratuity-Act (in Rs)": emp.salaryAct,
      "Monthly Salary for Gratuity-Scheme (in Rs)": emp.salaryScheme ?? "",
      "Years of Service": years,
      "Vesting Status": vested ? "Vested" : "Non-Vested",
      "Gratuity Amount": gratuity,
      "Additional Column 3": emp.col3 ?? "",
    }
  })

  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(workbook, worksheet, "Gratuity Valuation")

  XLSX.writeFile(workbook, "Gratuity_Valuation_Report.xlsx")
  toast.success("Gratuity valuation report downloaded")
}
