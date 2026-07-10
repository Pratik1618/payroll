"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrganizationTree } from "./components/OrganizationTree";
import { DashboardHeader } from "./components/DashboardHeader";
import { SummaryCards } from "./components/SummaryCards";
import { OverviewTab } from "./components/OverviewTab";
import { EmployeesTable } from "./components/EmployeesTable";
import { SalaryCostTab } from "./components/SalaryCostTab";
import { organizationData, OrganizationNode } from "./mock/organization";

import { MainLayout } from "@/components/ui/layout/main-layout";

export default function OrganizationManagementPage() {
  const [selectedNode, setSelectedNode] = useState<OrganizationNode>(organizationData[0]);

  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-4rem)] bg-muted/10 flex flex-col -m-6 rounded-lg overflow-hidden border">
      <DashboardHeader />
      
      <div className="flex flex-1 overflow-hidden p-6 gap-6">
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

        {/* Right Panel: Dashboard */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-background border rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold tracking-tight mb-1">{selectedNode.name}</h2>
            <p className="text-sm text-muted-foreground">Dashboard & Metrics</p>
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
    </div>
    </MainLayout>
  );
}
