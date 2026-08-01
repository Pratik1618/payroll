"use client";

export function DashboardHeader() {
  return (
    <div className="bg-background border-b py-3 px-6 flex flex-row items-center justify-between gap-4">
      <div className="flex flex-col">
        <h1 className="text-xl font-semibold tracking-tight">Organization Management</h1>
        <p className="text-xs text-muted-foreground">Manage hierarchy, departments, zones, and candidate offer letters.</p>
      </div>
    </div>
  );
}
