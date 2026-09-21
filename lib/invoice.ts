/**
 * Core invoice domain types and calculations.
 *
 * This module deliberately contains no React, browser or HTTP concerns so the
 * same rules can be reused by the invoice editor and the public API.
 */

export type InvoiceLanguage = "en" | "fr";

export type InvoiceItem = {
  name: string;
  quantity: number;
  unitPrice: number;
};

export type InvoicePayload = {
  merchant: {
    name: string;
    address?: string;
  };
  invoiceNumber?: string;
  date?: string;
  currency?: string;
  language?: string;
  items: InvoiceItem[];
  tax?: {
    rate?: number;
  };
  discount?: {
    rate?: number;
  };
  payment?: {
    method?: string;
    last4?: string;
  };
  note?: string;
};

export type InvoiceTotals = {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
};

export type InvoiceLabels = {
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

const INVOICE_LABELS: Record<InvoiceLanguage, InvoiceLabels> = {
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

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
  MAD: "MAD ",
};

/** Returns labels for a supported language, falling back to English. */
export function getInvoiceLabels(language?: string): InvoiceLabels {
  return language === "fr" ? INVOICE_LABELS.fr : INVOICE_LABELS.en;
}

/** Formats an amount using the lightweight formatting used by API documents. */
export function money(amount: number, currency = "EUR"): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? `${currency} `;
  return `${symbol}${amount.toFixed(2)}`;
}

/**
 * Calculates monetary totals from invoice lines and percentage adjustments.
 * Negative discounts/taxes are intentionally clamped by the caller validation.
 */
export function totals(invoice: InvoicePayload): InvoiceTotals {
  const subtotal = invoice.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );
  const discount = subtotal * ((invoice.discount?.rate ?? 0) / 100);
  const taxable = Math.max(0, subtotal - discount);
  const tax = taxable * ((invoice.tax?.rate ?? 0) / 100);

  return {
    subtotal,
    discount,
    tax,
    total: taxable + tax,
  };
}

/**
 * Validates the minimum contract required by the public invoice API.
 * Returns a user-facing error instead of throwing so route handlers stay small.
 */
export function validateInvoice(value: unknown): string | null {
  if (!value || typeof value !== "object") {
    return "JSON body is required.";
  }

  const invoice = value as Partial<InvoicePayload>;

  if (!invoice.merchant?.name) {
    return "merchant.name is required.";
  }

  if (!Array.isArray(invoice.items) || invoice.items.length === 0) {
    return "items must contain at least one item.";
  }

  for (const item of invoice.items) {
    if (
      !item.name ||
      typeof item.quantity !== "number" ||
      typeof item.unitPrice !== "number"
    ) {
      return "Each item requires name, numeric quantity and numeric unitPrice.";
    }
  }

  return null;
}
