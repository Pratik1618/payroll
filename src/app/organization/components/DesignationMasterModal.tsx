import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { fetchDesignations, createNextDesignation, removeDesignation } from "../services/masterDataService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Settings2, ShieldCheck, Search, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DesignationMasterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DesignationMasterModal({ open, onOpenChange }: DesignationMasterModalProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [designationsList, setDesignationsList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      loadDesignations();
    }
  }, [open]);

  const loadDesignations = async () => {
    setIsLoading(true);
    const list = await fetchDesignations();
    setDesignationsList(list);
    setIsLoading(false);
  };

  const filteredDesignations = designationsList.filter((d) =>
    searchTerm.trim() ? d.toLowerCase().includes(searchTerm.toLowerCase().trim()) : true
  );

  const handleAdd = async () => {
    if (!newTitle.trim()) {
      toast.error("Designation title is required.");
      return;
    }

    setIsSubmitting(true);
    const success = await createNextDesignation(newTitle.trim());
    setIsSubmitting(false);

    if (success) {
      toast.success(`Designation '${newTitle.trim()}' added to master data!`);
      setNewTitle("");
      setIsAddOpen(false);
      loadDesignations();
    } else {
      toast.error(`Failed to add designation '${newTitle.trim()}'.`);
    }
  };

  const handleDelete = async (title: string) => {
    const success = await removeDesignation(title);
    if (success) {
      toast.success(`Designation '${title}' deleted from master data.`);
      loadDesignations();
    } else {
      toast.error(`Failed to delete designation '${title}'.`);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl w-[92vw] max-h-[85vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b bg-slate-50 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pr-6">
              <div>
                <DialogTitle className="text-lg font-bold">Designation Master</DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  Global directory of standardized job titles ({filteredDesignations.length} titles).
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-36 sm:w-52">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 h-8 text-xs"
                  />
                </div>
                <Button size="sm" onClick={() => setIsAddOpen(true)} className="h-8 px-3 text-xs gap-1.5 shrink-0 whitespace-nowrap">
                  <Plus className="h-3.5 w-3.5" />
                  Add Designation
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            <div className="border rounded-md overflow-hidden bg-white shadow-sm">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="w-[80px]">#</TableHead>
                    <TableHead>Designation Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                        Loading designations...
                      </TableCell>
                    </TableRow>
                  ) : filteredDesignations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No designations found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDesignations.map((d, index) => (
                      <TableRow key={d}>
                        <TableCell className="font-medium text-slate-500">{index + 1}</TableCell>
                        <TableCell className="font-medium text-slate-900">{d}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-50 border border-green-200">
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <span className="sr-only">Edit</span>
                              <Settings2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(d)}
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

      {/* Add New Designation Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Designation</DialogTitle>
            <DialogDescription className="text-xs">
              Register a new standardized job title in the designation master data.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-3">
            <div className="grid gap-2">
              <Label htmlFor="desigTitle">Designation Title *</Label>
              <Input
                id="desigTitle"
                placeholder="e.g. Principal Architect, DevOps Lead"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Designation"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
