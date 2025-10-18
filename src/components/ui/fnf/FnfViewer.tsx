// FnfProcessingModal.tsx
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Download, FileText, Upload, Check } from "lucide-react";

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
}

interface FnfProcessingModalProps {
  employee: Employee | null;
  onClose: () => void;
  onUpdateStatus: (empId: string, newStatus: Employee["status"]) => void;
  onToggleClearance: (empId: string, itemIndex: number) => void;
  onApproveStage: (empId: string, stage: string) => void;
  onAddNote: (empId: string, note: string) => void;
}

export function FnfProcessingModal({
  employee,
  onClose,
  onUpdateStatus,
  onToggleClearance,
  onApproveStage,
  onAddNote,
}: FnfProcessingModalProps) {
  const [newNote, setNewNote] = useState("");

  if (!employee) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "bg-green-50 text-green-700 border-green-200";
      case "approved":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "under-review":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "done":
        return "Done";
      case "approved":
        return "Approved";
      case "under-review":
        return "Under Review";
      default:
        return "Pending";
    }
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      onAddNote(employee.empId, newNote);
      setNewNote("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{employee.name}</h2>
            <p className="text-sm text-muted-foreground">
              {employee.empId} • {employee.designation}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Management */}
          <Card>
            <CardHeader>
              <CardTitle>Status Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Current Status:</span>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium border ${getStatusColor(
                    employee.status
                  )}`}
                >
                  {getStatusLabel(employee.status)}
                </span>
                <select
                  className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                  value={employee.status}
                  onChange={(e) =>
                    onUpdateStatus(
                      employee.empId,
                      e.target.value as Employee["status"]
                    )
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="under-review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Salary Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Salary Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b">
                  <span>Basic Salary</span>
                  <span className="font-medium">
                    ₹{employee.basicSalary.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>Allowances</span>
                  <span className="font-medium">
                    ₹{employee.allowances.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>Leave Encashment</span>
                  <span className="font-medium text-green-600">
                    +₹{employee.leaveEncashment.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>Deductions</span>
                  <span className="font-medium text-red-600">
                    -₹{employee.deductions.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>Notice Period Recovery</span>
                  <span className="font-medium text-red-600">
                    -₹{employee.noticePeriodRecovery.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-3 text-lg font-bold bg-gray-50 px-3 rounded">
                  <span>Net Settlement</span>
                  <span>₹{employee.netSalary.toLocaleString()}</span>
                </div>
              </div>
              <Button className="w-full mt-4">
                <Download className="h-4 w-4 mr-2" />
                Generate F&F Statement
              </Button>
            </CardContent>
          </Card>

          {/* Clearance Checklist */}
          <Card>
            <CardHeader>
              <CardTitle>Clearance Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {employee.clearanceItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <span className="text-sm">{item.item}</span>
                    <button
                      onClick={() => onToggleClearance(employee.empId, index)}
                      className={`flex items-center gap-2 px-3 py-1 rounded text-sm font-medium ${
                        item.cleared
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-gray-50 text-gray-700 border border-gray-200"
                      }`}
                    >
                      {item.cleared && <Check className="h-4 w-4" />}
                      {item.cleared ? "Cleared" : "Pending"}
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Approval Workflow */}
          <Card>
            <CardHeader>
              <CardTitle>Approval Workflow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {employee.approvals.map((approval, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <div>
                      <div className="font-medium">{approval.stage}</div>
                      <div className="text-sm text-muted-foreground">
                        {approval.approver}
                      </div>
                      {approval.date && (
                        <div className="text-xs text-muted-foreground">
                          {approval.date}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border ${
                          approval.status === "approved"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : approval.status === "rejected"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200"
                        }`}
                      >
                        {approval.status === "approved"
                          ? "Approved"
                          : approval.status === "rejected"
                          ? "Rejected"
                          : "Pending"}
                      </span>
                      {approval.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() =>
                            onApproveStage(employee.empId, approval.stage)
                          }
                        >
                          Approve
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {employee.documents.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{doc}</span>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-2">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Internal Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {employee.notes.map((note, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded text-sm">
                    {note}
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddNote()}
                  />
                  <Button onClick={handleAddNote}>Add</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}