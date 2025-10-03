"use client"

import { useState } from "react"
import { MainLayout } from "@/components/ui/layout/main-layout"  
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Download, Upload, AlertTriangle, CheckCircle, Clock, DollarSign, Users } from "lucide-react"
import { BankFilePreview } from "@/components/ui/payroll/bank-file-preview" 

const mockDisbursementData = [
  {
    id: 1,
    employeeCode: "EMP001",
    name: "John Doe",
    site: "Site A",
    netPay: 45000,
    bankAccount: "****1234",
    status: "pending",
    month: "Dec 2024",
  },
  {
    id: 2,
    employeeCode: "EMP002",
    name: "Jane Smith",
    site: "Site B",
    netPay: 52000,
    bankAccount: "****5678",
    status: "processed",
    month: "Dec 2024",
  },
  {
    id: 3,
    employeeCode: "EMP003",
    name: "Mike Johnson",
    site: "Site A",
    netPay: 38000,
    bankAccount: "****9012",
    status: "failed",
    month: "Dec 2024",
  },
  {
    id: 4,
    employeeCode: "EMP004",
    name: "Sarah Wilson",
    site: "Site C",
    netPay: 47000,
    bankAccount: "****3456",
    status: "pending",
    month: "Dec 2024",
  },
]

const mockFnFData = [
  {
    id: 1,
    employeeCode: "EMP005",
    name: "Robert Brown",
    designation: "Security Guard",
    lastWorkingDay: "2024-12-15",
    totalDues: 125000,
    status: "calculated",
  },
  {
    id: 2,
    employeeCode: "EMP006",
    name: "Lisa Davis",
    designation: "Supervisor",
    lastWorkingDay: "2024-12-20",
    totalDues: 185000,
    status: "approved",
  },
]

export default function DisbursementPage() {
  const [selectedMonth, setSelectedMonth] = useState("Dec 2024")
  const [selectedSite, setSelectedSite] = useState("all")
  const [disbursementData, setDisbursementData] = useState(mockDisbursementData)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [previewData, setPreviewData] = useState<any[]>([])

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      processed: "bg-green-500/20 text-green-400 border-green-500/30",
      failed: "bg-red-500/20 text-red-400 border-red-500/30",
      calculated: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      approved: "bg-green-500/20 text-green-400 border-green-500/30",
    }
    return variants[status as keyof typeof variants] || variants.pending
  }

  const filteredData = disbursementData.filter(
    (item) => (selectedSite === "all" || item.site === selectedSite) && item.month === selectedMonth,
  )
  const totalAmount = filteredData.reduce((sum, item) => sum + item.netPay, 0)
  const pendingCount = filteredData.filter((item) => item.status === "pending").length
  const processedCount = filteredData.filter((item) => item.status === "processed").length
  const failedCount = filteredData.filter((item) => item.status === "failed").length

  const isAllSelected = filteredData.length > 0 && filteredData.every((r) => selectedIds.includes(r.id))
  const toggleSelectAll = () => {
    if (isAllSelected) setSelectedIds([])
    else setSelectedIds(filteredData.map((r) => r.id))
  }
  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const processSelected = () => {
    if (selectedIds.length === 0) return
    setDisbursementData((prev) =>
      prev.map((r) => (selectedIds.includes(r.id) && r.status === "pending" ? { ...r, status: "processed" } : r)),
    )
    setSelectedIds([])
  }

  const retryFailed = () => {
    if (selectedIds.length > 0) {
      setDisbursementData((prev) =>
        prev.map((r) => (selectedIds.includes(r.id) && r.status === "failed" ? { ...r, status: "processed" } : r)),
      )
      setSelectedIds([])
      return
    }
    const failedIds = filteredData.filter((r) => r.status === "failed").map((r) => r.id)
    if (failedIds.length === 0) return
    setDisbursementData((prev) => prev.map((r) => (failedIds.includes(r.id) ? { ...r, status: "processed" } : r)))
  }

  const openBankPreview = () => {
    const source =
      selectedIds.length > 0
        ? filteredData.filter((r) => selectedIds.includes(r.id))
        : filteredData.filter((r) => r.status === "pending")
    if (source.length === 0) return
    const normalized = source.map((r) => ({
      empId: r.employeeCode,
      name: r.name,
      netSalary: r.netPay,
    }))
    setPreviewData(normalized)
    setShowPreview(true)
  }

  const downloadBankCsv = () => {
    const header = "Sr No,Employee ID,Employee Name,Account Number,IFSC Code,Amount,Payment Type,Payment Date"
    const rows = previewData.map((emp: any, index: number) =>
      [
        (index + 1).toString().padStart(3, "0"),
        emp.empId,
        emp.name,
        "12345678901234",
        "HDFC0001234",
        emp.netSalary.toString(),
        "SALARY",
        new Date().toISOString().split("T")[0],
      ].join(","),
    )
    const csv = [header, ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `bank_upload_${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setShowPreview(false)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Bank Disbursement & F&F Settlement</h1>
            <p className="text-slate-400 mt-1">Manage salary disbursements and full & final settlements</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent">
              <Upload className="w-4 h-4 mr-2" />
              Upload Bank File
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={downloadBankCsv}>
              <Download className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>

        <Tabs defaultValue="disbursement" className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="disbursement" className="data-[state=active]:bg-indigo-600">
              Salary Disbursement
            </TabsTrigger>
            <TabsTrigger value="fnf" className="data-[state=active]:bg-indigo-600">
              F&F Settlement
            </TabsTrigger>
          </TabsList>

          <TabsContent value="disbursement" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Total Amount</p>
                      <p className="text-2xl font-bold text-white">₹{totalAmount.toLocaleString()}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-indigo-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Pending</p>
                      <p className="text-2xl font-bold text-yellow-400">{pendingCount}</p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Processed</p>
                      <p className="text-2xl font-bold text-green-400">{processedCount}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Failed</p>
                      <p className="text-2xl font-bold text-red-400">{failedCount}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Actions */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Disbursement Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label className="text-slate-300">Month</Label>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="Dec 2024">December 2024</SelectItem>
                        <SelectItem value="Nov 2024">November 2024</SelectItem>
                        <SelectItem value="Oct 2024">October 2024</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label className="text-slate-300">Site</Label>
                    <Select value={selectedSite} onValueChange={setSelectedSite}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="all">All Sites</SelectItem>
                        <SelectItem value="Site A">Site A</SelectItem>
                        <SelectItem value="Site B">Site B</SelectItem>
                        <SelectItem value="Site C">Site C</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={openBankPreview}>
                    Generate Bank File
                  </Button>
                  <Button
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                    onClick={processSelected}
                    disabled={selectedIds.length === 0}
                  >
                    Process Selected
                  </Button>
                  <Button
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                    onClick={retryFailed}
                  >
                    Retry Failed
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Disbursement Table */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Disbursement Records</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="py-3 px-4">
                          <input
                            aria-label="Select all"
                            type="checkbox"
                            className="h-4 w-4"
                            checked={isAllSelected}
                            onChange={toggleSelectAll}
                          />
                        </th>
                        <th className="text-left py-3 px-4 text-slate-300 font-medium">Employee</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-medium">Site</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-medium">Net Pay</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-medium">Bank Account</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-medium">Status</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((record) => (
                        <tr key={record.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                          <td className="py-3 px-4">
                            <input
                              aria-label={`Select ${record.name}`}
                              type="checkbox"
                              className="h-4 w-4"
                              checked={selectedIds.includes(record.id)}
                              onChange={() => toggleSelect(record.id)}
                            />
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="text-white font-medium">{record.name}</p>
                              <p className="text-slate-400 text-sm">{record.employeeCode}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-300">{record.site}</td>
                          <td className="py-3 px-4 text-white font-medium">₹{record.netPay.toLocaleString()}</td>
                          <td className="py-3 px-4 text-slate-300">{record.bankAccount}</td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusBadge(record.status)}>{record.status}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                              >
                                View
                              </Button>
                              {record.status === "failed" && (
                                <Button
                                  size="sm"
                                  className="bg-indigo-600 hover:bg-indigo-700"
                                  onClick={() =>
                                    setDisbursementData((prev) =>
                                      prev.map((r) => (r.id === record.id ? { ...r, status: "processed" } : r)),
                                    )
                                  }
                                >
                                  Retry
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fnf" className="space-y-6">
            {/* F&F Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Pending F&F</p>
                      <p className="text-2xl font-bold text-white">2</p>
                    </div>
                    <Users className="w-8 h-8 text-orange-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Total F&F Amount</p>
                      <p className="text-2xl font-bold text-white">₹3,10,000</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">This Month</p>
                      <p className="text-2xl font-bold text-white">2</p>
                    </div>
                    <Calendar className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* F&F Management */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Full & Final Settlement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-slate-300 font-medium">Employee</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-medium">Designation</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-medium">Last Working Day</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-medium">Total Dues</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-medium">Status</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockFnFData.map((record) => (
                        <tr key={record.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                          <td className="py-3 px-4">
                            <div>
                              <p className="text-white font-medium">{record.name}</p>
                              <p className="text-slate-400 text-sm">{record.employeeCode}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-300">{record.designation}</td>
                          <td className="py-3 px-4 text-slate-300">{record.lastWorkingDay}</td>
                          <td className="py-3 px-4 text-white font-medium">₹{record.totalDues.toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusBadge(record.status)}>{record.status}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                              >
                                Calculate
                              </Button>
                              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                                Process
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* F&F Calculation Details */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">F&F Calculation Components</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-white">Receivables</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-slate-300">
                        <span>Pending Salary</span>
                        <span>₹45,000</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Leave Encashment</span>
                        <span>₹25,000</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Gratuity</span>
                        <span>₹75,000</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Bonus</span>
                        <span>₹15,000</span>
                      </div>
                      <div className="flex justify-between font-semibold text-green-400 border-t border-slate-600 pt-2">
                        <span>Total Receivables</span>
                        <span>₹1,60,000</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-white">Deductions</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-slate-300">
                        <span>Notice Period Recovery</span>
                        <span>₹30,000</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Advance Recovery</span>
                        <span>₹5,000</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>IT Deduction</span>
                        <span>₹0</span>
                      </div>
                      <div className="flex justify-between font-semibold text-red-400 border-t border-slate-600 pt-2">
                        <span>Total Deductions</span>
                        <span>₹35,000</span>
                      </div>
                      <div className="flex justify-between font-bold text-white border-t border-slate-600 pt-2 text-lg">
                        <span>Net F&F Amount</span>
                        <span>₹1,25,000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {showPreview && (
        <BankFilePreview payrollData={previewData} onClose={() => setShowPreview(false)} onDownload={downloadBankCsv} />
      )}
    </MainLayout>
  )
}
