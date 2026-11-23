import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import { formatDate, formatMoney } from "./format";

export type InvoiceDocumentProps = {
  orderNumber: string;
  invoiceNumber: string;
  issueDate: Date;
  orderDate: Date;
  currency: string;
  customer: { name: string };
  shippingAddress: string;
  items: Array<{
    name: string;
    sku: string;
    quantity: number;
    unitPrice: string;
    lineTotal: string;
  }>;
  subtotal: string;
  grandTotal: string;
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#0f172a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    paddingBottom: 16,
  },
  brand: { fontSize: 20, fontWeight: 700, letterSpacing: 1 },
  muted: { color: "#64748b" },
  title: { fontSize: 22, fontWeight: 700, textAlign: "right" },
  section: { marginTop: 20 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  metaLabel: { color: "#64748b", marginBottom: 2 },
  metaValue: { fontWeight: 700 },
  columns: { flexDirection: "row", marginTop: 20 },
  column: { flexGrow: 1, flexBasis: 0, paddingRight: 12 },
  table: { marginTop: 20, borderWidth: 1, borderColor: "#e2e8f0" },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontWeight: 700,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  description: { flexGrow: 1, flexBasis: 0 },
  quantity: { width: 50, textAlign: "right" },
  money: { width: 80, textAlign: "right" },
  totals: { marginTop: 16, alignItems: "flex-end" },
  totalRow: {
    flexDirection: "row",
    width: 220,
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  grandTotal: {
    flexDirection: "row",
    width: 220,
    justifyContent: "space-between",
    paddingTop: 6,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#0f172a",
    fontWeight: 700,
    fontSize: 12,
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 8,
    fontSize: 8,
    color: "#64748b",
  },
});

const money = (value: string, currency: string) => formatMoney(value, currency);

export function InvoiceDocument({
  orderNumber,
  invoiceNumber,
  issueDate,
  orderDate,
  currency,
  customer,
  shippingAddress,
  items,
  subtotal,
  grandTotal,
}: InvoiceDocumentProps) {
  return (
    <Document
      title={`Invoice ${invoiceNumber}`}
      author="OrderFlow"
      subject={`Invoice for order ${orderNumber}`}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>ORDERFLOW</Text>
            <Text style={styles.muted}>B2B order management POC</Text>
          </View>
          <View>
            <Text style={styles.title}>INVOICE</Text>
            <Text style={styles.muted}>{invoiceNumber}</Text>
          </View>
        </View>

        <View style={styles.columns}>
          <View style={styles.column}>
            <Text style={styles.metaLabel}>Billed to</Text>
            <Text style={styles.metaValue}>{customer.name}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.metaLabel}>Ship to</Text>
            <Text>{shippingAddress}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.metaLabel}>Order</Text>
            <Text style={styles.metaValue}>{orderNumber}</Text>
            <Text style={styles.muted}>Placed {formatDate(orderDate)}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.metaLabel}>Issue date</Text>
            <Text>{formatDate(issueDate)}</Text>
            <Text style={styles.muted}>Currency {currency}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.description}>Item</Text>
            <Text style={styles.quantity}>Qty</Text>
            <Text style={styles.money}>Unit</Text>
            <Text style={styles.money}>Line total</Text>
          </View>

          {items.map((item) => (
            <View key={`${item.sku}-${item.name}`} style={styles.tableRow} wrap={false}>
              <View style={styles.description}>
                <Text>{item.name}</Text>
                <Text style={styles.muted}>{item.sku}</Text>
              </View>
              <Text style={styles.quantity}>{item.quantity}</Text>
              <Text style={styles.money}>{money(item.unitPrice, currency)}</Text>
              <Text style={styles.money}>{money(item.lineTotal, currency)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.muted}>Subtotal</Text>
            <Text>{money(subtotal, currency)}</Text>
          </View>
          <View style={styles.grandTotal}>
            <Text>Grand total</Text>
            <Text>{money(grandTotal, currency)}</Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>This is a mock invoice generated by the assessment POC. No payment is due.</Text>
          <Text>
            {invoiceNumber} · Order {orderNumber}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
