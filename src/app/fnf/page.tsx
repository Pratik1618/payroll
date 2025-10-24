// Fnfpage.tsx
"use client";

import React, { useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Eye, Users, Clock, CheckCircle, TrendingDown } from "lucide-react";
import { MainLayout } from "@/components/ui/layout/main-layout";
import { FnfProcessingModal } from "@/components/ui/fnf/FnfViewer";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface Employee {
    empId: string;
    name: string;
    designation: string;
    department: string;
    lastWorkingDay: string;
    netSalary: number;
    reasonForLeaving: string;
    status: "pending" | "under-review" | "approved" | "done";
    clientSite: string;
    basicSalary: number;
    allowances: number;
    deductions: number;
    leaveEncashment: number;
    noticePeriodRecovery: number;
    clearanceItems: {
        item: string;
        cleared: boolean;
    }[];
    documents: string[];
    approvals: {
        stage: string;
        approver: string;
        status: "pending" | "approved" | "rejected";
        date?: string;
    }[];
    notes: string[];
    bankAccount?: string; // optional if available in your data model
    ifsc?: string; // optional
}

const dummyFNF: Employee[] = [
    {
        empId: "EMP001",
        name: "John Doe",
        designation: "HK",
        department: "Housekeeping",
        lastWorkingDay: "2025-09-30",
        netSalary: 32381,
        reasonForLeaving: "Resigned",
        status: "done",
        clientSite: "Site A",
        basicSalary: 25000,
        allowances: 8000,
        deductions: 1500,
        leaveEncashment: 1881,
        noticePeriodRecovery: 0,
        clearanceItems: [
            { item: "Laptop/Equipment", cleared: true },
            { item: "ID Card", cleared: true },
            { item: "Access Card", cleared: true },
            { item: "Pending Loans", cleared: true }
        ],
        documents: ["Resignation Letter.pdf", "Clearance Form.pdf"],
        approvals: [
            { stage: "HR", approver: "Sarah HR", status: "approved", date: "2025-09-28" },
            { stage: "Finance", approver: "Mike Finance", status: "approved", date: "2025-09-29" },
            { stage: "Final Settlement", approver: "Admin", status: "approved", date: "2025-09-30" }
        ],
        notes: ["All clearances completed", "Payment processed"]
    },
    {
        empId: "EMP002",
        name: "Jane Smith",
        designation: "Supervisor",
        department: "Management",
        lastWorkingDay: "2025-09-28",
        netSalary: 45000,
        reasonForLeaving: "Terminated",
        status: "under-review",
        clientSite: "Site B",
        basicSalary: 38000,
        allowances: 12000,
        deductions: 2000,
        leaveEncashment: 0,
        noticePeriodRecovery: 3000,
        clearanceItems: [
            { item: "Laptop/Equipment", cleared: true },
            { item: "ID Card", cleared: false },
            { item: "Access Card", cleared: true },
            { item: "Pending Loans", cleared: true }
        ],
        documents: ["Termination Letter.pdf"],
        approvals: [
            { stage: "HR", approver: "Sarah HR", status: "approved", date: "2025-09-26" },
            { stage: "Finance", approver: "Mike Finance", status: "pending" },
            { stage: "Final Settlement", approver: "Admin", status: "pending" }
        ],
        notes: ["ID card not returned yet"]
    },
    {
        empId: "EMP003",
        name: "Mike Johnson",
        designation: "Janitor",
        department: "Housekeeping",
        lastWorkingDay: "2025-09-25",
        netSalary: 28000,
        reasonForLeaving: "Resigned",
        status: "approved",
        clientSite: "Site A",
        basicSalary: 22000,
        allowances: 6500,
        deductions: 1200,
        leaveEncashment: 1700,
        noticePeriodRecovery: 0,
        clearanceItems: [
            { item: "Laptop/Equipment", cleared: true },
            { item: "ID Card", cleared: true },
            { item: "Access Card", cleared: true },
            { item: "Pending Loans", cleared: true }
        ],
        documents: ["Resignation Letter.pdf", "Clearance Form.pdf"],
        approvals: [
            { stage: "HR", approver: "Sarah HR", status: "approved", date: "2025-09-23" },
            { stage: "Finance", approver: "Mike Finance", status: "approved", date: "2025-09-24" },
            { stage: "Final Settlement", approver: "Admin", status: "pending" }
        ],
        notes: []
    },
    {
        empId: "EMP004",
        name: "Sarah Williams",
        designation: "Cleaner",
        department: "Housekeeping",
        lastWorkingDay: "2025-09-20",
        netSalary: 26500,
        reasonForLeaving: "Personal Reasons",
        status: "pending",
        clientSite: "Site C",
        basicSalary: 21000,
        allowances: 6000,
        deductions: 1000,
        leaveEncashment: 1500,
        noticePeriodRecovery: 1000,
        clearanceItems: [
            { item: "Laptop/Equipment", cleared: false },
            { item: "ID Card", cleared: false },
            { item: "Access Card", cleared: false },
            { item: "Pending Loans", cleared: true }
        ],
        documents: ["Resignation Letter.pdf"],
        approvals: [
            { stage: "HR", approver: "Sarah HR", status: "pending" },
            { stage: "Finance", approver: "Mike Finance", status: "pending" },
            { stage: "Final Settlement", approver: "Admin", status: "pending" }
        ],
        notes: ["Need to collect equipment"]
    },
    {
        empId: "EMP005",
        name: "David Brown",
        designation: "Manager",
        department: "Management",
        lastWorkingDay: "2025-09-15",
        netSalary: 55000,
        reasonForLeaving: "Better Opportunity",
        status: "done",
        clientSite: "Site B",
        basicSalary: 45000,
        allowances: 15000,
        deductions: 2500,
        leaveEncashment: 2500,
        noticePeriodRecovery: 0,
        clearanceItems: [
            { item: "Laptop/Equipment", cleared: true },
            { item: "ID Card", cleared: true },
            { item: "Access Card", cleared: true },
            { item: "Pending Loans", cleared: true }
        ],
        documents: ["Resignation Letter.pdf", "Clearance Form.pdf", "Experience Letter.pdf"],
        approvals: [
            { stage: "HR", approver: "Sarah HR", status: "approved", date: "2025-09-12" },
            { stage: "Finance", approver: "Mike Finance", status: "approved", date: "2025-09-13" },
            { stage: "Final Settlement", approver: "Admin", status: "approved", date: "2025-09-14" }
        ],
        notes: ["All documents provided", "Payment done on time"]
    },
];

export default function Fnfpage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSite, setSelectedSite] = useState("all");
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [employees, setEmployees] = useState(dummyFNF);

    // Calculate stats
    const lastMonthEmployees = employees.filter(emp => {
        const lastWorkingDate = new Date(emp.lastWorkingDay);
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        return lastWorkingDate >= lastMonth;
    });

    const pendingCount = employees.filter(emp => emp.status === "pending" || emp.status === "under-review").length;
    const doneCount = employees.filter(emp => emp.status === "done").length;
    const totalLeft = employees.length;

    const clientSites = ["all", ...Array.from(new Set(employees.map(emp => emp.clientSite)))];

    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.empId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSite = selectedSite === "all" || emp.clientSite === selectedSite;
        return matchesSearch && matchesSite;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "done": return "bg-green-50 text-green-700 border-green-200";
            case "approved": return "bg-blue-50 text-blue-700 border-blue-200";
            case "under-review": return "bg-yellow-50 text-yellow-700 border-yellow-200";
            default: return "bg-gray-50 text-gray-700 border-gray-200";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "done": return "Done";
            case "approved": return "Approved";
            case "under-review": return "Under Review";
            default: return "Pending";
        }
    };

    const handleUpdateStatus = (empId: string, newStatus: Employee["status"]) => {
        setEmployees(employees.map(emp =>
            emp.empId === empId ? { ...emp, status: newStatus } : emp
        ));
        if (selectedEmployee?.empId === empId) {
            setSelectedEmployee({ ...selectedEmployee, status: newStatus });
        }
    };

    const handleToggleClearance = (empId: string, itemIndex: number) => {
        setEmployees(employees.map(emp => {
            if (emp.empId === empId) {
                const newClearanceItems = [...emp.clearanceItems];
                newClearanceItems[itemIndex].cleared = !newClearanceItems[itemIndex].cleared;
                return { ...emp, clearanceItems: newClearanceItems };
            }
            return emp;
        }));
        if (selectedEmployee?.empId === empId) {
            const newClearanceItems = [...selectedEmployee.clearanceItems];
            newClearanceItems[itemIndex].cleared = !newClearanceItems[itemIndex].cleared;
            setSelectedEmployee({ ...selectedEmployee, clearanceItems: newClearanceItems });
        }
    };

    const handleAddNote = (empId: string, note: string) => {
        setEmployees(employees.map(emp =>
            emp.empId === empId ? { ...emp, notes: [...emp.notes, note] } : emp
        ));
        if (selectedEmployee?.empId === empId) {
            setSelectedEmployee({ ...selectedEmployee, notes: [...selectedEmployee.notes, note] });
        }
    };

    const handleApproveStage = (empId: string, stage: string) => {
        setEmployees(employees.map(emp => {
            if (emp.empId === empId) {
                const newApprovals = emp.approvals.map(approval =>
                    approval.stage === stage && approval.status === "pending"
                        ? { ...approval, status: "approved" as const, date: new Date().toISOString().split('T')[0] }
                        : approval
                );
                return { ...emp, approvals: newApprovals };
            }
            return emp;
        }));
        if (selectedEmployee?.empId === empId) {
            const newApprovals = selectedEmployee.approvals.map(approval =>
                approval.stage === stage && approval.status === "pending"
                    ? { ...approval, status: "approved" as const, date: new Date().toISOString().split('T')[0] }
                    : approval
            );
            setSelectedEmployee({ ...selectedEmployee, approvals: newApprovals });
        }
    };

    // Generate Payments Button
    const [debitAccount, setDebitAccount] = useState("12345678901234");
    const [ifscDefault, setIfscDefault] = useState("HDFC0001234");
    const [filenamePrefix, setFilenamePrefix] = useState("fnf_payments");

    const handleGeneratePayments = () => {
        const approved = employees.filter(e => e.status === "approved");

        if (approved.length === 0) {
            alert("No employees with status 'approved'.");
            return;
        }

        const header = "TYPE,DEBIT BANK A/C NO,DEBIT AMT,CUR,BENEFICIARY A/C NO,IFSC CODE,NARRATION/NAME (NOT MORE THAN 20)";
        const rows = approved.map(emp => {
            const beneficiaryAcct = emp.bankAccount && emp.bankAccount.trim().length >= 6
                ? emp.bankAccount.replace(/\D/g, "").slice(-12).padStart(12, "0")
                : randomAccountNumber(12);

            const ifsc = emp.ifsc?.trim() || ifscDefault;
            const amount = Math.round(emp.netSalary || 0);
            const narration = (emp.name || emp.empId || "").substring(0, 20).replace(/,/g, ""); // remove commas

            return [
                "NEFT",
                debitAccount,
                amount.toString(),
                "INR",
                beneficiaryAcct,
                ifsc,
                narration,
            ].join(",");
        });

        const csvContent = [header, ...rows].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute(
            "download",
            `${filenamePrefix}_${new Date().toISOString().split("T")[0]}.csv`
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">F&F Employees</h1>
                        <p className="text-muted-foreground ">List of employees who have left the company.</p>
                    </div>

                </div>

                {/* Dashboard Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Left</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalLeft}</div>
                            <p className="text-xs text-muted-foreground">All time departures</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Left Last Month</CardTitle>
                            <TrendingDown className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{lastMonthEmployees.length}</div>
                            <p className="text-xs text-muted-foreground">Past 30 days</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending F&F</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{pendingCount}</div>
                            <p className="text-xs text-muted-foreground">Awaiting completion</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{doneCount}</div>
                            <p className="text-xs text-muted-foreground">Settlement done</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Employee Table */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row gap-4 mb-4">
                            <Input
                                type="text"
                                placeholder="Search employee..."
                                className="w-full sm:max-w-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <select
                                className="flex h-10 w-full sm:w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={selectedSite}
                                onChange={(e) => setSelectedSite(e.target.value)}
                            >
                                {clientSites.map(site => (
                                    <option key={site} value={site}>
                                        {site === "all" ? "All Client Sites" : site}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Designation</TableHead>
                                        <TableHead>Department</TableHead>
                                        <TableHead>Client Site</TableHead>
                                        <TableHead>Last Working Day</TableHead>
                                        <TableHead className="text-right">Net Salary</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredEmployees.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                                                No records found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredEmployees.map(emp => (
                                            <TableRow key={emp.empId}>
                                                <TableCell>
                                                    <div className="font-medium">{emp.name}</div>
                                                    <div className="text-xs text-muted-foreground">{emp.empId}</div>
                                                </TableCell>
                                                <TableCell>{emp.designation}</TableCell>
                                                <TableCell>{emp.department}</TableCell>
                                                <TableCell>{emp.clientSite}</TableCell>
                                                <TableCell>{emp.lastWorkingDay}</TableCell>
                                                <TableCell className="text-right">₹{emp.netSalary.toLocaleString()}</TableCell>
                                                <TableCell>{emp.reasonForLeaving}</TableCell>
                                                <TableCell>
                                                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium border ${getStatusColor(emp.status)}`}>
                                                        {getStatusLabel(emp.status)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Eye
                                                        className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer inline-block"
                                                        onClick={() => setSelectedEmployee(emp)}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Generate Payments Button */}
                <div className="flex justify-end">
                    <Button onClick={handleGeneratePayments} variant="default">
                        <Download className="mr-2 h-4 w-4" />
                        Generate Payments (Approved)
                    </Button>
                </div>
            </div>

            {/* F&F Processing Modal */}
            <FnfProcessingModal
                employee={selectedEmployee}
                onClose={() => setSelectedEmployee(null)}
                onUpdateStatus={handleUpdateStatus}
                onToggleClearance={handleToggleClearance}
                onApproveStage={handleApproveStage}
                onAddNote={handleAddNote}
            />
        </MainLayout>
    );
}

const randomAccountNumber = (length = 12) =>
    Array.from({ length }, () => Math.floor(Math.random() * 10)).join("");