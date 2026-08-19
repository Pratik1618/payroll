  "use client"

  import { useState, useEffect, useRef } from "react"
  import { MainLayout } from "@/components/ui/layout/main-layout"
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
  import { Button } from "@/components/ui/button"
  import { Badge } from "@/components/ui/badge"
  import { Stepper } from "@/components/ui/stepper"
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
  import { Upload, Lock, Copy, AlertTriangle, CheckCircle, Calendar, ChevronDown } from "lucide-react"
  import { SalaryHoldModal } from "@/components/ui/payroll/salary-hold-modal"
  import { toast } from "sonner"
  import { SitesDropdown } from "@/components/ui/sites-dropdown"
  import * as XLSX from 'xlsx';
  import { withBasePath } from "@/lib/base-path"
  import { useClients, useClientSites } from "@/hooks/use-shared-master-data"
  import { generateMonthOptions, formatMonthLabel } from "@/utils/month-utility"

  interface BranchOption {
    id: string
    name: string
  }

  const initialPayrollSteps = [
    {
      id: 1,
      title: "Import Attendance",
      description: "Select client & sites, sync attendance",
      completed: false,
      current: false,
    },
    {
      id: 2,
      title: "Calculate Payroll",
      description: "Process salary based on attendance",
      completed: false,
      current: false,
    },
    { id: 3, title: "Review & Approve", description: "Validate payroll calculations", completed: false, current: false },
    { id: 4, title: "Lock Payroll", description: "Finalize and lock", completed: false, current: false },
  ]

  const mockClients = [
    { id: "client-1", name: "ABC Corporation", sites: ["site-a", "site-b"] },
    { id: "client-2", name: "XYZ Industries", sites: ["site-c", "site-d"] },
    { id: "client-3", name: "Global Tech", sites: ["site-e"] },
  ]

  const mockSites = [
    { id: "site-a", name: "Corporate Office", employees: 450, clientId: "client-1", branchId: "branch-1" },
    { id: "site-b", name: "Manufacturing Unit", employees: 520, clientId: "client-1", branchId: "branch-2" },
    { id: "site-c", name: "Warehouse", employees: 277, clientId: "client-2", branchId: "branch-1" },
    { id: "site-d", name: "Distribution Center", employees: 180, clientId: "client-2", branchId: "branch-3" },
    { id: "site-e", name: "Tech Hub", employees: 320, clientId: "client-3", branchId: "branch-2" },
  ]

  // added: branches (states) list
  const fallbackBranches: BranchOption[] = [
    { id: "branch-1", name: "Gujarat" },
    { id: "branch-2", name: "Maharashtra" },
    { id: "branch-3", name: "Karnataka" },
    { id: "branch-4", name: "Tamil Nadu" },
  ]

  const payrollMonthOptions = generateMonthOptions(2025, 2031)

  // add an initial payroll-data constant for easy reset
  const initialPayrollData = {
    totalEmployees: 0,
    grossPayroll: 0,
    overtimeHours: 0,
    ismartOt: 0,
    clientOt: 0,
    onHold: 0,
    attendanceImported: false,
    payrollCalculated: false,
    reviewCompleted: false,
    payrollLocked: false,
  }

  export default function PayrollPage() {
    const { clients } = useClients(mockClients as any)
    const [currentStep, setCurrentStep] = useState(1)
    const [payrollSteps, setPayrollSteps] = useState(initialPayrollSteps)
    const [isProcessing, setIsProcessing] = useState(false)
    const [showVariableUpload, setShowVariableUpload] = useState(false)
    const [showSalaryHold, setShowSalaryHold] = useState(false)
    const [showCloneSite, setShowCloneSite] = useState(false)

    const [selectedClient, setSelectedClient] = useState("")
    const [selectedClients, setSelectedClients] = useState<string[]>([]) // when branch selected: multi-client selection
    const [selectedSites, setSelectedSites] = useState<string[]>([])
    const [selectedPayrollMonth, setSelectedPayrollMonth] = useState("")
    const [selectedBranch, setSelectedBranch] = useState<string>("") // new: branch/state selection
    
    // Fetch sites for single client selection
    const { sites: apiSites, isLoading: isSitesLoading } = useClientSites(selectedClient, mockSites)

    const [clientDropdownOpen, setClientDropdownOpen] = useState(false)
    const [clientSearch, setClientSearch] = useState("")
    const clientDropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target as Node)) {
          setClientDropdownOpen(false)
        }
      }
      if (clientDropdownOpen) {
        document.addEventListener("mousedown", handleClickOutside)
      }
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [clientDropdownOpen])

    const [branches, setBranches] = useState<BranchOption[]>(fallbackBranches)
    const [attendanceData, setAttendanceData] = useState<any[]>([])
    const [mergedData, setMergedData] = useState<any[]>([]);
    const [finalSalary, setFinalSalary] = useState<any[]>([])
    const [payrollCalculations, setPayrollCalculations] = useState<any[]>([])

    // Real payroll-run wizard state (POST /api/payroll/run -> calculate -> review -> lock)
    const [payrollRunId, setPayrollRunId] = useState<string>("")
    const [runSummary, setRunSummary] = useState<any>(null)

    // use the shared initialPayrollData
    const [payrollData, setPayrollData] = useState(initialPayrollData)

    const [pendingLeavesCount, setPendingLeavesCount] = useState(0)
    const [overridePendingLeaves, setOverridePendingLeaves] = useState(false)
    const [overrideReason, setOverrideReason] = useState("")
    const [salaryStructure, setSalaryStructure] = useState([]);
    useEffect(() => {
      fetch(withBasePath("/salary_structure.json"))
        .then(res => res.json())
        .then(data => {
          console.log("Salary JSON Loaded:", data);
          setSalaryStructure(data);
        })
        .catch(err => console.error("Error loading JSON:", err));
    }, []);

    useEffect(() => {
      const normalizeBranches = (payload: any): BranchOption[] => {
        const rawList = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload?.results?.data)
              ? payload.results.data
            : Array.isArray(payload?.branches)
              ? payload.branches
              : []

        return rawList
          .map((item: any, index: number) => {
            const name = String(item?.name ?? item?.branchName ?? item?.branch_name ?? "").trim()
            if (!name) return null

            const matchedFallback = fallbackBranches.find(
              (branch) => branch.name.toLowerCase() === name.toLowerCase()
            )

            return {
              id: String(
                matchedFallback?.id ??
                item?.id ??
                item?.branchId ??
                item?.branch_id ??
                `branch-${index + 1}`
              ),
              name,
            }
          })
          .filter(Boolean) as BranchOption[]
      }

      const loadBranches = async () => {
        try {
          const response = await fetch(withBasePath("/api/branches"), {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          })

          if (!response.ok) {
            throw new Error(`Failed to fetch branches: ${response.status}`)
          }

          const data = await response.json()
          const normalizedBranches = normalizeBranches(data)

          if (normalizedBranches.length > 0) {
            setBranches(normalizedBranches)
          } else {
            setBranches(fallbackBranches)
            toast.error("Branches API returned no usable branch records")
          }
        } catch (error) {
          console.error("Error loading branches:", error)
          setBranches(fallbackBranches)
          toast.error("Unable to load branches from API. Showing fallback branches.")
        }
      }

      loadBranches()
    }, [])

    console.log(JSON.stringify(salaryStructure, null, 2))


    useEffect(() => {

      const updatedSteps = payrollSteps.map((step, index) => ({
        ...step,
        completed: index < currentStep - 1,
        current: index === currentStep - 1,
      }))
      setPayrollSteps(updatedSteps)
    }, [currentStep])


    const getAvailableSites = () => {
      // If a branch is selected, show sites under that branch.
      // If selectedClients has values, limit to those clients; otherwise show all clients in branch.
      if (selectedBranch) {
        const sites = mockSites.filter((site) => site.branchId === selectedBranch)
        if (selectedClients.length > 0) {
          return sites.filter((s) => selectedClients.includes(s.clientId))
        }
        return sites
      }

      if (!selectedClient) return []
      
      // Use dynamically fetched sites for the selected client
      return apiSites
    }

    const toggleClientSelection = (clientId: string) => {
      setSelectedClients((prev) => (prev.includes(clientId) ? prev.filter((c) => c !== clientId) : [...prev, clientId]))
    }

    const selectAllBranchClients = (clientIds: string[]) => {
      setSelectedClients(clientIds)
    }

    const processCurrentStep = async () => {
      // If this step's action already succeeded for the current run, don't
      // resubmit it - the backend enforces immutability (no recalculation,
      // no unlock-after-lock), and navigating Previous then re-clicking
      // "Process Step" would otherwise re-POST the same mutating call and
      // surface a confusing "not allowed" error even though the step
      // already completed correctly the first time.
      const alreadyDone =
        (currentStep === 1 && !!payrollRunId && payrollData.attendanceImported) ||
        (currentStep === 2 && payrollData.payrollCalculated) ||
        (currentStep === 4 && payrollData.payrollLocked)

      if (alreadyDone) {
        if (currentStep < payrollSteps.length) {
          setCurrentStep(currentStep + 1)
        }
        return
      }

      setIsProcessing(true)

      try {
        switch (currentStep) {
          case 1: {
            // If branch selected -> bulk run across all sites in that branch.
            if (!selectedBranch && (!selectedClient || selectedSites.length === 0)) {
              toast("Selection Required", {
                description: "Please select a client and at least one site, or select a branch for bulk import.",
                action: {
                  label: "OK",
                  onClick: () => console.log("ok"),
                },
              })
              setIsProcessing(false)
              return
            }

            const runBody = selectedBranch
              ? { month: selectedPayrollMonth, scopeType: "BRANCH", branchId: selectedBranch }
              : { month: selectedPayrollMonth, scopeType: "SITE", clientId: selectedClient, siteIds: selectedSites }

            const runRes = await fetch(withBasePath("/api/payroll/run"), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify(runBody),
            })
            const runJson = await runRes.json()

            if (!runRes.ok) {
              toast.error("Could Not Create Payroll Run", {
                description: runJson?.errors?.[0]?.errorMessage || runJson?.message || `Failed with status ${runRes.status}`,
              })
              setIsProcessing(false)
              return
            }

            const runId = runJson?.results?.runId
            setPayrollRunId(runId)
            setPayrollData((prev) => ({
              ...prev,
              attendanceImported: true,
            }))

            toast("Payroll Run Created", {
              description: selectedBranch
                ? `Run ${runId} created for the selected branch, ${formatMonthLabel(selectedPayrollMonth)}.`
                : `Run ${runId} created for ${selectedSites.length} site(s), ${formatMonthLabel(selectedPayrollMonth)}.`,
              action: {
                label: "OK",
                onClick: () => console.log("ok"),
              },
            })
            break
          }

          case 2: {
            if (!payrollRunId) {
              toast.error("No Payroll Run", { description: "Create a payroll run first." })
              setIsProcessing(false)
              return
            }

            const calcRes = await fetch(withBasePath(`/api/payroll/run/${payrollRunId}/calculate`), {
              method: "POST",
              credentials: "include",
            })
            const calcJson = await calcRes.json()

            if (!calcRes.ok) {
              toast.error("Calculation Failed", {
                description: calcJson?.errors?.[0]?.errorMessage || calcJson?.message || `Failed with status ${calcRes.status}`,
              })
              setIsProcessing(false)
              return
            }

            const calcResults = calcJson?.results || {}
            const employees = calcResults.employees || []
            const summary = calcResults.summary || {}

            setPayrollCalculations(employees)
            setRunSummary(summary)
            setAttendanceData(employees)
            setPayrollData((prev) => ({
              ...prev,
              payrollCalculated: true,
              grossPayroll: summary.totalGross || 0,
              overtimeHours: summary.totalOTHours || 0,
            }))

            toast("Payroll Calculated", {
              description: `Salary calculations completed for ${employees.length} employees. Total gross: ₹${((summary.totalGross || 0) / 100000).toFixed(1)}L`,
              action: {
                label: "OK",
                onClick: () => console.log("ok"),
              },
            })
            break
          }

          case 3: {
            if (!payrollRunId) {
              toast.error("No Payroll Run", { description: "Create and calculate a payroll run first." })
              setIsProcessing(false)
              return
            }

            const reviewRes = await fetch(withBasePath(`/api/payroll/run/${payrollRunId}/review`), {
              method: "GET",
              credentials: "include",
            })
            const reviewJson = await reviewRes.json()

            if (!reviewRes.ok) {
              toast.error("Review Failed", {
                description: reviewJson?.errors?.[0]?.errorMessage || reviewJson?.message || `Failed with status ${reviewRes.status}`,
              })
              setIsProcessing(false)
              return
            }

            const reviewResults = reviewJson?.results || {}
            setPayrollCalculations(reviewResults.employees || [])
            setRunSummary(reviewResults.summary || {})
            setPayrollData((prev) => ({ ...prev, reviewCompleted: true }))
            toast("Review Completed", {
              description: "Payroll data has been reviewed and approved.",
              action: {
                label: "OK",
                onClick: () => console.log("ok"),
              },
            })
            break
          }

          case 4: {
            if (!payrollRunId) {
              toast.error("No Payroll Run", { description: "Create, calculate and review a payroll run first." })
              setIsProcessing(false)
              return
            }

            const lockRes = await fetch(withBasePath(`/api/payroll/run/${payrollRunId}/lock`), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ confirmed: true }),
            })
            const lockJson = await lockRes.json()

            if (!lockRes.ok) {
              toast.error("Lock Failed", {
                description: lockJson?.errors?.[0]?.errorMessage || lockJson?.message || `Failed with status ${lockRes.status}`,
              })
              setIsProcessing(false)
              return
            }

            setPayrollData((prev) => ({ ...prev, payrollLocked: true }))
            toast("Payroll Locked", {
              description: "Payroll has been finalized and locked for processing.",
              action: {
                label: "OK",
                onClick: () => console.log("ok"),
              },
            })
            break
          }
        }

        if (currentStep < payrollSteps.length) {
          setCurrentStep(currentStep + 1)
        }
      } catch (error) {
        toast.error("Error", {
          description: "Failed to process step. Please try again.",

          action: {
            label: "Retry",
            onClick: () => console.log("retry clicked"),
          },
        })
      } finally {
        setIsProcessing(false)
      }
    }

    const handlePreviousStep = () => {
      if (currentStep > 1 && !payrollData.payrollLocked) {
        setCurrentStep(currentStep - 1)
      }
    }

    const handleNextStep = () => {
      if (currentStep <= payrollSteps.length && !isProcessing) {
        processCurrentStep()
      }
    }

    const canProceed = () => {
      switch (currentStep) {
        case 1:
          // allow proceed if branch selected (bulk import) or client+sites selected
          return (!!selectedBranch || (selectedClient && selectedSites.length > 0)) && !!selectedPayrollMonth
        case 2:
          return payrollData.attendanceImported
        case 3:
          return payrollData.payrollCalculated
        case 4:
          if (!payrollData.reviewCompleted) return false
          const canLock = pendingLeavesCount === 0 || (overridePendingLeaves && overrideReason.trim().length >= 5)
          return canLock
        default:
          return false
      }
    }
    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();

      reader.onload = (event) => {
        if (!event.target) return;

        const data = new Uint8Array(event.target.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const attendanceJson = XLSX.utils.sheet_to_json(sheet);

        console.log("Attendance JSON:", attendanceJson);
        setAttendanceData(attendanceJson);

        //  Step 1: Merge Salary Structure + Attendance
        const merged = mergeSalaryWithAttendance(attendanceJson, salaryStructure);
        setMergedData(merged);
        console.log("Merged:", merged);

        //  Step 2: Calculate Final Salary
        const finalData = calculateFinalSalary(merged);
        setFinalSalary(finalData);
        console.log("Final Salary:", finalData);
        setPayrollData(prev => ({
          ...prev,
          totalEmployees: finalData.length
        }));
      };

      reader.readAsArrayBuffer(file);
    };
    console.log("attendance", mergedData)

    // Convert formula string to actual numeric PF base value


    const mergeSalaryWithAttendance = (attendanceData: any, salaryStructure: any) => {
      return attendanceData.map((emp: any) => {
        const sal = salaryStructure.find(
          (s: any) =>
            s.DESIGNATION?.trim().toLowerCase() ===
            emp.DESIGNATIONNAME?.trim().toLowerCase()
        );

        if (!sal) {
          return { ...emp, ERROR: "Salary Structure Missing for Designation" };
        }

        // Payable days (max 30)
        const payableDays = Math.min(Number(emp.NORMALDAYS || 0), 30);
        const totalMonthDays = 30;
        const dayRatio = payableDays / totalMonthDays;

        return {
          ...emp,
          payableDays,
          lopDays: totalMonthDays - payableDays,
          dayRatio,
          salaryStructure: sal,
          calculatedSalary: {
            basic: sal.BASIC * dayRatio,
            da: sal.DA * dayRatio,
            hra: sal.HRA * dayRatio,
            conveyance: sal.CONV * dayRatio,
            washing: sal.WASHING * dayRatio,
            otherAllowance: sal["OTHER ALW"] * dayRatio,
            edu: sal["EDU. ALW"] * dayRatio,
            medical: sal["MEDICAL ALLOWANCE"] * dayRatio,
            splAllowance: sal["SPL ALLOWANCE"] * dayRatio,
            cca: sal.CCA * dayRatio,
            lww: (sal.LWW || 0) * dayRatio,
            bonus: (sal.BONUS || 0) * dayRatio
          },
          otRates: {
            normalOTRate: sal.OTRATE,
            specialOTRate: sal.SPECIALOTRATE
          }
        };
      });
    };

    const calculateFinalSalary = (mergedData: any) => {
      return mergedData
        .filter((emp: any) => emp.calculatedSalary)
        .map((emp: any) => {
          const sal = emp.calculatedSalary;
          const full = emp.salaryStructure;

          // OT
          const normalOTAmount =
            (emp.OTHOURS || 0) * (emp.otRates?.normalOTRate || 0);
          const splOTAmount =
            (emp.SPLOTHOURS || 0) * (emp.otRates?.specialOTRate || 0);

          // PF
          // ---------------- PF Calculation (Earned & Formula-Based) ----------------
          const pfFormula = full?.PFFORMULA || "";
          let pfBase = 0;

          pfFormula.split("+").forEach((key: string) => {
            const k = key.trim().toUpperCase();
            if (k === "BA") pfBase += sal.basic || 0;
            if (k === "DA") pfBase += sal.da || 0;
            if (k === "CON") pfBase += sal.conveyance || 0;
            if (k === "OA") pfBase += sal.otherAllowance || 0;
          });

          // Wage capping before PF calculation (PFMAXAMOUNT = wage limit)
          const pfWageCap = full?.PFMAXAMOUNT || 0;
          const cappedPfBase = pfWageCap > 0 ? Math.min(pfBase, pfWageCap) : pfBase;

          const pfPercent = full?.PFPERCENTAGE || 12;
          const finalPF = Math.round((cappedPfBase * pfPercent) / 100);


          // ---------------- ESIC Calculation (Earned & Formula-Based) ----------------
          const esicFormula = full?.ESICFORMULA || "";
          let esicBase = 0;

          esicFormula.split("+").forEach((key: string) => {
            const k = key.trim().toUpperCase();
            if (k === "BA") esicBase += sal.basic || 0;
            if (k === "DA") esicBase += sal.da || 0;
            if (k === "HRA") esicBase += sal.hra || 0;
            if (k === "OA") esicBase += sal.otherAllowance || 0;
          });

          // Eligibility check (Statutory Rule)
          if (esicBase > 21000) esicBase = 0;

          const esicPercent = full?.ESICPERCENTAGE || 0.75;
          let esicAmount = (esicBase * esicPercent) / 100;

          // ESIC cap if applicable
          const esicCap = full?.ESICMAXAMOUNT || 0;
          const finalESIC = esicCap > 0 ? Math.min(Math.round(esicAmount), esicCap) : Math.round(esicAmount);

          // 1-12 scale

          // PT Calculation


          // Gross
          const grossPayable =
            sal.basic +
            sal.da +
            sal.hra +
            sal.conveyance +
            sal.washing +
            sal.otherAllowance +
            sal.edu +
            sal.medical +
            sal.splAllowance +
            sal.cca +
            sal.lww +
            sal.bonus;

          //pt
          const currentMonth = new Date().getMonth() + 1; // 1-12 scale

          // PT Calculation
          const gender = (emp.GENDER || "").toUpperCase();
          const gross = grossPayable; // earned gross

          let pt = 0;

          if (gender === "M") {
            if (gross > 10000) {
              pt = currentMonth === 2 ? 300 : 200; // February special rule
            } else if (gross >= 7501) {
              pt = 175;
            }
          } else if (gender === "F") {
            if (gross > 25000) {
              pt = currentMonth === 2 ? 300 : 200;
            }
          }
  const deductions = finalPF+finalESIC+pt
          // Net Salary
          const netSalary =
            grossPayable + normalOTAmount + splOTAmount - finalPF - finalESIC - pt;

          return {
            ...emp,
            normalOTAmount,
            splOTAmount,
            finalPF,
            finalESIC,
            grossPayable,
            pt,
            netSalary,
            deductions
          };
        });
    };






    const renderStepContent = () => {
      switch (currentStep) {
        case 1:
          return (
            <div className="space-y-6">
              <div className="text-center py-4">
                <input
                  type="file"
                  id="attendance-upload"
                  accept=".xlsx,.xls"
                  onChange={handleUpload}
                  className="hidden"
                />
                <Upload className="cursor-pointer h-16 w-16 mx-auto text-blue-500 mb-4" onClick={() => document.getElementById("attendance-upload")?.click()} />
                <h3 className="text-lg font-semibold mb-2">Import Attendance Data</h3>
                <p className="text-muted-foreground mb-4">Select client and sites to import attendance data</p>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                {/* Branch / State Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Branch</label>
                  <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a branch (optional)" />
                    </SelectTrigger>
                    <SelectContent>

                      {branches.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Client selection:
                    - when branch selected: allow selecting some/all clients (checkbox list)
                    - when no branch: single client Select */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Client</label>
                  {selectedBranch ? (
                    <div className="border rounded p-2 bg-background">
                      {/* compute clients that have sites in this branch */}
                      {selectedPayrollMonth ? `Payroll month: ${formatMonthLabel(selectedPayrollMonth)}. ` : ""}{(() => {
                        const branchClientIds = Array.from(
                          new Set(mockSites.filter((s) => s.branchId === selectedBranch).map((s) => s.clientId))
                        )
                        const branchClients = clients.filter((c) => branchClientIds.includes(c.id))
                        const allSelected = branchClients.length > 0 && branchClients.every((c) => selectedClients.includes(c.id))
                        return (
                          <>
                            <div className="flex items-center justify-between mb-2">
                              <label className="flex items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={allSelected}
                                  onChange={(e) => {
                                    if (e.target.checked) selectAllBranchClients(branchClients.map((c) => c.id))
                                    else setSelectedClients([])
                                  }}
                                />
                                <span className="font-medium">Select All</span>
                              </label>
                            </div>
                            <div className="grid gap-1">
                              {branchClients.map((c) => (
                                <label key={c.id} className="flex items-center gap-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={selectedClients.includes(c.id)}
                                    onChange={() => toggleClientSelection(c.id)}
                                  />
                                  <span>{c.name}</span>
                                </label>
                              ))}
                              {branchClients.length === 0 && <div className="text-xs text-muted-foreground">No clients found for this branch.</div>}
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  ) : (
                    <div className="relative" ref={clientDropdownRef}>
                      <button
                        type="button"
                        className="w-full border rounded-md px-3 py-2 text-left bg-background h-10 text-sm flex items-center justify-between"
                        onClick={() => setClientDropdownOpen((v) => !v)}
                      >
                        <span className="truncate">
                          {selectedClient
                            ? clients.find((c) => c.id === selectedClient)?.name || "Select Client"
                            : "Choose a client"}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </button>
                      {clientDropdownOpen && (
                        <div className="absolute z-20 mt-2 w-full bg-popover border rounded-md shadow-lg max-h-64 overflow-hidden flex flex-col">
                          <div className="p-2 border-b">
                            <input
                              type="text"
                              placeholder="Search client..."
                              className="w-full px-2 py-1 border rounded text-sm bg-background"
                              value={clientSearch}
                              onChange={(e) => setClientSearch(e.target.value)}
                              autoFocus
                            />
                          </div>
                          <div className="overflow-y-auto">
                            {clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase())).length === 0 && (
                              <div className="p-2 text-muted-foreground text-sm">No clients found</div>
                            )}
                            {clients
                              .filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()))
                              .map((client) => (
                                <div
                                  key={client.id}
                                  className={`px-2 py-2 cursor-pointer hover:bg-accent text-sm flex items-center ${selectedClient === client.id ? 'bg-accent/50' : ''}`}
                                  onClick={() => {
                                    setSelectedClient(client.id)
                                    setSelectedSites([])
                                    setClientDropdownOpen(false)
                                    setClientSearch("")
                                  }}
                                >
                                  {client.name}
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Sites Dropdown with Search and Select All */}
                <div className="space-y-2">
                  <SitesDropdown
                    sites={getAvailableSites()}
                    selectedSites={selectedSites}
                    setSelectedSites={setSelectedSites}
                    label="Select Sites"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Month</label>
                  <Select value={selectedPayrollMonth} onValueChange={setSelectedPayrollMonth}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose payroll month" />
                    </SelectTrigger>
                    <SelectContent>
                      {payrollMonthOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(selectedBranch && (selectedClients.length > 0 || getAvailableSites().length > 0)) || (selectedClient && selectedSites.length > 0) ? (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Ready to Import</span>
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    {(() => {
                      if (selectedBranch) {
                        const sites = getAvailableSites()
                        const totalEmployees = sites.reduce((sum, s) => sum + ((s as { employees?: number }).employees || 0), 0)
                        const sitesCount = sites.length
                        const clientsCount = Array.from(new Set(sites.map((s) => (s as { clientId?: string }).clientId))).length
                        return `${sitesCount} site(s) across ${clientsCount} client(s) selected with ${totalEmployees} total employees`
                      } else {
                        const totalEmployees = getAvailableSites()
                          .filter((site) => selectedSites.includes(site.id))
                          .reduce((sum, site) => sum + ((site as { employees?: number }).employees || 0), 0)
                        return `${selectedSites.length} sites selected with ${totalEmployees} total employees`
                      }
                    })()}
                  </p>
                </div>
              ) : null}
            </div>
          )
        case 2:
          return (
            <div className="space-y-6">
              <div className="text-center py-4">
                <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Calculate Payroll</h3>
                <p className="text-muted-foreground mb-4">
                  Process salary calculations based on attendance and leave data
                </p>
              </div>

              {payrollData.attendanceImported && attendanceData.length === 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center text-sm text-blue-800 dark:text-blue-200">
                  Payroll run {payrollRunId} created. Click Calculate to process real attendance and wage data.
                </div>
              )}

              {payrollData.attendanceImported && attendanceData.length > 0 && (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 dark:text-green-200 mb-3">Attendance Summary</h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                        {attendanceData.reduce((sum, emp) => sum + (emp.attendance?.presentDays || 0), 0)}
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-400">Total Present Days</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                        {attendanceData.reduce((sum, emp) => sum + (emp.attendance?.lopDays || 0), 0)}
                      </div>
                      <div className="text-sm text-orange-600 dark:text-orange-400">LOP Days</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {payrollData.overtimeHours}
                      </div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">
                        Total OT Hours
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        case 3:
          return (
            <div className="space-y-6">
              {runSummary && (
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-3">Payroll Run Summary ({payrollRunId})</h4>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{runSummary.employeesProcessed ?? payrollCalculations.length}</div>
                      <div className="text-sm text-muted-foreground">Employees</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">₹{(runSummary.totalGross || 0).toLocaleString("en-IN")}</div>
                      <div className="text-sm text-muted-foreground">Total Gross</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">₹{(runSummary.totalDeductions || 0).toLocaleString("en-IN")}</div>
                      <div className="text-sm text-muted-foreground">Total Deductions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">₹{(runSummary.totalInHand || 0).toLocaleString("en-IN")}</div>
                      <div className="text-sm text-muted-foreground">Total In-Hand</div>
                    </div>
                  </div>
                </div>
              )}

              {runSummary?.unresolvedEmployees?.length > 0 && (
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-start gap-3 mb-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <h4 className="font-medium text-orange-800 dark:text-orange-200">
                      {runSummary.unresolvedEmployees.length} employee(s) could not be processed — no wage rule found
                    </h4>
                  </div>
                  <div className="overflow-x-auto border rounded-lg bg-background max-h-64 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted sticky top-0">
                        <tr>
                          <th className="text-left p-2">Emp ID</th>
                          <th className="text-left p-2">Name</th>
                          <th className="text-left p-2">Site</th>
                          <th className="text-left p-2">Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {runSummary.unresolvedEmployees.map((emp: { employeeId?: string; employeeName?: string; siteId?: string; reason?: string }, index: number) => (
                          <tr key={emp.employeeId || index} className="border-t">
                            <td className="p-2">{emp.employeeId}</td>
                            <td className="p-2">{emp.employeeName}</td>
                            <td className="p-2">{emp.siteId}</td>
                            <td className="p-2">{emp.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {payrollCalculations.length === 0 && !(runSummary?.unresolvedEmployees?.length > 0) && (
                <div className="text-center py-8 text-muted-foreground border rounded-lg">
                  {runSummary?.message || "No attendance data found for this scope and month."}
                </div>
              )}

              {payrollCalculations.length > 0 && (
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-2">Emp ID</th>
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Designation</th>
                        <th className="text-right p-2">Gross</th>
                        <th className="text-right p-2">Deductions</th>
                        <th className="text-right p-2">Net</th>
                        <th className="text-right p-2">In-Hand</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payrollCalculations.map((emp, index) => (
                        <tr key={emp.empId || index} className="border-t">
                          <td className="p-2">{emp.empId}</td>
                          <td className="p-2">{emp.name}</td>
                          <td className="p-2">{emp.designation}</td>
                          <td className="p-2 text-right">₹{(emp.totals?.grossSalary || 0).toLocaleString("en-IN")}</td>
                          <td className="p-2 text-right">₹{(emp.totals?.totalDeductions || 0).toLocaleString("en-IN")}</td>
                          <td className="p-2 text-right">₹{(emp.totals?.netSalary || 0).toLocaleString("en-IN")}</td>
                          <td className="p-2 text-right">₹{(emp.totals?.inHandSalary || 0).toLocaleString("en-IN")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-orange-800 dark:text-orange-200">Pending Leave Exceptions</h4>
                      {pendingLeavesCount > 0 ? (
                        <p className="text-sm text-orange-700 dark:text-orange-300">
                          There are {pendingLeavesCount} pending leave request(s) for the selected client/site(s). Payroll
                          cannot approve or reject leaves. Locking is blocked until leaves are finalized, or you
                          explicitly override with reason.
                        </p>
                      ) : (
                        <p className="text-sm text-green-700 dark:text-green-300">
                          No pending leave exceptions. You can proceed to lock payroll.
                        </p>
                      )}
                    </div>
                  </div>
                  {pendingLeavesCount > 0 && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          toast("Managers Notified", {
                            description: "A notification has been sent to managers to resolve pending leaves",
                            action: {
                              label: "OK",
                              onClick: () => console.log("ok"),
                            },
                          })
                        }
                      >
                        Notify Managers
                      </Button>
                    </div>
                  )}
                </div>

                {pendingLeavesCount > 0 && (
                  <div className="mt-4 space-y-2">
                    <label className="text-sm font-medium">Override with LOP (requires reason)</label>
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={overridePendingLeaves}
                          onChange={(e) => setOverridePendingLeaves(e.target.checked)}
                        />
                        Treat pending leaves as LOP for this cycle
                      </label>
                      <input
                        type="text"
                        placeholder="Enter reason (min 5 chars)"
                        className="w-full md:w-80 rounded-md border border-border bg-background px-3 py-2 text-sm"
                        value={overrideReason}
                        onChange={(e) => setOverrideReason(e.target.value)}
                        disabled={!overridePendingLeaves}
                        aria-disabled={!overridePendingLeaves}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground  ">
                      An override is auditable. Ensure the Leave module resolves these items post-cycle.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )
        case 4:
          return (
            <div className="text-center py-8">
              <Lock className="h-16 w-16 mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Lock Payroll</h3>
              <p className="text-muted-foreground mb-4">Finalize and lock payroll for disbursement</p>
              {payrollData.reviewCompleted && !payrollData.payrollLocked && (
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  <span>Ready to lock payroll</span>
                </div>
              )}
            </div>
          )
        default:
          return (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Payroll Complete</h3>
              <p className="text-muted-foreground">Payroll processing has been completed successfully</p>
            </div>
          )
      }
    }
    console.log(finalSalary)
    const generateBankFile = async () => {
      if (!payrollData.payrollLocked || payrollCalculations.length === 0) {
        toast.error("Cannot Generate Bank File", {
          description: "Payroll must be locked and calculations must be completed.",
          action: {
            label: "OK",
            onClick: () => console.log("ok"),
          },
        })
        return
      }

      // Import XLSX dynamically
      const XLSX = await import("xlsx");

      // Generate a random 12-digit beneficiary account number for each row
      const randomAccountNumber = () =>
        Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join("")

      // Sheet 1: Bank Transaction Data
      const bankFileData = finalSalary.map((emp) => ({
        "TYPE": "NEFT",
        "DEBIT BANK A/C NO": "12345678901234",
        "DEBIT AMT": Math.round(emp.inHandSalary || emp.netSalary || 0),
        "CUR": "INR",
        "BENEFICIARY A/C NO": randomAccountNumber(),
        "IFSC CODE": emp.ifsc || "HDFC0001234",
        "NARRATION/NAME (NOT MORE THAN 20)": (emp.EMPNAME || "").substring(0, 20),
      }))

      // Sheet 2: Designation-wise Count
      const designationCount = payrollCalculations.reduce((acc, emp) => {
        const designation = emp.designation || "Unknown"
        acc[designation] = (acc[designation] || 0) + 1
        return acc
      }, {})

      const designationData = Object.entries(designationCount).map(([designation, count]) => ({
        "Designation": designation,
        "Employee Count": count,
      }))

      // Add total row
      designationData.push({
        "Designation": "TOTAL",
        "Employee Count": payrollCalculations.length,
      })

      // Create workbook
      const wb = XLSX.utils.book_new()

      // Add Sheet 1: Bank Transactions
      const ws1 = XLSX.utils.json_to_sheet(bankFileData)
      XLSX.utils.book_append_sheet(wb, ws1, "Bank Transactions")

      // Add Sheet 2: Designation Summary
      const ws2 = XLSX.utils.json_to_sheet(designationData)
      XLSX.utils.book_append_sheet(wb, ws2, "Designation Summary")

      // Generate file and download
      XLSX.writeFile(wb, `bank_upload_${new Date().toISOString().split("T")[0]}.xlsx`)

      toast("Bank File Generated", {
        description: "Excel file with bank transactions and designation summary has been generated.",
        className: "bg-green-600 text-white",
        action: {
          label: "OK",
          onClick: () => console.log("ok"),
        },
      })

      // Reset state and go back to first step
      setPayrollCalculations([])
      setAttendanceData([])
      setSelectedClient("")
      setSelectedSites([])
      setPayrollData(initialPayrollData)
      setPayrollRunId("")
      setRunSummary(null)
      setCurrentStep(1)
    }

    // when branch selected -> clear client/site selections (branch triggers bulk import)
    useEffect(() => {
      if (selectedBranch) {
        setSelectedClient("")
        setSelectedSites([])
        setSelectedClients([])
      }
    }, [selectedBranch])

    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Payroll Processing</h1>
              <p className="text-muted-foreground">Process monthly payroll with step-by-step workflow</p>
            </div>
          </div>

          {/* Payroll Stepper */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Payroll Processing Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <Stepper steps={payrollSteps} currentStep={currentStep} />

              <div className="mt-8 mb-6">{renderStepContent()}</div>

              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={handlePreviousStep}
                  disabled={currentStep === 1 || payrollData.payrollLocked || isProcessing}
                >
                  Previous
                </Button>

                <div className="flex space-x-2">
                  {payrollData.payrollLocked && (
                    <Button onClick={generateBankFile} variant="default" className="bg-green-600 hover:bg-green-700">
                      <Upload className="mr-2 h-4 w-4" />
                      Generate Bank File
                    </Button>
                  )}

                  <Button
                    onClick={handleNextStep}
                    disabled={currentStep > payrollSteps.length || !canProceed() || payrollData.payrollLocked}
                    className="min-w-[120px]"
                  >
                    {isProcessing ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </div>
                    ) : currentStep > payrollSteps.length ? (
                      "Complete"
                    ) : (
                      `Process Step ${currentStep}`
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Employees</p>
                    <p className="text-2xl font-bold text-foreground">{payrollData.totalEmployees.toLocaleString()}</p>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {payrollData.attendanceImported ? "Imported" : "Pending"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Gross Payroll</p>
                    <p className="text-2xl font-bold text-foreground">
                      ₹{(payrollData.grossPayroll / 100000).toFixed(1)}L
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {payrollData.payrollCalculated ? "Calculated" : "Pending"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Client Overtime</p>
                    <p className="text-center text-2xl font-bold text-foreground">{payrollData.clientOt.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">iSmart Overtime</p>
                    <p className="text-center text-2xl font-bold text-foreground">{payrollData.ismartOt.toLocaleString()}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-500" />
                </div>

              </CardContent>
            </Card>


            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">On Hold</p>
                    <p className="text-2xl font-bold text-foreground">{payrollData.onHold}</p>
                  </div>
                  <Lock className="h-8 w-8 text-red-500" />
                </div>
                <div className="mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSalaryHold(true)}
                    className="text-xs"
                    disabled={payrollData.payrollLocked}
                  >
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {payrollData.attendanceImported && currentStep >= 2 && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">
                  {currentStep === 2 ? "Attendance Data" : "Payroll Calculations"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Employee</th>
                        <th className="text-left p-2 min-w-[150px]">Designation</th>
                        {/* <th className="text-left p-2">Present Days</th> */}
                        <th className="text-left p-2">Leaves</th>
                        <th className="text-left p-2">LOP</th>
                        <th className="text-left p-2">Paid Days</th>
                        <th className="text-left p-2">Client OT</th>
                        <th className="text-left p-2">iSmart OT</th>
                        <th className="text-left p-2">Total OT</th>
                        {currentStep >= 3 && (
                          <>
                            <th className="text-left p-2">Basic<br /><span className="text-xs text-muted-foreground">(Given/<span className="text-green-600">Earned</span>)</span></th>
                            <th className="text-left p-2">DA<br /><span className="text-xs text-muted-foreground">(Given/<span className="text-green-600">Earned</span>)</span></th>
                            <th className="text-left p-2">HRA<br /><span className="text-xs text-muted-foreground">(Given/<span className="text-green-600">Earned</span>)</span></th>
                            <th className="text-left p-2">CONVEYANCE<br /><span className="text-xs text-muted-foreground">(Given/<span className="text-green-600">Earned</span>)</span></th>

                            <th className="text-left p-2">Washing<br /><span className="text-xs text-muted-foreground">(Given/<span className="text-green-600">Earned</span>)</span></th>
                            <th className="text-left p-2">Other all.<br /><span className="text-xs text-muted-foreground">(Given/<span className="text-green-600">Earned</span>)</span></th>
                            <th className="text-left p-2">Leave w/ Wages<br /><span className="text-xs text-muted-foreground">(Given/<span className="text-green-600">Earned</span>)</span></th>
                            <th className="text-left p-2">CCA<br /><span className="text-xs text-muted-foreground">(Given/<span className="text-green-600">Earned</span>)</span></th>

                            <th className="text-left p-2">Educational<br /><span className="text-xs text-muted-foreground">(Given/<span className="text-green-600">Earned</span>)</span></th>
                            <th className="text-left p-2">Medical<br /><span className="text-xs text-muted-foreground">(Given/<span className="text-green-600">Earned</span>)</span></th>
                            <th className="text-left p-2">Spl Allow<br /><span className="text-xs text-muted-foreground">(Given/<span className="text-green-600">Earned</span>)</span></th>
                            <th className="text-left p-2">Bonus<br /><span className="text-xs text-muted-foreground">(Given/<span className="text-green-600">Earned</span>)</span></th>
                            <th className="text-left p-2">Meal<br /><span className="text-xs text-muted-foreground">(Given/<span className="text-green-600">Earned</span>)</span></th>
                            <th className="text-left p-2">Site Allowance<br /><span className="text-xs text-muted-foreground">(Given/<span className="text-green-600">Earned</span>)</span></th>
                            <th className="text-left p-2">Performance<br /><span className="text-xs text-muted-foreground">(Given/<span className="text-green-600">Earned</span>)</span></th>
                            <th className="text-left p-2">Food<br /><span className="text-xs text-muted-foreground">(Given/<span className="text-green-600">Earned</span>)</span></th>
                            <th className="text-left p-2">Metro City<br /><span className="text-xs text-muted-foreground">(Given/<span className="text-green-600">Earned</span>)</span></th>
                            <th className="text-left p-2">Stipend<br /><span className="text-xs text-muted-foreground">(Given/<span className="text-green-600">Earned</span>)</span></th>
                            <th className="text-left p-2 b">OT Amount</th>
                            <th className="text-left p-2">Reimburse</th>
                            <th className="text-left p-2">Cony</th>
                            <th className="text-left p-2">Cash Risk</th>
                            <th className="text-left p-2">Incentive</th>


                            <th className="text-left p-2">
                              Gross Salary<br />
                              <span className="text-xs text-muted-foreground">(Given/<span className="text-green-600">Earned</span>)</span>
                            </th>
                            <th className="text-left p-2">PF</th>
                            <th className="text-left p-2">ESIC</th>
                            <th className="text-left p-2">PT</th>
                            <th className="text-left p-2">LWF</th>
                            <th className="text-left p-2">Other Ded</th>
                            <th className="text-left p-2">Uniform</th>


                            <th className="text-left p-2">Mess</th>
                            <th className="text-left p-2">HRA Ded</th>
                            <th className="text-left p-2">Staff Welfare Fund</th>
                            <th className="text-left p-2">BG Verification</th>


                            <th className="text-left p-2">Uniform Ded</th>

                            <th className="text-left p-2">Deductions</th>
                            <th className="text-left p-2">Net Salary</th>
                            <th className="text-left p-2">Advance Remaining</th>
                            <th className="text-left p-2">InHand Salary<br />
                              <span className="text-xs text-muted-foreground">(net salary - advance)</span>

                            </th>

                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {(currentStep >= 3 ? finalSalary : mergedData).map((emp, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">
                            <div>
                              <div className="font-medium">{emp.EMPNAME}</div>
                              <div className="text-xs text-muted-foreground">{emp.EMPCODE}</div>
                            </div>
                          </td>
                          <td className="p-2">{emp.DESIGNATIONNAME}</td>
                          {/* <td className="p-2">
                            {emp.NORMALDAYS}/{30}
                          </td> */}
                          <td className="p-2">    {(emp.PL || 0) + (emp.CL || 0) + (emp.SL || 0)}
                          </td>
                          <td className="p-2">
                            <Badge variant={emp.lop > 0 ? "destructive" : "secondary"}>{emp.lopDays}</Badge>
                          </td>
                          <td className="p-2">{emp.payableDays}</td>

                          {/* show OT breakdown */}
                          <td className="p-2">
                            <Badge variant={emp.clientOvertime > 0 ? "secondary" : undefined}>{emp.clientOvertime ?? (emp.clientOvertime === 0 ? "0" : "-")}</Badge>
                          </td>
                          <td className="p-2">
                            <Badge variant={emp.ismartOvertime > 0 ? "secondary" : undefined}>{emp.ismartOvertime ?? (emp.ismartOvertime === 0 ? "0" : "-")}</Badge>
                          </td>
                          <td className="p-2">
                            <Badge variant={(emp.clientOvertime + (emp.ismartOvertime || 0)) > 10 ? "destructive" : "secondary"}>{(emp.clientOvertime || 0) + (emp.ismartOvertime || 0)}h</Badge>
                          </td>

                          {currentStep >= 3 && (
                            <>
                              <td className="p-2">
                                ₹{emp.salaryStructure?.BASIC?.toLocaleString()}
                                <br />
                                <span className="text-green-700 dark:text-green-300 text-xs font-medium">
                                  ₹{emp.calculatedSalary?.basic?.toLocaleString()}
                                </span>
                              </td>
                              <td className="p-2">
                                ₹{emp.salaryStructure?.DA?.toLocaleString()}
                                <br />
                                <span className="text-green-700 dark:text-green-300 text-xs font-medium">
                                  ₹{emp.calculatedSalary?.da?.toLocaleString()}
                                </span>
                              </td>
                              <td className="p-2">
                                ₹{emp.salaryStructure?.HRA?.toLocaleString()}
                                <br />
                                <span className="text-green-700 dark:text-green-300 text-xs font-medium">
                                  ₹{emp.calculatedSalary?.hra?.toLocaleString()}

                                </span>
                              </td>
                              <td className="p-2">
                                ₹{emp.salaryStructure?.CONV?.toLocaleString()}
                                <br />
                                <span className="text-green-700 dark:text-green-300 text-xs font-medium">
                                  ₹{emp.calculatedSalary?.conveyance?.toLocaleString()}
                                </span>
                              </td>

                              <td className="p-2">
                                ₹{emp.salaryStructure?.WASHING?.toLocaleString()}
                                <br />
                                <span className="text-green-700 dark:text-green-300 text-xs font-medium">
                                  ₹{emp.calculatedSalary?.washing?.toLocaleString()}
                                </span>
                              </td>
                              <td className="p-2">
                                ₹{emp.salaryStructure?.["OTHER ALW"]?.toLocaleString()}
                                <br />
                                <span className="text-green-700 dark:text-green-300 text-xs font-medium">
                                  ₹{emp.calculatedSalary?.otherAllowance?.toLocaleString()}
                                </span>
                              </td>
                              <td className="p-2">
                                ₹{emp.LWW?.toLocaleString()}
                                <br />
                                <span className="text-green-700 dark:text-green-300 text-xs font-medium">
                                  ₹{emp.leaveWithWages?.toLocaleString()}
                                </span>
                              </td>
                              <td className="p-2">
                                ₹{emp.salaryStructure?.CCA?.toLocaleString()}
                                <br />
                                <span className="text-green-700 dark:text-green-300 text-xs font-medium">
                                  ₹{emp.calculatedSalary?.cca?.toLocaleString()}
                                </span>
                              </td>
                              <td className="p-2">
                                ₹{emp.givenEducationalAllowance?.toLocaleString()}
                                <br />
                                <span className="text-green-700 dark:text-green-300 text-xs font-medium">
                                  ₹{emp.educationalAllowance?.toLocaleString()}
                                </span>
                              </td>

                              <td className="p-2">
                                ₹{emp.givenMedicalAllowance?.toLocaleString()}
                                <br />
                                <span className="text-green-700 dark:text-green-300 text-xs font-medium">
                                  ₹{emp.medicalAllowance?.toLocaleString()}
                                </span>
                              </td>
                              <td className="p-2">
                                ₹{emp.givenSpecialAllowance?.toLocaleString()}
                                <br />
                                <span className="text-green-700 dark:text-green-300 text-xs font-medium">
                                  ₹{emp.specialAllowance?.toLocaleString()}
                                </span>
                              </td>  <td className="p-2">
                                ₹{emp.salaryStructure?.BONUS?.toLocaleString()}
                                <br />
                                <span className="text-green-700 dark:text-green-300 text-xs font-medium">
                                  ₹{emp.bonus?.toLocaleString()}
                                </span>
                              </td>  <td className="p-2">
                                ₹{emp.givenMeal?.toLocaleString()}
                                <br />
                                <span className="text-green-700 dark:text-green-300 text-xs font-medium">
                                  ₹{emp.meal?.toLocaleString()}
                                </span>
                              </td>  <td className="p-2">
                                ₹{emp.givenSiteAllowance?.toLocaleString()}
                                <br />
                                <span className="text-green-700 dark:text-green-300 text-xs font-medium">
                                  ₹{emp.siteAllowance?.toLocaleString()}
                                </span>
                              </td>
                              <td className="p-2">
                                ₹{emp.givenPerformanceAllowance?.toLocaleString()}
                                <br />
                                <span className="text-green-700 dark:text-green-300 text-xs font-medium">
                                  ₹{emp.performanceAllowance?.toLocaleString()}
                                </span>
                              </td> <td className="p-2">
                                ₹{emp.givenFood?.toLocaleString()}
                                <br />
                                <span className="text-green-700 dark:text-green-300 text-xs font-medium">
                                  ₹{emp.food?.toLocaleString()}
                                </span>
                              </td> <td className="p-2">
                                ₹{emp.givenMetroCityAllowance?.toLocaleString()}
                                <br />
                                <span className="text-green-700 dark:text-green-300 text-xs font-medium">
                                  ₹{emp.metroCityAllowance?.toLocaleString()}
                                </span>
                              </td> <td className="p-2">
                                ₹{emp.givenStipend?.toLocaleString()}
                                <br />
                                <span className="text-green-700 dark:text-green-300 text-xs font-medium">
                                  ₹{emp.stipend?.toLocaleString()}
                                </span>
                              </td>
                              <td className="p-2">
                                ₹{emp.overtimePay?.toLocaleString()}


                              </td><td className="p-2">
                                ₹{emp.reimbursement?.toLocaleString()}

                              </td><td className="p-2">
                                ₹{emp.convy?.toLocaleString()}

                              </td><td className="p-2">
                                ₹{emp.cashRiskAllowance?.toLocaleString()}

                              </td>
                              <td className="p-2">
                                ₹{emp.incentive?.toLocaleString()}

                              </td>
                              <td className="p-2">
                                ₹{emp.salaryStructure?.GROSS.toLocaleString()}
                                <br />
                                <span className="text-green-700 dark:text-green-300 text-xs font-medium">
                                  ₹{emp.grossPayable?.toLocaleString()}
                                </span>
                              </td>

                              <td className="p-2">₹{emp.finalPF?.toLocaleString()}</td>
                              <td className="p-2">₹{emp.finalESIC?.toLocaleString()}</td>
                              <td className="p-2">₹{emp.pt?.toLocaleString()}</td>
                              <td className="p-2">₹{emp.lwf?.toLocaleString()}</td>
                              <td className="p-2">₹{emp.otherDeduction?.toLocaleString()}</td>
                              <td className="p-2">₹{emp.uniform?.toLocaleString()}</td>
                              <td className="p-2">₹{emp.messDeduction?.toLocaleString()}</td>
                              <td className="p-2">₹{emp.hraDeduction?.toLocaleString()}</td>
                              <td className="p-2">₹{emp.staffWelfareFund?.toLocaleString()}</td>
                              <td className="p-2">₹{emp.backgroundVerification?.toLocaleString()}</td>
                              <td className="p-2">₹{emp.uniformDeduction?.toLocaleString()}</td>

                              <td className="p-2">₹{emp.deductions?.toLocaleString()}</td>
                              <td className="p-2 font-medium">₹{emp.netSalary?.toLocaleString()}</td>
                              <td className="p-2 font-medium">₹{emp.advanceRemaining?.toLocaleString()}</td>
                              <td className="p-2 font-medium">₹{emp.inHandSalary?.toLocaleString()}</td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Modals */}
          {showSalaryHold && <SalaryHoldModal onClose={() => setShowSalaryHold(false)} />}
        </div>
      </MainLayout>
    )
  }
