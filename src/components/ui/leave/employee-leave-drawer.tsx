import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { MonthWiseLedger } from "./month-wise-ledger"
import { LopImpact } from "./lop-impact"

export function EmployeeLeaveDrawer({
  open,
  onClose,
  context,
}: any) {
  if (!context) return null

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="h-[90vh]">
        <DrawerHeader className="border-b">
          <DrawerTitle className="flex gap-3 items-center">
            {context.empName} ({context.empId})
            <Badge variant="outline">{context.leaveType}</Badge>
            <Badge variant="secondary">FY {context.fy}</Badge>
          </DrawerTitle>
        </DrawerHeader>

        <div className="p-4">
          <Tabs defaultValue="ledger">
            <TabsList>
              <TabsTrigger value="ledger">Month-wise Ledger</TabsTrigger>
              <TabsTrigger value="lop">LOP Impact</TabsTrigger>
            </TabsList>

            <TabsContent value="ledger">
              <MonthWiseLedger />
            </TabsContent>

            <TabsContent value="lop">
              <LopImpact />
            </TabsContent>
          </Tabs>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
