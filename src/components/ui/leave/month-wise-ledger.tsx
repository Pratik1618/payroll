import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const ledger = [
  { month: "Apr-24", o: 0, e: 1.75, a: 0, l: 0, c: 1.75 },
  { month: "May-24", o: 1.75, e: 1.75, a: 1, l: 0, c: 2.5 },
  { month: "Jun-24", o: 2.5, e: 1.75, a: 0.5, l: 0, c: 3.75 },
]

export function MonthWiseLedger() {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Month</TableHead>
            <TableHead className="text-right">Opening</TableHead>
            <TableHead className="text-right">Earned</TableHead>
            <TableHead className="text-right">Availed</TableHead>
            <TableHead className="text-right">Lapsed</TableHead>
            <TableHead className="text-right">Closing</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ledger.map((r) => (
            <TableRow key={r.month}>
              <TableCell>{r.month}</TableCell>
              <TableCell className="text-right">{r.o}</TableCell>
              <TableCell className="text-right text-green-600">{r.e}</TableCell>
              <TableCell className="text-right">{r.a}</TableCell>
              <TableCell className="text-right text-red-600">{r.l}</TableCell>
              <TableCell className="text-right font-semibold">{r.c}</TableCell>
            </TableRow>
          ))}
          <TableRow className="bg-muted font-semibold">
            <TableCell>Total</TableCell>
            <TableCell />
            <TableCell className="text-right">21</TableCell>
            <TableCell className="text-right">8</TableCell>
            <TableCell className="text-right">1.5</TableCell>
            <TableCell className="text-right">11.5</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  )
}
