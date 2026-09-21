import {
  getInvoiceLabels,
  money,
  totals,
  type InvoicePayload,
} from "./invoice";

function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character]!,
  );
}

/**
 * Renders a standalone HTML representation of an invoice.
 *
 * All user-provided strings are escaped before interpolation because this
 * output can be returned directly by the public API.
 */
export function renderInvoiceHtml(invoice: InvoicePayload): string {
  const currency = invoice.currency ?? "EUR";
  const language = invoice.language === "fr" ? "fr" : "en";
  const labels = getInvoiceLabels(language);
  const result = totals(invoice);

  const rows = invoice.items
    .map(
      (item) => `
    <div class="item">
      <div>
        <b>${escapeHtml(item.name)}</b>
        <small>${labels.quantity}: ${item.quantity} · ${labels.rate}: ${money(item.unitPrice, currency)}</small>
      </div>
      <b>${money(item.quantity * item.unitPrice, currency)}</b>
    </div>`,
    )
    .join("");

  return `<!doctype html>
<html lang="${language}">
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; background: #eee; font-family: Arial, sans-serif; color: #201d19; }
    .invoice { width: 360px; margin: 30px auto; background: #fffaf3; padding: 30px 26px; }
    .center { text-align: center; }
    .center h1 { font-size: 23px; margin: 0 0 7px; }
    .center p { white-space: pre-line; color: #716a62; font-size: 12px; }
    .dash { border-top: 1px dashed #999; margin: 18px 0; }
    .meta, .sum { display: grid; grid-template-columns: 1fr auto; gap: 8px; font-size: 12px; }
    .items { display: grid; gap: 15px; }
    .item { display: flex; justify-content: space-between; gap: 15px; font-size: 12px; }
    .item div { display: grid; gap: 4px; }
    .item small { color: #777; }
    .total { font-size: 18px; border-top: 2px solid #222; padding-top: 10px; margin-top: 4px; }
    .foot { text-align: center; margin-top: 24px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <main class="invoice">
    <section class="center">
      <h1>${escapeHtml(invoice.merchant.name)}</h1>
      <p>${escapeHtml(invoice.merchant.address)}</p>
      <strong>${labels.invoice}</strong>
    </section>
    <div class="dash"></div>
    <div class="meta">
      <span>${labels.invoiceNumber}</span>
      <b>${escapeHtml(invoice.invoiceNumber ?? "INVOICE")}</b>
      <span>${labels.date}</span>
      <b>${escapeHtml(invoice.date ?? new Date().toISOString().slice(0, 10))}</b>
      <span>${labels.payment}</span>
      <b>${escapeHtml(invoice.payment?.method ?? "—")}${invoice.payment?.last4 ? ` •••• ${escapeHtml(invoice.payment.last4)}` : ""}</b>
    </div>
    <div class="dash"></div>
    <section class="items">
      <div class="item">
        <b>${labels.description}</b>
        <b>${labels.amount}</b>
      </div>
      ${rows}
    </section>
    <div class="dash"></div>
    <section class="sum">
      <span>${labels.subtotal}</span>
      <b>${money(result.subtotal, currency)}</b>
      ${result.discount ? `<span>${labels.discount}</span><b>-${money(result.discount, currency)}</b>` : ""}
      ${result.tax ? `<span>${labels.tax}</span><b>${money(result.tax, currency)}</b>` : ""}
      <span class="total">${labels.total}</span>
      <b class="total">${money(result.total, currency)}</b>
    </section>
    <div class="foot">${escapeHtml(invoice.note ?? "Thank you for your business!")}</div>
  </main>
</body>
</html>`;
}
