"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  UserCheck,
  MoreVertical,
  Eye,
  Trash2,
  Calendar,
  Building2,
  Mail,
  IndianRupee,
  Filter,
} from "lucide-react";
import {
  getOfferLetters,
  updateOfferStatus,
  deleteOfferLetter,
  OfferLetter,
  OfferStatus,
} from "../mock/offerLetters";
import { organizationData } from "../mock/organization";
import { GenerateOfferModal } from "./GenerateOfferModal";
import { OfferTemplatesModal } from "./OfferTemplatesModal";
import { toast } from "sonner";

export function OfferManagementModule() {
  const [offers, setOffers] = useState<OfferLetter[]>(() => getOfferLetters());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [deptFilter, setDeptFilter] = useState<string>("ALL");
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<OfferLetter | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const departments = useMemo(() => organizationData[0]?.children || [], []);

  const refreshOffers = () => {
    setOffers([...getOfferLetters()]);
  };

  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      const matchesSearch =
        offer.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (offer.tid && offer.tid.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        statusFilter === "ALL" || offer.status === statusFilter;

      const matchesDept =
        deptFilter === "ALL" || offer.departmentId === deptFilter;

      return matchesSearch && matchesStatus && matchesDept;
    });
  }, [offers, searchTerm, statusFilter, deptFilter]);

  const kpis = useMemo(() => {
    const total = offers.length;
    const pending = offers.filter(
      (o) => o.status === "Pending" || o.status === "Sent"
    ).length;
    const accepted = offers.filter((o) => o.status === "Accepted").length;
    const joined = offers.filter((o) => o.status === "Joined").length;
    const declined = offers.filter(
      (o) => o.status === "Declined" || o.status === "Expired"
    ).length;
    const totalCtcOffered = offers.reduce((acc, curr) => acc + curr.ctc, 0);

    return { total, pending, accepted, joined, declined, totalCtcOffered };
  }, [offers]);

  const handleStatusChange = (id: string, newStatus: OfferStatus) => {
    updateOfferStatus(id, newStatus);
    refreshOffers();
    toast.success(`Offer ${id} status updated to "${newStatus}"`);
  };

  const handleDelete = (id: string) => {
    deleteOfferLetter(id);
    refreshOffers();
    toast.success(`Offer letter ${id} has been removed.`);
  };

  const getStatusBadge = (status: OfferStatus) => {
    switch (status) {
      case "Joined":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200 gap-1">
            <UserCheck className="w-3 h-3" />
            Joined
          </Badge>
        );
      case "Accepted":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200 gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Accepted
          </Badge>
        );
      case "Sent":
      case "Pending":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200 gap-1">
            <Clock className="w-3 h-3" />
            {status}
          </Badge>
        );
      case "Declined":
      case "Expired":
        return (
          <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100 border-rose-200 gap-1">
            <XCircle className="w-3 h-3" />
            {status}
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-background border rounded-lg p-5 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Offer Letter Management</h2>
          <p className="text-sm text-muted-foreground">
            Track issued offer letters, monitor acceptance statuses, and generate new candidate offers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="default" onClick={() => setIsTemplatesModalOpen(true)} className="gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </Button>
          <Button size="default" onClick={() => setIsGenerateModalOpen(true)} className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            Generate Offer Letter
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Card>
          <CardHeader className="space-y-0 pb-2">
            <CardDescription className="text-xs">Total Issued Offers</CardDescription>
            <CardTitle className="text-2xl">{kpis.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              <span>₹{(kpis.totalCtcOffered / 100000).toFixed(1)}L total CTC</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-0 pb-2">
            <CardDescription className="text-xs">Awaiting Response</CardDescription>
            <CardTitle className="text-2xl text-amber-600">{kpis.pending}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-amber-600" />
              <span>Sent / Pending candidate response</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-0 pb-2">
            <CardDescription className="text-xs">Accepted Offers</CardDescription>
            <CardTitle className="text-2xl text-green-600">{kpis.accepted}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
              <span>Confirmed offer letters</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-0 pb-2">
            <CardDescription className="text-xs">Joined Team</CardDescription>
            <CardTitle className="text-2xl text-emerald-600">{kpis.joined}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Onboarded employees</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-0 pb-2">
            <CardDescription className="text-xs">Declined / Expired</CardDescription>
            <CardTitle className="text-2xl text-rose-600">{kpis.declined}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <XCircle className="h-3.5 w-3.5 text-rose-600" />
              <span>Unsuccessful or lapsed</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader className="border-b pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-lg">Offer Letter Directory</CardTitle>
              <CardDescription>
                Search, filter, and manage candidate offer letters across all departments.
              </CardDescription>
            </div>
            {/* Search & Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search candidate, email, title..."
                  className="pl-8 text-sm h-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-9 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="Sent">Sent / Pending</SelectItem>
                  <SelectItem value="Accepted">Accepted</SelectItem>
                  <SelectItem value="Joined">Joined</SelectItem>
                  <SelectItem value="Declined">Declined</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                </SelectContent>
              </Select>

              <Select value={deptFilter} onValueChange={setDeptFilter}>
                <SelectTrigger className="w-[150px] h-9 text-xs">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Departments</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredOffers.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="font-medium text-base">No offer letters found</p>
              <p className="text-xs mt-1">Try adjusting your search query or filters.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[110px]">Offer Ref</TableHead>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Designation & Dept</TableHead>
                  <TableHead>Offered CTC</TableHead>
                  <TableHead>Issued Date</TableHead>
                  <TableHead>Valid Till</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>TID</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOffers.map((offer) => (
                  <TableRow key={offer.id} className="hover:bg-muted/40">
                    <TableCell className="font-mono text-xs font-semibold text-slate-700">
                      {offer.id}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground text-sm">{offer.candidateName}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {offer.candidateEmail}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-xs text-slate-900">{offer.designation}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Building2 className="h-3 w-3" />
                        {offer.departmentName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-xs text-slate-900">
                        ₹{offer.ctc.toLocaleString("en-IN")}/yr
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        ₹{Math.round(offer.monthlyCtc).toLocaleString("en-IN")}/mo
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {offer.issuedDate}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {offer.validTill}
                    </TableCell>
                    <TableCell>{getStatusBadge(offer.status)}</TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-slate-700 whitespace-nowrap">
                      {offer.tid || `TMP-${offer.id.replace(/[^0-9]/g, '')}`}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel className="text-xs">Offer Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedOffer(offer);
                              setIsDetailsModalOpen(true);
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View CTC Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel className="text-xs">Update Status</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleStatusChange(offer.id, "Sent")}>
                            <Clock className="mr-2 h-3.5 w-3.5 text-amber-600" />
                            Mark as Sent / Pending
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(offer.id, "Accepted")}>
                            <CheckCircle2 className="mr-2 h-3.5 w-3.5 text-green-600" />
                            Mark as Accepted
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(offer.id, "Joined")}>
                            <UserCheck className="mr-2 h-3.5 w-3.5 text-emerald-600" />
                            Mark as Joined
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(offer.id, "Declined")}>
                            <XCircle className="mr-2 h-3.5 w-3.5 text-rose-600" />
                            Mark as Declined
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(offer.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Offer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Generate Offer Modal */}
      <GenerateOfferModal
        open={isGenerateModalOpen}
        onOpenChange={(open) => {
          setIsGenerateModalOpen(open);
          if (!open) {
            refreshOffers();
          }
        }}
      />

      {/* Offer Details Modal */}
      {selectedOffer && (
        <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-xl">Offer Details: {selectedOffer.id}</DialogTitle>
                  <DialogDescription className="text-xs mt-1">
                    Candidate offer and salary component breakdown
                  </DialogDescription>
                </div>
                {getStatusBadge(selectedOffer.status)}
              </div>
            </DialogHeader>

            <div className="grid gap-4 py-3 text-sm">
              <div className="grid grid-cols-2 gap-4 bg-muted/40 p-3 rounded-lg border">
                <div>
                  <div className="text-xs text-muted-foreground">Candidate Name</div>
                  <div className="font-semibold text-foreground">{selectedOffer.candidateName}</div>
                  <div className="text-xs text-muted-foreground mt-1">{selectedOffer.candidateEmail}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Position & Dept</div>
                  <div className="font-semibold text-foreground">{selectedOffer.designation}</div>
                  <div className="text-xs text-muted-foreground mt-1">{selectedOffer.departmentName}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-3 rounded-lg border">
                <div>
                  <div className="text-xs text-muted-foreground">Annual CTC</div>
                  <div className="font-bold text-base text-primary">₹{selectedOffer.ctc.toLocaleString("en-IN")}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Monthly CTC</div>
                  <div className="font-bold text-base text-slate-800">₹{Math.round(selectedOffer.monthlyCtc).toLocaleString("en-IN")}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Valid Until</div>
                  <div className="font-semibold text-sm text-slate-700">{selectedOffer.validTill}</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2 text-slate-800">Salary Component Breakdown</h4>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-100">
                      <TableRow>
                        <TableHead className="text-xs">Component</TableHead>
                        <TableHead className="text-xs">Type</TableHead>
                        <TableHead className="text-xs text-right">Monthly Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOffer.salaryComponents && selectedOffer.salaryComponents.length > 0 ? (
                        selectedOffer.salaryComponents.map((comp, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="text-xs font-medium">{comp.name}</TableCell>
                            <TableCell className="text-xs capitalize text-muted-foreground">{comp.type}</TableCell>
                            <TableCell className="text-xs text-right font-medium">₹{comp.value.toLocaleString("en-IN")}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-xs text-center text-muted-foreground py-4">
                            Standard CTC structure applied
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {/* Offer Templates Modal */}
      <OfferTemplatesModal
        open={isTemplatesModalOpen}
        onOpenChange={setIsTemplatesModalOpen}
      />
    </div>
  );
}
