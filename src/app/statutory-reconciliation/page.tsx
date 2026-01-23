"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MainLayout } from "@/components/ui/layout/main-layout"
import PFReconciliationModule from "./pf-reconcilitation"
import ESICReconciliationModule from "./esic-reconcilitation"


export default function StatutoryReconciliationPage() {
  return (
    <MainLayout>
      <div className="space-y-6">

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Statutory Reconciliation</h1>
          <p className="text-muted-foreground">
            PF & ESIC statutory reconciliation and compliance
          </p>
        </div>

        <Tabs defaultValue="pf" className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="pf">PF Reconciliation</TabsTrigger>
            <TabsTrigger value="esic">ESIC Reconciliation</TabsTrigger>
          </TabsList>

          {/* PF */}
          <TabsContent value="pf">
            <PFReconciliationModule/>
          </TabsContent>

          {/* ESIC */}
          <TabsContent value="esic">
            <ESICReconciliationModule />
          </TabsContent>

        </Tabs>

      </div>
    </MainLayout>
  )
}
