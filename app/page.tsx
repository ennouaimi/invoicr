"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import { toJpeg, toPng } from "html-to-image";
import jsPDF from "jspdf";
import { getInvoiceLabels, type InvoiceLanguage } from "../lib/invoice";

type Item = {\n  id: number;\n  description: string;\n  quantity: number;\n  price: number;\n};

const currencies = [
  ["EUR", "€"],
  ["USD", "$"],
  ["GBP", "£"],
  ["MAD", "MAD"],
];

export default function Home() {
  const [business, setBusiness] = useState("Northstar Studio");
  const [address, setAddress] = useState("120 Market Street\\nSan Francisco, CA 94105");
  const [client, setClient] = useState("Brightside Labs");
  const [clientAddress, setClientAddress] = useState("455 Mission Street\\nSan Francisco, CA 94105");
  const [clientEmail, setClientEmail] = useState("billing@brightside.example");
  const [invoiceNo, setInvoiceNo] = useState("INV-2026-001");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(() => {
    const value = new Date();
    value.setDate(value.getDate() + 30);
    return value.toISOString().slice(0, 10);
  });
  const [payment, setPayment] = useState("Bank transfer");
  const [currency, setCurrency] = useState("EUR");
  const [language, setLanguage] = useState<InvoiceLanguage>("en");
  const labels = getInvoiceLabels(language);
  const [tax, setTax] = useState(20);
  const [discount, setDiscount] = useState(0);
  const [note, setNote] = useState("Thank you for your business.");
  const [logo, setLogo] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([
    { id: 1, description: "Brand design package", quantity: 1, price: 120 },
    { id: 2, description: "Business cards", quantity: 2, price: 25 },
  ]);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const symbol = currencies.find(([code]) => code === currency)?.[1] ?? currency;
  const subtotal = useMemo(\n    () => items.reduce((sum, item) => sum + item.quantity * item.price, 0),\n    [items],\n  );
  const discountAmount = subtotal * (Math.max(0, discount) / 100);
  const taxable = Math.max(0, subtotal - discountAmount);
  const taxAmount = taxable * (Math.max(0, tax) / 100);
  const total = taxable + taxAmount;

  function updateItem(id: number, patch: Partial<Item>) {
    setItems((current) =>\n      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),\n    );
  }

  function addItem() {
    setItems((current) => [\n      ...current,\n      { id: Date.now(), description: "New item", quantity: 1, price: 0 },\n    ]);
  }

  function removeItem(id: number) {
    setItems((current) =>\n      current.length === 1\n        ? current\n        : current.filter((item) => item.id !== id),\n    );
  }

  function uploadLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogo(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function exportImage(type: "png" | "jpg") {
    if (!invoiceRef.current) return;
    const options = {\n      pixelRatio: 3,\n      backgroundColor: "#fffaf3",\n      cacheBust: true,\n    };
    const dataUrl = type === "png"
      ? await toPng(invoiceRef.current, options)
      : await toJpeg(invoiceRef.current, { ...options, quality: 0.96 });
    const link = document.createElement("a");
    link.download = `invoice-${invoiceNo}.${type === "jpg" ? "jpg" : "png"}`;
    link.href = dataUrl;
    link.click();
  }

  async function exportPdf() {
    if (!invoiceRef.current) return;
    const dataUrl = await toPng(invoiceRef.current, {\n      pixelRatio: 3,\n      backgroundColor: "#fffaf3",\n      cacheBust: true,\n    });
    const img = new Image();
    img.src = dataUrl;
    await new Promise((resolve) => {\n      img.onload = resolve;\n    });
    const width = 190;
    const height = (img.height / img.width) * width;
    const pdf = new jsPDF({\n      orientation: "portrait",\n      unit: "mm",\n      format: "a4",\n    });
    pdf.addImage(dataUrl, "PNG", 10, 10, width, Math.min(height, 277));
    pdf.save(`invoice-${invoiceNo}.pdf`);
  }

  const formatMoney = (value: number) =>
    currency === "MAD" ? `${value.toFixed(2)} MAD` : `${symbol}${value.toFixed(2)}`;

  return (
    <main className="site-shell">
      <header className="topbar">
        <a className="brand" href="#"><span className="brand-icon">I</span><span>Invoicr</span></a>
        <div className="top-actions">
          <a className="nav-link" href="#maker">Invoice Maker</a>
          <a className="nav-link api-nav-link" href="/docs">API Docs</a>
          <a className="privacy-pill github-star" href="https://github.com/ennouaimi/invoicr" target="_blank" rel="noreferrer" aria-label="Star Invoicr on GitHub">⭐ Star on GitHub</a>
        </div>
      </header>

      <section className="hero">
        <div className="eyebrow">FREE INVOICE MAKER</div>
        <h1>Make polished invoices.<br /><span>In under a minute.</span></h1>
        <p>Create professional invoices directly in your browser, or generate them programmatically with the Invoicr API. No account, no watermark, no invoice data stored.</p>
        <div className="hero-actions">
          <a className="hero-primary" href="#maker">Create an invoice</a>
          <a className="hero-secondary" href="/docs"><span className="code-mark">&lt;/&gt;</span> Integrate the API</a>
        </div>
        <div className="hero-badges"><span>Live preview</span><span>PDF / PNG / JPG</span><span>No signup</span></div>
      </section>

      <section className="workspace" id="maker">
        <div className="editor-card">
          <div className="section-heading"><div><span>01</span><h2>Invoice details</h2></div><p>Everything updates instantly.</p></div>

          <div className="form-grid">
            <label>Business name<input value={business} onChange={(e) => setBusiness(e.target.value)} /></label>
            <label>Invoice number<input value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} /></label>
            <label className="span-2">Address<textarea rows={3} value={address} onChange={(e) => setAddress(e.target.value)} /></label>
            <label>Issue date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
            <label>Due date<input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></label>
            <label>Payment method<select value={payment} onChange={(e) => setPayment(e.target.value)}><option>Bank transfer</option><option>Card</option><option>Cash</option><option>PayPal</option><option>Other</option></select></label>
            <label>Currency<select value={currency} onChange={(e) => setCurrency(e.target.value)}>{currencies.map(([code]) => <option key={code}>{code}</option>)}</select></label>
            <label>Invoice language<select value={language} onChange={(e) => setLanguage(e.target.value as InvoiceLanguage)}><option value="en">English</option><option value="fr">Français</option></select></label>
            <label>Logo<input className="file-input" type="file" accept="image/*" onChange={uploadLogo} /></label>
          </div>

          <div className="section-divider" />
          <div className="section-heading"><div><span>02</span><h2>Bill to</h2></div></div>
          <div className="form-grid">
            <label>Client / company<input value={client} onChange={(e) => setClient(e.target.value)} /></label>
            <label>Client email<input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} /></label>
            <label className="span-2">Billing address<textarea rows={2} value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} /></label>
          </div>
          <div className="section-divider" />

          <div className="section-heading compact"><div><span>03</span><h2>Items & services</h2></div><button className="text-action" onClick={addItem}>+ Add item</button></div>
          <div className="items-editor">
            {items.map((item, index) => (
              <div className="item-row" key={item.id}>
                <div className="item-index">{String(index + 1).padStart(2, "0")}</div>
                <input className="item-name" value={item.description} onChange={(e) => updateItem(item.id, { description: e.target.value })} />
                <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) || 0 })} />
                <input type="number" min="0" step="0.01" value={item.price} onChange={(e) => updateItem(item.id, { price: Number(e.target.value) || 0 })} />
                <button className="remove-button" onClick={() => removeItem(item.id)} aria-label="Remove item">×</button>
              </div>
            ))}
            <div className="item-labels"><span /><span>Description</span><span>Qty</span><span>Price</span><span /></div>
          </div>

          <div className="section-divider" />

          <div className="form-grid totals-form">
            <label>Tax (%)<input type="number" min="0" value={tax} onChange={(e) => setTax(Number(e.target.value) || 0)} /></label>
            <label>Discount (%)<input type="number" min="0" max="100" value={discount} onChange={(e) => setDiscount(Number(e.target.value) || 0)} /></label>
            <label className="span-2">Footer note<input value={note} onChange={(e) => setNote(e.target.value)} /></label>
          </div>
        </div>

        <aside className="preview-column">
          <div className="preview-header"><div><span className="live-dot" />Live preview</div><span>A4 invoice</span></div>
          <div className="invoice-stage">
            <div className="invoice" ref={invoiceRef}>
              <div className="invoice-head">
                <div>
                  {logo ? <img className="invoice-logo" src={logo} alt="Business logo" /> : <div className="invoice-logo-fallback">{business.slice(0, 1) || "I"}</div>}
                  <h3>{business || "Your business"}</h3>
                  <p>{address}</p>
                </div>
                <div className="invoice-title"><h2>{labels.invoice.toUpperCase()}</h2><strong>#{invoiceNo}</strong></div>
              </div>
              <div className="invoice-parties">
                <div><span>{labels.from.toUpperCase()}</span><strong>{business}</strong><p>{address}</p></div>
                <div><span>{labels.billTo.toUpperCase()}</span><strong>{client}</strong><p>{clientAddress}<br />{clientEmail}</p></div>
                <div><span>{labels.date.toUpperCase()}</span><strong>{date}</strong><span>{labels.dueDate.toUpperCase()}</span><strong>{dueDate}</strong><span>{labels.payment.toUpperCase()}</span><strong>{payment}</strong></div>
              </div>
              <div className="invoice-table">
                <div className="invoice-table-head"><span>{labels.description}</span><span>{labels.quantity}</span><span>{labels.rate}</span><span>{labels.amount}</span></div>
                {items.map((item) => <div className="invoice-line" key={item.id}><strong>{item.description || "Item"}</strong><span>{item.quantity}</span><span>{formatMoney(item.price)}</span><strong>{formatMoney(item.quantity * item.price)}</strong></div>)}
              </div>
              <div className="invoice-summary">
                <div><span>{labels.subtotal}</span><strong>{formatMoney(subtotal)}</strong></div>
                {discount > 0 && <div><span>{labels.discount} ({discount}%)</span><strong>-{formatMoney(discountAmount)}</strong></div>}
                {tax > 0 && <div><span>{labels.tax} ({tax}%)</span><strong>{formatMoney(taxAmount)}</strong></div>}
                <div className="invoice-total"><span>{labels.total}</span><strong>{formatMoney(total)}</strong></div>
              </div>
              <div className="invoice-note"><strong>{labels.notes}</strong><p>{note}</p></div>
              <small className="invoice-made">Generated with Invoicr</small>
            </div>
          </div>
          <div className="export-row"><button className="primary-button" onClick={exportPdf}>Download PDF</button><button className="square-button" onClick={() => exportImage("png")}>PNG</button><button className="square-button" onClick={() => exportImage("jpg")}>JPG</button></div>
        </aside>
      </section>

      <section className="value-strip">
        <div><span>01</span><strong>Private by design</strong><p>Your invoice data stays in your browser.</p></div>
        <div><span>02</span><strong>Instant export</strong><p>Download polished files in PDF, PNG or JPG.</p></div>
        <div><span>03</span><strong>No account needed</strong><p>Open the page, make your invoice, leave.</p></div>
      </section>

      <footer><div className="brand"><span className="brand-icon small">I</span><span>Invoicr</span></div><p>Simple tools for small businesses.</p><a href="https://github.com/ennouaimi/invoicr" target="_blank" rel="noreferrer">⭐ Star Invoicr on GitHub</a></footer>
    </main>
  );
}
