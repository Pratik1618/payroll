# Frontend PRD – Organization Management (Back Office)

## Objective
Redesign the current Organization Management page into a modern enterprise dashboard for back-office hierarchy management.
- This is a frontend-only implementation.
- No backend integration.
- Use only mock data.

## Tech Stack
**Use only:**
- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide Icons

**Do NOT use:**
- Material UI
- AG Grid
- PrimeReact
- Ant Design

Everything should follow the existing design system.

## Layout
------------------------------------------------------
Organization Management | Search Organization... | Quick Actions
------------------------------------------------------
│ Organization Tree │ Dashboard                      │
│                   │                                │
│                   │                                │
------------------------------------------------------

## Left Panel
Replace the Branch list with an Organization Tree.

**Hierarchy Example:**
Company
▶ Top Management
▶ CTO
▼ Operations
      ▼ West
            Mumbai
            Pune
            Gujarat
      South
      North
      East
▶ HR
▶ Finance
▶ Procurement
▶ Marketing
▶ Learning & Development
▶ Admin

**Use from shadcn:**
- Collapsible
- ScrollArea
- Button
- Badge

**The tree should support:**
- Expand / Collapse
- Active selection
- Search
- Icons
- Smooth animation

## Right Panel
When a node is selected, display its dashboard. Example: West Zone

### Top Summary Cards
- Employees
- Managers
- Payroll
- Employer Cost
- Departments
- Average Salary

Use shadcn Cards.

### Tabs (Below cards)
- Overview
- Employees
- Hierarchy
- Salary Cost
- Analytics

#### Overview Tab
Show using Cards:
- Department Head
- Total Employees
- Monthly Payroll
- Employer Cost
- Active Managers
- Organization Description

#### Employees Tab
Instead of AG Grid, Use shadcn Table.

**Columns:**
- Employee
- Employee ID
- Designation
- Department
- Reporting Manager
- Monthly Salary
- Status

**Features:**
- Search
- Pagination
- Status Badge
- Avatar
- Sort icons (UI only)
- Use mock data.

#### Hierarchy Tab
Create an Org Chart UI.
**Example:**
VP Operations
↓
AVP West
↓
Regional Manager
↓
Operations Executive
↓
Supervisor

Each person should appear inside a Card.

#### Salary Cost Tab
**Display Cards:**
- Basic Salary
- HRA
- Special Allowance
- Employer PF
- Employer ESIC
- Bonus
- Gratuity
- Total Cost

**Below that - Progress bars:**
Example:
Payroll Budget
███████████░░░░ 82%

#### Analytics Tab
Frontend only.
**Show:**
- Department Cost
- Employee Distribution
- Salary Distribution

Use simple progress bars, cards, and percentages. No chart library required for now.

## Search
Top search should search:
- Departments
- Zones
- Regions
- Employees
*(Frontend only)*

## Quick Actions
Top-right buttons:
- Add Department
- Add Region
- Add Zone
- Export
- Import
*(Buttons only. No functionality.)*

## Mock Data
Create a separate folder `mock/`
- `organization.ts`
- `employees.ts`
- `salary.ts`
- `analytics.ts`
No hardcoded data inside components.

## Component Structure
`organization/`
`components/`
- `OrganizationTree.tsx`
- `DashboardHeader.tsx`
- `SummaryCards.tsx`
- `OverviewTab.tsx`
- `EmployeesTable.tsx`
- `HierarchyTab.tsx`
- `SalaryCostTab.tsx`
- `AnalyticsTab.tsx`
- `SearchBar.tsx`
- `QuickActions.tsx`

Keep every component under 250 lines where possible.

## Design Style
The page should resemble an enterprise ERP.

**Requirements:**
- Clean spacing
- Minimal colors
- Rounded cards
- Sticky header
- Professional typography
- Responsive layout
- Soft shadows
- Collapsible tree
- Smooth transitions
- Consistent spacing
- Dark mode support

Avoid colorful dashboards, excessive gradients, or marketing-style visuals.

**Important:**
Do not redesign this as a CRUD page. The primary purpose of this page is to help management navigate the organization hierarchy and understand departmental structure and costs. All data should be mocked for now so the UI is ready for backend integration later.
