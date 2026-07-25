import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportToPDF(title: string, headers: string[], rows: (string | number)[][]) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(title, 14, 15);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 22);

  autoTable(doc, {
    startY: 28,
    head: [headers],
    body: rows.map((row) => row.map(String)),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [37, 99, 235] },
  });

  doc.save(`${title.replace(/\s+/g, '_').toLowerCase()}.pdf`);
}

export function exportToExcel(
  filename: string,
  sheetName: string,
  headers: string[],
  rows: (string | number)[][]
) {
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export interface ReceiptExportData {
  receiptNumber: string;
  amount: number;
  issuedAt: string;
  reference: string;
  gateway: string;
  propertyName: string;
  unitNumber: string;
  tenantName: string;
}

export function exportReceiptPDF(receipt: ReceiptExportData) {
  const doc = new jsPDF();
  const formatNaira = (amount: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);

  doc.setFontSize(20);
  doc.setTextColor(37, 99, 235);
  doc.text('PropertyFlow', 14, 20);

  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('Payment Receipt', 14, 32);

  doc.setDrawColor(226, 232, 240);
  doc.line(14, 36, 196, 36);

  let y = 48;
  const row = (label: string, value: string) => {
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text(label, 14, y);
    doc.setTextColor(15, 23, 42);
    doc.text(value, 80, y);
    y += 10;
  };

  row('Receipt Number', receipt.receiptNumber);
  row('Date Issued', new Date(receipt.issuedAt).toLocaleDateString());
  row('Tenant', receipt.tenantName);
  row('Property', receipt.propertyName);
  row('Unit', receipt.unitNumber);
  row('Payment Reference', receipt.reference);
  row('Payment Method', receipt.gateway.toUpperCase());

  doc.setDrawColor(226, 232, 240);
  doc.line(14, y, 196, y);
  y += 12;

  doc.setFontSize(13);
  doc.setTextColor(37, 99, 235);
  doc.text('Amount Paid', 14, y);
  doc.setFontSize(16);
  doc.text(formatNaira(receipt.amount), 80, y);

  y += 20;
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'This receipt was generated automatically by PropertyFlow upon verified payment.',
    14,
    y
  );

  doc.save(`receipt-${receipt.receiptNumber}.pdf`);
}
