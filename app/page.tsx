"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import { toJpeg, toPng } from "html-to-image";
import jsPDF from "jspdf";

type Item = { id: number; description: string; quantity: number; price: number };

const currencies = [
  ["EUR", "€"],
  ["USD", "$"],
  ["GBP", "£"],
  ["MAD", "MAD"],
];

export default function Home() {
  const [business, setBusiness] = useState("Atelier Nova");
  const [address, setAddress] = useState("24 Rue des Fleurs\n75002 Paris");
  const [receiptNo, setReceiptNo] = useState("RCP-2026-001");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [payment, setPayment] = useState("Card");
  const [currency, setCurrency] = useState("EUR");
  const [tax, setTax] = useState(20);
  const [discount, setDiscount] = useState(0);
  const [note, setNote] = useState("Thank you for your purchase!");
  const [logo, setLogo] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([
    { id: 1, description: "Brand design package", quantity: 1, price: 120 },
    { id: 2, description: "Business cards", quantity: 2, price: 25 },
  ]);
  const receiptRef = useRef<HTMLDivElement>(null);

  const symbol = currencies.find(([code]) => code === currency)?.[1] ?? currency;
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.quantity * item.price, 0), [items]);
  const discountAmount = subtotal * (Math.max(0, discount) / 100);
  const taxable = Math.max(0, subtotal - discountAmount);
  const taxAmount = taxable * (Math.max(0, tax) / 100);
  const total = taxable + taxAmount;

  function updateItem(id: number, patch: Partial<Item>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function addItem() {
    setItems((current) => [...current, { id: Date.now(), description: "New item", quantity: 1, price: 0 }]);
  }

  function removeItem(id: number) {
    setItems((current) => (current.length === 1 ? current : current.filter((item) => item.id !== id)));
  }

  function uploadLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogo(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function exportImage(type: "png" | "jpg") {
    if (!receiptRef.current) return;
    const options = { pixelRatio: 3, backgroundColor: "#fffaf3", cacheBust: true };
    const dataUrl = type === "png"
      ? await toPng(receiptRef.current, options)
      : await toJpeg(receiptRef.current, { ...options, quality: 0.96 });
    const link = document.createElement("a");
    link.download = `receipt-${receiptNo}.${type === "jpg" ? "jpg" : "png"}`;
    link.href = dataUrl;
    link.click();
  }

  async function exportPdf() {
    if (!receiptRef.current) return;
    const dataUrl = await toPng(receiptRef.current, { pixelRatio: 3, backgroundColor: "#fffaf3", cacheBust: true });
    const img = new Image();
    img.src = dataUrl;
    await new Promise((resolve) => { img.onload = resolve; });
    const width = 80;
    const height = (img.height / img.width) * width;
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [width, Math.max(height, 110)] });
    pdf.addImage(dataUrl, "PNG", 0, 0, width, height);
    pdf.save(`receipt-${receiptNo}.pdf`);
  }

  const formatMoney = (value: number) =>
    currency === "MAD" ? `${value.toFixed(2)} MAD` : `${symbol}${value.toFixed(2)}`;

  return (
    <main className="site-shell">
      <header className="topbar">
        <a className="brand" href="#"><span className="brand-icon">R</span><span>Receiptly</span></a>
        <div className="top-actions">
          <span className="privacy-pill">Processed locally</span>
          <a className="nav-link" href="#maker">Receipt Maker</a>
          <a className="nav-link api-nav-link" href="/docs">API Docs</a>
          <a className="ghost-button" href="https://github.com/ennouaimi/receipt-generator" target="_blank">GitHub</a>
        </div>
      </header>

      <section className="hero">
        <div className="eyebrow">FREE RECEIPT MAKER</div>
        <h1>Make polished receipts.<br /><span>In under a minute.</span></h1>
        <p>Create professional receipts directly in your browser, or generate them programmatically with the Receiptly API. No account, no watermark, no receipt data stored.</p>
        <div className="hero-actions">
          <a className="hero-primary" href="#maker">Create a receipt</a>
          <a className="hero-secondary" href="/docs"><span className="code-mark">&lt;/&gt;</span> Integrate the API</a>
        </div>
        <div className="hero-badges"><span>Live preview</span><span>PDF / PNG / JPG</span><span>No signup</span></div>
      </section>

      <section className="workspace" id="maker">
        <div className="editor-card">
          <div className="section-heading"><div><span>01</span><h2>Receipt details</h2></div><p>Everything updates instantly.</p></div>

          <div className="form-grid">
            <label>Business name<input value={business} onChange={(e) => setBusiness(e.target.value)} /></label>
            <label>Receipt number<input value={receiptNo} onChange={(e) => setReceiptNo(e.target.value)} /></label>
            <label className="span-2">Address<textarea rows={3} value={address} onChange={(e) => setAddress(e.target.value)} /></label>
            <label>Date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
            <label>Payment method<select value={payment} onChange={(e) => setPayment(e.target.value)}><option>Card</option><option>Cash</option><option>Bank transfer</option><option>PayPal</option><option>Other</option></select></label>
            <label>Currency<select value={currency} onChange={(e) => setCurrency(e.target.value)}>{currencies.map(([code]) => <option key={code}>{code}</option>)}</select></label>
            <label>Logo<input className="file-input" type="file" accept="image/*" onChange={uploadLogo} /></label>
          </div>

          <div className="section-divider" />

          <div className="section-heading compact"><div><span>02</span><h2>Items</h2></div><button className="text-action" onClick={addItem}>+ Add item</button></div>
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
          <div className="preview-header"><div><span className="live-dot" />Live preview</div><span>80mm thermal</span></div>
          <div className="receipt-stage">
            <div className="receipt" ref={receiptRef}>
              <div className="receipt-top">
                {logo ? <img className="receipt-logo" src={logo} alt="Business logo" /> : <div className="receipt-logo-fallback">{business.slice(0, 1) || "R"}</div>}
                <h3>{business || "Your business"}</h3>
                <p>{address.split("\n").map((line, index) => <span key={`${line}-${index}`}>{line}<br /></span>)}</p>
              </div>
              <div className="dashed" />
              <div className="receipt-meta"><span>Receipt</span><strong>{receiptNo}</strong><span>Date</span><strong>{date}</strong><span>Payment</span><strong>{payment}</strong></div>
              <div className="dashed" />
              <div className="receipt-items">
                {items.map((item) => <div className="receipt-item" key={item.id}><div><strong>{item.description || "Item"}</strong><span>{item.quantity} × {formatMoney(item.price)}</span></div><strong>{formatMoney(item.quantity * item.price)}</strong></div>)}
              </div>
              <div className="dashed" />
              <div className="receipt-totals">
                <div><span>Subtotal</span><strong>{formatMoney(subtotal)}</strong></div>
                {discount > 0 && <div><span>Discount ({discount}%)</span><strong>-{formatMoney(discountAmount)}</strong></div>}
                {tax > 0 && <div><span>Tax ({tax}%)</span><strong>{formatMoney(taxAmount)}</strong></div>}
                <div className="grand-total"><span>Total</span><strong>{formatMoney(total)}</strong></div>
              </div>
              <div className="receipt-footer"><div className="barcode">|||| ||| |||| | ||||| || ||||</div><p>{note}</p><small>Generated with Receiptly</small></div>
            </div>
          </div>
          <div className="export-row"><button className="primary-button" onClick={exportPdf}>Download PDF</button><button className="square-button" onClick={() => exportImage("png")}>PNG</button><button className="square-button" onClick={() => exportImage("jpg")}>JPG</button></div>
        </aside>
      </section>

      <section className="value-strip">
        <div><span>01</span><strong>Private by design</strong><p>Your receipt data stays in your browser.</p></div>
        <div><span>02</span><strong>Instant export</strong><p>Download polished files in PDF, PNG or JPG.</p></div>
        <div><span>03</span><strong>No account needed</strong><p>Open the page, make your receipt, leave.</p></div>
      </section>

      <footer><div className="brand"><span className="brand-icon small">R</span><span>Receiptly</span></div><p>Simple tools for small businesses.</p><a href="https://github.com/ennouaimi/receipt-generator">Open source on GitHub</a></footer>
    </main>
  );
}
