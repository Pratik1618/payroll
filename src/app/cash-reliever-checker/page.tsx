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

interface RelieverRecord {
    name: string;
    phone: string;
    designation: string;
    days: number;
    rate: number;
    total: number;
}

interface SubmissionRecord {
    id: string;
    client: string;
    site: string;
    submittedBy: string;
    submittedAt: string;
    records: RelieverRecord[];
    status: "pending" | "approved" | "rejected" | "sent_to_billing" | "paid";
}

export default function CashRelieverVerificationPage() {

    const [submissions, setSubmissions] = useState<SubmissionRecord[]>([
        {
            id: "CR001",
            client: "HDFC",
            site: "Nagpur Site",
            submittedBy: "Site Manager",
            submittedAt: "05 Feb 2026 10:30 AM",
            status: "pending",
            records: [
                {
                    name: "Rahul",
                    phone: "9876543210",
                    designation: "Security Guard",
                    days: 2,
                    rate: 600,
                    total: 1200,
                },
                {
                    name: "Amit",
                    phone: "8888888888",
                    designation: "Housekeeping",
                    days: 1,
                    rate: 500,
                    total: 500,
                },
            ],
        },
        {
            id: "CR002",
            client: "TCS",
            site: "Pune Site",
            submittedBy: "Admin",
            submittedAt: "04 Feb 2026",
            status: "approved",
            records: [],
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
                sub.id === id
                    ? { ...sub, status: "sent_to_billing" as const }
                    : sub
            )
        );
        setShowDetailsDialog(false);
        toast.success("Approved & sent to billing 💰");
    };

    const handleReject = (id: string) => {
        setSubmissions(
            submissions.map((sub) =>
                sub.id === id ? { ...sub, status: "rejected" as const } : sub
            )
        );
        setShowDetailsDialog(false);
        toast.error("Request rejected ❌");
    };

    const pending = submissions.filter((s) => s.status === "pending");
    const approved = submissions.filter((s) => s.status === "sent_to_billing");
    const rejected = submissions.filter((s) => s.status === "rejected");

    return (
        <MainLayout>
            <div className="space-y-6">

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold">Cash Reliever Verification</h1>
                    <p className="text-muted-foreground">
                        Maker → Checker → Billing approval flow
                    </p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground">
                                Pending
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{pending.length}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground">
                                Sent to Billing
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {approved.length}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground">
                                Rejected
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {rejected.length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Cash Reliever Requests</CardTitle>
                        <CardDescription>
                            Review and approve reliever cash entries
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <div className="border rounded-lg overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead>ID</TableHead>
                                        <TableHead>Client</TableHead>
                                        <TableHead>Site</TableHead>
                                        <TableHead>Relievers</TableHead>
                                        <TableHead>Submitted By</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Action</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {submissions.map((sub) => (
                                        <TableRow key={sub.id}>
                                            <TableCell className="font-medium">{sub.id}</TableCell>
                                            <TableCell>{sub.client}</TableCell>
                                            <TableCell>{sub.site}</TableCell>
                                            <TableCell>{sub.records.length}</TableCell>
                                            <TableCell>{sub.submittedBy}</TableCell>
                                            <TableCell>{sub.submittedAt}</TableCell>

                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        sub.status === "pending"
                                                            ? "outline"
                                                            : sub.status === "sent_to_billing"
                                                                ? "default"
                                                                : "destructive"
                                                    }
                                                >
                                                    {sub.status}
                                                </Badge>
                                            </TableCell>

                                            <TableCell>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleViewDetails(sub)}
                                                    disabled={sub.status !== "pending"}
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

            {/* Dialog */}
            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                <DialogContent className="w-[95vw] max-w-none max-h-[90vh] overflow-hidden">
                    <DialogHeader>
                        <DialogTitle>Reliever Details</DialogTitle>
                        <DialogDescription>
                            {selectedSubmission?.client} • {selectedSubmission?.site}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedSubmission && (
                        <div className="space-y-4">

                            <div className="max-h-[60vh] overflow-y-auto border rounded-lg">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead>Name</TableHead>
                                            <TableHead>Phone</TableHead>
                                            <TableHead>Designation</TableHead>
                                            <TableHead>Days</TableHead>
                                            <TableHead>Rate</TableHead>
                                            <TableHead>Total</TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {selectedSubmission.records.map((r, i) => (
                                            <TableRow key={i}>
                                                <TableCell>{r.name}</TableCell>
                                                <TableCell>{r.phone}</TableCell>
                                                <TableCell>{r.designation}</TableCell>
                                                <TableCell>{r.days}</TableCell>
                                                <TableCell>₹{r.rate}</TableCell>
                                                <TableCell className="font-bold">
                                                    ₹{r.total}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {selectedSubmission.status === "pending" && (
                                <div className="flex justify-end gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => handleReject(selectedSubmission.id)}
                                    >
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Reject
                                    </Button>

                                    <Button
                                        onClick={() => handleApprove(selectedSubmission.id)}
                                    >
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Approve → Billing
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
