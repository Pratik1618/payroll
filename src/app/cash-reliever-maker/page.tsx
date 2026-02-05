"use client";

import { useState } from "react";
import { MainLayout } from "@/components/ui/layout/main-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash } from "lucide-react";
import { toast } from "sonner";

interface RelieverRow {
  id: number;
  name: string;
  phone: string;
  designation: string;
  days: number;
  rate: number;
  total: number;
}

export default function CashRelieverMakerPage() {
  const [client, setClient] = useState("");
  const [site, setSite] = useState("");

  const [rows, setRows] = useState<RelieverRow[]>([
    {
      id: Date.now(),
      name: "",
      phone: "",
      designation: "",
      days: 0,
      rate: 0,
      total: 0,
    },
  ]);

  // 🔥 dummy rate master
  const dummyRateMaster: any = {
    HDFC: {
      Nagpur: {
        "Security Guard": 750,
        Housekeeping: 500,
      },
      Pune: {
        "Security Guard": 800,
        Housekeeping: 550,
      },
    },
    TCS: {
      Mumbai: {
        "Security Guard": 900,
        Housekeeping: 600,
      },
    },
  };

  // get rate
  const getDummyRate = (client: string, site: string, designation: string) => {
    return dummyRateMaster?.[client]?.[site]?.[designation] || 0;
  };

  // add row
  const addRow = () => {
    setRows([
      ...rows,
      {
        id: Date.now(),
        name: "",
        phone: "",
        designation: "",
        days: 0,
        rate: 0,
        total: 0,
      },
    ]);
  };

  // remove row
  const removeRow = (id: number) => {
    setRows(rows.filter((r) => r.id !== id));
  };

  // update row
  const updateRow = (id: number, field: string, value: any) => {
    const updated = rows.map((row) => {
      if (row.id === id) {
        const newRow: any = { ...row, [field]: value };

        // auto fetch rate
        if (field === "designation") {
          const rate = getDummyRate(client, site, value);
          newRow.rate = rate;
        }

        // total calc
        if (field === "days" || field === "designation") {
          newRow.total = Number(newRow.days) * Number(newRow.rate);
        }

        return newRow;
      }
      return row;
    });

    setRows(updated);
  };

  // submit
  const handleSubmit = () => {
    if (!client || !site) {
      toast.error("Select client and site");
      return;
    }

    if (rows.length === 0) {
      toast.error("Add reliever");
      return;
    }

    console.log("Submit data:", { client, site, rows });
    toast.success("Sent to checker for approval 🚀");

    // reset
    setRows([]);
  };

  const grandTotal = rows.reduce((sum, r) => sum + r.total, 0);

  return (
    <MainLayout>
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Cash Reliever Entry</h1>
          <p className="text-muted-foreground">
            Fill details and send to checker
          </p>
        </div>

        {/* Client & Site */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Details</CardTitle>
          </CardHeader>

          <CardContent className="grid grid-cols-3 gap-4">
            <div>
              <Label>Client</Label>
              <Select onValueChange={setClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HDFC">HDFC</SelectItem>
                  <SelectItem value="TCS">TCS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Site</Label>
              <Select onValueChange={setSite}>
                <SelectTrigger>
                  <SelectValue placeholder="Select site" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nagpur">Nagpur</SelectItem>
                  <SelectItem value="Pune">Pune</SelectItem>
                  <SelectItem value="Mumbai">Mumbai</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reliever Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Reliever Details</CardTitle>
            <Button size="sm" onClick={addRow}>
              <Plus className="h-4 w-4 mr-2" />
              Add Row
            </Button>
          </CardHeader>

          <CardContent>
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Input
                          placeholder="Name"
                          onChange={(e) =>
                            updateRow(row.id, "name", e.target.value)
                          }
                        />
                      </TableCell>

                      <TableCell>
                        <Input
                          placeholder="Phone"
                          onChange={(e) =>
                            updateRow(row.id, "phone", e.target.value)
                          }
                        />
                      </TableCell>

                      <TableCell>
                        <Select
                          onValueChange={(v) =>
                            updateRow(row.id, "designation", v)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Designation" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Security Guard">
                              Security Guard
                            </SelectItem>
                            <SelectItem value="Housekeeping">
                              Housekeeping
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>

                      <TableCell>
                        <Input
                          type="number"
                          onChange={(e) =>
                            updateRow(row.id, "days", e.target.value)
                          }
                        />
                      </TableCell>

                      <TableCell>
                        <Input value={row.rate} disabled />
                      </TableCell>

                      <TableCell className="font-bold">
                        ₹{row.total}
                      </TableCell>

                      <TableCell>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeRow(row.id)}
                        >
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Grand Total */}
            <div className="flex justify-end mt-4 text-lg font-bold">
              Grand Total: ₹{grandTotal}
            </div>

            {/* Submit */}
            <div className="flex justify-end mt-6">
              <Button onClick={handleSubmit}>
                Submit to Checker
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
