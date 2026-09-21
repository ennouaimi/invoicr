import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import {
  getInvoiceLabels,
  invoiceHtml,
  money,
  totals,
  validateInvoice,
  type InvoicePayload,
} from "../../../../lib/invoice";

export const runtime = "nodejs";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function pdfText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\\u0300-\\u036f]/g, "")
    .replace(/[^ -~]/g, "");
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: cors });
}

export async function POST(request: Request) {
  let body: InvoicePayload;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid JSON body." },
      { status: 400, headers: cors },
    );
  }

  const error = validateInvoice(body);
  if (error) return Response.json({ error }, { status: 422, headers: cors });

  const format = new URL(request.url).searchParams.get("format") ?? "pdf";
  if (format === "html") {
    return new Response(invoiceHtml(body), {
      headers: { ...cors, "Content-Type": "text/html; charset=utf-8" },
    });
  }
  if (format === "json") {
    return Response.json(
      { invoice: body, totals: totals(body) },
      { headers: cors },
    );
  }
  if (format !== "pdf") {
    return Response.json(
      { error: "format must be pdf, html or json." },
      { status: 400, headers: cors },
    );
  }

  const labels = getInvoiceLabels(body.language);
  const currency = body.currency ?? "EUR";
  const result = totals(body);
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([226.77, 520]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let y = 485;

  const text = (value: string, x = 18, size = 9, isBold = false) => {
    page.drawText(pdfText(value), {
      x,
      y,
      size,
      font: isBold ? bold : font,
      color: rgb(0.12, 0.11, 0.1),
    });
    y -= size + 7;
  };

  text(body.merchant.name, 18, 15, true);
  if (body.merchant.address) {
    for (const line of body.merchant.address.split("\n")) {
      text(line, 18, 8);
    }
  }
  y -= 6;
  text(labels.invoice, 18, 12, true);
  text(`${labels.invoiceNumber}: ${body.invoiceNumber ?? "RECEIPT"}`);
  text(`${labels.date}: ${body.date ?? new Date().toISOString().slice(0, 10)}`);
  text(
    `${labels.payment}: ${body.payment?.method ?? "-"}${body.payment?.last4 ? ` ****${body.payment.last4}` : ""}`,
  );
  y -= 8;

  for (const item of body.items) {
    text(item.name, 18, 9, true);
    text(
      `${labels.quantity}: ${item.quantity}  ${labels.rate}: ${money(item.unitPrice, currency)}  ${labels.amount}: ${money(item.quantity * item.unitPrice, currency)}`,
      18,
      8,
    );
    y -= 3;
  }

  y -= 5;
  text(`${labels.subtotal}: ${money(result.subtotal, currency)}`, 18, 9, true);
  if (result.discount)
    text(`${labels.discount}: -${money(result.discount, currency)}`);
  if (result.tax) text(`${labels.tax}: ${money(result.tax, currency)}`);
  y -= 4;
  text(`${labels.total}: ${money(result.total, currency)}`, 18, 14, true);
  y -= 12;
  text(body.note ?? "Thank you for your purchase!", 18, 8);

  const bytes = await pdf.save();
  const filename = (body.invoiceNumber ?? "invoice").replace(
    /[^a-z0-9_-]/gi,
    "-",
  );
  return new Response(bytes as BodyInit, {
    headers: {
      ...cors,
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
