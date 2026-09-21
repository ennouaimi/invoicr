export type InvoiceItem = { name: string; quantity: number; unitPrice: number };
export type InvoiceLanguage = "en" | "fr";

export type InvoicePayload = {
  merchant: { name: string; address?: string };
  invoiceNumber?: string;
  date?: string;
  currency?: string;
  language?: string;
  items: InvoiceItem[];
  tax?: { rate?: number };
  discount?: { rate?: number };
  payment?: { method?: string; last4?: string };
  note?: string;
};

type InvoiceLabels = {
  invoice: string;
  invoiceNumber: string;
  from: string;
  billTo: string;
  date: string;
  dueDate: string;
  payment: string;
  description: string;
  quantity: string;
  rate: string;
  amount: string;
  subtotal: string;
  tax: string;
  discount: string;
  total: string;
  notes: string;
};

const invoiceLabels: Record<InvoiceLanguage, InvoiceLabels> = {
  en: {
    invoice: "Invoice",
    invoiceNumber: "Invoice number",
    from: "From",
    billTo: "Bill to",
    date: "Date",
    dueDate: "Due date",
    payment: "Payment",
    description: "Description",
    quantity: "Quantity",
    rate: "Rate",
    amount: "Amount",
    subtotal: "Subtotal",
    tax: "Tax",
    discount: "Discount",
    total: "Total",
    notes: "Notes",
  },
  fr: {
    invoice: "Facture",
    invoiceNumber: "Numéro de facture",
    from: "De",
    billTo: "Facturé à",
    date: "Date",
    dueDate: "Date d'échéance",
    payment: "Paiement",
    description: "Description",
    quantity: "Quantité",
    rate: "Tarif",
    amount: "Montant",
    subtotal: "Sous-total",
    tax: "TVA",
    discount: "Remise",
    total: "Total",
    notes: "Notes",
  },
};

export function getInvoiceLabels(language?: string): InvoiceLabels {
  return language === "fr" ? invoiceLabels.fr : invoiceLabels.en;
}

const symbols: Record<string, string> = {\n  EUR: "€",\n  USD: "$",\n  GBP: "£",\n  MAD: "MAD ",\n};

export function money(amount: number, currency = "EUR") {
  const symbol = symbols[currency] ?? `${currency} `;
  return `${symbol}${amount.toFixed(2)}`;
}

export function totals(invoice: InvoicePayload) {
  const subtotal = invoice.items.reduce(\n    (sum, item) => sum + item.quantity * item.unitPrice,\n    0,\n  );
  const discount = subtotal * ((invoice.discount?.rate ?? 0) / 100);
  const taxable = Math.max(0, subtotal - discount);
  const tax = taxable * ((invoice.tax?.rate ?? 0) / 100);
  return { subtotal, discount, tax, total: taxable + tax };
}

export function validateInvoice(value: unknown): string | null {
  if (!value || typeof value !== "object") return "JSON body is required.";

  const invoice = value as Partial<InvoicePayload>;
  if (!invoice.merchant?.name) return "merchant.name is required.";
  if (!Array.isArray(invoice.items) || !invoice.items.length) {
    return "items must contain at least one item.";
  }

  for (const item of invoice.items) {
    if (\n      !item.name ||\n      typeof item.quantity !== "number" ||\n      typeof item.unitPrice !== "number"\n    ) {
      return "Each item requires name, numeric quantity and numeric unitPrice.";
    }
  }

  return null;
}

function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]!);
}

export function invoiceHtml(invoice: InvoicePayload) {
  const currency = invoice.currency ?? "EUR";
  const language = invoice.language === "fr" ? "fr" : "en";
  const labels = getInvoiceLabels(language);
  const result = totals(invoice);
  const rows = invoice.items.map((item) => `
    <div class="item">
      <div><b>${escapeHtml(item.name)}</b><small>${labels.quantity}: ${item.quantity} · ${labels.rate}: ${money(item.unitPrice, currency)}</small></div>
      <b>${money(item.quantity * item.unitPrice, currency)}</b>
    </div>
  `).join("");

  return `<!doctype html>
<html lang="${language}">
<head><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;background:#eee;font-family:Arial,sans-serif;color:#201d19}.invoice{width:360px;margin:30px auto;background:#fffaf3;padding:30px 26px}.center{text-align:center}.center h1{font-size:23px;margin:0 0 7px}.center p{white-space:pre-line;color:#716a62;font-size:12px}.dash{border-top:1px dashed #999;margin:18px 0}.meta,.sum{display:grid;grid-template-columns:1fr auto;gap:8px;font-size:12px}.items{display:grid;gap:15px}.item{display:flex;justify-content:space-between;gap:15px;font-size:12px}.item div{display:grid;gap:4px}.item small{color:#777}.total{font-size:18px;border-top:2px solid #222;padding-top:10px;margin-top:4px}.foot{text-align:center;margin-top:24px;font-size:12px;color:#666}</style></head>
<body><main class="invoice">
  <section class="center"><h1>${escapeHtml(invoice.merchant.name)}</h1><p>${escapeHtml(invoice.merchant.address)}</p><strong>${labels.invoice}</strong></section>
  <div class="dash"></div>
  <div class="meta"><span>${labels.invoiceNumber}</span><b>${escapeHtml(invoice.invoiceNumber ?? "INVOICE")}</b><span>${labels.date}</span><b>${escapeHtml(invoice.date ?? new Date().toISOString().slice(0, 10))}</b><span>${labels.payment}</span><b>${escapeHtml(invoice.payment?.method ?? "—")}${invoice.payment?.last4 ? ` •••• ${escapeHtml(invoice.payment.last4)}` : ""}</b></div>
  <div class="dash"></div><section class="items"><div class="item"><b>${labels.description}</b><b>${labels.amount}</b></div>${rows}</section><div class="dash"></div>
  <section class="sum"><span>${labels.subtotal}</span><b>${money(result.subtotal, currency)}</b>${result.discount ? `<span>${labels.discount}</span><b>-${money(result.discount, currency)}</b>` : ""}${result.tax ? `<span>${labels.tax}</span><b>${money(result.tax, currency)}</b>` : ""}<span class="total">${labels.total}</span><b class="total">${money(result.total, currency)}</b></section>
  <div class="foot">${escapeHtml(invoice.note ?? "Thank you for your business!")}</div>
</main></body></html>`;
}
