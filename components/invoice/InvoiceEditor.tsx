import type { ChangeEvent } from "react";

import type { InvoiceLanguage } from "../../lib/invoice";
import { InvoiceItemsEditor } from "./InvoiceItemsEditor";
import type { EditorItem, InvoiceEditorValue } from "./types";

const CURRENCIES = ["EUR", "USD", "GBP", "MAD"];

type InvoiceEditorProps = {
  value: InvoiceEditorValue;
  onChange: <K extends keyof InvoiceEditorValue>(field: K, value: InvoiceEditorValue[K]) => void;
  onAddItem: () => void;
  onUpdateItem: (id: number, patch: Partial<EditorItem>) => void;
  onRemoveItem: (id: number) => void;
};

/**
 * Form used to edit invoice data.
 *
 * This component is intentionally controlled: the page owns the invoice state,
 * while the editor only translates user input into explicit change callbacks.
 */
export function InvoiceEditor({
  value,
  onChange,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
}: InvoiceEditorProps) {
  function uploadLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Keep the logo in memory so creating an invoice never requires an upload.
    const reader = new FileReader();
    reader.onload = () => onChange("logo", String(reader.result));
    reader.readAsDataURL(file);
  }

  return (
    <div className="editor-card">
      <div className="section-heading">
        <div>
          <span>01</span>
          <h2>Invoice details</h2>
        </div>
        <p>Everything updates instantly.</p>
      </div>

      <div className="form-grid">
        <label>
          Business name
          <input
            value={value.business}
            onChange={(event) => onChange("business", event.target.value)}
          />
        </label>
        <label>
          Invoice number
          <input
            value={value.invoiceNo}
            onChange={(event) => onChange("invoiceNo", event.target.value)}
          />
        </label>
        <label className="span-2">
          Address
          <textarea
            rows={3}
            value={value.address}
            onChange={(event) => onChange("address", event.target.value)}
          />
        </label>
        <label>
          Issue date
          <input
            type="date"
            value={value.date}
            onChange={(event) => onChange("date", event.target.value)}
          />
        </label>
        <label>
          Due date
          <input
            type="date"
            value={value.dueDate}
            onChange={(event) => onChange("dueDate", event.target.value)}
          />
        </label>
        <label>
          Payment method
          <select
            value={value.payment}
            onChange={(event) => onChange("payment", event.target.value)}
          >
            <option>Bank transfer</option>
            <option>Card</option>
            <option>Cash</option>
            <option>PayPal</option>
            <option>Other</option>
          </select>
        </label>
        <label>
          Currency
          <select
            value={value.currency}
            onChange={(event) => onChange("currency", event.target.value)}
          >
            {CURRENCIES.map((currency) => (
              <option key={currency}>{currency}</option>
            ))}
          </select>
        </label>
        <label>
          Invoice language
          <select
            value={value.language}
            onChange={(event) => onChange("language", event.target.value as InvoiceLanguage)}
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
          </select>
        </label>
        <label>
          Logo
          <input className="file-input" type="file" accept="image/*" onChange={uploadLogo} />
        </label>
      </div>

      <div className="section-divider" />

      <div className="section-heading">
        <div>
          <span>02</span>
          <h2>Bill to</h2>
        </div>
      </div>

      <div className="form-grid">
        <label>
          Client / company
          <input
            value={value.client}
            onChange={(event) => onChange("client", event.target.value)}
          />
        </label>
        <label>
          Client email
          <input
            value={value.clientEmail}
            onChange={(event) => onChange("clientEmail", event.target.value)}
          />
        </label>
        <label className="span-2">
          Billing address
          <textarea
            rows={2}
            value={value.clientAddress}
            onChange={(event) => onChange("clientAddress", event.target.value)}
          />
        </label>
      </div>

      <div className="section-divider" />

      <InvoiceItemsEditor
        items={value.items}
        onAdd={onAddItem}
        onUpdate={onUpdateItem}
        onRemove={onRemoveItem}
      />

      <div className="section-divider" />

      <div className="form-grid totals-form">
        <label>
          Tax (%)
          <input
            type="number"
            min="0"
            value={value.tax}
            onChange={(event) => onChange("tax", Number(event.target.value) || 0)}
          />
        </label>
        <label>
          Discount (%)
          <input
            type="number"
            min="0"
            max="100"
            value={value.discount}
            onChange={(event) => onChange("discount", Number(event.target.value) || 0)}
          />
        </label>
        <label className="span-2">
          Footer note
          <input value={value.note} onChange={(event) => onChange("note", event.target.value)} />
        </label>
      </div>
    </div>
  );
}
