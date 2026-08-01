"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrganizationTree } from "./components/OrganizationTree";
import { QuickActions } from "./components/QuickActions";
import { SummaryCards } from "./components/SummaryCards";
import { OverviewTab } from "./components/OverviewTab";
import { EmployeesTable } from "./components/EmployeesTable";
import { SalaryCostTab } from "./components/SalaryCostTab";
import { OfferManagementModule } from "./components/OfferManagementModule";
import { organizationData, OrganizationNode } from "./mock/organization";
import { MainLayout } from "@/components/ui/layout/main-layout";
import { Building2, FileCheck } from "lucide-react";

export default function OrganizationManagementPage() {
  const [selectedNode, setSelectedNode] = useState<OrganizationNode>(organizationData[0]);
  const [activeMainTab, setActiveMainTab] = useState<"hierarchy" | "offers">("hierarchy");

  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-4rem)] bg-muted/10 flex flex-col -m-6 rounded-lg overflow-hidden border">
        <Tabs
          value={activeMainTab}
          onValueChange={(val) => setActiveMainTab(val as "hierarchy" | "offers")}
          className="w-full flex flex-col flex-1"
        >
          {/* Top Header Bar with Title on Left & 2 Tabs on Top Right */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b py-3 px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col">
              <h1 className="text-xl font-semibold tracking-tight">Organization Management</h1>
              <p className="text-xs text-muted-foreground">
                {activeMainTab === "hierarchy" 
                  ? "Manage department hierarchy, employees, and zones." 
                  : "Track candidate offer letters and salary CTC breakdowns."}
              </p>
            </div>

            {/* Main Tabs positioned at Top Right */}
            <TabsList className="bg-muted/70 p-1 shrink-0">
              <TabsTrigger value="hierarchy" className="gap-2 text-xs md:text-sm px-4 py-1.5">
                <Building2 className="h-4 w-4" />
                Organization Hierarchy
              </TabsTrigger>
              <TabsTrigger value="offers" className="gap-2 text-xs md:text-sm px-4 py-1.5">
                <FileCheck className="h-4 w-4" />
                Offer Letter Management
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab 1: Organization Hierarchy Screen */}
          <TabsContent value="hierarchy" className="m-0 border-0 p-0 focus-visible:outline-none flex-1">
            <div className="flex flex-1 overflow-hidden p-6 gap-6 min-h-[70vh]">
              {/* Left Panel: Organization Tree */}
              <aside className="w-72 flex-shrink-0 bg-background border rounded-lg shadow-sm flex flex-col">
                <div className="p-4 border-b font-medium text-sm">
                  Organization Structure
                </div>
                <div className="flex-1 p-2 overflow-hidden">
                  <OrganizationTree 
                    selectedNodeId={selectedNode.id} 
                    onSelect={setSelectedNode} 
                  />
                </div>
              </aside>

              {/* Right Panel: Dashboard with Action Buttons inside tab screen */}
              <main className="flex-1 overflow-y-auto custom-scrollbar bg-background border rounded-lg shadow-sm p-6">
                {/* Header Action Bar inside Tab Screen */}
                <div className="mb-6 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 pb-4 border-b">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight mb-1">{selectedNode.name}</h2>
                    <p className="text-xs text-muted-foreground">Dashboard & Hierarchy Metrics</p>
                  </div>
                  
                  {/* Action buttons embedded inside tab screen */}
                  <QuickActions />
                </div>
                
                <SummaryCards node={selectedNode} />

                <Tabs defaultValue="overview" className="mt-8">
                  <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-muted/50">
                    <TabsTrigger value="overview" className="py-2 text-xs md:text-sm">Overview</TabsTrigger>
                    <TabsTrigger value="employees" className="py-2 text-xs md:text-sm">Employees</TabsTrigger>
                    <TabsTrigger value="salary" className="py-2 text-xs md:text-sm">Salary Cost</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview">
                    <OverviewTab node={selectedNode} />
                  </TabsContent>
                  
                  <TabsContent value="employees">
                    <EmployeesTable nodeId={selectedNode.id} />
                  </TabsContent>
                  
                  <TabsContent value="salary">
                    <SalaryCostTab node={selectedNode} />
                  </TabsContent>
                </Tabs>
              </main>
            </div>
          </TabsContent>

          {/* Tab 2: Offer Letter Management Screen */}
          <TabsContent value="offers" className="m-0 border-0 p-6 focus-visible:outline-none flex-1">
            <OfferManagementModule />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
