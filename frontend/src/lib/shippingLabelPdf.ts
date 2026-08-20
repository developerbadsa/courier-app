/**
 * Thermal Shipping Label PDF Generator — Shohnaat Logistics
 * Generates industry-standard 4x6" (101.6 x 152.4mm) thermal shipping labels
 * Compatible with Zebra, Rollo, Dymo, MUNBYN, Brother thermal printers
 */

import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

/* ── Types ── */
export interface ShippingLabelData {
  trackingNumber: string;
  serviceType: 'STANDARD' | 'EXPRESS' | 'ECONOMY';
  // Ship From (origin)
  shipFromName: string;
  shipFromAddress: string;
  shipFromCity: string;
  shipFromPhone: string;
  // Ship To (destination)
  shipToName: string;
  shipToAddress: string;
  shipToCity: string;
  shipToPhone: string;
  // Package
  weightKg?: number;
  // COD
  paymentType: 'COD' | 'PREPAID';
  codAmount?: number;
  // Hub routing
  hubCode?: string;
}

/* ── Constants ── */
const LABEL_WIDTH_MM = 152.4;  // 6 inches
const LABEL_HEIGHT_MM = 101.6; // 4 inches
const MARGIN = 3;
const TRACKING_URL = 'https://shohnaat.rahimbadsa.me/track/';

/* ── Helpers ── */
function truncate(text: string, maxLen: number): string {
  return text.length > maxLen ? text.slice(0, maxLen - 1) + '…' : text;
}

function serviceLabel(type: string): string {
  switch (type) {
    case 'EXPRESS': return 'EXPRESS 24H';
    case 'ECONOMY': return 'ECONOMY 5-7D';
    default: return 'STANDARD 2-3D';
  }
}

/* ── Main: Generate PDF Data URL ── */
async function generateLabelPDFDataUrl(data: ShippingLabelData): Promise<string> {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [LABEL_HEIGHT_MM, LABEL_WIDTH_MM], // height x width for landscape
  });

  const W = LABEL_WIDTH_MM;
  const H = LABEL_HEIGHT_MM;
  const m = MARGIN;

  // ── Background: White ──
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, W, H, 'F');

  // ── Top Border Line ──
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.line(m, m, W - m, m);

  // ═══ HEADER SECTION ═══
  // Brand
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text('SHOHNAAT LOGISTICS', m + 1, m + 4);

  // Service badge (right side)
  const svcText = serviceLabel(data.serviceType);
  const svcWidth = doc.getStringUnitWidth(svcText) * 7 / doc.internal.scaleFactor + 4;
  const svcX = W - m - svcWidth;
  doc.setFillColor(0, 0, 0);
  doc.roundedRect(svcX, m + 1, svcWidth, 4.5, 0.5, 0.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(5.5);
  doc.text(svcText, svcX + 2, m + 3.8);

  // Tracking number (prominent)
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(data.trackingNumber, m + 1, m + 10);

  // Separator line
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.line(m, m + 12, W - m, m + 12);

  // ═══ BARCODE SECTION ═══
  try {
    // Generate barcode as canvas data URL
    const barcodeDataUrl = await generateBarcodeDataUrl(data.trackingNumber, 140, 18);
    doc.addImage(barcodeDataUrl, 'PNG', m + 1, m + 13, 80, 14);
  } catch {
    // Fallback: just show tracking number text
    doc.setFont('courier', 'bold');
    doc.setFontSize(7);
    doc.text(data.trackingNumber, m + 30, m + 22);
  }

  // ═══ QR CODE (right of barcode) ═══
  try {
    const qrDataUrl = await QRCode.toDataURL(TRACKING_URL + data.trackingNumber, {
      width: 120,
      margin: 0,
      color: { dark: '#000000', light: '#FFFFFF' },
      errorCorrectionLevel: 'M',
    });
    doc.addImage(qrDataUrl, 'PNG', W - m - 20, m + 13, 18, 18);
  } catch {
    // QR failed — skip silently
  }

  // ═══ SHIP FROM BOX (left) ═══
  const boxY = m + 29;
  const boxH = 22;
  const leftBoxW = (W - 2 * m - 3) / 2;

  // Left box border
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.2);
  doc.roundedRect(m, boxY, leftBoxW, boxH, 0.5, 0.5, 'S');

  // Ship From header
  doc.setFillColor(230, 230, 230);
  doc.roundedRect(m, boxY, leftBoxW, 4, 0.5, 0.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5);
  doc.setTextColor(0, 0, 0);
  doc.text('SHIP FROM', m + 1.5, boxY + 2.8);

  // Ship From content
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.5);
  doc.text(truncate(data.shipFromName, 28), m + 1.5, boxY + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(4.5);
  doc.text(truncate(data.shipFromAddress, 32), m + 1.5, boxY + 11);
  doc.text(truncate(data.shipFromCity, 30), m + 1.5, boxY + 14.5);
  doc.text(data.shipFromPhone, m + 1.5, boxY + 18);

  // ═══ SHIP TO BOX (right) ═══
  const rightBoxX = m + leftBoxW + 3;

  doc.roundedRect(rightBoxX, boxY, leftBoxW, boxH, 0.5, 0.5, 'S');

  // Ship To header
  doc.setFillColor(230, 230, 230);
  doc.roundedRect(rightBoxX, boxY, leftBoxW, 4, 0.5, 0.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5);
  doc.text('SHIP TO', rightBoxX + 1.5, boxY + 2.8);

  // Ship To content (bold name)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.text(truncate(data.shipToName, 28), rightBoxX + 1.5, boxY + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(4.5);
  doc.text(truncate(data.shipToAddress, 32), rightBoxX + 1.5, boxY + 11);
  doc.text(truncate(data.shipToCity, 30), rightBoxX + 1.5, boxY + 14.5);
  doc.text(data.shipToPhone, rightBoxX + 1.5, boxY + 18);

  // ═══ COD / PREPAID BADGE ═══
  const badgeY = boxY + boxH + 2;
  const badgeH = 7;

  if (data.paymentType === 'COD' && data.codAmount && data.codAmount > 0) {
    // COD badge — high contrast
    doc.setFillColor(0, 0, 0);
    doc.roundedRect(m, badgeY, W - 2 * m, badgeH, 0.5, 0.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(`COLLECT ON DELIVERY: $${data.codAmount.toFixed(2)} USD`, W / 2, badgeY + 4.8, { align: 'center' });
  } else {
    // Prepaid badge
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.2);
    doc.roundedRect(m, badgeY, W - 2 * m, badgeH, 0.5, 0.5, 'S');
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.text('PREPAID — DO NOT COLLECT CASH', W / 2, badgeY + 4.5, { align: 'center' });
  }

  // ═══ BOTTOM DETAILS ═══
  const bottomY = H - m - 2;
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(4.5);

  // Weight
  if (data.weightKg) {
    doc.text(`WT: ${data.weightKg.toFixed(2)} KG`, m + 1, bottomY);
  }

  // Hub
  if (data.hubCode) {
    doc.text(`HUB: ${data.hubCode}`, m + 35, bottomY);
  }

  // Page count / label identifier
  doc.setTextColor(140, 140, 140);
  doc.text('SHOHNAAT LOGISTICS — shohnaat.rahimbadsa.me', W - m - 1, bottomY, { align: 'right' });

  // ── Bottom border ──
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.line(m, H - m, W - m, H - m);

  return doc.output('dataurlstring');
}

/* ── Barcode Generator (Code-128) ── */
function generateBarcodeDataUrl(text: string, width: number, height: number): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new Error('Server-side barcode generation not supported'));
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width * 4; // high-res for thermal quality
    canvas.height = height * 4;

    try {
      // jsBarcode expects a canvas element
      const JsBarcode = require('jsbarcode').default || require('jsbarcode');
      JsBarcode(canvas, text, {
        format: 'CODE128',
        width: 1.5,
        height: height * 3,
        displayValue: true,
        fontSize: 14,
        font: 'monospace',
        textMargin: 2,
        margin: 0,
        background: '#FFFFFF',
        lineColor: '#000000',
      });
      resolve(canvas.toDataURL('image/png'));
    } catch (err) {
      reject(err);
    }
  });
}

/* ── Public: Print Label (opens browser print dialog) ── */
export async function printShippingLabel(data: ShippingLabelData): Promise<void> {
  try {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [LABEL_HEIGHT_MM, LABEL_WIDTH_MM],
    });

    const W = LABEL_WIDTH_MM;
    const H = LABEL_HEIGHT_MM;
    const m = MARGIN;

    // White background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, W, H, 'F');

    // Top border
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.4);
    doc.line(m, m, W - m, m);

    // Header: Brand
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text('SHOHNAAT LOGISTICS', m + 1, m + 4);

    // Service badge
    const svcText = serviceLabel(data.serviceType);
    const svcWidth = doc.getStringUnitWidth(svcText) * 7 / doc.internal.scaleFactor + 4;
    const svcX = W - m - svcWidth;
    doc.setFillColor(0, 0, 0);
    doc.roundedRect(svcX, m + 1, svcWidth, 4.5, 0.5, 0.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(5.5);
    doc.text(svcText, svcX + 2, m + 3.8);

    // Tracking number
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(data.trackingNumber, m + 1, m + 10);

    // Separator
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.line(m, m + 12, W - m, m + 12);

    // Barcode
    try {
      const barcodeDataUrl = await generateBarcodeDataUrl(data.trackingNumber, 140, 18);
      doc.addImage(barcodeDataUrl, 'PNG', m + 1, m + 13, 80, 14);
    } catch {
      doc.setFont('courier', 'bold');
      doc.setFontSize(7);
      doc.text(data.trackingNumber, m + 30, m + 22);
    }

    // QR Code
    try {
      const qrDataUrl = await QRCode.toDataURL(TRACKING_URL + data.trackingNumber, {
        width: 120, margin: 0,
        color: { dark: '#000000', light: '#FFFFFF' },
        errorCorrectionLevel: 'M',
      });
      doc.addImage(qrDataUrl, 'PNG', W - m - 20, m + 13, 18, 18);
    } catch { /* skip */ }

    // Ship From box
    const boxY = m + 29;
    const boxH = 22;
    const leftBoxW = (W - 2 * m - 3) / 2;

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.roundedRect(m, boxY, leftBoxW, boxH, 0.5, 0.5, 'S');
    doc.setFillColor(230, 230, 230);
    doc.roundedRect(m, boxY, leftBoxW, 4, 0.5, 0.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5);
    doc.setTextColor(0, 0, 0);
    doc.text('SHIP FROM', m + 1.5, boxY + 2.8);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.text(truncate(data.shipFromName, 28), m + 1.5, boxY + 7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(4.5);
    doc.text(truncate(data.shipFromAddress, 32), m + 1.5, boxY + 11);
    doc.text(truncate(data.shipFromCity, 30), m + 1.5, boxY + 14.5);
    doc.text(data.shipFromPhone, m + 1.5, boxY + 18);

    // Ship To box
    const rightBoxX = m + leftBoxW + 3;
    doc.roundedRect(rightBoxX, boxY, leftBoxW, boxH, 0.5, 0.5, 'S');
    doc.setFillColor(230, 230, 230);
    doc.roundedRect(rightBoxX, boxY, leftBoxW, 4, 0.5, 0.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5);
    doc.text('SHIP TO', rightBoxX + 1.5, boxY + 2.8);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.text(truncate(data.shipToName, 28), rightBoxX + 1.5, boxY + 7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(4.5);
    doc.text(truncate(data.shipToAddress, 32), rightBoxX + 1.5, boxY + 11);
    doc.text(truncate(data.shipToCity, 30), rightBoxX + 1.5, boxY + 14.5);
    doc.text(data.shipToPhone, rightBoxX + 1.5, boxY + 18);

    // COD / Prepaid badge
    const badgeY = boxY + boxH + 2;
    const badgeH = 7;

    if (data.paymentType === 'COD' && data.codAmount && data.codAmount > 0) {
      doc.setFillColor(0, 0, 0);
      doc.roundedRect(m, badgeY, W - 2 * m, badgeH, 0.5, 0.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.text(`COLLECT ON DELIVERY: $${data.codAmount.toFixed(2)} USD`, W / 2, badgeY + 4.8, { align: 'center' });
    } else {
      doc.setDrawColor(100, 100, 100);
      doc.setLineWidth(0.2);
      doc.roundedRect(m, badgeY, W - 2 * m, badgeH, 0.5, 0.5, 'S');
      doc.setTextColor(80, 80, 80);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.text('PREPAID — DO NOT COLLECT CASH', W / 2, badgeY + 4.5, { align: 'center' });
    }

    // Bottom details
    const bottomY = H - m - 2;
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(4.5);
    if (data.weightKg) doc.text(`WT: ${data.weightKg.toFixed(2)} KG`, m + 1, bottomY);
    if (data.hubCode) doc.text(`HUB: ${data.hubCode}`, m + 35, bottomY);
    doc.setTextColor(140, 140, 140);
    doc.text('SHOHNAAT LOGISTICS — shohnaat.rahimbadsa.me', W - m - 1, bottomY, { align: 'right' });

    // Bottom border
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.4);
    doc.line(m, H - m, W - m, H - m);

    // ── Open print dialog ──
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const printWindow = window.open(pdfUrl, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    } else {
      // Fallback: download instead
      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = `label-${data.trackingNumber}.pdf`;
      a.click();
    }
  } catch {
    console.error('Failed to generate shipping label');
  }
}

/* ── Public: Download Label PDF ── */
export async function downloadShippingLabel(data: ShippingLabelData): Promise<void> {
  try {
    const dataUrl = await generateLabelPDFDataUrl(data);
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `label-${data.trackingNumber}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch {
    console.error('Failed to download shipping label');
  }
}

/* ── Public: Generate multi-page batch PDF for bulk printing ── */
export async function printBatchLabels(labels: ShippingLabelData[]): Promise<void> {
  if (labels.length === 0) return;

  // Generate first label PDF, then append remaining
  const firstDataUrl = await generateLabelPDFDataUrl(labels[0]);
  // For batch, we open each label in sequence
  for (const label of labels) {
    await printShippingLabel(label);
    // Small delay between prints
    await new Promise((r) => setTimeout(r, 300));
  }
}

/* ── Helper: Convert shipment API response to label data ── */
export function shipmentToLabelData(shipment: Record<string, unknown>): ShippingLabelData {
  const s = shipment as any;
  return {
    trackingNumber: s.trackingNumber || s.id || 'SH-UNKNOWN',
    serviceType: s.chargeSnapshot?.serviceType || s.serviceType || 'STANDARD',
    shipFromName: s.merchant?.businessName || s.pickupAddressSnap?.contactName || 'Shipper',
    shipFromAddress: s.pickupAddress?.line1 || s.pickupAddressSnap?.street || '',
    shipFromCity: s.pickupAddress?.city || s.pickupAddressSnap?.city || '',
    shipFromPhone: s.pickupAddressSnap?.contactPhone || s.merchant?.phone || '',
    shipToName: s.consignee?.name || 'Recipient',
    shipToAddress: s.deliveryAddress?.line1 || s.deliveryAddressSnap?.street || '',
    shipToCity: s.deliveryAddress?.city || s.deliveryAddressSnap?.city || '',
    shipToPhone: s.consignee?.phone || '',
    weightKg: s.weightKg ? parseFloat(s.weightKg) : undefined,
    paymentType: s.paymentType || 'COD',
    codAmount: s.codAmount ? parseFloat(s.codAmount) : 0,
    hubCode: s.currentBranch?.code || s.currentBranch?.name || undefined,
  };
}
