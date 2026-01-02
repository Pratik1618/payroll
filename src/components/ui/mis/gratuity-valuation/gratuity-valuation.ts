import * as XLSX from "xlsx"
import { toast } from "sonner"

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

function calculateGratuity(salary: number, years: number) {
    return Math.round((salary / 26) * 15 * years)
}

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

export function downloadGratuityValuation() {
  const employees: GratuityEmployee[] = [
  {
    EmpCode: "HYD00177",
    DOB: "25-Apr-87",
    DOJ: "01-Feb-23",
    salaryAct: 10958,
    office: "FO",
    name: "ANJAMMA PALAMURI",
  },
]

        // add more
    
const rows = employees.map((emp, index) => {
  const years = calculateYearsOfService(emp.DOJ)
  const gratuity = calculateGratuity(emp.salaryAct, years)

  return {
    "Sr. No": index + 1,
    "Employee Code": emp.EmpCode,
    "Date of Birth (dd mmm yy)": emp.DOB,
    "Date of Joining (dd mmm yy)": emp.DOJ,
    "Monthly Salary for Gratuity-Act (in Rs)": emp.salaryAct,
    "Monthly Salary for Gratuity-Scheme (in Rs)": emp.salaryScheme ?? "",
    "Office": emp.office ?? "",
    "Name": emp.name ?? "",
    "Additional Column 3": emp.col3 ?? "",
    "Years of Service": years,
    "Gratuity Amount": gratuity,
  }
})


    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Gratuity")

    XLSX.writeFile(workbook, "Gratuity_Valuation_Report.xlsx")
    toast.success("Gratuity valuation report downloaded")
}
