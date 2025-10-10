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
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Eye } from "lucide-react";
import { PayslipViewer } from "@/components/ui/payroll-History/payslip-viewer";

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



// Now payrollHistory with detailed employee info for payslip
const payrollHistory = [
  {
    id: 1,
    employee: {
      name: "John Doe",
      designation: "HK",
      department: "Housekeeping",
      site: "Site X",
      pan: "ABCDE1234F",
      uan: "100200300",
      esic: "1234567890",
      joiningDate: "2022-01-15"
    },
    clientId: 1,
    siteId: 1,
    amount: 50000,
    date: "2025-10-01",
    salary: {
      basic: 20000,
      hra: 8000,
      da: 5000,
      conveyance: 2000,
      medical: 1500,
      others: 1500,
      deductions: 5000,
    
     
    }
   
  },
  {
    id: 2,
    employee: {
      name: "Jane Smith",
      designation: "Supervisor",
      department: "Management",
      site: "Site Z",
      pan: "XYZAB5678C",
      uan: "200300400",
      esic: "0987654321",
      joiningDate: "2020-03-20"
    },
    clientId: 2,
    siteId: 3,
    amount: 60000,
    date: "2025-10-05",
    salary: {
      basic: 25000,
      hra: 9000,
      da: 6000,
      conveyance: 2500,
      medical: 2000,
      others: 1500,
      deductions: 6000,
      netPay: 60000
    }
  },
  // Add more records with similar structure
];



// Fixed designations
const designations = ["HK", "Supervisor", "Janitor", "Chambermaid"];

// Month options (manually define or generate)
const months = [
  { label: "September 2025", value: "2025-09" },
  { label: "October 2025", value: "2025-10" },
  { label: "November 2025", value: "2025-11" },
];

export default function PayrollHistoryPage() {
  const [selectedClient, setSelectedClient] = useState<string>("all");
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("2025-10");
const [searchTerm, setSearchTerm] = useState<string>("");
const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const filteredSites =
    selectedClient !== "all"
      ? sites.filter((site) => site.clientId === Number(selectedClient))
      : sites;


const filteredHistory = payrollHistory.filter((record) => {
  const clientMatch =
    selectedClient !== "all" ? record.clientId === Number(selectedClient) : true;
  const siteMatch =
    selectedSite !== "all" ? record.siteId === Number(selectedSite) : true;
  const monthMatch = record.date.startsWith(selectedMonth);
  const searchMatch = record.employee.name.toLowerCase().includes(searchTerm.toLowerCase());

  return clientMatch && siteMatch && monthMatch && searchMatch;
});


  // Count by designation
  const designationSummary: Record<string, number> = {};
  designations.forEach((des) => {
    designationSummary[des] = filteredHistory.filter((rec) => rec.employee.designation === des).length;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
         <div>
          <h1 className="text-3xl font-bold tracking-tight">Payroll History</h1>
          <p className="text-muted-foreground text-sm">
            Filter and view processed payroll data by client, site, and month.
          </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Client Filter */}
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

              {/* Site Filter */}
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

              {/* Month Filter */}
              <div>
                <label className="block text-sm font-medium mb-1">Month</label>
                <Select
                  value={selectedMonth}
                  onValueChange={(value) => setSelectedMonth(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Designation Summary */}
        <Card>
          <CardContent className="p-6">
          

            <h2 className="text-xl font-semibold mb-4">Designation Summary</h2>
            {filteredHistory.length === 0 ? (
              <p className="text-muted-foreground">No data to display.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {designations.map((designation) => (
                  <div
                    key={designation}
                    className="bg-gray-100 rounded-md p-4 flex items-center justify-between"
                  >
                    <span className="font-medium">{designation}</span>
                    <span className="text-sm text-muted-foreground">
                      {designationSummary[designation]} employee(s)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detailed Table */}
        <Card>
          <CardContent className="p-0">
              <div className="flex justify-end mb-4">
  <Input
    type="text"
    placeholder="Search employee..."
    className="w-full max-w-sm"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
</div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead >Action</TableHead>

                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        No records found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredHistory.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.employee.name}</TableCell>
                        <TableCell>{record.employee.designation}</TableCell>
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
                        <TableCell className="text-center">
 <Eye
    className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer"
    onClick={() => setSelectedRecord(record)}
  /></TableCell>

                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      {selectedRecord && (
  <PayslipViewer
    employeeId={selectedRecord.id}
    record={selectedRecord}
  month={selectedMonth}
  onClose={() => setSelectedRecord(null)}
  />
)}
    </MainLayout>
  );
}
