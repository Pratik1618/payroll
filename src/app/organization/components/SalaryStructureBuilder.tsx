"use client";

import { SalaryComp, ComponentType, CalcType, SalaryCalculations } from "../types/salary";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Trash2, Plus, ChevronDown, Wallet, Shield, Building2 } from "lucide-react";

interface SalaryStructureBuilderProps {
  components: SalaryComp[];
  onChange: (components: SalaryComp[]) => void;
  calculations: SalaryCalculations;
}

export function SalaryStructureBuilder({ components, onChange, calculations }: SalaryStructureBuilderProps) {
  const addComponent = (type: ComponentType) => {
    onChange([...components, {
      id: "comp_" + Math.random().toString(36).substr(2, 9),
      name: `New ${type.replace('_', ' ')}`,
      type,
      calcType: 'fixed',
      value: 0,
      formulaBaseIds: []
    }]);
  };

  const updateComponent = (id: string, field: keyof SalaryComp, value: any) => {
    onChange(components.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const toggleFormulaBase = (compId: string, baseId: string) => {
    onChange(components.map(c => {
      if (c.id === compId) {
        const has = c.formulaBaseIds.includes(baseId);
        return { 
          ...c, 
          formulaBaseIds: has 
            ? c.formulaBaseIds.filter(id => id !== baseId)
            : [...c.formulaBaseIds, baseId]
        };
      }
      return c;
    }));
  };

  const removeComponent = (id: string) => {
    onChange(components.filter(c => c.id !== id));
  };

  const renderComponentSection = (type: ComponentType, title: string, Icon: any, badgeClass: string) => (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-lg ${badgeClass.replace('bg-', 'bg-opacity-20 bg-').replace('text-white', badgeClass.includes('green') ? 'text-green-600' : badgeClass.includes('red') ? 'text-red-600' : 'text-blue-600')}`}>
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
        <Badge className={`${badgeClass} ml-2 font-medium`}>{components.filter(c => c.type === type).length}</Badge>
      </div>
      
      <div className="space-y-5">
        <>
          {components.filter(c => c.type === type).length === 0 && (
            <div className="text-sm text-slate-500 italic p-4 border border-dashed rounded-xl">
              No {title.toLowerCase()} added yet.
            </div>
          )}
          {components.filter(c => c.type === type).map(comp => (
            <div key={comp.id}>
              <Card className={`overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 ${calculations.unresolvedComps.some(u => u.id === comp.id) ? 'border-red-300 bg-red-50/30' : 'bg-white'}`}>
                <CardHeader className="py-3 px-4 border-b bg-slate-50/50 flex flex-row items-center justify-between">
                  <Input 
                    value={comp.name} 
                    onChange={e => updateComponent(comp.id, 'name', e.target.value)} 
                    className="h-8 w-1/2 font-semibold text-base bg-transparent border-transparent hover:border-slate-300 focus:border-slate-300 focus:bg-white shadow-none px-2 -ml-2" 
                  />
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 transition-colors" onClick={() => removeComponent(comp.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Calculation Type */}
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-500 font-medium">Calculation Type</Label>
                      <Select value={comp.calcType} onValueChange={val => updateComponent(comp.id, 'calcType', val)}>
                        <SelectTrigger className="shadow-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">Fixed Amount</SelectItem>
                          <SelectItem value="formula">Formula Based</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Value */}
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-500 font-medium">Value {comp.calcType === 'formula' && '(%)'}</Label>
                      <Input type="number" value={comp.value || ""} onChange={e => updateComponent(comp.id, 'value', Number(e.target.value))} className="shadow-sm" />
                    </div>

                    {/* Applied On (Only for Formula) */}
                    <div className="space-y-2">
                      {comp.calcType === 'formula' ? (
                        <>
                          <Label className="text-xs text-slate-500 font-medium">Applied On</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-between shadow-sm">
                                {comp.formulaBaseIds.length > 0 
                                  ? `${comp.formulaBaseIds.length} Component${comp.formulaBaseIds.length > 1 ? 's' : ''}` 
                                  : "Select Base"}
                                <ChevronDown className="w-4 h-4 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[240px] p-3" align="start">
                              <div className="space-y-3">
                                <h4 className="font-semibold text-sm text-slate-900 border-b pb-2">Select Base Components</h4>
                                <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                                  {components.filter(c => c.id !== comp.id).map(c => (
                                    <div key={c.id} className="flex items-center space-x-2">
                                      <Checkbox 
                                        id={`base-${comp.id}-${c.id}`} 
                                        checked={comp.formulaBaseIds.includes(c.id)}
                                        onCheckedChange={() => toggleFormulaBase(comp.id, c.id)}
                                      />
                                      <label htmlFor={`base-${comp.id}-${c.id}`} className="text-sm font-medium leading-none cursor-pointer">
                                        {c.name || 'Unnamed'}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </>
                      ) : (
                        <div className="hidden md:block"></div>
                      )}
                    </div>

                    {/* Monthly Computed Amount */}
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-500 font-medium">Monthly Amount</Label>
                      <div className="h-10 flex items-center px-3 border rounded-md bg-slate-50 font-semibold text-slate-900 shadow-sm overflow-hidden">
                        {type === 'deduction' ? '-' : ''}₹{calculations.calculatedComponents.find(c => c.id === comp.id)?.monthlyVal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </>
        
        <Button variant="outline" className="border-dashed w-full text-slate-500 hover:text-slate-900 bg-transparent hover:bg-slate-50" onClick={() => addComponent(type)}>
          <Plus className="w-4 h-4 mr-2" />
          Add {title} Component
        </Button>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col lg:flex-row">
      {/* Left Column - Components */}
      <div className="flex-1 px-6 py-6 border-r border-slate-200 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto pr-4">
          {calculations.unresolvedComps.length > 0 && (
            <div className="p-4 mb-6 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200 flex items-center shadow-sm">
              <Shield className="w-5 h-5 mr-3 shrink-0" />
              <strong>Warning: Circular dependency detected. Some formulas could not be resolved.</strong>
            </div>
          )}

          {renderComponentSection('earning', 'Earnings', Wallet, 'bg-green-600 text-white')}
          {renderComponentSection('deduction', 'Employee Deductions', Shield, 'bg-red-600 text-white')}
          {renderComponentSection('employer_contribution', 'Employer Contributions', Building2, 'bg-blue-600 text-white')}
        </div>
      </div>

      {/* Right Column - Sticky Summary */}
      <div className="w-full lg:w-[400px] bg-slate-50 shrink-0 border-t lg:border-t-0 p-6 flex flex-col">
        <div className="sticky top-0">
          <Card className="shadow-lg border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-4">
              <h3 className="text-lg font-semibold">Salary Summary</h3>
              <p className="text-slate-400 text-sm">Monthly breakdown</p>
            </div>
            
            <CardContent className="p-0">
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Gross Earnings</span>
                  <span className="text-lg font-semibold text-slate-900">₹{calculations.grossMonthly.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Employee Deductions</span>
                  <span className="text-lg font-semibold text-red-600">-₹{(calculations.totalDeductions / 12).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                </div>
              </div>

              <div className="bg-blue-50/50 p-5 border-y border-slate-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-blue-900 font-bold text-lg">Net Take-Home</span>
                  <span className="text-3xl font-bold text-blue-700">₹{calculations.netMonthly.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                </div>
                <p className="text-xs text-blue-600/70 text-right">Amount transferred to bank / month</p>
              </div>

              <div className="p-5 space-y-4 bg-slate-50">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium text-sm">Employer Contributions</span>
                  <span className="text-base font-semibold text-slate-700">₹{(calculations.totalEmployer / 12).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-slate-700 font-bold">Total Cost to Company</span>
                  <span className="text-xl font-bold text-slate-900">₹{(calculations.computedCTC / 12).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
