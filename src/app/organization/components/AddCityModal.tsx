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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getStates, addCity } from "../mock/statesAndCities";
import { toast } from "sonner";
import { Building } from "lucide-react";

interface AddCityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCityAdded?: () => void;
}

export function AddCityModal({ open, onOpenChange, onCityAdded }: AddCityModalProps) {
  const [cityName, setCityName] = useState("");
  const [cityCode, setCityCode] = useState("");
  const [selectedStateId, setSelectedStateId] = useState("");
  const [category, setCategory] = useState<"Metro" | "Non-Metro" | "Tier 1" | "Tier 2" | "Tier 3">("Tier 1");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");
  const [description, setDescription] = useState("");

  const states = useMemo(() => getStates(), [open]);

  useEffect(() => {
    if (open) {
      setCityName("");
      setCityCode("");
      setSelectedStateId(states[0]?.id || "");
      setCategory("Tier 1");
      setStatus("Active");
      setDescription("");
    }
  }, [open, states]);

  const handleSave = () => {
    if (!cityName.trim()) {
      toast.error("City Name is required.");
      return;
    }

    if (!selectedStateId) {
      toast.error("Please select a state.");
      return;
    }

    const stateObj = states.find((s) => s.id === selectedStateId);
    const stateName = stateObj ? stateObj.name : "Unknown State";

    addCity({
      name: cityName.trim(),
      code: cityCode.trim().toUpperCase() || cityName.substring(0, 3).toUpperCase(),
      stateId: selectedStateId,
      stateName,
      category,
      status,
      description: description.trim(),
    });

    toast.success(`City "${cityName.trim()}" has been added under ${stateName}!`);
    if (onCityAdded) onCityAdded();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Building className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Add City</DialogTitle>
              <DialogDescription className="text-xs">
                Add a new city under a state in organization master data.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="stateSelect">State *</Label>
            <Select value={selectedStateId} onValueChange={setSelectedStateId}>
              <SelectTrigger id="stateSelect">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {states.map((st) => (
                  <SelectItem key={st.id} value={st.id}>
                    {st.name} ({st.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cityName">City Name *</Label>
            <Input
              id="cityName"
              placeholder="e.g. Mumbai, Pune, Bengaluru"
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="cityCode">City Code</Label>
              <Input
                id="cityCode"
                placeholder="e.g. MUM, PNQ"
                value={cityCode}
                onChange={(e) => setCityCode(e.target.value.toUpperCase())}
                maxLength={6}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category / Tier</Label>
              <Select value={category} onValueChange={(val) => setCategory(val as typeof category)}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Metro">Metro</SelectItem>
                  <SelectItem value="Non-Metro">Non-Metro</SelectItem>
                  <SelectItem value="Tier 1">Tier 1</SelectItem>
                  <SelectItem value="Tier 2">Tier 2</SelectItem>
                  <SelectItem value="Tier 3">Tier 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
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

          <div className="grid gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief description or location notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Create City</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
