"use client";

import { useState, useEffect } from "react";
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
import { addState } from "../mock/statesAndCities";
import { toast } from "sonner";
import { MapPin } from "lucide-react";

interface AddStateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStateAdded?: () => void;
}

export function AddStateModal({ open, onOpenChange, onStateAdded }: AddStateModalProps) {
  const [stateName, setStateName] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [region, setRegion] = useState("West");
  const [country, setCountry] = useState("India");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (open) {
      setStateName("");
      setStateCode("");
      setRegion("West");
      setCountry("India");
      setStatus("Active");
      setDescription("");
    }
  }, [open]);

  const handleSave = () => {
    if (!stateName.trim()) {
      toast.error("State Name is required.");
      return;
    }

    if (!stateCode.trim()) {
      toast.error("State Code is required.");
      return;
    }

    addState({
      name: stateName.trim(),
      code: stateCode.trim().toUpperCase(),
      region,
      country: country.trim() || "India",
      status,
      description: description.trim(),
    });

    toast.success(`State "${stateName.trim()}" has been added successfully!`);
    if (onStateAdded) onStateAdded();
    onOpenChange(false);
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
              <Label htmlFor="stateCode">State Code *</Label>
              <Input
                id="stateCode"
                placeholder="e.g. MH, KA"
                value={stateCode}
                onChange={(e) => setStateCode(e.target.value.toUpperCase())}
                maxLength={5}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="region">Region / Zone</Label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger id="region">
                  <SelectValue placeholder="Select region" />
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                placeholder="e.g. India"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
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

          <div className="grid gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief description or regional notes..."
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
          <Button onClick={handleSave}>Create State</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
