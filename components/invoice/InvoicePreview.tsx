import type { RefObject } from "react";

import { getInvoiceLabels } from "../../lib/invoice";
import type { InvoiceAmounts, InvoiceEditorValue } from "./types";

type InvoicePreviewProps = {
  invoice: InvoiceEditorValue;
  amounts: InvoiceAmounts;
  invoiceRef: RefObject<HTMLDivElement | null>;
  formatMoney: (value: number) => string;
  onExportPdf: () => void;
  onExportImage: (format: "png" | "jpg") => void;
};

/**
 * Read-only invoice preview and export actions.
 *
 * Keeping this rendering separate from the form makes it possible to evolve
 * the editor without coupling input controls to the printable document.
 */
export function InvoicePreview({
  invoice,
  amounts,
  invoiceRef,
  formatMoney,
  onExportPdf,
  onExportImage,
}: InvoicePreviewProps) {
  const labels = getInvoiceLabels(invoice.language);

  return (
    <aside className="preview-column">
      <div className="preview-header">
        <div>
          <span className="live-dot" />
          Live preview
        </div>
        <span>A4 invoice</span>
      </div>

      <div className="invoice-stage">
        <div className="invoice" ref={invoiceRef}>
          <div className="invoice-head">
            <div>
              {invoice.logo ? (
                <img
                  className="invoice-logo"
                  src={invoice.logo}
                  alt="Business logo"
                />
              ) : (
                <div className="invoice-logo-fallback">
                  {invoice.business.slice(0, 1) || "I"}
                </div>
              )}
              <h3>{invoice.business || "Your business"}</h3>
              <p>{invoice.address}</p>
            </div>
            <div className="invoice-title">
              <h2>{labels.invoice.toUpperCase()}</h2>
              <strong>#{invoice.invoiceNo}</strong>
            </div>
          </div>

          <div className="invoice-parties">
            <div>
              <span>{labels.from.toUpperCase()}</span>
              <strong>{invoice.business}</strong>
              <p>{invoice.address}</p>
            </div>
            <div>
              <span>{labels.billTo.toUpperCase()}</span>
              <strong>{invoice.client}</strong>
              <p>
                {invoice.clientAddress}
                <br />
                {invoice.clientEmail}
              </p>
            </div>
            <div>
              <span>{labels.date.toUpperCase()}</span>
              <strong>{invoice.date}</strong>
              <span>{labels.dueDate.toUpperCase()}</span>
              <strong>{invoice.dueDate}</strong>
              <span>{labels.payment.toUpperCase()}</span>
              <strong>{invoice.payment}</strong>
            </div>
          </div>

          <div className="invoice-table">
            <div className="invoice-table-head">
              <span>{labels.description}</span>
              <span>{labels.quantity}</span>
              <span>{labels.rate}</span>
              <span>{labels.amount}</span>
            </div>

            {invoice.items.map((item) => (
              <div className="invoice-line" key={item.id}>
                <strong>{item.description || "Item"}</strong>
                <span>{item.quantity}</span>
                <span>{formatMoney(item.price)}</span>
                <strong>{formatMoney(item.quantity * item.price)}</strong>
              </div>
            ))}
          </div>

          <div className="invoice-summary">
            <div>
              <span>{labels.subtotal}</span>
              <strong>{formatMoney(amounts.subtotal)}</strong>
            </div>

            {invoice.discount > 0 && (
              <div>
                <span>
                  {labels.discount} ({invoice.discount}%)
                </span>
                <strong>-{formatMoney(amounts.discount)}</strong>
              </div>
            )}

            {invoice.tax > 0 && (
              <div>
                <span>
                  {labels.tax} ({invoice.tax}%)
                </span>
                <strong>{formatMoney(amounts.tax)}</strong>
              </div>
            )}

            <div className="invoice-total">
              <span>{labels.total}</span>
              <strong>{formatMoney(amounts.total)}</strong>
            </div>
          </div>

          <div className="invoice-note">
            <strong>{labels.notes}</strong>
            <p>{invoice.note}</p>
          </div>

          <small className="invoice-made">Generated with Invoicr</small>
        </div>
      </div>

      <div className="export-row">
        <button className="primary-button" onClick={onExportPdf}>
          Download PDF
        </button>
        <button className="square-button" onClick={() => onExportImage("png")}>
          PNG
        </button>
        <button className="square-button" onClick={() => onExportImage("jpg")}>
          JPG
        </button>
      </div>
    </aside>
  );
}
