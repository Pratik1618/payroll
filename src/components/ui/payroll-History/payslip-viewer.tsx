"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Download, Mail, Building, Calendar, User, Wallet, MessageCircle } from "lucide-react"
import { format } from "date-fns"
// @ts-ignore
import { toWords } from "number-to-words"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { PayslipDocument } from "./PayslipDocument"

interface PayslipViewerProps {
  employeeId: string
  record: any
  month: string
  onClose: () => void
}

export function PayslipViewer({ employeeId, month, onClose, record }: PayslipViewerProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Salary values from localStorage record
  const {
    earnedBasic = 0,
    da = 0,
    hra = 0,
    cca = 0,
    overtimePay = 0,
    grossSalary = 0,
    totalDeductions = 0,
    lopDeduction = 0,
    netSalary = 0,
    inHandSalary = 0,
    advanceRemaining = 0,
    incentive = 0, // if present
    pf = 0,
    lwf = 0,
    esic = 0,
    tds = 0,
    pt = 0,
    otHours = 0,
    wf=0 
  } = record

  const attendance = {
    workingDays: record.totalDays || 0,
    present: record.daysPresent || 0,
    leaves: record.leaves || 0,
    lop: record.lop || 0,
    wo: record.wo || 0,
    // ensure we read both possible keys saved earlier and expose otHours
    otHours: record.otHours ?? record.ot ?? 0,
    clientOvertime: record.clientOvertime,
    ismartOvertime: record.ismartOvertime,
  }

  const employee = {
    name: record.name,
    designation: record.designation,
    department: record.department,
    site: record.site,
    pan: record.pan,
    uan: record.uan,
    esic: record.esic,
    joiningDate: record.joiningDate
  }

  const period = month

  const handleDownload = () => console.log("Downloading payslip PDF")
  const handleEmail = () => console.log("Emailing payslip")
  const handleWhatsApp = () => {
    const message = `Hello ${employee.name}, Please find attached your payslip for ${period}`
    const phoneNumber = "9326558563" // Replace with actual phone number or use from record
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto bg-card border-border">
        
        {/* Logo, title/date and actions in a single header row */}
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-border p-3">
          <div className="text-left flex-1">
            <CardTitle className="text-foreground text-lg">
              Payslip - {record?.date ? format(new Date(record.date), "MMMM yyyy") : period}
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              {record?.date ? format(new Date(record.date), "dd MMMM, yyyy") : period}
            </div>
          </div>

          <div className="flex-shrink-0">
            <img src="/company-logo.png" alt="Company Logo" className="h-16 w-auto" />
          </div>

          <div className="flex items-center space-x-2 flex-1 justify-end">
            <Button variant="outline" size="sm">
              <PDFDownloadLink
                document={<PayslipDocument employeeId={employeeId} month={month} record={record} />}
                fileName={`Payslip-${record?.name ?? employeeId}-${month}.pdf`}
              >
                <div className="flex items-center"><Download className="mr-2 h-4 w-4" /></div>
              </PDFDownloadLink>
            </Button>
            <Button variant="outline" size="sm" onClick={handleEmail}>
              <Mail className="mr-2 h-4 w-4" /> 
            </Button>
            <Button variant="outline" size="sm" onClick={handleWhatsApp}>
              <MessageCircle className="mr-2 h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Employee Details */}
          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <Card className="bg-accent/50 border-border">
              <CardHeader>
                <CardTitle className="text-sm text-foreground flex items-center">
                  <User className="mr-2 h-4 w-4" /> Employee Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium text-foreground">{employee.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Employee Code:</span>
                  <span className="text-foreground">{employeeId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Designation:</span>
                  <span className="text-foreground">{employee.designation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Department:</span>
                  <span className="text-foreground">{employee.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Site:</span>
                  <span className="text-foreground">{employee.site}</span>
                </div>
              </CardContent>
            </Card>

            {/* Statutory Info */}
            <Card className="bg-accent/50 border-border">
              <CardHeader>
                <CardTitle className="text-sm text-foreground flex items-center">
                  <Building className="mr-2 h-4 w-4" /> Statutory Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PAN no:</span>
                  <span className="text-foreground">{employee.pan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">UAN no:</span>
                  <span className="text-foreground">{employee.uan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ESIC no:</span>
                  <span className="text-foreground">{employee.esic}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Joining Date:</span>
                  <span className="text-foreground">
                    {employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString("en-IN") : ""}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pay Period:</span>
                  <span className="text-foreground">{period}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attendance & Leave Balance */}
          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <Card className="bg-accent/50 border-border">
              <CardHeader>
                <CardTitle className="text-sm text-foreground flex items-center">
                  <Calendar className="mr-2 h-4 w-4" /> Attendance Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 grid-cols-4 text-sm">
                  <div className="text-center">
                    <div className="text-muted-foreground">Total Days</div>
                    <div className="text-lg font-bold text-foreground">{attendance.workingDays}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-muted-foreground">Present</div>
                    <div className="text-lg font-bold text-green-600">{attendance.present}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-muted-foreground">Leave</div>
                    <div className="text-lg font-bold text-blue-600">{attendance.leaves}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-muted-foreground">LOP</div>
                    <div className="text-lg font-bold text-red-600">{attendance.lop}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-muted-foreground">Weekly Off</div>
                    <div className="text-lg font-bold text-gray-600">4</div>
                  </div>
                  <div className="text-center">
                    <div className="text-muted-foreground">Ismart OT</div>
                    <div className="text-lg font-bold text-purple-600">{attendance.ismartOvertime}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-muted-foreground">Client OT</div>
                    <div className="text-lg font-bold text-purple-600">{attendance.clientOvertime}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-accent/50 border-border">
              <CardHeader>
                <CardTitle className="text-sm text-foreground flex items-center">
                  <Calendar className="mr-2 h-4 w-4" /> Leave Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Opening Balance</span>
                    <span className="text-lg font-bold text-foreground">{record.openingLeave || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Earned This Month</span>
                    <span className="text-lg font-bold text-green-600">+{record.earnedLeave || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Leaves Taken</span>
                    <span className="text-lg font-bold text-red-600">-{attendance.leaves}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-border pt-3">
                    <span className="font-semibold text-foreground">Closing Balance</span>
                    <span className="text-xl font-bold text-blue-600">{record.closingLeave || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Loan Details */}
          {/* {(record.loanAmount > 0 || record.loanEMI > 0) && ( */}
            <Card className="mb-6 bg-orange-50 border-orange-200">
              <CardHeader>
                <CardTitle className="text-sm text-orange-800 flex items-center">
                  <Wallet className="mr-2 h-4 w-4" /> Loan Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-5 text-sm">
                  <div className="text-center">
                    <div className="text-muted-foreground">Loan Amount</div>
                    <div className="text-lg font-bold text-orange-800">{formatCurrency(record.loanAmount || 0)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-muted-foreground">EMI Amount</div>
                    <div className="text-lg font-bold text-red-600">{formatCurrency(record.loanEMI || 0)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-muted-foreground">EMI Paid</div>
                    <div className="text-lg font-bold text-green-600">{record.emiPaid || 0}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-muted-foreground">EMI Remaining</div>
                    <div className="text-lg font-bold text-blue-600">{record.emiRemaining || 0}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-muted-foreground">Balance Amount</div>
                    <div className="text-lg font-bold text-orange-600">{formatCurrency(record.loanBalance || 0)}</div>
                  </div>
                </div>
                {record.loanStartDate && (
                  <div className="mt-3 text-xs text-center text-muted-foreground">
                    Loan started: {new Date(record.loanStartDate).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                  </div>
                )}
              </CardContent>
            </Card>
          {/* )} */}

          {/* Salary */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Earnings */}
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-sm text-green-800">Earnings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Basic</span><span>{formatCurrency(earnedBasic)}</span></div>
                <div className="flex justify-between"><span>DA</span><span>{formatCurrency(da)}</span></div>
                <div className="flex justify-between"><span>HRA</span><span>{formatCurrency(hra)}</span></div>
                <div className="flex justify-between"><span>CCA</span><span>{formatCurrency(cca)}</span></div>
                <div className="flex justify-between"><span>Overtime</span><span>{formatCurrency(overtimePay)}</span></div>
                <div className="flex justify-between border-t border-green-300 pt-2 font-bold">
                  <span>Gross Salary</span>
                  <span>{formatCurrency(grossSalary)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Deductions */}
            <Card className="bg-red-50 border-red-200">
              <CardHeader>
                <CardTitle className="text-sm text-red-800">Deductions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span>PF</span><span>{formatCurrency(pf)}</span></div>
                <div className="flex justify-between"><span>ESI</span><span>{formatCurrency(esic)}</span></div>
                <div className="flex justify-between"><span>TDS</span><span>{formatCurrency(tds)}</span></div>
                <div className="flex justify-between"><span>PT</span><span>{formatCurrency(pt)}</span></div>
                <div className="flex justify-between"><span>LWF</span><span>{formatCurrency(lwf)}</span></div>
                {/* <div className="flex justify-between"><span>LOP DEDUCTION</span><span>{formatCurrency(lopDeduction)}</span></div> */}
                <div className="flex justify-between"><span>Bonvolent fund</span><span>{formatCurrency(wf)}</span></div>

                <div className="flex justify-between border-t border-red-300 pt-2 font-bold">
                  <span>Total Deductions</span>
                  <span>{formatCurrency(totalDeductions)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Net Pay */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-sm text-blue-800">Net Pay</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Gross Salary</span><span>{formatCurrency(grossSalary)}</span></div>
                <div className="flex justify-between"><span>Total Deductions</span><span>-{formatCurrency(totalDeductions)}</span></div>
                <div className="border-t border-blue-300 pt-2 font-bold flex justify-between">
                  <span>Net Pay</span>
                  <span>{formatCurrency(netSalary)}</span>
                </div>
                <div className="text-center mt-2">
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800 block max-w-full whitespace-normal break-words px-2 py-1"
                  >
                    Amount in Words: {toWords(netSalary)} rupees only
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6 bg-accent/50 border-border">
            <CardHeader>
              <CardTitle className="text-sm text-foreground flex items-center">
                <Wallet className="mr-2 h-4 w-4" /> In-hand Salary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Advance Remaining</span>
                  <span className="font-medium text-foreground">{formatCurrency(advanceRemaining ?? 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Net Salary</span>
                  <span className="font-medium text-foreground">{formatCurrency(netSalary ?? 0)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 font-bold">
                  <span>In-hand Salary</span>
                  <span className="text-blue-800">{formatCurrency(inHandSalary)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-border text-center text-xs text-muted-foreground">
            <p>This is a computer-generated payslip and does not require a signature.</p>
            <p>For any queries, please contact HR Department.</p>
            <p>toll free no : 9326558563 | email: hr@ismartfacitech.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}