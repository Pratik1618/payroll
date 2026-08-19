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
import { withBasePath } from "@/lib/base-path";
import { useClients, useClientSites } from "@/hooks/use-shared-master-data";

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
  const { clients } = useClients([]);
  const { sites } = useClientSites(client, []);

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

  // Real reliever rate, looked up from the backend by client/site/designation
  const fetchRelieverRate = async (
    clientId: string,
    siteId: string,
    designation: string
  ): Promise<number> => {
    if (!clientId || !siteId || !designation) return 0;
    try {
      const res = await fetch(
        withBasePath(
          `/api/reliever-rate?clientId=${encodeURIComponent(clientId)}&siteId=${encodeURIComponent(siteId)}&designation=${encodeURIComponent(designation)}`
        ),
        { credentials: "include", cache: "no-store" }
      );
      const json = await res.json();
      if (!res.ok) return 0;
      return Number(json?.results?.rate ?? json?.results ?? 0) || 0;
    } catch (error) {
      console.error("Failed to fetch reliever rate:", error);
      return 0;
    }
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

        // total calc (rate itself is refreshed async below when designation changes)
        if (field === "days") {
          newRow.total = Number(newRow.days) * Number(newRow.rate);
        }

        return newRow;
      }
      return row;
    });

    setRows(updated);

    if (field === "designation") {
      fetchRelieverRate(client, site, value).then((rate) => {
        setRows((prev) =>
          prev.map((row) =>
            row.id === id ? { ...row, rate, total: Number(row.days) * rate } : row
          )
        );
      });
    }
  };

  // submit
  const handleSubmit = async () => {
    if (!client || !site) {
      toast.error("Select client and site");
      return;
    }

    if (rows.length === 0) {
      toast.error("Add reliever");
      return;
    }

    try {
      const res = await fetch(withBasePath("/api/cash-reliever"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          clientId: client,
          clientName: clients.find((c) => c.id === client)?.name || client,
          siteId: site,
          siteName: sites.find((s) => s.id === site)?.name || site,
          relievers: rows.map((r) => ({
            name: r.name,
            phone: r.phone,
            designation: r.designation,
            days: r.days,
            rate: r.rate,
            total: r.total,
          })),
          grandTotal,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.message || `Failed to submit (${res.status})`);
      }

      toast.success("Sent to checker for approval");
      setRows([]);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit entry");
    }
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
              <Select
                value={client}
                onValueChange={(value) => {
                  setClient(value);
                  setSite("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Site</Label>
              <Select value={site} onValueChange={setSite}>
                <SelectTrigger>
                  <SelectValue placeholder="Select site" />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
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
