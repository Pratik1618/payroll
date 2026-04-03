'use client'

import React, { useEffect, useState } from 'react'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { MainLayout } from '@/components/ui/layout/main-layout'
import { Input } from '@/components/ui/input'
import { Eye, Loader2 } from 'lucide-react'
import { PayslipViewer } from '@/components/ui/payroll-History/payslip-viewer'
import { withBasePath } from '@/lib/base-path'

// Dummy data
const clients = [
  { id: 1, name: 'Client A' },
  { id: 2, name: 'Client B' },
]

const sites = [
  { id: 1, clientId: 1, name: 'Site X' },
  { id: 2, clientId: 1, name: 'Site Y' },
  { id: 3, clientId: 2, name: 'Site Z' },
]

const designations = ['HK', 'Supervisor', 'Janitor', 'Chambermaid']

const months = [
  { label: 'September 2025', value: '2025-09' },
  { label: 'October 2025', value: '2025-10' },
  { label: 'November 2025', value: '2025-11' },
]

export default function PayrollHistoryPage() {
  const [payrollHistory, setPayrollHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const [selectedClient, setSelectedClient] = useState<string>('all')
  const [selectedSite, setSelectedSite] = useState<string>('all')
  const [selectedMonth, setSelectedMonth] = useState<string>('2025-10')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null)

  const handleViewPayslip = async (record: any) => {
  try {
    setLoading(true)

    const empId =
      record.EMPID ||
      record.emp_id ||
      record.employeeId ||
      record.EMPCODE // fallback

    const res = await fetch(
      withBasePath(`/api/payslip?emp_id=${empId}&month=${selectedMonth}`)
    )

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch payslip')
    }

    console.log('Payslip Data:', data)

    setSelectedRecord(data.results || data)

  } catch (err: any) {
    alert(err.message)
  } finally {
    setLoading(false)
  }
}

  const filteredSites =
    selectedClient !== 'all'
      ? sites.filter((site) => site.clientId === Number(selectedClient))
      : sites

  // 🔥 Fetch API
const fetchPayroll = async () => {
  try {
    setLoading(true)

    const params = new URLSearchParams()

    // ✅ ALWAYS send month
    params.append('month', selectedMonth)

    // ✅ Send others (even if empty)
  if (selectedClient !== 'all') {
  params.append('client_id', selectedClient)
}

if (selectedSite !== 'all') {
  params.append('site_id', selectedSite)
}

    params.append('emp_id', '') // not used yet

    const url = withBasePath(`/api/payroll-history?${params.toString()}`)

    console.log('Calling API:', url)

    const res = await fetch(url)
    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch payroll')
    }

    console.log('API response:', data)

    setPayrollHistory(data.results || [])

  } catch (err: any) {
    console.error(err)
    alert(err.message)
  } finally {
    setLoading(false)
  }
}

  // 🚀 Fetch on filter change
  useEffect(() => {
    fetchPayroll()
  }, [selectedMonth, selectedClient, selectedSite])

  // 🔍 Search filter
  const filteredHistory = payrollHistory.filter((record) =>
    record.EMPNAME?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // ✅ FIXED designation logic (UI unchanged)
  const designationSummary: Record<string, number> = {}
  designations.forEach((des) => {
    designationSummary[des] = filteredHistory.filter(
      (rec: any) => rec.DESIGNATIONNAME === des
    ).length
  })

  return (
    <MainLayout>
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payroll History</h1>
          <p className="text-muted-foreground text-sm">
            Filter and view processed payroll data by client, site, and month.
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Client */}
              <div>
                <label className="block text-sm font-medium mb-1">Client</label>
                <Select
                  value={selectedClient}
                  onValueChange={(value) => {
                    setSelectedClient(value)
                    setSelectedSite('all')
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Clients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Site */}
              <div>
                <label className="block text-sm font-medium mb-1">Site</label>
                <Select
                  value={selectedSite}
                  onValueChange={setSelectedSite}
                  disabled={selectedClient === 'all'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Sites" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sites</SelectItem>
                    {filteredSites.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Month */}
              <div>
                <label className="block text-sm font-medium mb-1">Month</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* ✅ SAME Designation UI */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Designation Summary</h2>

            {filteredHistory.length === 0 ? (
              <p className="text-muted-foreground">No data to display.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {designations.map((designation) => (
                  <div
                    key={designation}
                    className="bg-gray-100 rounded-md p-4 flex items-center justify-between"
                  >
                    <span className="font-medium">{designation}</span>
                    <span className="text-sm text-muted-foreground">
                      {designationSummary[designation]} employee(s)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">

            <div className="flex justify-end mb-4 p-4">
              <Input
                placeholder="Search employee..."
                className="w-full max-w-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="text-center py-6">
                <Loader2 className="animate-spin mx-auto" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Site</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredHistory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6">
                          No records found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredHistory.map((r, i) => (
                        <TableRow key={i}>
                          <TableCell>{r.EMPNAME}</TableCell>
                          <TableCell>{r.DESIGNATIONNAME || '-'}</TableCell>
                          <TableCell>{r.CLIENTNAME || '-'}</TableCell>
                          <TableCell>{r.SITENAME || '-'}</TableCell>
                          <TableCell className="text-right">
                            ₹{r.netSalary?.toLocaleString() || 0}
                          </TableCell>
                          <TableCell>
                            {r.payableDays ? `${r.payableDays}/30` : '-'}
                          </TableCell>
                          <TableCell className="text-center">
                            <Eye
                              className="cursor-pointer"
                              onClick={() => handleViewPayslip(r)}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {selectedRecord && (
        <PayslipViewer
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </MainLayout>
  )
}
