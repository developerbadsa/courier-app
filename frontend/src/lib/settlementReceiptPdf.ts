/**
 * Settlement Receipt PDF Generator
 * Generates a formal settlement remittance advice for merchants
 */

import jsPDF from 'jspdf';

interface SettlementReceiptData {
  settlementId: string;
  merchantName: string;
  merchantId: string;
  amount: number;
  currency: string;
  method: 'bank_transfer' | 'paypal' | 'sandbox';
  status: 'PAID' | 'PENDING' | 'PROCESSING' | 'FAILED';
  transactionId: string;
  gatewayReference?: string;
  paidAt?: string;
  requestedAt?: string;
  periodStart?: string;
  periodEnd?: string;
}

/**
 * Generate and download a settlement receipt PDF
 */
export function downloadSettlementReceipt(data: SettlementReceiptData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let y = 20;

  // ── Header ──
  doc.setFillColor(15, 42, 74); // #0F2A4A (primary navy)
  doc.rect(0, 0, pageWidth, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SHOHNAAT LOGISTICS', margin, 15);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Settlement Receipt / Remittance Advice', margin, 23);

  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, 29);

  y = 45;

  // ── Status Badge ──
  const statusColors: Record<string, [number, number, number]> = {
    PAID: [22, 163, 74],      // green
    PENDING: [217, 119, 6],   // amber
    PROCESSING: [37, 99, 235], // blue
    FAILED: [220, 38, 38],    // red
  };

  const [r, g, b] = statusColors[data.status] || [100, 100, 100];
  doc.setFillColor(r, g, b);
  doc.roundedRect(pageWidth - margin - 35, y - 4, 35, 8, 1, 1, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(data.status, pageWidth - margin - 17.5, y + 1, { align: 'center' });

  // ── Settlement Info ──
  y += 12;
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('SETTLEMENT DETAILS', margin, y);

  y += 8;
  const drawField = (label: string, value: string, yPos: number) => {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text(label, margin, yPos);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(value, margin + 40, yPos);
  };

  drawField('Settlement ID:', data.settlementId, y);
  y += 7;
  drawField('Transaction ID:', data.transactionId, y);
  y += 7;

  if (data.gatewayReference) {
    drawField('Gateway Ref:', data.gatewayReference, y);
    y += 7;
  }

  drawField('Merchant:', data.merchantName, y);
  y += 7;
  drawField('Merchant ID:', data.merchantId, y);
  y += 7;
  drawField('Payout Method:', data.method === 'bank_transfer' ? 'Stripe Connect (Bank Wire)' : data.method === 'paypal' ? 'PayPal Payouts' : 'Sandbox (Test)', y);
  y += 7;

  if (data.periodStart && data.periodEnd) {
    drawField('Period:', `${data.periodStart} — ${data.periodEnd}`, y);
    y += 7;
  }

  if (data.paidAt) {
    drawField('Paid On:', data.paidAt, y);
    y += 7;
  }

  if (data.requestedAt) {
    drawField('Requested:', data.requestedAt, y);
    y += 7;
  }

  // ── Amount Box ──
  y += 5;
  doc.setFillColor(240, 253, 244); // emerald-50
  doc.setDrawColor(187, 247, 208); // emerald-200
  doc.roundedRect(margin, y, contentWidth, 25, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(22, 163, 74);
  doc.text('SETTLEMENT AMOUNT', margin + 8, y + 8);

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(21, 128, 61);
  doc.text(
    `$${data.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${data.currency}`,
    margin + 8,
    y + 19
  );

  y += 35;

  // ── Divider ──
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // ── Footer ──
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 150, 150);
  doc.text(
    'This is an automatically generated settlement receipt from Shohnaat Logistics.',
    pageWidth / 2,
    y,
    { align: 'center' }
  );
  y += 4;
  doc.text(
    'For questions regarding this settlement, contact finance@shohnaat.com',
    pageWidth / 2,
    y,
    { align: 'center' }
  );
  y += 4;
  doc.text(
    'Shohnaat Logistics — Delivery made simple.',
    pageWidth / 2,
    y,
    { align: 'center' }
  );

  // ── Download ──
  const filename = `settlement-${data.settlementId.slice(0, 12)}.pdf`;
  doc.save(filename);
}

/**
 * Generate and open receipt in new tab for printing
 */
export function printSettlementReceipt(data: SettlementReceiptData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let y = 20;

  // Header
  doc.setFillColor(15, 42, 74);
  doc.rect(0, 0, pageWidth, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SHOHNAAT LOGISTICS', margin, 15);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Settlement Receipt / Remittance Advice', margin, 23);
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, 29);

  y = 45;

  // Status badge
  const statusColors: Record<string, [number, number, number]> = {
    PAID: [22, 163, 74],
    PENDING: [217, 119, 6],
    PROCESSING: [37, 99, 235],
    FAILED: [220, 38, 38],
  };
  const [sr, sg, sb] = statusColors[data.status] || [100, 100, 100];
  doc.setFillColor(sr, sg, sb);
  doc.roundedRect(pageWidth - margin - 35, y - 4, 35, 8, 1, 1, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(data.status, pageWidth - margin - 17.5, y + 1, { align: 'center' });

  // Settlement details
  y += 12;
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('SETTLEMENT DETAILS', margin, y);

  y += 8;
  const drawField = (label: string, value: string, yPos: number) => {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text(label, margin, yPos);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(value, margin + 40, yPos);
  };

  drawField('Settlement ID:', data.settlementId, y);
  y += 7;
  drawField('Transaction ID:', data.transactionId, y);
  y += 7;
  if (data.gatewayReference) {
    drawField('Gateway Ref:', data.gatewayReference, y);
    y += 7;
  }
  drawField('Merchant:', data.merchantName, y);
  y += 7;
  drawField('Payout Method:', data.method === 'bank_transfer' ? 'Stripe Connect (Bank Wire)' : data.method === 'paypal' ? 'PayPal Payouts' : 'Sandbox (Test)', y);
  y += 7;
  if (data.paidAt) {
    drawField('Paid On:', data.paidAt, y);
    y += 7;
  }

  // Amount box
  y += 5;
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(margin, y, contentWidth, 25, 2, 2, 'FD');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(22, 163, 74);
  doc.text('SETTLEMENT AMOUNT', margin + 8, y + 8);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(21, 128, 61);
  doc.text(
    `$${data.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${data.currency}`,
    margin + 8,
    y + 19
  );

  y += 35;
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 150, 150);
  doc.text('This is an automatically generated settlement receipt from Shohnaat Logistics.', pageWidth / 2, y, { align: 'center' });
  y += 4;
  doc.text('For questions regarding this settlement, contact finance@shohnaat.com', pageWidth / 2, y, { align: 'center' });

  // Open in new tab for printing
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, '_blank');
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}
