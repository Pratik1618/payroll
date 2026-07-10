"use client";

import { QuickActions } from "./QuickActions";

export function DashboardHeader() {
  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b py-2 px-6 flex flex-row items-center justify-between gap-4">
      <div className="flex flex-col">
        <h1 className="text-xl font-semibold tracking-tight">Organization Management</h1>
        <p className="text-xs text-muted-foreground">Manage hierarchy, departments, and zones.</p>
      </div>
      <div className="flex items-center gap-4">
        <QuickActions />
      </div>
    </div>
  );
}
