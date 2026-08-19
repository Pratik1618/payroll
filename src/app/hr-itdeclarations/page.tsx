"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { MainLayout } from "@/components/ui/layout/main-layout"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Eye, FileCheck } from "lucide-react"
import { withBasePath } from "@/lib/base-path"

type DeclarationStatus = "submitted" | "approved" | "rejected" | "locked"

interface DeclarationListItem {
  declarationId: string
  empCode: string
  empName: string
  financialYear: string
  regime: string
  status: DeclarationStatus
}

interface DeclarationDetail {
  declarationId: string
  employee: { empCode: string; empName: string; pan: string }
  financialYear: string
  regime: string
  hra: { rentPaid?: number; landlordName?: string; landlordPan?: string; city?: string } | null
  deductions: { sec80c?: number; sec80d?: number; sec80ccd1b?: number } | null
  otherIncome: { otherIncome?: number; prevEmployerIncome?: number; prevEmployerTds?: number } | null
  proofs: { fileId: string; fileName: string; category: string }[]
}

// Best-effort read of the logged-in user's identity from the JWT stored in
// the `token` cookie (matches the backend's `sub` claim) - used for
// approvedBy/rejectedBy since the backend requires an explicit string.
function getCurrentUserIdentity(): string {
  if (typeof document === "undefined") return ""
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/)
  if (!match) return ""
  try {
    const payload = JSON.parse(atob(match[1].split(".")[1]))
    return payload.sub || ""
  } catch {
    return ""
  }
}

export default function HrItDeclarationPage() {
  const router = useRouter()
  const [declarations, setDeclarations] = useState<DeclarationListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<DeclarationDetail | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<DeclarationStatus | null>(null)
  const [remarks, setRemarks] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  const isActionAllowed = selectedStatus === "submitted"

  const loadDeclarations = async () => {
    setLoading(true)
    try {
      const res = await fetch(withBasePath("/api/tax/hr/declarations"), {
        credentials: "include",
        cache: "no-store",
      })
      if (res.status === 401) {
        toast.error("Your session has expired. Please log in again.")
        router.replace(withBasePath("/login"))
        return
      }
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.message || "Failed to load declarations")
      }
      setDeclarations(data?.results?.data ?? data?.data ?? [])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load declarations")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadDeclarations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openDeclaration = async (d: DeclarationListItem) => {
    try {
      const res = await fetch(
        withBasePath(`/api/tax/hr/declaration/${encodeURIComponent(d.declarationId)}`),
        { credentials: "include", cache: "no-store" }
      )
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.message || "Failed to load declaration detail")
      }
      const detail: DeclarationDetail = data?.results?.data ?? data?.data
      setSelected(detail)
      setSelectedStatus(d.status)
      setRemarks("")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load declaration detail")
    }
  }

  const handleApprove = async () => {
    if (!selected) return
    setActionLoading(true)
    try {
      const res = await fetch(withBasePath("/api/tax/hr/declaration/approve"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          declarationId: selected.declarationId,
          approvedBy: getCurrentUserIdentity(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.message || "Failed to approve declaration")
      }
      toast.success("Declaration approved")
      setSelected(null)
      await loadDeclarations()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to approve declaration")
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selected || !remarks.trim()) return
    setActionLoading(true)
    try {
      const res = await fetch(withBasePath("/api/tax/hr/declaration/reject"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          declarationId: selected.declarationId,
          rejectedBy: getCurrentUserIdentity(),
          remarks: remarks.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.message || "Failed to reject declaration")
      }
      toast.success("Declaration rejected")
      setSelected(null)
      await loadDeclarations()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reject declaration")
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">IT Declarations</h1>
            <p className="text-muted-foreground text-sm">
              Review and approve employee tax declarations
            </p>
          </div>
        </div>

        {/* TABLE */}
        <Card>
          <CardHeader>
            <CardTitle>Submitted Declarations</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Emp Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>FY</TableHead>
                  <TableHead>Regime</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                      Loading declarations...
                    </TableCell>
                  </TableRow>
                ) : declarations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                      No declarations found.
                    </TableCell>
                  </TableRow>
                ) : (
                  declarations.map((d) => (
                    <TableRow key={d.declarationId}>
                      <TableCell>{d.empCode}</TableCell>
                      <TableCell>{d.empName}</TableCell>
                      <TableCell>{d.financialYear}</TableCell>
                      <TableCell className="uppercase">{d.regime}</TableCell>
                      <TableCell>
                        <Badge className="capitalize">{d.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openDeclaration(d)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* MODAL */}
        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-4xl p-0">
  {/* Header */}
  <div className="border-b px-6 py-4">
    <DialogHeader>
      <DialogTitle className="text-xl">
        IT Declaration Review
      </DialogTitle>
      <p className="text-sm text-muted-foreground">
        Verify employee declaration before approval
      </p>
    </DialogHeader>
  </div>

  {selected && (
    <div className="max-h-[75vh] overflow-y-auto px-6 py-5 space-y-6">
      {/* Employee Context */}
      <div className="grid md:grid-cols-5 gap-4 text-sm bg-muted/40 p-4 rounded-lg">
        <Info label="Emp Code" value={selected.employee.empCode} />
        <Info label="Name" value={selected.employee.empName} />
        <Info label="PAN" value={selected.employee.pan} />
        <Info label="FY" value={selected.financialYear} />
        <Info label="Regime" value={selected.regime.toUpperCase()} />
      </div>

      {/* OLD REGIME DETAILS */}
      {selected.regime === "old" && selected.hra && selected.deductions && (
        <>
          {/* HRA */}
          <Section title="HRA Details">
            <Info label="Annual Rent Paid" value={`₹ ${(selected.hra.rentPaid ?? 0).toLocaleString("en-IN")}`} />
            <Info label="Landlord Name" value={selected.hra.landlordName ?? "-"} />
            <Info label="Landlord PAN" value={selected.hra.landlordPan ?? "-"} />
            <Info label="City Type" value={selected.hra.city ?? "-"} />
          </Section>

          {/* Deductions */}
          <Section title="Chapter VI-A Deductions">
            <Info label="80C" value={`₹ ${(selected.deductions.sec80c ?? 0).toLocaleString("en-IN")}`} />
            <Info label="80D" value={`₹ ${(selected.deductions.sec80d ?? 0).toLocaleString("en-IN")}`} />
            <Info label="80CCD(1B)" value={`₹ ${(selected.deductions.sec80ccd1b ?? 0).toLocaleString("en-IN")}`} />
          </Section>
        </>
      )}

      {/* Other Income */}
      {selected.otherIncome && (
        <Section title="Other Income / Previous Employer">
          <Info label="Other Income" value={`₹ ${(selected.otherIncome.otherIncome ?? 0).toLocaleString("en-IN")}`} />
          <Info label="Prev Employer Income" value={`₹ ${(selected.otherIncome.prevEmployerIncome ?? 0).toLocaleString("en-IN")}`} />
          <Info label="Prev Employer TDS" value={`₹ ${(selected.otherIncome.prevEmployerTds ?? 0).toLocaleString("en-IN")}`} />
        </Section>
      )}

      {/* HR Action */}
      <div className="border-t pt-4 space-y-3">
        {/* Proofs Section */}
        <Section title="Supporting Documents">
          {selected.proofs && selected.proofs.length > 0 ? (
            <div className="space-y-2">
              {selected.proofs.map((proof) => (
                <div key={proof.fileId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileCheck className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{proof.fileName}</p>
                      <p className="text-xs text-muted-foreground">{proof.category}</p>
                    </div>
                  </div>
                  {/* No file view/download endpoint exists on the backend yet. */}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No documents uploaded</p>
          )}
        </Section>

        <div>
          <Label className="text-sm">
            Remarks <span className="text-muted-foreground">(mandatory for rejection)</span>
          </Label>
          <Input
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            disabled={!isActionAllowed}
          />
        </div>
      </div>
    </div>
  )}

  {/* Footer Actions */}
  <div className="border-t px-6 py-4 flex justify-end gap-3 bg-background">
    <Button
      disabled={!isActionAllowed || actionLoading}
      onClick={handleApprove}
    >
      {actionLoading ? "Approving..." : "Approve"}
    </Button>

    <Button
      variant="destructive"
      disabled={!isActionAllowed || !remarks.trim() || actionLoading}
      onClick={handleReject}
    >
      {actionLoading ? "Rejecting..." : "Reject"}
    </Button>
  </div>
</DialogContent>

        </Dialog>
      </div>
    </MainLayout>
  )
}

/* Helpers */
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  )
}
function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground">
        {title}
      </h3>
      <div className="grid md:grid-cols-4 gap-4 text-sm bg-muted/30 p-4 rounded-lg">
        {children}
      </div>
    </div>
  )
}
