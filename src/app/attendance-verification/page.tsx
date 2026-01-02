"use client";

import { useState } from "react";
import { MainLayout } from "@/components/ui/layout/main-layout";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Eye, CheckCircle, XCircle } from "lucide-react";

interface AttendanceRecord {
    employee_id: string;
    employee_name: string;
    present_days: number;
    weekly_off: number;
    national_holidays: number;
    holiday: number;
    comp_off: number;
    leave: number;
    absent: number;
    half_day: number;
    ot_hrs: number;
    total_payable_days: number;
}

interface SubmissionRecord {
    id: string;
    client: string;
    site: string;
    month: string;
    records: AttendanceRecord[];
    status: "pending" | "approved" | "rejected";
    submittedAt: string;
    submittedBy: string;
    approvedBy?: string;
    approvedAt?: string;
}

export default function AttendanceVerificationPage() {
    const [submissions, setSubmissions] = useState<SubmissionRecord[]>([
        {
            id: "SUB001",
            client: "Acme Corp",
            site: "Site A",
            month: "November",
            records: [
                {
                    employee_id: "EMP001",
                    employee_name: "John Doe",
                    present_days: 20,
                    weekly_off: 4,
                    national_holidays: 2,
                    holiday: 1,
                    comp_off: 0,
                    leave: 1,
                    absent: 0,
                    half_day: 1,
                    ot_hrs: 8,
                    total_payable_days: 25,
                },
                {
                    employee_id: "EMP002",
                    employee_name: "Jane Smith",
                    present_days: 19,
                    weekly_off: 4,
                    national_holidays: 2,
                    holiday: 1,
                    comp_off: 1,
                    leave: 0,
                    absent: 2,
                    half_day: 0,
                    ot_hrs: 4,
                    total_payable_days: 24,
                },
            ],
            status: "pending",
            submittedAt: "2024-12-20 10:30 AM",
            submittedBy: "HR Manager",
        },
        {
            id: "SUB002",
            client: "Tech Solutions",
            site: "Site B",
            month: "December",
            records: [],
            status: "approved",
            submittedAt: "2024-12-18 2:15 PM",
            submittedBy: "Payroll Team",
        },
        {
            id: "SUB003",
            client: "Global Services",
            site: "Site C",
            month: "November",
            records: [],
            status: "rejected",
            submittedAt: "2024-12-19 3:45 PM",
            submittedBy: "HR Manager",
        },
    ]);
    const [selectedSubmission, setSelectedSubmission] =
        useState<SubmissionRecord | null>(null);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);

    const handleViewDetails = (submission: SubmissionRecord) => {
        setSelectedSubmission(submission);
        setShowDetailsDialog(true);
    };

    const handleApprove = (id: string) => {
        setSubmissions(
            submissions.map((sub) =>
                sub.id === id ? { ...sub, status: "approved" as const } : sub
            )
        );
        setShowDetailsDialog(false);
        toast.success("Attendance approved and uploaded to client site");
    };

    const handleReject = (id: string) => {
        setSubmissions(
            submissions.map((sub) =>
                sub.id === id ? { ...sub, status: "rejected" as const } : sub
            )
        );
        setShowDetailsDialog(false);
        toast.error("Attendance rejected. Requestor notified to re-upload");
    };

    const pendingSubmissions = submissions.filter((s) => s.status === "pending");

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Attendance Verification
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Review and approve attendance submissions
                    </p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Pending
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {pendingSubmissions.length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Approved
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {submissions.filter((s) => s.status === "approved").length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Rejected
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {submissions.filter((s) => s.status === "rejected").length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Submissions Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Pending & Verified Submissions</CardTitle>
                        <CardDescription>
                            Review submissions and take action
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-lg overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead>Submission ID</TableHead>
                                        <TableHead>Client</TableHead>
                                        <TableHead>Site</TableHead>
                                        <TableHead>Month</TableHead>
                                        <TableHead>Records</TableHead>
                                        <TableHead>Submitted By</TableHead>
                                        <TableHead>Submitted</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {submissions.map((submission) => (
                                        <TableRow key={submission.id}>
                                            <TableCell className="font-medium">
                                                {submission.id}
                                            </TableCell>
                                            <TableCell>{submission.client}</TableCell>
                                            <TableCell>{submission.site}</TableCell>
                                            <TableCell>{submission.month}</TableCell>
                                            <TableCell>
                                                {submission.records.length} employees
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {submission.submittedBy}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {submission.submittedAt}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        submission.status === "pending"
                                                            ? "outline"
                                                            : submission.status === "approved"
                                                                ? "default"
                                                                : "destructive"
                                                    }
                                                >
                                                    {submission.status.charAt(0).toUpperCase() +
                                                        submission.status.slice(1)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleViewDetails(submission)}
                                                    disabled={submission.status !== "pending"}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
 
            {/* Details Dialog */}
            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                <DialogContent
                    className="w-[96vw] max-w-none 
                sm:max-w-none md:max-w-none lg:max-w-none xl:max-w-none
             max-h-[90vh]
                overflow-hidden"
                >
                    <DialogHeader>
                        <DialogTitle>Attendance Details</DialogTitle>
                        <DialogDescription>
                            {selectedSubmission?.client} • {selectedSubmission?.site} •{" "}
                            {selectedSubmission?.month}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedSubmission && (
                        <div className="space-y-6">
                            {/* Records Table */}
                            <div className="max-h-[60vh] overflow-y-auto border rounded-lg">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead>Employee ID</TableHead>
                                            <TableHead>Employee Name</TableHead>
                                            <TableHead className="text-center">P</TableHead>
                                            <TableHead className="text-center">W</TableHead>
                                            <TableHead className="text-center">NH</TableHead>
                                            <TableHead className="text-center">H</TableHead>
                                            <TableHead className="text-center">CO</TableHead>
                                            <TableHead className="text-center">L</TableHead>
                                            <TableHead className="text-center">A</TableHead>
                                            <TableHead className="text-center">HD</TableHead>
                                            <TableHead className="text-center">OT Hrs</TableHead>
                                            <TableHead className="text-center font-bold">
                                                Total Payable Days
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedSubmission.records.map((record, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell className="font-medium">
                                                    {record.employee_id}
                                                </TableCell>
                                                <TableCell>{record.employee_name}</TableCell>
                                                <TableCell className="text-center text-sm">
                                                    {record.present_days}
                                                </TableCell>
                                                <TableCell className="text-center text-sm">
                                                    {record.weekly_off}
                                                </TableCell>
                                                <TableCell className="text-center text-sm">
                                                    {record.national_holidays}
                                                </TableCell>
                                                <TableCell className="text-center text-sm">
                                                    {record.holiday}
                                                </TableCell>
                                                <TableCell className="text-center text-sm">
                                                    {record.comp_off}
                                                </TableCell>
                                                <TableCell className="text-center text-sm">
                                                    {record.leave}
                                                </TableCell>
                                                <TableCell className="text-center text-sm">
                                                    {record.absent}
                                                </TableCell>
                                                <TableCell className="text-center text-sm">
                                                    {record.half_day}
                                                </TableCell>
                                                <TableCell className="text-center text-sm">
                                                    {record.ot_hrs}
                                                </TableCell>
                                                <TableCell className="text-center font-semibold text-primary">
                                                    {record.total_payable_days}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Action Buttons */}
                            {selectedSubmission.status === "pending" && (
                                <div className="flex gap-3 justify-end">
                                    <Button
                                        variant="outline"
                                        onClick={() => handleReject(selectedSubmission.id)}
                                    >
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Reject
                                    </Button>
                                    <Button onClick={() => handleApprove(selectedSubmission.id)}>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Approve & Upload
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </MainLayout>
    );
}
