"use client"

import { useState } from "react"
import { MainLayout } from "@/components/ui/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    Area,
    AreaChart,
} from "recharts"
import {
    Download,
    Filter,
    TrendingUp,
    TrendingDown,
    Users,
    DollarSign,
    Calendar,
    FileText,
    BarChart3,
    PieChartIcon,
} from "lucide-react"

/* -------------------- DATA -------------------- */

const monthlyPayrollData = [
    { month: "Jul", amount: 2850000, employees: 145 },
    { month: "Aug", amount: 2920000, employees: 148 },
    { month: "Sep", amount: 3100000, employees: 152 },
    { month: "Oct", amount: 3250000, employees: 158 },
    { month: "Nov", amount: 3180000, employees: 156 },
    { month: "Dec", amount: 3400000, employees: 162 },
]

const siteWiseData = [
    { site: "Site A", employees: 65, payroll: 1450000, color: "#6366f1" },
    { site: "Site B", employees: 48, payroll: 1120000, color: "#8b5cf6" },
    { site: "Site C", employees: 32, payroll: 780000, color: "#06b6d4" },
    { site: "Site D", employees: 17, payroll: 450000, color: "#10b981" },
]

const attendanceData = [
    { month: "Jul", present: 92.5, absent: 7.5 },
    { month: "Aug", present: 94.2, absent: 5.8 },
    { month: "Sep", present: 91.8, absent: 8.2 },
    { month: "Oct", present: 93.6, absent: 6.4 },
    { month: "Nov", present: 89.4, absent: 10.6 },
    { month: "Dec", present: 95.1, absent: 4.9 },
]

const overtimeData = [
    { month: "Jul", regular: 2200, overtime: 320 },
    { month: "Aug", regular: 2280, overtime: 380 },
    { month: "Sep", regular: 2350, overtime: 420 },
    { month: "Oct", regular: 2420, overtime: 450 },
    { month: "Nov", regular: 2380, overtime: 390 },
    { month: "Dec", regular: 2480, overtime: 520 },
]

const leaveTypeData = [
    { name: "Casual Leave", value: 35, color: "#6366f1" },
    { name: "Sick Leave", value: 28, color: "#8b5cf6" },
    { name: "Annual Leave", value: 42, color: "#06b6d4" },
    { name: "Emergency Leave", value: 15, color: "#10b981" },
]

export default function ReportsPage() {
    const [selectedPeriod, setSelectedPeriod] = useState("6months")
    const [selectedSite, setSelectedSite] = useState("all")
    const [selectedReport, setSelectedReport] = useState("payroll")

    const formatAxisAmount = (value: number) => {
        if (value >= 1e7) return `${(value / 1e7).toFixed(1)} Cr`
        if (value >= 1e5) return `${(value / 1e5).toFixed(1)} L`
        return value.toLocaleString("en-IN")
    }

    const formatTooltipAmount = (value: number) =>
        `₹${value.toLocaleString("en-IN")}`

    const totalPayroll = monthlyPayrollData.reduce((sum, item) => sum + item.amount, 0)
    const avgEmployees = Math.round(
        monthlyPayrollData.reduce((sum, item) => sum + item.employees, 0) /
        monthlyPayrollData.length,
    )

    const currentMonth = monthlyPayrollData[monthlyPayrollData.length - 1]
    const previousMonth = monthlyPayrollData[monthlyPayrollData.length - 2]
    const payrollGrowth = (
        ((currentMonth.amount - previousMonth.amount) /
            previousMonth.amount) *
        100
    ).toFixed(1)

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">
                            Analytics
                        </h1>
                        <p className="text-slate-500 mt-1">
                            Comprehensive payroll and workforce analytics
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline">
                            <Filter className="w-4 h-4 mr-2" />
                            Advanced Filters
                        </Button>

                        <Button>
                            <Download className="w-4 h-4 mr-2 text-white" />
                            Export Report
                        </Button>
                    </div>

                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="bg-white border border-slate-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-500 text-sm">
                                        Total Payroll (6M)
                                    </p>
                                    <p className="text-2xl font-bold text-slate-900">
                                        ₹{(totalPayroll / 1000000).toFixed(1)}M
                                    </p>
                                    <div className="flex items-center mt-2">
                                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                                        <span className="text-green-500 text-sm">
                                            +{payrollGrowth}%
                                        </span>
                                    </div>
                                </div>
                                <DollarSign className="w-8 h-8 text-indigo-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border border-slate-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-500 text-sm">Avg Employees</p>
                                    <p className="text-2xl font-bold text-slate-900">
                                        {avgEmployees}
                                    </p>
                                    <div className="flex items-center mt-2">
                                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                                        <span className="text-green-500 text-sm">
                                            +8.2%
                                        </span>
                                    </div>
                                </div>
                                <Users className="w-8 h-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border border-slate-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-500 text-sm">Avg Attendance</p>
                                    <p className="text-2xl font-bold text-slate-900">
                                        92.8%
                                    </p>
                                    <div className="flex items-center mt-2">
                                        <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                                        <span className="text-red-500 text-sm">
                                            -1.2%
                                        </span>
                                    </div>
                                </div>
                                <Calendar className="w-8 h-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border border-slate-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-500 text-sm">Overtime Hours</p>
                                    <p className="text-2xl font-bold text-slate-900">
                                        2,480
                                    </p>
                                    <div className="flex items-center mt-2">
                                        <TrendingUp className="w-4 h-4 text-orange-500 mr-1" />
                                        <span className="text-orange-500 text-sm">
                                            +15.3%
                                        </span>
                                    </div>
                                </div>
                                <BarChart3 className="w-8 h-8 text-orange-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="bg-white border border-slate-200">
                    <CardContent className="p-6">
                        <div className="flex gap-4">
                            {/* filters unchanged except colors */}
                            <div className="flex-1">
                                <Label className="text-slate-900">Time Period</Label>
                                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                                    <SelectTrigger className="bg-white border border-slate-200 text-slate-900">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border border-slate-200">
                                        <SelectItem value="3months">Last 3 Months</SelectItem>
                                        <SelectItem value="6months">Last 6 Months</SelectItem>
                                        <SelectItem value="1year">Last 1 Year</SelectItem>
                                        <SelectItem value="custom">Custom Range</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex-1">
                                <Label className="text-slate-900">Site</Label>
                                <Select value={selectedSite} onValueChange={setSelectedSite}>
                                    <SelectTrigger className="bg-white border border-slate-200 text-slate-900">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border border-slate-200">
                                        <SelectItem value="all">All Sites</SelectItem>
                                        <SelectItem value="Site A">Site A</SelectItem>
                                        <SelectItem value="Site B">Site B</SelectItem>
                                        <SelectItem value="Site C">Site C</SelectItem>
                                        <SelectItem value="Site D">Site D</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex-1">
                                <Label className="text-slate-900">Report Type</Label>
                                <Select value={selectedReport} onValueChange={setSelectedReport}>
                                    <SelectTrigger className="bg-white border border-slate-200 text-slate-900">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border border-slate-200">
                                        <SelectItem value="payroll">Payroll Analysis</SelectItem>
                                        <SelectItem value="attendance">Attendance Report</SelectItem>
                                        <SelectItem value="leave">Leave Analysis</SelectItem>
                                        <SelectItem value="overtime">Overtime Report</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Tabs defaultValue="charts" className="space-y-6">
                    <TabsList className="bg-muted p-1">
                        <TabsTrigger
                            value="charts"
                            className="data-[state=active]:bg-background data-[state=active]:shadow-sm
  "
                        >
                            Charts & Analytics
                        </TabsTrigger>
                        <TabsTrigger
                            value="detailed"
                            className=" data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            Detailed Reports
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="charts" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Monthly Payroll Trend */}
                            <Card className="bg-white border border-slate-200">
                                <CardHeader>
                                    <CardTitle className="text-slate-900 flex items-center">
                                        <BarChart3 className="w-5 h-5 mr-2" />
                                        Monthly Payroll Trend
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart data={monthlyPayrollData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis dataKey="month" stroke="#6b7280" />
                                            <YAxis stroke="#6b7280" tickFormatter={(value) => formatAxisAmount(value)}
                                                width={80} />
                                            <Tooltip
                                                formatter={(value) => [
                                                    formatTooltipAmount(Number(value)),
                                                    "Payroll",
                                                ]}
                                                contentStyle={{
                                                    backgroundColor: "#ffffff",
                                                    border: "1px solid #e5e7eb",
                                                    borderRadius: "8px",
                                                    color: "#111827",
                                                }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="amount"
                                                stroke="#6366f1"
                                                fill="#6366f1"
                                                fillOpacity={0.25}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Site-wise Distribution */}
                            <Card className="bg-white border border-slate-200">
                                <CardHeader>
                                    <CardTitle className="text-slate-900 flex items-center">
                                        <PieChartIcon className="w-5 h-5 mr-2" />
                                        Site-wise Payroll Distribution
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={siteWiseData}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={100}
                                                dataKey="payroll"
                                                label={({ payload }) =>
                                                    payload
                                                        ? `${payload.site}: ${formatAxisAmount(payload.payroll)}`
                                                        : ""
                                                }
                                            >
                                                {siteWiseData.map((entry, index) => (
                                                    <Cell key={index} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value) => [
                                                    formatTooltipAmount(Number(value)),
                                                    "Payroll",
                                                ]}
                                                contentStyle={{
                                                    backgroundColor: "#ffffff",
                                                    border: "1px solid #e5e7eb",
                                                    borderRadius: "8px",
                                                    color: "#111827",
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Attendance Trends */}
                            <Card className="bg-white border border-slate-200">
                                <CardHeader>
                                    <CardTitle className="text-slate-900 flex items-center">
                                        <Calendar className="w-5 h-5 mr-2" />
                                        Attendance Trends
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={attendanceData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis dataKey="month" stroke="#6b7280" />
                                            <YAxis domain={[80, 100]} stroke="#6b7280" />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: "#ffffff",
                                                    border: "1px solid #e5e7eb",
                                                    borderRadius: "8px",
                                                    color: "#111827",
                                                }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="present"
                                                stroke="#10b981"
                                                strokeWidth={3}
                                                dot={{ r: 4 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Overtime Analysis */}
                            <Card className="bg-white border border-slate-200">
                                <CardHeader>
                                    <CardTitle className="text-slate-900 flex items-center">
                                        <BarChart3 className="w-5 h-5 mr-2" />
                                        Regular vs Overtime Hours
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={overtimeData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis dataKey="month" stroke="#6b7280" />
                                            <YAxis stroke="#6b7280" />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: "#ffffff",
                                                    border: "1px solid #e5e7eb",
                                                    borderRadius: "8px",
                                                    color: "#111827",
                                                }}
                                            />
                                            <Bar dataKey="regular" stackId="a" fill="#6366f1" />
                                            <Bar dataKey="overtime" stackId="a" fill="#f59e0b" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Leave Analysis */}
                        <Card className="bg-white border border-slate-200">
                            <CardHeader>
                                <CardTitle className="text-slate-900">
                                    Leave Type Distribution
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie
                                                data={leaveTypeData}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                dataKey="value"
                                            >
                                                {leaveTypeData.map((entry, index) => (
                                                    <Cell key={index} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: "#ffffff",
                                                    border: "1px solid #e5e7eb",
                                                    borderRadius: "8px",
                                                    color: "#111827",
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>

                                    <div className="space-y-4">
                                        {leaveTypeData.map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between"
                                            >
                                                <div className="flex items-center">
                                                    {/* Color indicator */}
                                                    <span
                                                        className="w-3 h-3 rounded-sm mr-3"
                                                        style={{ backgroundColor: item.color }}
                                                    />
                                                    <span className="text-slate-900">
                                                        {item.name}
                                                    </span>
                                                </div>

                                                <span className="text-slate-900 font-semibold">
                                                    {item.value} days
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="detailed" className="space-y-6">
                        <Card className="bg-white border border-slate-200">
                            <CardHeader>
                                <CardTitle className="text-slate-900">
                                    Detailed Payroll Report
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-slate-200">
                                                <th className="text-left p-3 text-slate-900">Month</th>
                                                <th className="text-left p-3 text-slate-900">Employees</th>
                                                <th className="text-left p-3 text-slate-900">Gross</th>
                                                <th className="text-left p-3 text-slate-900">Net</th>
                                                <th className="text-left p-3 text-slate-900">Growth</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {monthlyPayrollData.map((record, index) => {
                                                const growth =
                                                    index > 0
                                                        ? (
                                                            ((record.amount -
                                                                monthlyPayrollData[index - 1].amount) /
                                                                monthlyPayrollData[index - 1].amount) *
                                                            100
                                                        ).toFixed(1)
                                                        : "0.0"

                                                return (
                                                    <tr
                                                        key={record.month}
                                                        className="border-b border-slate-100 hover:bg-slate-100"
                                                    >
                                                        <td className="p-3 text-slate-900">
                                                            {record.month} 2024
                                                        </td>
                                                        <td className="p-3 text-slate-900">
                                                            {record.employees}
                                                        </td>
                                                        <td className="p-3 text-slate-900">
                                                            ₹{(record.amount * 1.2).toLocaleString()}
                                                        </td>
                                                        <td className="p-3 text-green-600 font-semibold">
                                                            ₹{record.amount.toLocaleString()}
                                                        </td>
                                                        <td className="p-3">
                                                            <Badge
                                                                className={
                                                                    Number(growth) >= 0
                                                                        ? "bg-green-100 text-green-700"
                                                                        : "bg-red-100 text-red-700"
                                                                }
                                                            >
                                                                {growth}%
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Export Options */}
                        <Card className="bg-white border border-slate-200">
                            <CardHeader>
                                <CardTitle className="text-slate-900">
                                    Export Options
                                </CardTitle>
                            </CardHeader>

                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                    {/* Primary action */}
                                    <Button className="justify-start">
                                        <FileText className="w-4 h-4 mr-2" />
                                        Export to PDF
                                    </Button>

                                    {/* Secondary actions */}
                                    <Button
                                        variant="outline"
                                        className="justify-start"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Export to Excel
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="justify-start"
                                    >
                                        <BarChart3 className="w-4 h-4 mr-2" />
                                        Schedule Report
                                    </Button>

                                </div>
                            </CardContent>
                        </Card>

                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout>
    )
}
