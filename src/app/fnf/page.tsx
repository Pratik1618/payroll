// Fnfpage.tsx
"use client";

import React, { useEffect, useState } from "react";
import { withBasePath } from "@/lib/base-path";
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
    status: "pending" | "approved" | "done";
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


function mapFnfListItem(item: any): Employee {
    return {
        empId: item.empId,
        name: item.name,
        designation: item.designation || "",
        department: "",
        lastWorkingDay: item.lastWorkingDay,
        netSalary: item.netSalary,
        reasonForLeaving: item.reasonForLeaving || "",
        status: (item.status || "pending").toLowerCase(),
        clientSite: item.clientSite,
        // Not tracked by the backend F&F module - no source to wire these to.
        basicSalary: 0,
        allowances: 0,
        deductions: 0,
        leaveEncashment: 0,
        noticePeriodRecovery: 0,
        clearanceItems: [],
        documents: [],
        approvals: [],
        notes: [],
    };
}

function getCurrentUser(): { userId: string; role: string } {
    if (typeof document === "undefined") return { userId: "unknown", role: "unknown" };
    const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
    if (!match) return { userId: "unknown", role: "unknown" };
    try {
        const payload = JSON.parse(atob(match[1].split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
        return { userId: payload.user_id || payload.sub || "unknown", role: payload.role || "unknown" };
    } catch {
        return { userId: "unknown", role: "unknown" };
    }
}

export default function Fnfpage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSite, setSelectedSite] = useState("all");
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [employees, setEmployees] = useState<Employee[]>([]);

    const loadEmployees = async () => {
        try {
            const res = await fetch(withBasePath("/api/fnf/list"), {
                credentials: "include",
                cache: "no-store",
            });
            const json = await res.json();
            if (!res.ok) {
                throw new Error(json?.message || `Failed to load F&F list (${res.status})`);
            }
            const rows = json?.results ?? [];
            setEmployees((Array.isArray(rows) ? rows : []).map(mapFnfListItem));
        } catch (error: any) {
            console.error(error);
        }
    };

    useEffect(() => {
        loadEmployees();
    }, []);

    // Calculate stats
    const lastMonthEmployees = employees.filter(emp => {
        const lastWorkingDate = new Date(emp.lastWorkingDay);
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        return lastWorkingDate >= lastMonth;
    });

    const pendingCount = employees.filter(emp => emp.status === "pending").length;
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
            default: return "bg-gray-50 text-gray-700 border-gray-200";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "done": return "Done";
            case "approved": return "Approved";
            default: return "Pending";
        }
    };

    const handleUpdateStatus = async (empId: string, newStatus: Employee["status"]) => {
        if (newStatus !== "approved") {
            // "done" transitions go through handleGeneratePayments (real
            // /payments/generate + /status/update calls); nothing else to do here.
            return;
        }
        try {
            const user = getCurrentUser();
            const res = await fetch(withBasePath("/api/fnf/approve"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ empId, approvedBy: user.userId, role: user.role }),
            });
            const json = await res.json();
            if (!res.ok) {
                throw new Error(json?.message || `Failed to approve (${res.status})`);
            }
            setEmployees(employees.map(emp =>
                emp.empId === empId ? { ...emp, status: newStatus } : emp
            ));
            if (selectedEmployee?.empId === empId) {
                setSelectedEmployee({ ...selectedEmployee, status: newStatus });
            }
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Failed to approve settlement");
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

    const handleGeneratePayments = async () => {
        const approved = employees.filter(e => e.status === "approved");

        if (approved.length === 0) {
            alert("No employees with status 'approved'.");
            return;
        }

        // The backend's F&F module doesn't store a per-employee bank account/IFSC
        // (FnfListItem/FnfDetailResponse have no such fields) - there's nothing
        // real to source these from. Rather than fabricate account numbers for a
        // real NEFT payment file, skip employees missing real bank details and
        // tell the operator, instead of the previous behavior of generating a
        // random 12-digit account number.
        const payable = approved.filter(
            emp => emp.bankAccount && emp.bankAccount.trim().length >= 6
        );
        const skipped = approved.length - payable.length;
        if (skipped > 0) {
            alert(
                `${skipped} approved employee(s) have no bank account on file and will be skipped. ` +
                `Bank account capture isn't available in F&F settlement yet.`
            );
        }
        if (payable.length === 0) {
            return;
        }

        const batchId = `FNF_${Date.now()}`;

        try {
            const genRes = await fetch(withBasePath("/api/fnf/payments/generate"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    batchId,
                    records: payable.map(emp => ({
                        empId: emp.empId,
                        amount: Math.round(emp.netSalary || 0),
                        bankAccount: emp.bankAccount!.replace(/\D/g, "").slice(-12).padStart(12, "0"),
                        ifsc: emp.ifsc?.trim() || ifscDefault,
                    })),
                }),
            });
            const genJson = await genRes.json();
            if (!genRes.ok) {
                throw new Error(genJson?.message || `Failed to generate payments (${genRes.status})`);
            }

            const statusRes = await fetch(withBasePath("/api/fnf/status/update"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ batchId }),
            });
            const statusJson = await statusRes.json();
            if (!statusRes.ok) {
                throw new Error(statusJson?.message || `Failed to mark batch done (${statusRes.status})`);
            }

            await loadEmployees();

            const header = "TYPE,DEBIT BANK A/C NO,DEBIT AMT,CUR,BENEFICIARY A/C NO,IFSC CODE,NARRATION/NAME (NOT MORE THAN 20)";
            const rows = payable.map(emp => {
                const beneficiaryAcct = emp.bankAccount!.replace(/\D/g, "").slice(-12).padStart(12, "0");
                const ifsc = emp.ifsc?.trim() || ifscDefault;
                const amount = Math.round(emp.netSalary || 0);
                const narration = (emp.name || emp.empId || "").substring(0, 20).replace(/,/g, "");
                return ["NEFT", debitAccount, amount.toString(), "INR", beneficiaryAcct, ifsc, narration].join(",");
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
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Failed to generate payments");
        }
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
                              <div className="flex justify-end">
                    <Button onClick={handleGeneratePayments} variant="default">
                        <Download className="mr-2 h-4 w-4" />
                        Generate Payments & Mark as Done
                    </Button>
                </div>
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
