import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import { getInvoiceLabels, money, totals, type InvoicePayload } from "./invoice";

const PAGE_SIZE: [number, number] = [226.77, 520];
const LEFT_MARGIN = 18;
const START_Y = 485;

/**
 * pdf-lib's standard Helvetica font only supports WinAnsi characters.
 * Normalize user input before drawing it to avoid encoding errors.
 */
function toPdfText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^ -~]/g, "");
}

/** Renders an invoice payload to PDF bytes for the public API response. */
export async function renderInvoicePdf(invoice: InvoicePayload): Promise<Uint8Array> {
  const labels = getInvoiceLabels(invoice.language);
  const currency = invoice.currency ?? "EUR";
  const result = totals(invoice);

  const document = await PDFDocument.create();
  const page = document.addPage(PAGE_SIZE);
  const regularFont = await document.embedFont(StandardFonts.Helvetica);
  const boldFont = await document.embedFont(StandardFonts.HelveticaBold);
  let y = START_Y;

  const drawText = (value: string, x = LEFT_MARGIN, size = 9, bold = false): void => {
    page.drawText(toPdfText(value), {
      x,
      y,
      size,
      font: bold ? boldFont : regularFont,
      color: rgb(0.12, 0.11, 0.1),
    });
    y -= size + 7;
  };

  drawText(invoice.merchant.name, LEFT_MARGIN, 15, true);
  if (invoice.merchant.address) {
    for (const line of invoice.merchant.address.split("\n")) {
      drawText(line, LEFT_MARGIN, 8);
    }
  }

  y -= 6;
  drawText(labels.invoice, LEFT_MARGIN, 12, true);
  drawText(`${labels.invoiceNumber}: ${invoice.invoiceNumber ?? "RECEIPT"}`);
  drawText(`${labels.date}: ${invoice.date ?? new Date().toISOString().slice(0, 10)}`);

  const paymentMethod = invoice.payment?.method
    ? (labels.paymentMethods[invoice.payment.method] ?? invoice.payment.method)
    : "-";
  const paymentSuffix = invoice.payment?.last4 ? ` ****${invoice.payment.last4}` : "";
  drawText(`${labels.payment}: ${paymentMethod}${paymentSuffix}`);

  y -= 8;
  for (const item of invoice.items) {
    drawText(item.name, LEFT_MARGIN, 9, true);
    drawText(
      `${labels.quantity}: ${item.quantity}  ${labels.rate}: ${money(item.unitPrice, currency)}  ${labels.amount}: ${money(item.quantity * item.unitPrice, currency)}`,
      LEFT_MARGIN,
      8,
    );
    y -= 3;
  }

  y -= 5;
  drawText(`${labels.subtotal}: ${money(result.subtotal, currency)}`, LEFT_MARGIN, 9, true);

  if (result.discount) {
    drawText(`${labels.discount}: -${money(result.discount, currency)}`);
  }
  if (result.tax) {
    drawText(`${labels.tax}: ${money(result.tax, currency)}`);
  }

  y -= 4;
  drawText(`${labels.total}: ${money(result.total, currency)}`, LEFT_MARGIN, 14, true);
  y -= 12;
  drawText(invoice.note ?? labels.defaultNote, LEFT_MARGIN, 8);

  return document.save();
}
