/**
 * PDF Invoice Generator for Shohnaat Logistics
 * Generates downloadable PDF invoices for COD settlements
 */

// Lightweight PDF generator — no external dependencies
// Generates a proper PDF invoice with line items, totals, and branding

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  from: {
    name: string;
    address?: string;
    email?: string;
    phone?: string;
  };
  to: {
    name: string;
    address?: string;
    email?: string;
    phone?: string;
  };
  items: InvoiceItem[];
  taxRate?: number; // percentage
  currency?: string;
  notes?: string;
}

function escapePDF(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function formatCurrency(amount: number, currency = 'USD'): string {
  return `${currency === 'USD' ? '$' : currency} ${amount.toFixed(2)}`;
}

export function generateInvoicePDF(data: InvoiceData): string {
  const currency = data.currency || 'USD';
  const taxRate = data.taxRate || 0;
  const margin = 50;
  const pageWidth = 595.28; // A4
  const pageHeight = 841.89;

  let y = margin;
  const lines: string[] = [];

  const addLine = (text: string, fontSize = 10, options: { bold?: boolean; color?: string; align?: string } = {}) => {
    const font = options.bold ? 'BT /F1' : 'BT /F2';
    const color = options.color || '0 0 0';
    const x = options.align === 'right' ? pageWidth - margin - 200 : margin;
    lines.push(`${x} ${y} Td`);
    lines.push(`${font} ${fontSize} Tf`);
    lines.push(`(${color} rg)`);
    lines.push(`(${escapePDF(text)}) Tj`);
    lines.push('ET');
    y -= fontSize + 4;
  };

  const addLineAt = (text: string, x: number, yPos: number, fontSize = 10, options: { bold?: boolean; color?: string } = {}) => {
    const font = options.bold ? 'BT /F1' : 'BT /F2';
    lines.push(`${x} ${yPos} Td`);
    lines.push(`${font} ${fontSize} Tf`);
    if (options.color) lines.push(`(${options.color} rg)`);
    lines.push(`(${escapePDF(text)}) Tj`);
    lines.push('ET');
  };

  // ── Header ──
  addLineAt('SHOHNAAT LOGISTICS', margin, pageHeight - margin, 18, { bold: true, color: '0.145 0.388 0.922' });
  addLineAt('Invoice', margin, pageHeight - margin - 25, 14, { bold: true });
  addLineAt(`#${data.invoiceNumber}`, margin + 55, pageHeight - margin - 25, 14, { color: '0.145 0.388 0.922' });

  // ── Invoice details (right side) ──
  const rightX = pageWidth - margin - 180;
  addLineAt(`Date: ${data.invoiceDate}`, rightX, pageHeight - margin, 10);
  if (data.dueDate) {
    addLineAt(`Due: ${data.dueDate}`, rightX, pageHeight - margin - 15, 10);
  }

  // ── From / To boxes ──
  y = pageHeight - margin - 60;
  addLineAt('FROM:', margin, y, 9, { bold: true, color: '0.4 0.4 0.4' });
  y -= 15;
  addLineAt(data.from.name, margin, y, 10, { bold: true });
  if (data.from.address) { y -= 13; addLineAt(data.from.address, margin, y, 9); }
  if (data.from.email) { y -= 13; addLineAt(data.from.email, margin, y, 9); }
  if (data.from.phone) { y -= 13; addLineAt(data.from.phone, margin, y, 9); }

  y = pageHeight - margin - 60;
  addLineAt('TO:', rightX + 80, y, 9, { bold: true, color: '0.4 0.4 0.4' });
  y -= 15;
  addLineAt(data.to.name, rightX + 80, y, 10, { bold: true });
  if (data.to.address) { y -= 13; addLineAt(data.to.address, rightX + 80, y, 9); }
  if (data.to.email) { y -= 13; addLineAt(data.to.email, rightX + 80, y, 9); }
  if (data.to.phone) { y -= 13; addLineAt(data.to.phone, rightX + 80, y, 9); }

  // ── Table header ──
  y = y - 40;
  const tableX = margin;
  const colWidths = [250, 60, 90, 90];
  const headers = ['Description', 'Qty', 'Unit Price', 'Total'];

  // Header background
  lines.push('0.96 0.97 0.98 rg');
  lines.push(`${tableX} ${y - 5} ${colWidths.reduce((a, b) => a + b, 0)} 18 re f`);

  headers.forEach((header, i) => {
    const x = tableX + colWidths.slice(0, i).reduce((a, b) => a + b, 0) + 5;
    addLineAt(header, x, y, 9, { bold: true });
  });

  // ── Table rows ──
  let subtotal = 0;
  data.items.forEach((item, idx) => {
    y -= 20;
    const total = item.quantity * item.unitPrice;
    subtotal += total;

    if (idx % 2 === 1) {
      lines.push('0.98 0.98 1 rg');
      lines.push(`${tableX} ${y - 5} ${colWidths.reduce((a, b) => a + b, 0)} 18 re f`);
    }

    addLineAt(item.description, tableX + 5, y, 10);
    addLineAt(String(item.quantity), tableX + colWidths[0] + 5, y, 10);
    addLineAt(formatCurrency(item.unitPrice, currency), tableX + colWidths[0] + colWidths[1] + 5, y, 10);
    addLineAt(formatCurrency(total, currency), tableX + colWidths[0] + colWidths[1] + colWidths[2] + 5, y, 10, { bold: true });
  });

  // ── Totals ──
  y -= 25;
  const totalsX = tableX + colWidths[0] + 10;
  const valuesX = tableX + colWidths[0] + colWidths[1] + colWidths[2] + 5;

  addLineAt('Subtotal:', totalsX, y, 10);
  addLineAt(formatCurrency(subtotal, currency), valuesX, y, 10);

  const taxAmount = subtotal * (taxRate / 100);
  if (taxRate > 0) {
    y -= 16;
    addLineAt(`Tax (${taxRate}%):`, totalsX, y, 10);
    addLineAt(formatCurrency(taxAmount, currency), valuesX, y, 10);
  }

  y -= 20;
  lines.push('0.145 0.388 0.922 rg');
  lines.push(`${totalsX} ${y + 2} ${colWidths[1] + colWidths[2] + 100} 0.5 re S`);

  y -= 5;
  addLineAt('Grand Total:', totalsX, y, 12, { bold: true, color: '0.145 0.388 0.922' });
  addLineAt(formatCurrency(subtotal + taxAmount, currency), valuesX, y, 12, { bold: true, color: '0.145 0.388 0.922' });

  // ── Notes ──
  if (data.notes) {
    y -= 40;
    addLineAt('Notes:', margin, y, 9, { bold: true, color: '0.4 0.4 0.4' });
    y -= 14;
    addLineAt(data.notes, margin, y, 9);
  }

  // ── Footer ──
  y = margin + 30;
  lines.push('0.8 0.8 0.8 rg');
  lines.push(`${margin} ${y} ${pageWidth - 2 * margin} 0.5 re S`);
  y -= 15;
  addLineAt('Shohnaat Logistics — shohnaat.rahimbadsa.me', margin, y, 8, { color: '0.6 0.6 0.6' });

  // ── Build PDF ──
  const objects: string[] = [];
  let objNum = 1;

  // Catalog
  const catalogNum = objNum++;
  // Pages
  const pagesNum = objNum++;
  // Page
  const pageNum = objNum++;
  // Font 1 (Bold)
  const font1Num = objNum++;
  // Font 2 (Regular)
  const font2Num = objNum++;
  // Content stream
  const contentNum = objNum++;

  objects.push(`${catalogNum} 0 obj\n<< /Type /Catalog /Pages ${pagesNum} 0 R >>\nendobj`);
  objects.push(`${pagesNum} 0 obj\n<< /Type /Pages /Kids [${pageNum} 0 R] /Count 1 >>\nendobj`);
  objects.push(`${pageNum} 0 obj\n<< /Type /Page /Parent ${pagesNum} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents ${contentNum} 0 R /Resources << /Font << /F1 ${font1Num} 0 R /F2 ${font2Num} 0 R >> >> >>\nendobj`);
  objects.push(`${font1Num} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj`);
  objects.push(`${font2Num} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj`);

  const streamContent = `q\n${lines.join('\n')}\nQ`;
  objects.push(`${contentNum} 0 obj\n<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream\nendobj`);

  // Cross-reference table
  const xrefOffset = 0; // simplified
  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  objects.forEach((obj) => {
    offsets.push(pdf.length);
    pdf += obj + '\n';
  });

  const xrefStart = pdf.length;
  pdf += 'xref\n';
  pdf += `0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  offsets.forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });

  pdf += 'trailer\n';
  pdf += `<< /Size ${objects.length + 1} /Root ${catalogNum} 0 R >>\n`;
  pdf += 'startxref\n';
  pdf += `${xrefStart}\n`;
  pdf += '%%EOF';

  return pdf;
}

export function downloadInvoicePDF(data: InvoiceData) {
  const pdf = generateInvoicePDF(data);
  const blob = new Blob([pdf], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `shohnaat-invoice-${data.invoiceNumber}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
