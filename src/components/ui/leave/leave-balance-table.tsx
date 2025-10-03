import type { LeaveBalance } from "./data"

export default function LeaveBalanceTable({ rows }: { rows: LeaveBalance[] }) {
  const totals = rows.reduce(
    (acc, r) => {
      acc.CL += r.CL
      acc.SL += r.SL
      acc.EL += r.EL
      acc.LOP += r.LOP
      return acc
    },
    { CL: 0, SL: 0, EL: 0, LOP: 0 },
  )

  return (
    <div className="rounded-lg border bg-card text-card-foreground">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-foreground">
            <tr className="text-left">
              <th className="px-3 py-2 font-medium">Emp ID</th>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Designation</th>
              <th className="px-3 py-2 font-medium">CL</th>
              <th className="px-3 py-2 font-medium">SL</th>
              <th className="px-3 py-2 font-medium">EL</th>
              <th className="px-3 py-2 font-medium">LOP</th>
              <th className="px-3 py-2 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-muted-foreground" colSpan={8}>
                  No employees found for the selected Client and Site.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.empId} className="border-t">
                  <td className="px-3 py-2">{r.empId}</td>
                  <td className="px-3 py-2">{r.name}</td>
                  <td className="px-3 py-2">{r.designation}</td>
                  <td className="px-3 py-2">{r.CL}</td>
                  <td className="px-3 py-2">{r.SL}</td>
                  <td className="px-3 py-2">{r.EL}</td>
                  <td className="px-3 py-2">{r.LOP}</td>
                  <td className="px-3 py-2 text-muted-foreground">{new Date(r.lastUpdated).toLocaleDateString('en-US')}</td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot className="border-t bg-muted/30">
            <tr>
              <td className="px-3 py-2 font-medium" colSpan={3}>
                Totals
              </td>
              <td className="px-3 py-2 font-semibold">{totals.CL}</td>
              <td className="px-3 py-2 font-semibold">{totals.SL}</td>
              <td className="px-3 py-2 font-semibold">{totals.EL}</td>
              <td className="px-3 py-2 font-semibold">{totals.LOP}</td>
              <td className="px-3 py-2" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
