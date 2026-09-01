"use client";

import { useEffect, useState } from "react";
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
import { updateGeofenceApi, clearGeofenceApi } from "../services/masterDataService";
import { OrganizationNode } from "../mock/organization";
import { toast } from "sonner";
import { MapPin, LocateFixed, ExternalLink, Loader2 } from "lucide-react";

interface BranchGeofenceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branch: OrganizationNode | null;
  onSaved?: () => void;
}

export function BranchGeofenceModal({ open, onOpenChange, branch, onSaved }: BranchGeofenceModalProps) {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [radiusMeters, setRadiusMeters] = useState("200");
  const [locating, setLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    if (open) {
      setLatitude(branch?.latitude != null ? String(branch.latitude) : "");
      setLongitude(branch?.longitude != null ? String(branch.longitude) : "");
      setRadiusMeters(branch?.geofenceRadiusMeters != null ? String(branch.geofenceRadiusMeters) : "200");
    }
  }, [open, branch]);

  const hasExistingGeofence = branch?.latitude != null && branch?.longitude != null;
  const hasCoordinates = latitude.trim() !== "" && longitude.trim() !== "";

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(String(position.coords.latitude));
        setLongitude(String(position.coords.longitude));
        setLocating(false);
      },
      (error) => {
        toast.error(error.message || "Unable to fetch current location.");
        setLocating(false);
      }
    );
  };

  const handleSave = async () => {
    if (!branch) return;

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const radius = parseInt(radiusMeters, 10);

    if (Number.isNaN(lat) || lat < -90 || lat > 90) {
      toast.error("Latitude must be a number between -90 and 90.");
      return;
    }
    if (Number.isNaN(lng) || lng < -180 || lng > 180) {
      toast.error("Longitude must be a number between -180 and 180.");
      return;
    }
    if (Number.isNaN(radius) || radius <= 0) {
      toast.error("Geofence radius must be greater than 0 meters.");
      return;
    }

    setIsSubmitting(true);
    const result = await updateGeofenceApi(branch.id, { latitude: lat, longitude: lng, radiusMeters: radius });
    setIsSubmitting(false);

    if (result) {
      toast.success(`Geofence updated for "${branch.name}".`);
      onSaved?.();
      onOpenChange(false);
    } else {
      toast.error("Failed to update geofence. Please try again.");
    }
  };

  const handleClear = async () => {
    if (!branch) return;

    setIsClearing(true);
    const success = await clearGeofenceApi(branch.id);
    setIsClearing(false);

    if (success) {
      toast.success(`Geofence cleared for "${branch.name}".`);
      onSaved?.();
      onOpenChange(false);
    } else {
      toast.error("Failed to clear geofence. Please try again.");
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
              <DialogTitle>Department Location</DialogTitle>
              <DialogDescription className="text-xs">
                {branch ? `Set GPS coordinates and geofence radius for ${branch.name}.` : "Select a department."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <Button type="button" variant="outline" onClick={handleUseCurrentLocation} disabled={locating}>
            {locating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LocateFixed className="mr-2 h-4 w-4" />
            )}
            Use Current Location
          </Button>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="geofence-lat">Latitude</Label>
              <Input
                id="geofence-lat"
                type="number"
                step="any"
                placeholder="19.1197000"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="geofence-lng">Longitude</Label>
              <Input
                id="geofence-lng"
                type="number"
                step="any"
                placeholder="72.8697000"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="geofence-radius">Geofence Radius (meters)</Label>
            <Input
              id="geofence-radius"
              type="number"
              min={1}
              value={radiusMeters}
              onChange={(e) => setRadiusMeters(e.target.value)}
            />
          </div>

          {hasCoordinates && (
            <a
              href={`https://www.google.com/maps?q=${latitude},${longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Preview on Google Maps
            </a>
          )}
        </div>

        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          {hasExistingGeofence ? (
            <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={handleClear} disabled={isClearing || isSubmitting}>
              {isClearing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Clear Geofence
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting || isClearing}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting || isClearing}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Location"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
