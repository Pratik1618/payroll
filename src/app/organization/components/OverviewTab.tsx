"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrganizationNode, updateNodeZones } from "../mock/organization";
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface OverviewTabProps {
  node: OrganizationNode;
}

const AVAILABLE_ZONES = ["West", "East", "North", "South"];

export function OverviewTab({ node }: OverviewTabProps) {
  const [isEditingZones, setIsEditingZones] = useState(false);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  
  // We use local state to trigger re-renders since we mutate the array directly
  const [refreshKey, setRefreshKey] = useState(0);
  const forceUpdate = () => setRefreshKey(prev => prev + 1);

  const handleSaveZones = () => {
    updateNodeZones(node.id, selectedZones);
    toast.success("Covered zones updated successfully.");
    setIsEditingZones(false);
    forceUpdate();
  };

  return (
    <div key={refreshKey} className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-4">
      <Card className="col-span-1 md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Organization Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{node.description || "No description provided."}</p>
        </CardContent>
      </Card>

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
      
    </div>
  );
}
