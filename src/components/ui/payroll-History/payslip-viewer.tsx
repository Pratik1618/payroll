// "use client"

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { X, Download, Mail, Building, Calendar, User } from "lucide-react"
// import { format } from "date-fns";
// // @ts-ignore
// import { toWords} from 'number-to-words'

// interface PayslipViewerProps {
//   employeeId: number;
//   record: any;
//   month: string;
//   onClose: () => void;
// }

// export function PayslipViewer({ employeeId, month, onClose, record }: PayslipViewerProps) {
//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat("en-IN", {
//       style: "currency",
//       currency: "INR",
//       maximumFractionDigits: 0,
//     }).format(amount);
//   };

//   const handleDownload = () => {
//     console.log("Downloading payslip PDF");
//   };

//   const handleEmail = () => {
//     console.log("Emailing payslip");
//   };

//   // Defensive checks in case some data is missing:
//   const employee = record?.employee || {};
//   const attendance = record?.attendance || {};
//   const salary = record?.salary || {};
//   const period = record?.period || month;
//   const { basic, da, hra, conveyance, medical, others ,deductions} = record.salary;
//   const  gross = basic + da + hra + conveyance + medical + others 
//   const netPay = gross-deductions


//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
//       <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto bg-card border-border">
//         <CardHeader className="flex flex-row items-center justify-between border-b border-border">
//           <CardTitle className="text-foreground">
//             Payslip - {record?.date ? format(new Date(record.date), "MMMM yyyy") : period}
//           </CardTitle>
//           <div className="flex space-x-2">
//             <Button variant="outline" onClick={handleDownload}>
//               <Download className="mr-2 h-4 w-4" />
//               Download PDF
//             </Button>
//             <Button variant="outline" onClick={handleEmail}>
//               <Mail className="mr-2 h-4 w-4" />
//               Email
//             </Button>
//             <Button variant="ghost" size="icon" onClick={onClose}>
//               <X className="h-4 w-4" />
//             </Button>
//           </div>
//         </CardHeader>
//         <CardContent className="p-6">
//           {/* Company Header */}
//           {/* <div className="text-center mb-6 pb-4 border-b border-border">
//             <h2 className="text-2xl font-bold text-foreground">FacilityTech Solutions Pvt. Ltd.</h2>
//             <p className="text-muted-foreground">Corporate Office: 123 Business Park, Mumbai - 400001</p>
//             <p className="text-muted-foreground">Email: hr@facilitytech.com | Phone: +91-22-12345678</p>
//           </div> */}

//           {/* Employee Information */}
//           <div className="grid gap-6 md:grid-cols-2 mb-6">
//             <Card className="bg-accent/50 border-border">
//               <CardHeader>
//                 <CardTitle className="text-sm text-foreground flex items-center">
//                   <User className="mr-2 h-4 w-4" />
//                   Employee Details
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-2 text-sm">
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Name:</span>
//                   <span className="font-medium text-foreground">{employee.name}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Employee Code:</span>
//                   <span className="text-foreground">{record.employeeId || employee.employeeId || employeeId}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Designation:</span>
//                   <span className="text-foreground">{employee.designation}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Department:</span>
//                   <span className="text-foreground">{employee.department}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Site:</span>
//                   <span className="text-foreground">{employee.site}</span>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card className="bg-accent/50 border-border">
//               <CardHeader>
//                 <CardTitle className="text-sm text-foreground flex items-center">
//                   <Building className="mr-2 h-4 w-4" />
//                   Statutory Information
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-2 text-sm">
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">PAN:</span>
//                   <span className="text-foreground">{employee.pan}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">UAN:</span>
//                   <span className="text-foreground">{employee.uan}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">ESIC:</span>
//                   <span className="text-foreground">{employee.esic}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Joining Date:</span>
//                   <span className="text-foreground">
//                     {employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString("en-IN") : ""}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Pay Period:</span>
//                   <span className="text-foreground">{period}</span>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Attendance Summary */}
//           <Card className="mb-6 bg-accent/50 border-border">
//             <CardHeader>
//               <CardTitle className="text-sm text-foreground flex items-center">
//                 <Calendar className="mr-2 h-4 w-4" />
//                 Attendance Summary
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="grid gap-4 md:grid-cols-6 text-sm">
//                 <div className="text-center">
//                   <div className="text-muted-foreground">Working Days</div>
//                   <div className="text-lg font-bold text-foreground">{attendance.workingDays}</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-muted-foreground">Present</div>
//                   <div className="text-lg font-bold text-green-600">{attendance.present}</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-muted-foreground">Leave</div>
//                   <div className="text-lg font-bold text-blue-600">{attendance.leaves}</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-muted-foreground">Lop</div>
//                   <div className="text-lg font-bold text-red-600">{attendance.lop}</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-muted-foreground">Weekly Off</div>
//                   <div className="text-lg font-bold text-gray-600">{attendance.wo}</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-muted-foreground">OT Hours</div>
//                   <div className="text-lg font-bold text-purple-600">{attendance.ot}</div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Salary Breakdown */}
//           <div className="grid gap-6 md:grid-cols-3">
//             {/* Earnings */}
//             <Card className="bg-green-50 border-green-200">
//               <CardHeader>
//                 <CardTitle className="text-sm text-green-800">Earnings</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-2 text-sm">
//                 <div className="flex justify-between">
//                   <span className="text-green-700">Basic Salary</span>
//                   <span className="font-medium text-green-800">{formatCurrency(salary.basic)}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-green-700">HRA</span>
//                   <span className="font-medium text-green-800">{formatCurrency(salary.hra)}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-green-700">Dearness Allowance</span>
//                   <span className="font-medium text-green-800">{formatCurrency(salary.da)}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-green-700">Conveyance</span>
//                   <span className="font-medium text-green-800">{formatCurrency(salary.conveyance)}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-green-700">Medical Allowance</span>
//                   <span className="font-medium text-green-800">{formatCurrency(salary.medical)}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-green-700">Overtime ({salary.otHours}h)</span>
//                   <span className="font-medium text-green-800">{formatCurrency(salary.otAmount)}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-green-700">Incentive</span>
//                   <span className="font-medium text-green-800">{formatCurrency(salary.incentive)}</span>
//                 </div>
//                 <div className="flex justify-between border-t border-green-300 pt-2 font-bold">
//                   <span className="text-green-800">Gross Earnings</span>
//                   <span className="text-green-800">{formatCurrency(gross)}</span>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Deductions */}
//             <Card className="bg-red-50 border-red-200">
//               <CardHeader>
//                 <CardTitle className="text-sm text-red-800">Deductions</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-2 text-sm">
//                 <div className="flex justify-between">
//                   <span className="text-red-700">Provident Fund</span>
//                   <span className="font-medium text-red-800">{formatCurrency(salary.pf)}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-red-700">ESI</span>
//                   <span className="font-medium text-red-800">{formatCurrency(salary.esi)}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-red-700">TDS</span>
//                   <span className="font-medium text-red-800">{formatCurrency(salary.tds)}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-red-700">Professional Tax</span>
//                   <span className="font-medium text-red-800">{formatCurrency(salary.pt)}</span>
//                 </div>
//                 <div className="flex justify-between border-t border-red-300 pt-2 font-bold">
//                   <span className="text-red-800">Total Deductions</span>
//                   <span className="text-red-800">{formatCurrency(salary.totalDeductions)}</span>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Net Pay */}
//             <Card className="bg-blue-50 border-blue-200">
//               <CardHeader>
//                 <CardTitle className="text-sm text-blue-800">Net Pay Summary</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4 text-sm">
//                 <div className="flex justify-between">
//                   <span className="text-blue-700">Gross Earnings</span>
//                   <span className="font-medium text-blue-800">{formatCurrency(gross)}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-blue-700">Total Deductions</span>
//                   <span className="font-medium text-blue-800">-{formatCurrency(salary.deductions)}</span>
//                 </div>
//                 <div className="border-t border-blue-300 pt-4">
//                   <div className="flex justify-between items-center">
//                     <span className="text-lg font-bold text-blue-800">Net Pay</span>
//                     <span className="text-2xl font-bold text-blue-900">{formatCurrency(netPay)}</span>
//                   </div>
//                   <div className="text-center mt-2">
//                     <Badge
//           variant="secondary"
//           className="bg-blue-100 text-blue-800 block max-w-full whitespace-normal break-words px-2 py-1"
//         >
//           Amount in Words: {toWords(netPay)} rupees only
//         </Badge>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Footer */}
//           <div className="mt-8 pt-4 border-t border-border text-center text-xs text-muted-foreground">
//             <p>This is a computer-generated payslip and does not require a signature.</p>
//             <p>For any queries, please contact HR Department at hr@facilitytech.com</p>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Download, Mail, Building, Calendar, User } from "lucide-react"
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
    incentive = 0, // if present
    pf = 0,
    lwf = 0,
    esic = 0,
    tds = 0,
    pt = 0,
    otHours = 0
  } = record

  const attendance = {
    workingDays: record.totalDays || 0,
    present: record.daysPresent || 0,
    leaves: record.leaves || 0,
    lop: record.lop || 0,
    wo: record.wo || 0,
    // ensure we read both possible keys saved earlier and expose otHours
    otHours: record.otHours ?? record.ot ?? 0,
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border">
          <CardTitle className="text-foreground">
            Payslip - {record?.date ? format(new Date(record.date), "MMMM yyyy") : period}
          </CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" >
             
              <PDFDownloadLink
                document={<PayslipDocument employeeId={employeeId} month={month} record={record} />}
                fileName={`Payslip-${record.name}-${month}.pdf`}
              >
                  <Download className="mr-2 h-4 w-6" /> 

              </PDFDownloadLink>
             
            </Button>
            <Button variant="outline" onClick={handleEmail}>
              <Mail className="mr-2 h-4 w-4" /> Email
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
                  <span className="text-muted-foreground">PAN:</span>
                  <span className="text-foreground">{employee.pan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">UAN:</span>
                  <span className="text-foreground">{employee.uan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ESIC:</span>
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

          {/* Attendance */}
          <Card className="mb-6 bg-accent/50 border-border">
            <CardHeader>
              <CardTitle className="text-sm text-foreground flex items-center">
                <Calendar className="mr-2 h-4 w-4" /> Attendance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-6 text-sm">
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
                  <div className="text-muted-foreground">Lop</div>
                  <div className="text-lg font-bold text-red-600">{attendance.lop}</div>
                </div>
                <div className="text-center">
                  <div className="text-muted-foreground">Weekly Off</div>
                  <div className="text-lg font-bold text-gray-600">4</div>
                </div>
                <div className="text-center">
                  <div className="text-muted-foreground">OT Hours</div>
                  <div className="text-lg font-bold text-purple-600">{attendance.otHours}</div>
                </div>
              </div>
            </CardContent>
          </Card>

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

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-border text-center text-xs text-muted-foreground">
            <p>This is a computer-generated payslip and does not require a signature.</p>
            <p>For any queries, please contact HR Department.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

