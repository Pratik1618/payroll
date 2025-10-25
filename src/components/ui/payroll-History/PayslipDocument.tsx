// PayslipDocument.tsx
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

//@ts-ignore
import { toWords } from "number-to-words";

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  section: { marginBottom: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  header: { fontSize: 14, marginBottom: 10, textAlign: "center", fontWeight: "bold" },
  tableHeader: { fontWeight: "bold", borderBottom: "1px solid black", marginBottom: 4 },
  badge: { fontSize: 8, marginTop: 4, textAlign: "center" },
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
    wo: record.wo || 0,
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

        {/* Employee Details */}
        <View style={styles.section}>
          <Text style={styles.tableHeader}>Employee Details</Text>
          <View style={styles.row}>
            <Text>Name:</Text>
            <Text>{employee.name}</Text>
          </View>
          <View style={styles.row}>
            <Text>Employee Code:</Text>
            <Text>{employeeId}</Text>
          </View>
          <View style={styles.row}>
            <Text>Designation:</Text>
            <Text>{employee.designation}</Text>
          </View>
          <View style={styles.row}>
            <Text>Department:</Text>
            <Text>{employee.department}</Text>
          </View>
          <View style={styles.row}>
            <Text>Site:</Text>
            <Text>{employee.site}</Text>
          </View>
        </View>

        {/* Statutory Info */}
        <View style={styles.section}>
          <Text style={styles.tableHeader}>Statutory Information</Text>
          <View style={styles.row}>
            <Text>PAN:</Text>
            <Text>{employee.pan}</Text>
          </View>
          <View style={styles.row}>
            <Text>UAN:</Text>
            <Text>{employee.uan}</Text>
          </View>
          <View style={styles.row}>
            <Text>ESIC:</Text>
            <Text>{employee.esic}</Text>
          </View>
          <View style={styles.row}>
            <Text>Joining Date:</Text>
            <Text>{employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString("en-IN") : ""}</Text>
          </View>
        </View>

        {/* Attendance */}
        <View style={styles.section}>
          <Text style={styles.tableHeader}>Attendance Summary</Text>
          {Object.entries(attendance).map(([key, value]) => (
            <View key={key} style={styles.row}>
              <Text>{key}:</Text>
              <Text>{value}</Text>
            </View>
          ))}
        </View>

        {/* Earnings */}
        <View style={styles.section}>
          <Text style={styles.tableHeader}>Earnings</Text>
          <View style={styles.row}><Text>Basic</Text><Text>{formatCurrency(earnedBasic)}</Text></View>
          <View style={styles.row}><Text>DA</Text><Text>{formatCurrency(da)}</Text></View>
          <View style={styles.row}><Text>HRA</Text><Text>{formatCurrency(hra)}</Text></View>
          <View style={styles.row}><Text>CCA</Text><Text>{formatCurrency(cca)}</Text></View>
          <View style={styles.row}><Text>Overtime</Text><Text>{formatCurrency(overtimePay)}</Text></View>
          <View style={styles.row}><Text>Gross Salary</Text><Text>{formatCurrency(grossSalary)}</Text></View>
        </View>

        {/* Deductions */}
        <View style={styles.section}>
          <Text style={styles.tableHeader}>Deductions</Text>
          <View style={styles.row}><Text>PF</Text><Text>{formatCurrency(pf)}</Text></View>
          <View style={styles.row}><Text>ESI</Text><Text>{formatCurrency(esic)}</Text></View>
          <View style={styles.row}><Text>TDS</Text><Text>{formatCurrency(tds)}</Text></View>
          <View style={styles.row}><Text>PT</Text><Text>{formatCurrency(pt)}</Text></View>
          <View style={styles.row}><Text>LWF</Text><Text>{formatCurrency(lwf)}</Text></View>
          <View style={styles.row}><Text>Total Deductions</Text><Text>{formatCurrency(totalDeductions)}</Text></View>
        </View>

        {/* Net Pay */}
        <View style={styles.section}>
          <Text style={styles.tableHeader}>Net Pay</Text>
          <View style={styles.row}><Text>Net Pay:</Text><Text>{formatCurrency(netSalary)}</Text></View>
          <Text style={styles.badge}>Amount in Words: {toWords(netSalary)} rupees only</Text>
        </View>

        <View style={styles.section}>
          <Text>This is a computer-generated payslip and does not require a signature.</Text>
          <Text>For any queries, please contact HR Department.</Text>
        </View>
      </Page>
    </Document>
  );
}
