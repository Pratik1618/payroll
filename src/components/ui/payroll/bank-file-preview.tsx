"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Eye, X } from "lucide-react"

interface BankFilePreviewProps {
  payrollData: any[]
  onClose: () => void
  onDownload: () => void
}

export function BankFilePreview({ payrollData, onClose, onDownload }: BankFilePreviewProps) {
  const totalAmount = payrollData.reduce((sum, emp) => sum + emp.netSalary, 0)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Bank Upload File Preview</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Review bank file before download - {payrollData.length} employees, Total: ₹{totalAmount.toLocaleString()}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* File Summary */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <div className="text-sm text-blue-600 dark:text-blue-400">Total Records</div>
              <div className="text-xl font-bold text-blue-700 dark:text-blue-300">{payrollData.length}</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <div className="text-sm text-green-600 dark:text-green-400">Total Amount</div>
              <div className="text-xl font-bold text-green-700 dark:text-green-300">
                ₹{(totalAmount / 100000).toFixed(1)}L
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
              <div className="text-sm text-purple-600 dark:text-purple-400">File Format</div>
              <div className="text-xl font-bold text-purple-700 dark:text-purple-300">CSV</div>
            </div>
          </div>

          {/* File Preview Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted p-2 border-b">
              <h4 className="font-medium">File Contents Preview</h4>
            </div>
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="text-left p-2 border-r">Sr No</th>
                    <th className="text-left p-2 border-r">Employee ID</th>
                    <th className="text-left p-2 border-r">Employee Name</th>
                    <th className="text-left p-2 border-r">Account Number</th>
                    <th className="text-left p-2 border-r">IFSC Code</th>
                    <th className="text-left p-2 border-r">Amount</th>
                    <th className="text-left p-2 border-r">Payment Type</th>
                    <th className="text-left p-2">Payment Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollData.map((emp, index) => (
                    <tr key={index} className="border-b hover:bg-muted/30">
                      <td className="p-2 border-r">{(index + 1).toString().padStart(3, "0")}</td>
                      <td className="p-2 border-r font-mono">{emp.empId}</td>
                      <td className="p-2 border-r">{emp.name}</td>
                      <td className="p-2 border-r font-mono">12345678901234</td>
                      <td className="p-2 border-r font-mono">HDFC0001234</td>
                      <td className="p-2 border-r font-bold">₹{emp.netSalary.toLocaleString()}</td>
                      <td className="p-2 border-r">
                        <Badge variant="secondary">SALARY</Badge>
                      </td>
                      <td className="p-2">{new Date().toISOString().split("T")[0]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              File will be downloaded as: bank_upload_{new Date().toISOString().split("T")[0]}.csv
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={onDownload} className="bg-green-600 hover:bg-green-700">
                <Download className="mr-2 h-4 w-4" />
                Download Bank File
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
