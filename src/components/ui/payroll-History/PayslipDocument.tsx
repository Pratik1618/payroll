// PayslipDocument.tsx
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

//@ts-ignore
import { toWords } from "number-to-words";


Font.register({
  family: 'Noto Sans',
  fonts: [
    { src: "/fonts/NotoSans-Regular.ttf", fontWeight: 'normal' },
  ]
})
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 10,
    fontFamily: "Noto Sans",
    backgroundColor: "#f9fafb",
  },
  header: {
    fontSize: 14,
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 10,
  },
  sectionContainer: {
    marginBottom: 10,
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#ffffff",
    border: "1pt solid #e5e7eb",
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#111827",
    borderBottom: "1pt solid #d1d5db",
    paddingBottom: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  earningsBox: {
    backgroundColor: "#ecfdf5", // light green
    border: "1pt solid #10b981",
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
  },
  deductionsBox: {
    backgroundColor: "#fef2f2", // light red
    border: "1pt solid #ef4444",
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
  },
  netPayBox: {
    backgroundColor: "#eff6ff", // light blue
    border: "1pt solid #3b82f6",
    borderRadius: 6,
    padding: 8,
  },
  badge: {
    fontSize: 8,
    textAlign: "center",
    marginTop: 4,
  },
  footer: {
    textAlign: "center",
    fontSize: 8,
    marginTop: 10,
    color: "#6b7280",
  },
});


interface PayslipDocumentProps {
  employeeId: string;
  month: string;
  record: any;
}

export function PayslipDocument({ employeeId, month, record }: PayslipDocumentProps) {
  const {
    earnedBasic = 0,
    da = 0,
    hra = 0,
    cca = 0,
    overtimePay = 0,
    grossSalary = 0,
    totalDeductions = 0,
    netSalary = 0,
    pf = 0,
    lwf = 0,
    esic = 0,
    tds = 0,
    pt = 0,
    otHours = 0,
  } = record;

  const attendance = {
    workingDays: record.totalDays || 0,
    present: record.daysPresent || 0,
    leaves: record.leaves || 0,
    lop: record.lop || 0,
    wo: record.wo || 4,
    otHours: record.otHours ?? record.ot ?? 0,
  };

  const employee = {
    name: record.name,
    designation: record.designation,
    department: record.department,
    site: record.site,
    pan: record.pan,
    uan: record.uan,
    esic: record.esic,
    joiningDate: record.joiningDate,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
   <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Payslip - {month}</Text>

        {/* Employee Details + Statutory Info */}
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={[styles.sectionContainer, { flex: 1 }]}>
            <Text style={styles.sectionTitle}>Employee Details</Text>
            <View style={styles.row}><Text>Name</Text><Text>{employee.name}</Text></View>
            <View style={styles.row}><Text>Employee Code</Text><Text>{employeeId}</Text></View>
            <View style={styles.row}><Text>Designation</Text><Text>{employee.designation}</Text></View>
            <View style={styles.row}><Text>Department</Text><Text>{employee.department}</Text></View>
            <View style={styles.row}><Text>Site</Text><Text>{employee.site}</Text></View>
          </View>

          <View style={[styles.sectionContainer, { flex: 1 }]}>
            <Text style={styles.sectionTitle}>Statutory Information</Text>
            <View style={styles.row}><Text>PAN</Text><Text>{employee.pan}</Text></View>
            <View style={styles.row}><Text>UAN</Text><Text>{employee.uan}</Text></View>
            <View style={styles.row}><Text>ESIC</Text><Text>{employee.esic}</Text></View>
            <View style={styles.row}>
              <Text>Joining Date</Text>
              <Text>
                {employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString("en-IN") : ""}
              </Text>
            </View>
          </View>
        </View>

        {/* Attendance Summary */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Attendance Summary</Text>
          {Object.entries(attendance).map(([key, val]) => (
            <View key={key} style={styles.row}>
              <Text>{key}</Text>
              <Text>{val}</Text>
            </View>
          ))}
        </View>

        {/* Earnings and Deductions */}
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={[styles.earningsBox, { flex: 1 }]}>
            <Text style={styles.sectionTitle}>Earnings</Text>
            <View style={styles.row}><Text>Basic</Text><Text>{formatCurrency(earnedBasic)}</Text></View>
            <View style={styles.row}><Text>DA</Text><Text>{formatCurrency(da)}</Text></View>
            <View style={styles.row}><Text>HRA</Text><Text>{formatCurrency(hra)}</Text></View>
            <View style={styles.row}><Text>CCA</Text><Text>{formatCurrency(cca)}</Text></View>
            <View style={styles.row}><Text>Overtime</Text><Text>{formatCurrency(overtimePay)}</Text></View>
            <View style={styles.row}><Text>Gross Salary</Text><Text>{formatCurrency(grossSalary)}</Text></View>
          </View>

          <View style={[styles.deductionsBox, { flex: 1 }]}>
            <Text style={styles.sectionTitle}>Deductions</Text>
            <View style={styles.row}><Text>PF</Text><Text>{formatCurrency(pf)}</Text></View>
            <View style={styles.row}><Text>ESI</Text><Text>{formatCurrency(esic)}</Text></View>
            <View style={styles.row}><Text>TDS</Text><Text>{formatCurrency(tds)}</Text></View>
            <View style={styles.row}><Text>PT</Text><Text>{formatCurrency(pt)}</Text></View>
            <View style={styles.row}><Text>LWF</Text><Text>{formatCurrency(lwf)}</Text></View>
            <View style={styles.row}><Text>Total Deductions</Text><Text>{formatCurrency(totalDeductions)}</Text></View>
          </View>
        </View>

        {/* Net Pay */}
        <View style={styles.netPayBox}>
          <Text style={styles.sectionTitle}>Net Pay</Text>
          <View style={styles.row}>
            <Text>Net Salary</Text>
            <Text>{formatCurrency(netSalary)}</Text>
          </View>
          <Text style={styles.badge}>
            Amount in Words: {toWords(netSalary)} rupees only
          </Text>
        </View>

        <Text style={styles.footer}>
          This is a computer-generated payslip and does not require a signature.
        </Text>
        <Text style={styles.footer}>
          For any queries, please contact HR Department.
        </Text>
      </Page>
    </Document>
  );
}
