"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchStates, createNextState } from "../services/masterDataService";
import { StateItem } from "../mock/statesAndCities";
import { toast } from "sonner";
import { MapPin, Loader2 } from "lucide-react";

interface AddStateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStateAdded?: () => void;
}

export function AddStateModal({ open, onOpenChange, onStateAdded }: AddStateModalProps) {
  const [selectedStateId, setSelectedStateId] = useState("");
  const [stateName, setStateName] = useState("");
  const [zone, setZone] = useState("West");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");
  const [states, setStates] = useState<StateItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedStateId("");
      setStateName("");
      setZone("West");
      setStatus("Active");
      loadStates("West");
    }
  }, [open]);

  const loadStates = async (zoneFilter?: string) => {
    setIsLoading(true);
    const data = await fetchStates(zoneFilter);
    setStates(data);
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!stateName.trim()) {
      toast.error("State Name is required.");
      return;
    }

    setIsSubmitting(true);
    const created = await createNextState({
      name: stateName.trim(),
      zone,
      status,
    });
    setIsSubmitting(false);

    if (created) {
      toast.success(`State "${created.name}" has been added successfully!`);
      if (onStateAdded) onStateAdded();
      onOpenChange(false);
    } else {
      toast.error("Failed to create state. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Add State</DialogTitle>
              <DialogDescription className="text-xs">
                Register a new state in organization master data.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="stateSelect">Select State</Label>
            <Select
              value={selectedStateId}
              onValueChange={(val) => {
                setSelectedStateId(val);
                const found = states.find((s) => s.id === val);
                if (found) {
                  setStateName(found.name);
                  setZone(found.zone || "West");
                  setStatus(found.status);
                }
              }}
            >
              <SelectTrigger id="stateSelect">
                <SelectValue placeholder="Select existing state" />
              </SelectTrigger>
              <SelectContent>
                {states.map((st) => (
                  <SelectItem key={st.id} value={st.id}>
                    {st.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="stateName">State Name *</Label>
            <Input
              id="stateName"
              placeholder="e.g. Maharashtra, Karnataka"
              value={stateName}
              onChange={(e) => setStateName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="zone">Zone</Label>
              <Select
                value={zone}
                onValueChange={(val) => {
                  setZone(val);
                  loadStates(val);
                }}
              >
                <SelectTrigger id="zone">
                  <SelectValue placeholder="Select zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="North">North</SelectItem>
                  <SelectItem value="South">South</SelectItem>
                  <SelectItem value="East">East</SelectItem>
                  <SelectItem value="West">West</SelectItem>
                  <SelectItem value="Central">Central</SelectItem>
                  <SelectItem value="North-East">North-East</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(val) => setStatus(val as "Active" | "Inactive")}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Create State"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
