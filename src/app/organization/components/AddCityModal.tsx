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
import { fetchStates, fetchCities, createNextCity } from "../services/masterDataService";
import { StateItem, CityItem } from "../mock/statesAndCities";
import { toast } from "sonner";
import { Building, Loader2 } from "lucide-react";

interface AddCityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCityAdded?: () => void;
}

export function AddCityModal({ open, onOpenChange, onCityAdded }: AddCityModalProps) {
  const [cityName, setCityName] = useState("");
  const [selectedStateId, setSelectedStateId] = useState("");
  const [selectedExistingCityId, setSelectedExistingCityId] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");

  const [states, setStates] = useState<StateItem[]>([]);
  const [stateCities, setStateCities] = useState<CityItem[]>([]);
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setCityName("");
      setSelectedExistingCityId("");
      setStatus("Active");
      loadInitialStates();
    }
  }, [open]);

  const loadInitialStates = async () => {
    setIsLoadingStates(true);
    const data = await fetchStates();
    setStates(data);
    setIsLoadingStates(false);
    if (data.length > 0) {
      const defaultStateId = data[0].id;
      setSelectedStateId(defaultStateId);
      loadCitiesForState(defaultStateId);
    }
  };

  const loadCitiesForState = async (stateId: string) => {
    if (!stateId) {
      setStateCities([]);
      return;
    }
    setIsLoadingCities(true);
    const citiesData = await fetchCities(stateId);
    setStateCities(citiesData);
    setIsLoadingCities(false);
  };

  const handleSave = async () => {
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

    setIsSubmitting(true);
    const created = await createNextCity({
      name: cityName.trim(),
      stateId: selectedStateId,
      stateName,
      status,
    });
    setIsSubmitting(false);

    if (created) {
      toast.success(`City "${cityName.trim()}" has been added under ${stateName}!`);
      if (onCityAdded) onCityAdded();
      onOpenChange(false);
    } else {
      toast.error("Failed to create city. Please try again.");
    }
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
            <Label htmlFor="stateSelect">Select State *</Label>
            <Select
              value={selectedStateId}
              onValueChange={(val) => {
                setSelectedStateId(val);
                setSelectedExistingCityId("");
                loadCitiesForState(val);
              }}
            >
              <SelectTrigger id="stateSelect">
                <SelectValue placeholder={isLoadingStates ? "Loading states..." : "Select state"} />
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

          {stateCities.length > 0 && (
            <div className="grid gap-2">
              <Label htmlFor="citySelect">Select City (Existing)</Label>
              <Select
                value={selectedExistingCityId}
                onValueChange={(val) => {
                  setSelectedExistingCityId(val);
                  const found = stateCities.find((c) => c.id === val);
                  if (found) {
                    setCityName(found.name);
                  }
                }}
              >
                <SelectTrigger id="citySelect">
                  <SelectValue placeholder={isLoadingCities ? "Loading cities..." : "Select from existing cities"} />
                </SelectTrigger>
                <SelectContent>
                  {stateCities.map((ct) => (
                    <SelectItem key={ct.id} value={ct.id}>
                      {ct.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="cityName">City Name *</Label>
            <Input
              id="cityName"
              placeholder="e.g. Mumbai, Pune, Bengaluru"
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
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
              "Create City"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
