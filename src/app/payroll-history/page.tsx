"use client";

import React, { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { MainLayout } from "@/components/ui/layout/main-layout";

// Dummy data
const clients = [
  { id: 1, name: "Client A" },
  { id: 2, name: "Client B" },
];

const sites = [
  { id: 1, clientId: 1, name: "Site X" },
  { id: 2, clientId: 1, name: "Site Y" },
  { id: 3, clientId: 2, name: "Site Z" },
];

const payrollHistory = [
  {
    id: 1,
    employee: "John Doe",
    clientId: 1,
    siteId: 1,
    amount: 50000,
    date: "2025-09-30",
  },
  {
    id: 2,
    employee: "Jane Smith",
    clientId: 2,
    siteId: 3,
    amount: 60000,
    date: "2025-09-29",
  },
];

export default function PayrollHistoryPage() {
  const [selectedClient, setSelectedClient] = useState<string>("all");
  const [selectedSite, setSelectedSite] = useState<string>("all");

  const filteredSites =
    selectedClient !== "all"
      ? sites.filter((site) => site.clientId === Number(selectedClient))
      : sites;

  const filteredHistory = payrollHistory.filter((record) => {
    const clientMatch =
      selectedClient !== "all" ? record.clientId === Number(selectedClient) : true;
    const siteMatch =
      selectedSite !== "all" ? record.siteId === Number(selectedSite) : true;
    return clientMatch && siteMatch;
  });

  return (
    <MainLayout>
      <div className="space-y-6 px-4 py-8 max-w-5xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payroll History</h1>
          <p className="text-muted-foreground text-sm">
            Filter and view processed payroll data by client and site.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Client</label>
                <Select
                  value={selectedClient}
                  onValueChange={(value) => {
                    setSelectedClient(value);
                    setSelectedSite("all");
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Clients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={String(client.id)}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Site</label>
                <Select
                  value={selectedSite}
                  onValueChange={(value) => setSelectedSite(value)}
                  disabled={selectedClient === "all"}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Sites" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sites</SelectItem>
                    {filteredSites.map((site) => (
                      <SelectItem key={site.id} value={String(site.id)}>
                        {site.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        No records found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredHistory.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.employee}</TableCell>
                        <TableCell>
                          {clients.find((c) => c.id === record.clientId)?.name}
                        </TableCell>
                        <TableCell>
                          {sites.find((s) => s.id === record.siteId)?.name}
                        </TableCell>
                        <TableCell className="text-right">
                          ₹{record.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>{record.date}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
