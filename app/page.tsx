"use client";

import { useMemo, useRef, useState } from "react";

import { InvoiceEditor } from "../components/invoice/InvoiceEditor";
import { InvoicePreview } from "../components/invoice/InvoicePreview";
import type {
  EditorItem,
  InvoiceEditorValue,
} from "../components/invoice/types";
import {
  exportInvoiceImage,
  exportInvoicePdf,
  type ImageFormat,
} from "../lib/invoice-export";

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
  MAD: "MAD",
};

function defaultDueDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().slice(0, 10);
}

function createInitialInvoice(): InvoiceEditorValue {
  return {
    business: "Northstar Studio",
    address: "120 Market Street\nSan Francisco, CA 94105",
    client: "Brightside Labs",
    clientAddress: "455 Mission Street\nSan Francisco, CA 94105",
    clientEmail: "billing@brightside.example",
    invoiceNo: "INV-2026-001",
    date: new Date().toISOString().slice(0, 10),
    dueDate: defaultDueDate(),
    payment: "Bank transfer",
    currency: "EUR",
    language: "en",
    tax: 20,
    discount: 0,
    note: "Thank you for your business.",
    logo: null,
    items: [
      { id: 1, description: "Brand design package", quantity: 1, price: 120 },
      { id: 2, description: "Business cards", quantity: 2, price: 25 },
    ],
  };
}

/**
 * Invoice maker page.
 *
 * The page owns state and derived values while dedicated components handle
 * editing and presentation. This keeps the data flow explicit and avoids
 * coupling the form to the printable preview.
 */
export default function Home() {
  const [invoice, setInvoice] = useState<InvoiceEditorValue>(
    createInitialInvoice,
  );
  const invoiceRef = useRef<HTMLDivElement>(null);

  const amounts = useMemo(() => {
    const subtotal = invoice.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    );
    const discount = subtotal * (Math.max(0, invoice.discount) / 100);
    const taxable = Math.max(0, subtotal - discount);
    const tax = taxable * (Math.max(0, invoice.tax) / 100);

    return {
      subtotal,
      discount,
      tax,
      total: taxable + tax,
    };
  }, [invoice.items, invoice.discount, invoice.tax]);

  function updateField<K extends keyof InvoiceEditorValue>(
    field: K,
    value: InvoiceEditorValue[K],
  ) {
    setInvoice((current) => ({ ...current, [field]: value }));
  }

  function updateItem(id: number, patch: Partial<EditorItem>) {
    setInvoice((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    }));
  }

  function addItem() {
    setInvoice((current) => ({
      ...current,
      items: [
        ...current.items,
        {
          id: Date.now(),
          description: "New item",
          quantity: 1,
          price: 0,
        },
      ],
    }));
  }

  function removeItem(id: number) {
    setInvoice((current) => ({
      ...current,
      items:
        current.items.length === 1
          ? current.items
          : current.items.filter((item) => item.id !== id),
    }));
  }

  function formatMoney(value: number): string {
    return invoice.currency === "MAD"
      ? `${value.toFixed(2)} MAD`
      : `${CURRENCY_SYMBOLS[invoice.currency] ?? invoice.currency}${value.toFixed(2)}`;
  }

  async function exportImage(format: ImageFormat) {
    if (!invoiceRef.current) return;
    await exportInvoiceImage(invoiceRef.current, invoice.invoiceNo, format);
  }

  async function exportPdf() {
    if (!invoiceRef.current) return;
    await exportInvoicePdf(invoiceRef.current, invoice.invoiceNo);
  }

  return (
    <main className="site-shell">
      <header className="topbar">
        <a className="brand" href="#">
          <span className="brand-icon">I</span>
          <span>Invoicr</span>
        </a>
        <div className="top-actions">
          <a className="nav-link" href="#maker">
            Invoice Maker
          </a>
          <a className="nav-link api-nav-link" href="/docs">
            API Docs
          </a>
          <a
            className="privacy-pill github-star"
            href="https://github.com/ennouaimi/invoicr"
            target="_blank"
            rel="noreferrer"
            aria-label="Star Invoicr on GitHub"
          >
            ⭐ Star on GitHub
          </a>
        </div>
      </header>

      <section className="hero">
        <div className="eyebrow">FREE INVOICE MAKER</div>
        <h1>
          Make polished invoices.
          <br />
          <span>In under a minute.</span>
        </h1>
        <p>
          Create professional invoices directly in your browser, or generate
          them programmatically with the Invoicr API. No account, no watermark,
          no invoice data stored.
        </p>
        <div className="hero-actions">
          <a className="hero-primary" href="#maker">
            Create an invoice
          </a>
          <a className="hero-secondary" href="/docs">
            <span className="code-mark">&lt;/&gt;</span> Integrate the API
          </a>
        </div>
        <div className="hero-badges">
          <span>Live preview</span>
          <span>PDF / PNG / JPG</span>
          <span>No signup</span>
        </div>
      </section>

      <section className="workspace" id="maker">
        <InvoiceEditor
          value={invoice}
          onChange={updateField}
          onAddItem={addItem}
          onUpdateItem={updateItem}
          onRemoveItem={removeItem}
        />

        <InvoicePreview
          invoice={invoice}
          amounts={amounts}
          invoiceRef={invoiceRef}
          formatMoney={formatMoney}
          onExportPdf={exportPdf}
          onExportImage={exportImage}
        />
      </section>

      <section className="value-strip">
        <div>
          <span>01</span>
          <strong>Private by design</strong>
          <p>Your invoice data stays in your browser.</p>
        </div>
        <div>
          <span>02</span>
          <strong>Instant export</strong>
          <p>Download polished files in PDF, PNG or JPG.</p>
        </div>
        <div>
          <span>03</span>
          <strong>No account needed</strong>
          <p>Open the page, make your invoice, leave.</p>
        </div>
      </section>

      <footer>
        <div className="brand">
          <span className="brand-icon small">I</span>
          <span>Invoicr</span>
        </div>
        <p>Simple tools for small businesses.</p>
        <a
          href="https://github.com/ennouaimi/invoicr"
          target="_blank"
          rel="noreferrer"
        >
          ⭐ Star Invoicr on GitHub
        </a>
      </footer>
    </main>
  );
}
