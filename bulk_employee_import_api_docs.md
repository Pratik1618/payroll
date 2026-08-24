# Bulk Employee Import API Specification

## 1. Overview & Data Flow

The Bulk Employee Import API allows HR Managers and Payroll Administrators to import multiple employee records alongside their organization department mapping and comprehensive salary component structure (94 components in exact sequence) in a single API call.

```mermaid
sequenceDiagram
    autonumber
    actor User as HR / Payroll Manager
    participant UI as Next.js Frontend (BulkImportModal)
    participant NextAPI as Next.js API Proxy (/api/organization/employees/bulk-import)
    participant Gateway as API Gateway (api.ismartfacitechpl.com/payroll)
    participant Backend as Spring Boot Microservice

    User->>UI: Uploads completed .xlsx file (Sheet 1: Data, Sheet 2: Code Legend)
    UI->>UI: Parses Excel & Validates required fields
    User->>UI: Clicks "Import Employees"
    UI->>NextAPI: POST /api/organization/employees/bulk-import (JSON payload)
    NextAPI->>Gateway: POST /api/v1/organization/employees/bulk-import (with Bearer Token)
    Gateway->>Backend: Forward Bulk Import Request
    Backend->>Backend: Validate Employee IDs, Department, & Salary Components
    Backend->>Backend: Process DB Insert / Update
    Backend-->>Gateway: Return 200 OK / 207 Multi-Status Response
    Gateway-->>NextAPI: Response JSON
    NextAPI-->>UI: Response JSON
    UI-->>User: Display Toast Summary & Refresh Org Tree / Employee Table
```

---

## 2. Endpoint Details

| Attribute | Specification |
|-----------|---------------|
| **Next.js Proxy Route** | `POST /api/organization/employees/bulk-import` |
| **Backend Endpoint** | `POST http://api.ismartfacitechpl.com/payroll/api/v1/organization/employees/bulk-import` |
| **Authentication** | `Bearer Token` (`Authorization: Bearer <jwt_token>`) |
| **Role Required** | `PAYROLL_MANAGER` or `HR_ADMIN` |
| **Content-Type** | `application/json` |

---

## 3. Request Header Specification

| Header Name | Type | Required | Value / Description |
|-------------|------|----------|---------------------|
| `Authorization` | String | Yes | `Bearer <JWT_TOKEN>` |
| `Content-Type` | String | Yes | `application/json` |
| `Accept` | String | Yes | `application/json` |

---

## 4. Request Schema Specification

### JSON Structure

```json
{
  "mode": "ATOMIC",
  "employees": [
    {
      "employeeId": "EMP-021",
      "name": "Rahul Sharma",
      "designation": "SUPERVISOR",
      "department": "Operations",
      "salaryComponents": [
        { "code": "BASIC", "name": "Basic Salary", "category": "Earning", "value": 11632 },
        { "code": "DA", "name": "Dearness Allowance", "category": "Earning", "value": 3614 },
        { "code": "HRA", "name": "House Rent Allowance", "category": "Earning", "value": 3709 },
        { "code": "CONVEYANCE", "name": "Conveyance Allowance", "category": "Earning", "value": 3000 },
        { "code": "OTHER_ALLOWANCE", "name": "Other Allowance", "category": "Earning", "value": 2500 },
        { "code": "PF", "name": "Provident Fund (EPF)", "category": "Deduction", "value": 1800 },
        { "code": "PT", "name": "Professional Tax", "category": "Deduction", "value": 200 },
        { "code": "EMPLOYER_PF", "name": "Employer PF Contribution", "category": "Employer Contribution", "value": 1800 }
      ]
    }
  ]
}
```

### Field Definitions & Validation Rules

| Field Path | Type | Required | Description & Validation Rules |
|------------|------|----------|--------------------------------|
| `mode` | Enum | No | Import strategy: `ATOMIC` (default: fails all if 1 row errors) or `PARTIAL` (imports valid, returns row errors). |
| `employees` | Array | Yes | Non-empty array of employee import items (Max 1000 items per request). |
| `employees[].employeeId` | String | Yes | Unique employee identifier (e.g. `EMP-021`). Must not be empty. |
| `employees[].name` | String | Yes | Full name of the employee. |
| `employees[].designation` | String | Yes | Designation title. Must match an active master designation or will be auto-created. |
| `employees[].department` | String | Yes | Department name/code in Organization Management hierarchy. |
| `employees[].salaryComponents` | Array | Yes | List of salary components in exact sequence. |
| `employees[].salaryComponents[].code` | String | Yes | Unique component code (e.g., `BASIC`, `HRA`, `PF`, `PT`). |
| `employees[].salaryComponents[].category` | Enum | Yes | `Earning`, `Deduction`, `Employer Contribution`, or `Summary`. |
| `employees[].salaryComponents[].value` | Number | Yes | Monthly monetary value (Numeric >= 0). `BASIC` must be > 0. |

---

## 5. Exact Ordered Salary Component Catalog (94 Components)

Below is the exact sequence of component codes as defined by the business:

| # | Code | Full Component Name | Category | Description |
|---|------|---------------------|----------|-------------|
| 1 | `BASIC` | Basic Salary | Earning | Core taxable basic monthly salary component. |
| 2 | `DA` | Dearness Allowance | Earning | Cost-of-living adjustment allowance. |
| 3 | `HRA` | House Rent Allowance | Earning | Tax-exempt house rent allowance under IT rules. |
| 4 | `CONVEYANCE` | Conveyance Allowance | Earning | Standard monthly travel/conveyance allowance. |
| 5 | `WASHING_ALLOWANCE` | Washing Allowance | Earning | Uniform maintenance and washing allowance. |
| 6 | `OTHER_ALLOWANCE` | Other Allowance | Earning | Miscellaneous monthly earnings allowance. |
| 7 | `OVERTIME` | Overtime Pay | Earning | Overtime hours payout. |
| 8 | `LEAVE_WITH_WAGES` | Leave With Wages | Earning | Statutory paid annual leave encashment payout. |
| 9 | `EX_GRATIA` | Ex-Gratia | Earning | Ex-Gratia discretionary payout. |
| 10 | `CCA` | City Compensatory Allowance | Earning | Allowance to offset cost of living in tier-1 cities. |
| 11 | `EDUCATIONAL_ALLOWANCE` | Educational Allowance | Earning | Children education allowance. |
| 12 | `MEDICAL_ALLOWANCE` | Medical Allowance | Earning | Fixed monthly medical reimbursement allowance. |
| 13 | `OT_AMOUNT` | OT Amount | Earning | Calculated overtime pay amount. |
| 14 | `PAID_HOLIDAY` | Paid Holiday Allowance | Earning | Payout for working on national/declared holidays. |
| 15 | `SPL_ALLOWANCE` | Special Allowance | Earning | Balancing component in monthly CTC calculation. |
| 16 | `WEEKLY_OFF` | Weekly Off Allowance | Earning | Payout for working on weekly off/rest days. |
| 17 | `GRATUITY` | Gratuity Payout | Earning | Statutory gratuity disbursement. |
| 18 | `REIMBURSEMENT` | Reimbursement | Earning | Official expense reimbursement payout. |
| 19 | `LTC` | Leave Travel Concession | Earning | Statutory travel concession payout. |
| 20 | `BONUS` | Bonus | Earning | Bonus payout to employee. |
| 21 | `ATTIRE` | Attire Allowance | Earning | Uniform and dress code allowance. |
| 22 | `MEAL` | Meal Allowance | Earning | Food voucher or meal coupon allowance. |
| 23 | `LTA` | Leave Travel Allowance | Earning | LTA tax-exempt travel allowance. |
| 24 | `CONSOLIDATED_WAGES_1` | Consolidated Wages 1 | Earning | All-inclusive consolidated wages tier 1. |
| 25 | `CONSOLIDATED_WAGES_2` | Consolidated Wages 2 | Earning | All-inclusive consolidated wages tier 2. |
| 26 | `BASIC_DA_ARREARS` | Basic DA Arrears | Earning | Retrospective revision arrears for Basic & DA. |
| 27 | `OTHER_ARREARS` | Other Arrears | Earning | Arrears for miscellaneous allowances. |
| 28 | `SITE_ALLOWANCE` | Site Allowance | Earning | Special field/site deployment allowance. |
| 29 | `HOLIDAY_ALLOWANCE` | Holiday Allowance | Earning | Special holiday work allowance. |
| 30 | `LEAVE_ENCASHMENT` | Leave Encashment | Earning | Encashment payout for unavailed leave balance. |
| 31 | `P_OT` | Production Overtime (P_OT) | Earning | Piece-rate or production overtime pay. |
| 32 | `CONY` | Conveyance Allowance (Short) | Earning | Standard monthly travel allowance. |
| 33 | `BONUS_Q_Y` | Bonus Quarterly/Yearly | Earning | Periodic quarterly or annual statutory bonus. |
| 34 | `P_HOLIDAY` | Paid Holiday Pay (Short) | Earning | Holiday shift premium payout. |
| 35 | `LTA_M` | Monthly LTA (LTA_M) | Earning | Monthly accrued leave travel allowance. |
| 36 | `EX_GRATIA_Q_Y` | Ex-Gratia Quarterly/Yearly | Earning | Periodic quarterly or annual ex-gratia bonus. |
| 37 | `FIXED_COMPENSATION` | Fixed Compensation | Earning | Fixed monthly gross compensation. |
| 38 | `PERFORMANCE_ALLOWANCE` | Performance Allowance | Earning | Variable performance incentive payout. |
| 39 | `MEDICAL_REM_MER` | Medical Reimbursement (MER) | Earning | Actual bill medical reimbursement payout. |
| 40 | `CAR_REPAIR_RMB` | Car Repair Reimbursement | Earning | Motor car repair & maintenance reimbursement. |
| 41 | `BOOK_PERIODICAL_RMB` | Book & Periodical Reimbursement | Earning | Books, newspapers & journals reimbursement. |
| 42 | `WASHING_ALLOWANCE_ARREARS` | Washing Allowance Arrears | Earning | Retrospective arrears for washing allowance. |
| 43 | `PLI` | Performance Linked Incentive | Earning | Performance linked incentive bonus. |
| 44 | `MEDICAL_INS_REB` | Medical Insurance Rebate | Earning | Reimbursement/rebate for personal medical policy. |
| 45 | `FOOD_ALLOWANCE` | Food Allowance | Earning | Fixed monthly food allowance. |
| 46 | `SUBSISTENCE_ALLOWANCE` | Subsistence Allowance | Earning | Statutory subsistence allowance during inquiry. |
| 47 | `FIXED_LTA_PA` | Fixed LTA Per Annum | Earning | Fixed annual LTA component. |
| 48 | `FIXED_MEAL_CARD` | Fixed Meal Card | Earning | Prepaid meal card monthly benefit. |
| 49 | `FIXED_MEDICAL_RMB` | Fixed Medical Reimbursement | Earning | Fixed structured medical reimbursement. |
| 50 | `FIXED_PLI_PA` | Fixed Performance Incentive PA | Earning | Fixed annual performance incentive. |
| 51 | `FIXED_MEDICAL_INS_REB` | Fixed Medical Insurance Rebate | Earning | Fixed monthly medical policy rebate. |
| 52 | `FIXED_CAR_REPAIR_RMB` | Fixed Car Repair RMB | Earning | Fixed monthly car repair allowance. |
| 53 | `FIXED_BOOK_PERIODICAL_RMB` | Fixed Book & Periodical RMB | Earning | Fixed monthly books & periodicals allowance. |
| 54 | `FIXED_TELEPHONE_RMB` | Fixed Telephone Reimbursement | Earning | Fixed monthly telephone allowance. |
| 55 | `TELEPHONE_REB` | Telephone Rebate | Earning | Monthly mobile/broadband bill reimbursement. |
| 56 | `CASH_RISK_ALLOWANCE` | Cash Risk Allowance | Earning | Risk allowance for cash handlers/cashiers. |
| 57 | `BA_OT_FD` | BA & OT Fixed | Earning | Basic Allowance & OT Fixed Lump-sum. |
| 58 | `INCENTIVE` | Incentive | Earning | Sales or operational goal achievement payout. |
| 59 | `FOOD` | Food Pay | Earning | Daily meal subsidy payout. |
| 60 | `WO_ALLOWANCE` | W/O Allowance | Earning | Weekly off shift allowance. |
| 61 | `METRO_CITY_ALLOWANCE` | Metro City Allowance | Earning | Special tier-1 metropolitan city allowance. |
| 62 | `ROOM_RENT_REIMB` | Room Rent Reimbursement | Earning | Official travel room rent reimbursement. |
| 63 | `BASIC_DA_ADVANCE` | Basic DA Advance Payout | Earning | Advance wage payout against Basic & DA. |
| 64 | `OTHER_ADVANCE` | Other Advance Payout | Earning | Advance payout against allowances. |
| 65 | `HRA_ADVANCE` | HRA Advance Payout | Earning | Advance payout against HRA. |
| 66 | `MOBILE_ALLOWANCE` | Mobile Allowance | Earning | Fixed cellular phone allowance. |
| 67 | `STIPEND` | Stipend | Earning | Trainee or intern monthly stipend. |
| 68 | `GROSS_AMT` | Total Gross Monthly Earnings | Summary | Computed total gross earnings (`Sum(1..67)`). |
| 69 | `PF` | Provident Fund (EPF) | Deduction | Statutory Employee Provident Fund 12% deduction. |
| 70 | `ESIC` | ESIC Employee | Deduction | Statutory Employee State Insurance 0.75% deduction. |
| 71 | `PT` | Professional Tax | Deduction | State Professional Tax statutory slab deduction. |
| 72 | `LWF` | Labour Welfare Fund | Deduction | Statutory Employee Labour Welfare Fund deduction. |
| 73 | `LOAN` | Loan Recovery | Deduction | Monthly EMI recovery for company loan. |
| 74 | `ADVANCE` | Salary Advance Recovery | Deduction | Recovery for salary advance taken. |
| 75 | `TDS` | Tax Deducted at Source (TDS) | Deduction | Monthly income tax withholding deduction. |
| 76 | `FINE` | Fine Deduction | Deduction | Disciplinary fine deduction under Factories Act. |
| 77 | `OTHER_DEDUCTION` | Other Deduction | Deduction | Miscellaneous monthly deductions. |
| 78 | `PENALTY` | Penalty Deduction | Deduction | Contractual or compliance penalty deduction. |
| 79 | `MEDICAL_INSURANCE` | Medical Insurance Premium | Deduction | Employee share for group medical policy. |
| 80 | `LOAN_ADV_RECOVERY` | Loan & Advance Recovery | Deduction | Combined recovery for loan and advance. |
| 81 | `GRATUITY_PROVISION` | Gratuity Provision | Employer Contribution | Statutory employer provision for gratuity trust. |
| 82 | `BENEVOLENT_F` | Benevolent Fund | Deduction | Employee voluntary contribution to benevolent fund. |
| 83 | `STAFF_WELFARE_FUND` | Staff Welfare Fund | Deduction | Employee contribution to staff welfare fund. |
| 84 | `BACKGROUND_VERIFICATION` | Background Verification Fee | Deduction | One-time background screening charge recovery. |
| 85 | `VOLUNTARY_PROVIDENT_FUND` | Voluntary Provident Fund (VPF) | Deduction | Employee voluntary VPF contribution above 12%. |
| 86 | `TOTALDEDUCTION` | Total Monthly Deductions | Summary | Computed total deductions (`Sum(69..85)`). |
| 87 | `NETPAYABLE` | Net Salary Payable | Summary | Computed net payable (`GROSS_AMT - TOTALDEDUCTION`). |
| 88 | `EMPLOYER_PF` | Employer PF Contribution | Employer Contribution | Statutory Employer EPF match contribution. |
| 89 | `EMPLOYER_ESIC` | Employer ESIC Contribution | Employer Contribution | Statutory Employer ESIC 3.25% match contribution. |
| 90 | `EMPLOYER_GRATUITY` | Employer Gratuity Contribution | Employer Contribution | Statutory Employer Gratuity contribution. |
| 91 | `MEDICLAIM` | Employer Mediclaim Provision | Employer Contribution | Employer premium contribution for group health insurance. |
| 92 | `EMPLOYER_BONUS` | Employer Bonus Provision | Employer Contribution | Employer statutory bonus reserve provision. |
| 93 | `EMPLOYER_LEAVE_WITH_WAGES` | Employer LWW Provision | Employer Contribution | Employer statutory LWW leave encashment reserve. |
| 94 | `CTC` | Cost to Company | Summary | Total Cost to Company (`GROSS_AMT + Employer Contributions`). |

---

## 6. Response Schema Specification

### 6.1 Success Response (`200 OK` / `201 Created`)

```json
{
  "success": true,
  "timestamp": "2026-08-24T17:32:00Z",
  "results": {
    "totalProcessed": 1,
    "successCount": 1,
    "failedCount": 0,
    "employees": [
      {
        "id": "USR-0021",
        "employeeId": "EMP-021",
        "name": "Rahul Sharma",
        "designation": "SUPERVISOR",
        "department": "Operations",
        "status": "ACTIVE",
        "grossSalary": 24455.0,
        "totalDeductions": 2000.0,
        "netSalary": 22455.0
      }
    ],
    "errors": []
  }
}
```

### 6.2 Partial Success Response (`207 Multi-Status`)

```json
{
  "success": true,
  "timestamp": "2026-08-24T17:32:00Z",
  "results": {
    "totalProcessed": 2,
    "successCount": 1,
    "failedCount": 1,
    "employees": [
      {
        "id": "USR-0021",
        "employeeId": "EMP-021",
        "name": "Rahul Sharma",
        "status": "ACTIVE"
      }
    ],
    "errors": [
      {
        "row": 3,
        "employeeId": "EMP-022",
        "field": "BASIC",
        "errorMessage": "BASIC salary component value must be greater than 0"
      }
    ]
  }
}
```

---

## 7. Integration Code Examples

### 7.1 cURL Request Example

```bash
curl -X POST "http://api.ismartfacitechpl.com/payroll/api/v1/organization/employees/bulk-import" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "ATOMIC",
    "employees": [
      {
        "employeeId": "EMP-021",
        "name": "Rahul Sharma",
        "designation": "SUPERVISOR",
        "department": "Operations",
        "salaryComponents": [
          { "code": "BASIC", "name": "Basic Salary", "category": "Earning", "value": 11632 },
          { "code": "DA", "name": "Dearness Allowance", "category": "Earning", "value": 3614 },
          { "code": "HRA", "name": "House Rent Allowance", "category": "Earning", "value": 3709 },
          { "code": "PF", "name": "Provident Fund (EPF)", "category": "Deduction", "value": 1800 },
          { "code": "PT", "name": "Professional Tax", "category": "Deduction", "value": 200 }
        ]
      }
    ]
  }'
```
