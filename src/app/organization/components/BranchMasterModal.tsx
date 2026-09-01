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
  fetchBranchesMaster,
  createBranch,
  updateBranchApi,
  deleteBranchApi,
} from "../services/masterDataService";
import { BranchMasterItem } from "../mock/branches";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, MapPin, Search, Trash2, Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface BranchMasterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BranchMasterModal({ open, onOpenChange }: BranchMasterModalProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [branchesList, setBranchesList] = useState<BranchMasterItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  useEffect(() => {
    if (open) {
      loadBranches();
    }
  }, [open]);

  const loadBranches = async () => {
    setIsLoading(true);
    const data = await fetchBranchesMaster();
    setBranchesList(data);
    setIsLoading(false);
  };

  const filteredBranches = branchesList.filter((b) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    return b.name.toLowerCase().includes(term) || b.code.toLowerCase().includes(term);
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setCode("");
    setName("");
    setLatitude("");
    setLongitude("");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (branch: BranchMasterItem) => {
    setEditingId(branch.id);
    setCode(branch.code);
    setName(branch.name);
    setLatitude(branch.latitude !== undefined ? String(branch.latitude) : "");
    setLongitude(branch.longitude !== undefined ? String(branch.longitude) : "");
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    if (!code.trim() || !name.trim()) {
      toast.error("Branch Code and Name are required.");
      return;
    }

    const lat = latitude.trim() ? Number(latitude) : undefined;
    const lng = longitude.trim() ? Number(longitude) : undefined;
    if (lat !== undefined && (Number.isNaN(lat) || lat < -90 || lat > 90)) {
      toast.error("Latitude must be a number between -90 and 90.");
      return;
    }
    if (lng !== undefined && (Number.isNaN(lng) || lng < -180 || lng > 180)) {
      toast.error("Longitude must be a number between -180 and 180.");
      return;
    }

    setIsSubmitting(true);
    if (editingId) {
      const { success, error } = await updateBranchApi(editingId, {
        code: code.trim(), name: name.trim(), latitude: lat, longitude: lng,
      });
      setIsSubmitting(false);
      if (success) {
        toast.success(`Branch '${name.trim()}' updated.`);
        setIsFormOpen(false);
        loadBranches();
      } else {
        toast.error(error || "Failed to update branch.");
      }
    } else {
      const { data, error } = await createBranch({ code: code.trim(), name: name.trim(), latitude: lat, longitude: lng });
      setIsSubmitting(false);
      if (data) {
        toast.success(`Branch '${name.trim()}' added.`);
        setIsFormOpen(false);
        loadBranches();
      } else {
        toast.error(error || "Failed to add branch.");
      }
    }
  };

  const handleDelete = async (id: string, branchName: string) => {
    const { success, error } = await deleteBranchApi(id);
    if (success) {
      toast.success(`Branch '${branchName}' deleted.`);
      loadBranches();
    } else {
      toast.error(error || `Failed to delete branch '${branchName}'.`);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl w-[92vw] max-h-[85vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b bg-slate-50 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pr-6">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold">Branches Master</DialogTitle>
                  <DialogDescription className="text-xs mt-0.5">
                    Physical office locations ({filteredBranches.length} items).
                  </DialogDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-40 sm:w-56">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search code or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 h-8 text-xs"
                  />
                </div>
                <Button size="sm" onClick={handleOpenAdd} className="h-8 px-3 text-xs gap-1.5 shrink-0 whitespace-nowrap">
                  <Plus className="h-3.5 w-3.5" />
                  Add Branch
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
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Coordinates</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                        Loading branches...
                      </TableCell>
                    </TableRow>
                  ) : filteredBranches.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No branches found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBranches.map((b, index) => (
                      <TableRow key={b.id}>
                        <TableCell className="font-medium text-slate-500">{index + 1}</TableCell>
                        <TableCell className="font-mono text-xs text-slate-600">{b.code}</TableCell>
                        <TableCell className="font-semibold text-slate-900">{b.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {b.latitude !== undefined && b.longitude !== undefined ? (
                            <a
                              href={`https://www.google.com/maps?q=${b.latitude},${b.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {b.latitude}, {b.longitude}
                            </a>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(b)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                            >
                              <span className="sr-only">Edit</span>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(b.id, b.name)}
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

      {/* Add/Edit Branch Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Branch" : "Add Branch"}</DialogTitle>
            <DialogDescription className="text-xs">
              A physical office location, independent of the department tree.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-3">
            <div className="grid gap-2">
              <Label htmlFor="branchCode">Branch Code *</Label>
              <Input
                id="branchCode"
                placeholder="e.g. BR-MUM-HQ"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="branchName">Branch Name *</Label>
              <Input
                id="branchName"
                placeholder="e.g. Mumbai Head Office"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="branchLat">Latitude</Label>
                <Input
                  id="branchLat"
                  type="number"
                  placeholder="e.g. 19.1197"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="branchLng">Longitude</Label>
                <Input
                  id="branchLng"
                  type="number"
                  placeholder="e.g. 72.8697"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : editingId ? (
                "Save Changes"
              ) : (
                "Create Branch"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
