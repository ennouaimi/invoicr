import {
  totals,
  validateInvoice,
  type InvoicePayload,
} from "../../../../lib/invoice";
import { renderInvoiceHtml } from "../../../../lib/invoice-html";
import { renderInvoicePdf } from "../../../../lib/invoice-pdf";

export const runtime = "nodejs";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

type ResponseFormat = "pdf" | "html" | "json";

/** Builds API errors with the same CORS headers as successful responses. */\nfunction jsonError(message: string, status: number): Response {
  return Response.json(
    { error: message },
    { status, headers: CORS_HEADERS },
  );
}

/** Reads and validates the requested output format. PDF is the default. */\nfunction parseResponseFormat(request: Request): ResponseFormat | null {
  const format = new URL(request.url).searchParams.get("format") ?? "pdf";
  return format === "pdf" || format === "html" || format === "json"
    ? format
    : null;
}

/** Sanitizes user-provided invoice numbers before using them in a header. */\nfunction invoiceFilename(invoiceNumber?: string): string {
  const safeName = (invoiceNumber ?? "invoice").replace(/[^a-z0-9_-]/gi, "-");
  return `${safeName}.pdf`;
}

/** Handles CORS preflight requests for browser API consumers. */\nexport async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

/**
 * Creates an invoice in PDF, HTML or JSON form.
 *
 * The endpoint is intentionally stateless: payloads are validated, rendered
 * and returned without persisting invoice data.
 */
export async function POST(request: Request): Promise<Response> {
  let invoice: InvoicePayload;

  try {
    invoice = await request.json();
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  const validationError = validateInvoice(invoice);
  if (validationError) {
    return jsonError(validationError, 422);
  }

  const format = parseResponseFormat(request);
  if (!format) {
    return jsonError("format must be pdf, html or json.", 400);
  }

  if (format === "html") {
    return new Response(renderInvoiceHtml(invoice), {
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  }

  if (format === "json") {
    return Response.json(
      { invoice, totals: totals(invoice) },
      { headers: CORS_HEADERS },
    );
  }

  const pdf = await renderInvoicePdf(invoice);
  return new Response(pdf as BodyInit, {
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoiceFilename(invoice.invoiceNumber)}"`,
      "Cache-Control": "no-store",
    },
  });
}
