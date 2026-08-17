"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  fetchSalaryComponents,
  createSalaryComponent,
  deleteSalaryComponentApi,
} from "../services/masterDataService";
import { SalaryComponentMasterItem, ComponentCategory } from "../mock/salaryComponentsMaster";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, ShieldCheck, Search, Trash2, Layers, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SalaryComponentsMasterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SalaryComponentsMasterModal({ open, onOpenChange }: SalaryComponentsMasterModalProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [componentsList, setComponentsList] = useState<SalaryComponentMasterItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [category, setCategory] = useState<ComponentCategory>("Welfare Scheme");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (open) {
      loadSalaryComponents();
    }
  }, [open]);

  const loadSalaryComponents = async () => {
    setIsLoading(true);
    const data = await fetchSalaryComponents();
    setComponentsList(data);
    setIsLoading(false);
  };

  const filteredComponents = componentsList.filter((c) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    return c.name.toLowerCase().includes(term) || c.category.toLowerCase().includes(term) || c.code.toLowerCase().includes(term);
  });

  const handleOpenAdd = () => {
    setName("");
    setCode("");
    setCategory("Welfare Scheme");
    setStatus("Active");
    setDescription("");
    setIsAddOpen(true);
  };

  const handleAddSave = async () => {
    if (!name.trim()) {
      toast.error("Component Name is required.");
      return;
    }

    const derivedCode = code.trim() ? code.trim().toUpperCase() : name.trim().replace(/\s+/g, "_").toUpperCase();

    setIsSubmitting(true);
    const created = await createSalaryComponent({
      name: name.trim(),
      code: derivedCode,
      category,
      status,
      description: description.trim() || undefined,
    });
    setIsSubmitting(false);

    if (created) {
      toast.success(`Salary Component '${name.trim()}' added to master data!`);
      setIsAddOpen(false);
      loadSalaryComponents();
    } else {
      toast.error("Failed to add salary component.");
    }
  };

  const handleDelete = async (id: string, compName: string) => {
    const success = await deleteSalaryComponentApi(id);
    if (success) {
      toast.success(`Component '${compName}' deleted from master data.`);
      loadSalaryComponents();
    } else {
      toast.error(`Failed to delete component '${compName}'.`);
    }
  };

  const getCategoryBadge = (cat: ComponentCategory) => {
    switch (cat) {
      case "Earning":
        return <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">Earning</Badge>;
      case "Deduction":
        return <Badge variant="secondary" className="bg-rose-50 text-rose-700 border-rose-200">Deduction</Badge>;
      case "Employer Contribution":
        return <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">Employer Contribution</Badge>;
      case "Welfare Scheme":
        return <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">Welfare Scheme</Badge>;
      default:
        return <Badge variant="outline">{cat}</Badge>;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl w-[92vw] max-h-[85vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b bg-slate-50 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pr-6">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold">Salary Components Master</DialogTitle>
                  <DialogDescription className="text-xs mt-0.5">
                    Global directory of statutory earnings, deductions, and welfare components ({filteredComponents.length} items).
                  </DialogDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-40 sm:w-56">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search component or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 h-8 text-xs"
                  />
                </div>
                <Button size="sm" onClick={handleOpenAdd} className="h-8 px-3 text-xs gap-1.5 shrink-0 whitespace-nowrap">
                  <Plus className="h-3.5 w-3.5" />
                  Add Component
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            <div className="border rounded-md overflow-hidden bg-white shadow-sm">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="w-[60px]">#</TableHead>
                    <TableHead>Component Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                        Loading salary components...
                      </TableCell>
                    </TableRow>
                  ) : filteredComponents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No components found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredComponents.map((c, index) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium text-slate-500">{index + 1}</TableCell>
                        <TableCell className="font-semibold text-slate-900">
                          {c.name}
                          {c.description && <p className="text-[11px] font-normal text-muted-foreground line-clamp-1">{c.description}</p>}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-slate-600">{c.code}</TableCell>
                        <TableCell>{getCategoryBadge(c.category)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-50 border border-green-200 text-xs">
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            {c.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(c.id, c.name)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <span className="sr-only">Delete</span>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Component Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Salary Component</DialogTitle>
            <DialogDescription className="text-xs">
              Add a new statutory earning, deduction, or welfare component to organization master data.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-3">
            <div className="grid gap-2">
              <Label htmlFor="compName">Component Name *</Label>
              <Input
                id="compName"
                placeholder="e.g. Leave With Wages, Bonus"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="compCode">Component Code</Label>
                <Input
                  id="compCode"
                  placeholder="e.g. LWW_EMP"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="categorySelect">Category *</Label>
                <Select value={category} onValueChange={(val) => setCategory(val as ComponentCategory)}>
                  <SelectTrigger id="categorySelect">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Welfare Scheme">Welfare Scheme</SelectItem>
                    <SelectItem value="Earning">Earning</SelectItem>
                    <SelectItem value="Deduction">Statutory Deduction</SelectItem>
                    <SelectItem value="Employer Contribution">Employer Contribution</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="statusSelect">Status</Label>
              <Select value={status} onValueChange={(val) => setStatus(val as "Active" | "Inactive")}>
                <SelectTrigger id="statusSelect">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="compDescription">Description (Optional)</Label>
              <Textarea
                id="compDescription"
                placeholder="Brief description or statutory compliance notes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleAddSave} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Create Component"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
