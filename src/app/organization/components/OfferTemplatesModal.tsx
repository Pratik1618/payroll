"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  CalendarDays,
  FileCheck2,
  X,
  Copy,
} from "lucide-react";
import { getOfferTemplates, OfferTemplate, addOfferTemplate } from "../mock/offerTemplates";
import { toast } from "sonner";

interface OfferTemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate?: (template: OfferTemplate) => void;
}

export function OfferTemplatesModal({
  open,
  onOpenChange,
  onSelectTemplate,
}: OfferTemplatesModalProps) {
  const [templates, setTemplates] = useState<OfferTemplate[]>(() => getOfferTemplates());
  const [selectedTpl, setSelectedTpl] = useState<OfferTemplate | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // New Template Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState<OfferTemplate["category"]>("Standard");
  const [description, setDescription] = useState("");
  const [noticePeriod, setNoticePeriod] = useState("30");
  const [validity, setValidity] = useState("15");

  const refreshTemplates = () => {
    setTemplates([...getOfferTemplates()]);
  };

  const handleSelect = (tpl: OfferTemplate) => {
    toast.success(`Selected template: "${tpl.name}"`);
    if (onSelectTemplate) {
      onSelectTemplate(tpl);
    }
    onOpenChange(false);
  };

  const handleCreateTemplate = () => {
    if (!name.trim()) {
      toast.error("Template Name is required.");
      return;
    }

    addOfferTemplate({
      name: name.trim(),
      category,
      description: description.trim() || "Custom offer letter template.",
      noticePeriodDays: parseInt(noticePeriod) || 30,
      validityDays: parseInt(validity) || 15,
      probationMonths: 6,
      isDefault: false,
      terms: [
        "Standard terms and conditions as specified in this offer template.",
        "Probation and notice period clauses subject to employment contract.",
      ],
    });

    toast.success(`New offer template "${name.trim()}" created successfully!`);
    refreshTemplates();
    setIsCreateOpen(false);
    setName("");
    setDescription("");
  };

  return (
    <>
      {/* Primary shadcn Dialog */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[950px] w-[95vw] max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-xl shadow-2xl border">
          {/* shadcn DialogHeader */}
          <DialogHeader className="px-6 py-4 border-b bg-slate-900 text-white shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-primary/20 text-primary border border-primary/30">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-white">Offer Letter Templates</DialogTitle>
                  <DialogDescription className="text-xs text-slate-300 mt-0.5">
                    Select a standardized template or create custom terms for candidate offer letters.
                  </DialogDescription>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => setIsCreateOpen(true)}
                className="gap-1.5 bg-white hover:bg-slate-100 text-slate-900 font-semibold shadow-sm border-0"
              >
                <Plus className="h-4 w-4 text-slate-900" />
                Create Template
              </Button>
            </div>
          </DialogHeader>

          {/* Body Cards Grid utilizing shadcn Card components */}
          <div className="p-6 grid gap-5 grid-cols-1 md:grid-cols-2 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50">
            {templates.map((tpl) => {
              const isSelected = selectedTpl?.id === tpl.id;

              return (
                <Card
                  key={tpl.id}
                  onClick={() => setSelectedTpl(tpl)}
                  className={`group transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "border-2 border-primary shadow-md bg-primary/[0.02]"
                      : "border border-slate-200 hover:border-slate-300 hover:shadow-sm"
                  }`}
                >
                  <CardHeader className="space-y-3 pb-3">
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 border-slate-200">
                        {tpl.category}
                      </Badge>
                      {tpl.isDefault && (
                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200 text-[10px] font-semibold">
                          <Sparkles className="h-3 w-3 mr-1 text-amber-600" /> Default
                        </Badge>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div>
                      <CardTitle className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors">
                        {tpl.name}
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {tpl.description}
                      </CardDescription>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pb-3 pt-0">
                    {/* Attributes Pill Ribbon */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200/60">
                        <Clock className="h-3 w-3 text-slate-500" />
                        Notice: <strong className="text-slate-900">{tpl.noticePeriodDays} Days</strong>
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200/60">
                        <CalendarDays className="h-3 w-3 text-slate-500" />
                        Validity: <strong className="text-slate-900">{tpl.validityDays} Days</strong>
                      </span>
                      {tpl.probationMonths > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200/60">
                          Probation: <strong className="text-slate-900">{tpl.probationMonths} Mo</strong>
                        </span>
                      )}
                    </div>

                    {/* Terms Snippet */}
                    <div className="pt-2 text-xs text-slate-600 space-y-1">
                      <div className="font-semibold text-[11px] text-slate-800 uppercase tracking-wide">Key Clauses:</div>
                      {tpl.terms.slice(0, 2).map((term, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{term}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>

                  {/* Card Actions Footer */}
                  <CardFooter className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTpl(tpl);
                      }}
                    >
                      View All Terms
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* Selected Template Detailed Terms Drawer */}
          {selectedTpl && (
            <div className="mx-6 my-2 p-4 border rounded-xl bg-slate-100/80 space-y-2 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="h-4 w-4 text-primary" />
                  <span className="font-bold text-sm text-slate-900">Selected Terms: {selectedTpl.name}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedTpl(null)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs text-slate-700 pt-1">
                {selectedTpl.terms.map((t, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 bg-white p-2 rounded border border-slate-200/80">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer */}
          <DialogFooter className="px-6 py-3 border-t bg-white shrink-0 flex items-center justify-between">
            <div className="text-xs text-slate-500 hidden sm:block">
              {templates.length} template(s) available
            </div>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create New Template Modal with shadcn Select & Inputs */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Create Offer Letter Template</DialogTitle>
            <DialogDescription className="text-xs">
              Define custom terms, notice periods, and validity for standard hiring offers.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-3 text-sm">
            <div className="grid gap-2">
              <Label htmlFor="tplName">Template Name *</Label>
              <Input
                id="tplName"
                placeholder="e.g. Senior Tech Lead Offer"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="tplCategory">Category</Label>
                <Select
                  value={category}
                  onValueChange={(val) => setCategory(val as OfferTemplate["category"])}
                >
                  <SelectTrigger id="tplCategory">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Executive">Executive</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tplNotice">Notice Period (Days)</Label>
                <Input
                  id="tplNotice"
                  type="number"
                  value={noticePeriod}
                  onChange={(e) => setNoticePeriod(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tplValid">Validity Duration (Days)</Label>
              <Input
                id="tplValid"
                type="number"
                value={validity}
                onChange={(e) => setValidity(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tplDesc">Description</Label>
              <Textarea
                id="tplDesc"
                placeholder="Brief description of when to use this offer template..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTemplate}>Save Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
