import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrganizationNode, DesignationQuantity } from "../mock/organization";
import { updateDesignationQuantitiesApi, updateCoveredZonesApi, fetchDesignations } from "../services/masterDataService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit2, Trash2, Plus, Settings2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import { SafeDeleteDepartmentModal } from "./SafeDeleteDepartmentModal";

interface OverviewTabProps {
  node: OrganizationNode;
  onDeleteSuccess?: () => void;
}

const AVAILABLE_ZONES = ["West", "East", "North", "South"];

export function OverviewTab({ node, onDeleteSuccess }: OverviewTabProps) {
  const [isEditingZones, setIsEditingZones] = useState(false);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isEditingQuantities, setIsEditingQuantities] = useState(false);
  const [editQuantitiesList, setEditQuantitiesList] = useState<DesignationQuantity[]>([]);
  const [newDesignation, setNewDesignation] = useState("");
  const [newQty, setNewQty] = useState<number>(1);
  const [availableDesignations, setAvailableDesignations] = useState<string[]>([]);
  const [isSubmittingQuantities, setIsSubmittingQuantities] = useState(false);
  
  // We use local state to trigger re-renders
  const [refreshKey, setRefreshKey] = useState(0);
  const forceUpdate = () => setRefreshKey(prev => prev + 1);

  const handleOpenEditQuantities = async () => {
    setEditQuantitiesList(node.designationQuantities ? [...node.designationQuantities] : []);
    setNewDesignation("");
    setNewQty(1);
    setIsEditingQuantities(true);
    const desigs = await fetchDesignations();
    setAvailableDesignations(desigs);
  };

  const handleAddQty = () => {
    if (!newDesignation) {
      toast.error("Please select a designation.");
      return;
    }
    if (newQty <= 0) {
      toast.error("Quantity must be at least 1.");
      return;
    }
    if (editQuantitiesList.some(q => q.designation === newDesignation)) {
      toast.error("Designation already exists in list.");
      return;
    }

    setEditQuantitiesList(prev => [...prev, { designation: newDesignation, quantity: newQty }]);
    setNewDesignation("");
    setNewQty(1);
  };

  const handleRemoveQty = (desigName: string) => {
    setEditQuantitiesList(prev => prev.filter(q => q.designation !== desigName));
  };

  const handleUpdateQtyValue = (desigName: string, val: number) => {
    setEditQuantitiesList(prev =>
      prev.map(q => (q.designation === desigName ? { ...q, quantity: Math.max(1, val) } : q))
    );
  };

  const handleSaveQuantities = async () => {
    setIsSubmittingQuantities(true);
    const success = await updateDesignationQuantitiesApi(node.id, editQuantitiesList);
    setIsSubmittingQuantities(false);

    if (success) {
      node.designationQuantities = editQuantitiesList;
      toast.success(`Designation quantities updated for '${node.name}'.`);
      setIsEditingQuantities(false);
      forceUpdate();
    } else {
      toast.error("Failed to update designation quantities.");
    }
  };

  const handleSaveZones = async () => {
    const success = await updateCoveredZonesApi(node.id, selectedZones);
    if (success) {
      node.coveredZones = selectedZones;
      toast.success("Covered zones updated successfully.");
      setIsEditingZones(false);
      forceUpdate();
    } else {
      toast.error("Failed to update covered zones.");
    }
  };

  return (
    <div key={refreshKey} className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-4">
      <Card className="col-span-1 md:col-span-2 lg:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Organization Description</CardTitle>
          {node.id !== "company" && (
            <Button
              variant="destructive"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => setIsConfirmDeleteOpen(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Department
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{node.description || "No description provided."}</p>
        </CardContent>
      </Card>

      {/* Safe Delete Department Safeguard Modal */}
      <SafeDeleteDepartmentModal
        open={isConfirmDeleteOpen}
        onOpenChange={setIsConfirmDeleteOpen}
        node={node}
        onDeleteSuccess={onDeleteSuccess}
      />

      {node.coveredZones && (
        <Card className="col-span-1 md:col-span-2 lg:col-span-3 border-primary/20 bg-primary/5">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm text-primary">Zones Covered</CardTitle>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-primary hover:text-primary hover:bg-primary/10" onClick={() => {
              setSelectedZones([...(node.coveredZones || [])]);
              setIsEditingZones(true);
            }}>
              <Edit2 className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            {node.coveredZones.length > 0 ? (
              <div className="flex gap-2">
                {node.coveredZones.map((zone) => (
                  <span key={zone} className="px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full shadow-sm">
                    {zone} Zone
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-sm text-muted-foreground italic">No zones currently covered.</span>
            )}
          </CardContent>
        </Card>
      )}

      {/* Zone Edit Dialog */}
      <Dialog open={isEditingZones} onOpenChange={setIsEditingZones}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Covered Zones</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            {AVAILABLE_ZONES.map(zone => (
              <div key={zone} className="flex items-center space-x-2">
                <Checkbox 
                  id={`zone-${zone}`} 
                  checked={selectedZones.includes(zone)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedZones(prev => [...prev, zone]);
                    } else {
                      setSelectedZones(prev => prev.filter(z => z !== zone));
                    }
                  }}
                />
                <Label htmlFor={`zone-${zone}`} className="font-normal cursor-pointer">
                  {zone} Zone
                </Label>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingZones(false)}>Cancel</Button>
            <Button onClick={handleSaveZones}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Designation Headcount Quantities Dialog */}
      <Dialog open={isEditingQuantities} onOpenChange={setIsEditingQuantities}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Designation Quantities - {node.name}</DialogTitle>
            <DialogDescription className="text-xs">
              Configure sanctioned position headcount limits for this department.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2">
              <Select value={newDesignation} onValueChange={setNewDesignation}>
                <SelectTrigger className="flex-1 text-xs">
                  <SelectValue placeholder="Select Designation..." />
                </SelectTrigger>
                <SelectContent>
                  {availableDesignations.map((d) => (
                    <SelectItem key={d} value={d} className="text-xs">
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min={1}
                value={newQty}
                onChange={(e) => setNewQty(Number(e.target.value))}
                className="w-20 text-xs"
                placeholder="Qty"
              />
              <Button type="button" size="sm" onClick={handleAddQty} className="h-9 px-3 gap-1">
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>

            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
              {editQuantitiesList.length > 0 ? (
                editQuantitiesList.map((item) => (
                  <div key={item.designation} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-md text-xs">
                    <span className="font-medium truncate pr-2">{item.designation}</span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => handleUpdateQtyValue(item.designation, Number(e.target.value))}
                        className="w-20 h-7 text-xs text-right"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveQty(item.designation)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic py-3 text-center">No designation quantities configured yet.</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingQuantities(false)} disabled={isSubmittingQuantities}>Cancel</Button>
            <Button onClick={handleSaveQuantities} disabled={isSubmittingQuantities}>
              {isSubmittingQuantities ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Department Head</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-semibold">{node.head || "N/A"}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Total Employees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-semibold">{node.employeeCount?.toLocaleString("en-IN") || 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Monthly Payroll</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-semibold">₹{(node.monthlyPayroll || 0).toLocaleString("en-IN")}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Employer Cost</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-semibold">₹{(node.employerCost || 0).toLocaleString("en-IN")}</div>
        </CardContent>
      </Card>

      {/* Designation Quantities Allocation Card */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-sm font-semibold">Designation Headcount Allocation</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Sanctioned quantity of positions allocated for this department.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleOpenEditQuantities} className="gap-1.5 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50">
            <Edit2 className="h-3.5 w-3.5" />
            Edit Quantities
          </Button>
        </CardHeader>
        <CardContent>
          {node.designationQuantities && node.designationQuantities.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-1">
              {node.designationQuantities.map((item) => (
                <div key={item.designation} className="flex items-center justify-between p-3 rounded-lg border bg-slate-50/70 dark:bg-slate-900/40">
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate pr-2">{item.designation}</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 text-xs px-2 py-0.5 font-bold shrink-0">
                    Qty: {item.quantity}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic py-2">No specific designation quantities configured for this node.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
