"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { organizationData } from "../mock/organization";
import { designations } from "../mock/designations";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Document, Page, Text, View, pdf } from '@react-pdf/renderer';
import { SalaryComp, DEFAULT_COMPONENTS } from "../types/salary";
import { useSalaryEngine } from "../hooks/useSalaryEngine";
import { SalaryStructureBuilder } from "./SalaryStructureBuilder";

interface GenerateOfferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GenerateOfferModal({ open, onOpenChange }: GenerateOfferModalProps) {
  const [step, setStep] = useState(1);
  
  // Step 1: Details
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [designation, setDesignation] = useState("");
  const [departmentId, setDepartmentId] = useState("");

  const [components, setComponents] = useState<SalaryComp[]>(DEFAULT_COMPONENTS);
  
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Reset form
  useEffect(() => {
    if (open) {
      setStep(1);
      setCandidateName("");
      setCandidateEmail("");
      setDesignation("");
      setDepartmentId("");
      setComponents(DEFAULT_COMPONENTS);
    }
  }, [open]);

  const departments = useMemo(() => organizationData[0]?.children || [], []);
  const deptName = departments.find(d => d.id === departmentId)?.name || "TBD";

  // Calculations Engine
  const calculations = useSalaryEngine(components);

  const handleNext = () => {
    if (step === 1) {
      if (!candidateName || !candidateEmail || !designation || !departmentId) {
        toast.error("Please fill in all candidate details.");
        return;
      }
      if (!/^\S+@\S+\.\S+$/.test(candidateEmail)) {
        toast.error("Please enter a valid email address.");
        return;
      }
    }
    setStep(s => s + 1);
  };

  const handleSendOffer = async () => {
    setIsGeneratingPdf(true);
    toast.info("Generating PDF, please wait...");
    
    try {
      const MyDocument = (
        <Document>
          <Page size="A4" style={{ padding: 40, fontFamily: 'Helvetica', fontSize: 11, color: '#334155' }}>
            <View style={{ marginBottom: 30 }}>
              <Text style={{ textAlign: 'right', color: '#64748b', fontSize: 10 }}>Date: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
            </View>
            
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontFamily: 'Helvetica-Bold' }}>To,</Text>
              <Text>{candidateName}</Text>
              <Text style={{ color: '#64748b' }}>{candidateEmail}</Text>
            </View>
            
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontFamily: 'Helvetica-Bold', textDecoration: 'underline' }}>Subject: Offer of Employment</Text>
            </View>
            
            <View style={{ marginBottom: 30, lineHeight: 1.5 }}>
              <Text>Dear {candidateName.split(' ')[0]},</Text>
              <Text>{"\n"}We are pleased to offer you the position of {designation} in the {deptName} department at our organization. Your Annual Cost to Company (CTC) will be Rs. {calculations.computedCTC.toLocaleString("en-IN")}.</Text>
              <Text>{"\n"}Please find the detailed salary structure attached in Annexure A. We look forward to welcoming you to the team.</Text>
              <Text>{"\n\n"}Sincerely,</Text>
              <Text style={{ fontFamily: 'Helvetica-Bold' }}>Human Resources</Text>
            </View>

            {/* Annexure Table */}
            <View break>
              <View style={{ backgroundColor: '#0f172a', padding: 8, borderTopLeftRadius: 4, borderTopRightRadius: 4 }}>
                <Text style={{ color: 'white', textAlign: 'center', fontFamily: 'Helvetica-Bold', fontSize: 12 }}>Annexure A: Salary Structure</Text>
              </View>
              
              <View style={{ flexDirection: 'row', backgroundColor: '#f8fafc', padding: 8, borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                <Text style={{ width: '40%', fontFamily: 'Helvetica-Bold' }}>Salary Component</Text>
                <Text style={{ width: '30%', textAlign: 'right', fontFamily: 'Helvetica-Bold' }}>Monthly (Rs)</Text>
                <Text style={{ width: '30%', textAlign: 'right', fontFamily: 'Helvetica-Bold' }}>Annual (Rs)</Text>
              </View>

              {/* Earnings */}
              <View style={{ backgroundColor: '#f1f5f9', padding: 4, paddingHorizontal: 8, borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#64748b' }}>EARNINGS</Text>
              </View>
              
              {calculations.calculatedComponents.filter(c => c.type === 'earning').map(c => (
                <View key={c.id} style={{ flexDirection: 'row', padding: 8, borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                  <Text style={{ width: '40%' }}>{c.name}</Text>
                  <Text style={{ width: '30%', textAlign: 'right' }}>{c.monthlyVal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</Text>
                  <Text style={{ width: '30%', textAlign: 'right' }}>{c.annualVal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</Text>
                </View>
              ))}

              <View style={{ flexDirection: 'row', backgroundColor: '#f0fdf4', padding: 8, borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                <Text style={{ width: '40%', fontFamily: 'Helvetica-Bold', color: '#166534' }}>Gross Earnings (A)</Text>
                <Text style={{ width: '30%', textAlign: 'right', fontFamily: 'Helvetica-Bold', color: '#166534' }}>{calculations.grossMonthly.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</Text>
                <Text style={{ width: '30%', textAlign: 'right', fontFamily: 'Helvetica-Bold', color: '#166534' }}>{calculations.totalEarnings.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</Text>
              </View>

              {/* Deductions */}
              {calculations.calculatedComponents.filter(c => c.type === 'deduction').length > 0 && (
                <>
                  <View style={{ backgroundColor: '#f1f5f9', padding: 4, paddingHorizontal: 8, borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                    <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#64748b' }}>EMPLOYEE DEDUCTIONS</Text>
                  </View>
                  {calculations.calculatedComponents.filter(c => c.type === 'deduction').map(c => (
                    <View key={c.id} style={{ flexDirection: 'row', padding: 8, borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                      <Text style={{ width: '40%', color: '#b91c1c' }}>{c.name}</Text>
                      <Text style={{ width: '30%', textAlign: 'right', color: '#b91c1c' }}>{c.monthlyVal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</Text>
                      <Text style={{ width: '30%', textAlign: 'right', color: '#b91c1c' }}>{c.annualVal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</Text>
                    </View>
                  ))}
                  <View style={{ flexDirection: 'row', backgroundColor: '#fef2f2', padding: 8, borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                    <Text style={{ width: '40%', fontFamily: 'Helvetica-Bold', color: '#991b1b' }}>Total Deductions (B)</Text>
                    <Text style={{ width: '30%', textAlign: 'right', fontFamily: 'Helvetica-Bold', color: '#991b1b' }}>{(calculations.totalDeductions / 12).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</Text>
                    <Text style={{ width: '30%', textAlign: 'right', fontFamily: 'Helvetica-Bold', color: '#991b1b' }}>{calculations.totalDeductions.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</Text>
                  </View>
                </>
              )}

              {/* Net Pay */}
              <View style={{ flexDirection: 'row', backgroundColor: '#2563eb', padding: 12, borderLeft: '1px solid #2563eb', borderRight: '1px solid #2563eb', borderBottom: '1px solid #2563eb' }}>
                <Text style={{ width: '40%', fontFamily: 'Helvetica-Bold', color: 'white', fontSize: 12 }}>Net Take-Home (A - B)</Text>
                <Text style={{ width: '30%', textAlign: 'right', fontFamily: 'Helvetica-Bold', color: 'white', fontSize: 12 }}>{calculations.netMonthly.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</Text>
                <Text style={{ width: '30%', textAlign: 'right', fontFamily: 'Helvetica-Bold', color: 'white', fontSize: 12 }}>{(calculations.totalEarnings - calculations.totalDeductions).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</Text>
              </View>

              {/* Employer Contributions */}
              {calculations.calculatedComponents.filter(c => c.type === 'employer_contribution').length > 0 && (
                <>
                  <View style={{ backgroundColor: '#f1f5f9', padding: 4, paddingHorizontal: 8, borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                    <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#64748b' }}>EMPLOYER CONTRIBUTIONS</Text>
                  </View>
                  {calculations.calculatedComponents.filter(c => c.type === 'employer_contribution').map(c => (
                    <View key={c.id} style={{ flexDirection: 'row', padding: 8, borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                      <Text style={{ width: '40%', color: '#1d4ed8' }}>{c.name}</Text>
                      <Text style={{ width: '30%', textAlign: 'right', color: '#1d4ed8' }}>{c.monthlyVal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</Text>
                      <Text style={{ width: '30%', textAlign: 'right', color: '#1d4ed8' }}>{c.annualVal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</Text>
                    </View>
                  ))}
                </>
              )}

              {/* CTC */}
              <View style={{ flexDirection: 'row', backgroundColor: '#0f172a', padding: 12, borderBottomLeftRadius: 4, borderBottomRightRadius: 4 }}>
                <Text style={{ width: '40%', fontFamily: 'Helvetica-Bold', color: 'white', fontSize: 12 }}>Total CTC</Text>
                <Text style={{ width: '30%', textAlign: 'right', fontFamily: 'Helvetica-Bold', color: 'white', fontSize: 12 }}>{(calculations.computedCTC / 12).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</Text>
                <Text style={{ width: '30%', textAlign: 'right', fontFamily: 'Helvetica-Bold', color: 'white', fontSize: 12 }}>{calculations.computedCTC.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</Text>
              </View>
            </View>
          </Page>
        </Document>
      );

      const blob = await pdf(MyDocument).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${candidateName.replace(/\s+/g, '_') || 'Candidate'}_Offer_Letter.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success(`Offer Letter Generated & Sent to ${candidateEmail}!`);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1200px] sm:max-w-[1200px] w-[95vw] h-[90vh] p-0 overflow-hidden flex flex-col bg-slate-50">
        <DialogHeader className="px-6 py-4 border-b bg-white shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">Generate Offer Letter</DialogTitle>
              <DialogDescription className="text-base mt-1">
                Step {step} of 3: {step === 1 ? "Candidate Details" : step === 2 ? "Advanced Salary Structure" : "Preview & Send"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden relative">
          {/* STEP 1: Details */}
          {step === 1 && (
            <div className="h-full px-6 py-8 overflow-y-auto custom-scrollbar">
              <div className="max-w-2xl mx-auto space-y-8 bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                <div>
                  <h3 className="text-lg font-semibold mb-6">Candidate Information</h3>
                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Full Name</Label>
                      <Input value={candidateName} onChange={e => setCandidateName(e.target.value)} placeholder="e.g. Sarah Jenkins" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Email Address</Label>
                      <Input type="email" value={candidateEmail} onChange={e => setCandidateEmail(e.target.value)} placeholder="sarah.j@example.com" className="h-11" />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-6">Role Details</h3>
                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Job Title / Designation</Label>
                      <Select value={designation} onValueChange={setDesignation}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select Designation" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[250px]">
                          {designations.map(d => (
                            <SelectItem key={d} value={d}>{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Proposed Department</Label>
                      <Select value={departmentId} onValueChange={setDepartmentId}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select Department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map(d => (
                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Salary Structure (70/30 Split) */}
          {step === 2 && (
            <SalaryStructureBuilder 
              components={components} 
              onChange={setComponents} 
              calculations={calculations} 
            />
          )}

          {/* STEP 3: Preview */}
          {step === 3 && (
            <div className="h-full px-6 py-6 overflow-y-auto custom-scrollbar">
              <div className="max-w-4xl mx-auto space-y-8">
                {/* Offer Letter Text */}
                <div className="p-10 border rounded-xl bg-white shadow-sm text-base font-serif leading-relaxed">
                  <div className="text-right text-slate-500 mb-8">Date: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  <div className="mb-8">
                    <strong>To,</strong><br />
                    {candidateName}<br />
                    <span className="text-slate-500">{candidateEmail}</span><br />
                  </div>
                  <div className="mb-6 font-bold underline text-lg">Subject: Offer of Employment</div>
                  <div className="mb-8">
                    Dear {candidateName.split(' ')[0]},<br /><br />
                    We are pleased to offer you the position of <strong>{designation}</strong> in the <strong>{deptName}</strong> department at our organization. 
                    Your Annual Cost to Company (CTC) will be <strong>₹{calculations.computedCTC.toLocaleString("en-IN")}</strong>.
                    <br /><br />
                    Please find the detailed salary structure attached in Annexure A. We look forward to welcoming you to the team.
                    <br /><br />
                    Sincerely,<br />
                    <strong>Human Resources</strong>
                  </div>
                </div>

                {/* Annexure Table */}
                <Card className="shadow-sm overflow-hidden border-slate-200 bg-white">
                  <div className="bg-slate-900 text-white p-4 text-center font-bold text-lg">Annexure A: Salary Structure</div>
                  <div className="grid grid-cols-3 font-semibold p-4 bg-slate-50 border-b text-slate-600">
                    <div>Salary Component</div>
                    <div className="text-right">Monthly (₹)</div>
                    <div className="text-right">Annual (₹)</div>
                  </div>
                  
                  {/* Earnings List */}
                  <div className="bg-slate-100 p-2 px-4 font-bold text-xs text-slate-500 uppercase tracking-wider border-b">Earnings</div>
                  {calculations.calculatedComponents.filter(c => c.type === 'earning').map(c => (
                    <div key={c.id} className="grid grid-cols-3 p-3 px-4 border-b text-sm hover:bg-slate-50">
                      <div className="font-medium text-slate-700">{c.name}</div>
                      <div className="text-right text-slate-600">{c.monthlyVal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
                      <div className="text-right text-slate-600">{c.annualVal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
                    </div>
                  ))}
                  
                  {/* Gross Earnings */}
                  <div className="grid grid-cols-3 p-4 border-b bg-green-50 font-bold text-green-800 text-base">
                    <div>Gross Earnings (A)</div>
                    <div className="text-right">{calculations.grossMonthly.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
                    <div className="text-right">{calculations.totalEarnings.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
                  </div>

                  {/* Employee Deductions List */}
                  <div className="bg-slate-100 p-2 px-4 font-bold text-xs text-slate-500 uppercase tracking-wider border-b">Employee Deductions</div>
                  {calculations.calculatedComponents.filter(c => c.type === 'deduction').map(c => (
                    <div key={c.id} className="grid grid-cols-3 p-3 px-4 border-b text-sm text-red-700 hover:bg-red-50/50">
                      <div className="font-medium">{c.name}</div>
                      <div className="text-right">{c.monthlyVal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
                      <div className="text-right">{c.annualVal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
                    </div>
                  ))}

                  {/* Total Deductions */}
                  {calculations.calculatedComponents.filter(c => c.type === 'deduction').length > 0 && (
                    <div className="grid grid-cols-3 p-4 border-b bg-red-50 font-bold text-red-800 text-base">
                      <div>Total Deductions (B)</div>
                      <div className="text-right">{(calculations.totalDeductions / 12).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
                      <div className="text-right">{calculations.totalDeductions.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
                    </div>
                  )}

                  {/* Net Pay */}
                  <div className="grid grid-cols-3 p-5 bg-blue-600 text-white font-bold text-xl">
                    <div>Net Take-Home Pay (A - B)</div>
                    <div className="text-right">₹{calculations.netMonthly.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
                    <div className="text-right">₹{(calculations.totalEarnings - calculations.totalDeductions).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
                  </div>

                  {/* Employer Contributions List */}
                  <div className="bg-slate-100 p-2 px-4 font-bold text-xs text-slate-500 uppercase tracking-wider border-b">Employer Contributions</div>
                  {calculations.calculatedComponents.filter(c => c.type === 'employer_contribution').map(c => (
                    <div key={c.id} className="grid grid-cols-3 p-3 px-4 border-b text-sm text-blue-800 hover:bg-blue-50/50">
                      <div className="font-medium">{c.name}</div>
                      <div className="text-right">{c.monthlyVal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
                      <div className="text-right">{c.annualVal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
                    </div>
                  ))}
                  
                  {/* Total CTC */}
                  <div className="grid grid-cols-3 p-5 bg-slate-900 text-white font-bold text-lg">
                    <div>Total Cost to Company (CTC)</div>
                    <div className="text-right">₹{(calculations.computedCTC / 12).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
                    <div className="text-right">₹{calculations.computedCTC.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-white shrink-0 items-center justify-between sm:justify-between w-full">
          <div className="text-sm text-slate-500">
            {step === 2 && <span>Ensure formulas resolve correctly before proceeding.</span>}
          </div>
          <div className="flex gap-3">
            {step > 1 && (
              <Button variant="outline" className="px-6 shadow-sm" onClick={() => setStep(s => s - 1)}>Back</Button>
            )}
            {step < 3 ? (
              <Button className="px-8 shadow-sm bg-blue-600 hover:bg-blue-700" onClick={handleNext}>Next Step</Button>
            ) : (
              <Button className="px-8 shadow-md bg-green-600 hover:bg-green-700" onClick={handleSendOffer} disabled={isGeneratingPdf}>
                {isGeneratingPdf ? 'Generating PDF...' : 'Generate & Send Offer Letter'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
