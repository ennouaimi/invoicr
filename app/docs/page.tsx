const payload=`{
  "merchant": {
    "name": "HabitPalo",
    "address": "Paris, France"
  },
  "invoiceNumber": "HP-38291",
  "date": "2026-09-20",
  "currency": "EUR",
  "items": [
    {
      "name": "HabitPalo Pro",
      "quantity": 1,
      "unitPrice": 7.99
    }
  ],
  "tax": { "rate": 20 },
  "payment": {
    "method": "Visa",
    "last4": "4242"
  },
  "note": "Thanks for your purchase!"
}`;
export default function Docs(){
 const curl=`curl -X POST "$BASE_URL/api/v1/invoices?format=pdf" \\\n  -H "Content-Type: application/json" \\\n  -d '${payload.replace(/\n/g," ")}' \\\n  --output invoice.pdf`;
 const js=`const response = await fetch("/api/v1/invoices?format=pdf", {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify(invoice)\n});\nconst pdf = await response.blob();`;
 const py=`import requests\n\nr = requests.post(\n    "https://your-domain.com/api/v1/invoices?format=pdf",\n    json=invoice\n)\nopen("invoice.pdf", "wb").write(r.content)`;
 return <main className="docs-shell"><nav className="docs-nav"><a className="brand" href="/"><span className="brand-icon">R</span>Invoicely</a><a className="ghost-button" href="/">Invoice Maker</a></nav><header className="docs-hero"><div className="eyebrow">RECEIPT API</div><h1>Generate invoices<br/>with one request.</h1><p>A stateless invoice API. Send transaction data and get a PDF, HTML invoice or calculated JSON back. No database required.</p></header><div className="docs-grid"><aside className="docs-sidebar"><b>API Reference</b><a href="#endpoint">Create invoice</a><a href="#payload">Payload</a><a href="#examples">Examples</a><a href="#formats">Formats</a></aside><article className="docs-content"><section id="endpoint"><span className="method">POST</span><code>/api/v1/invoices</code><h2>Create a invoice</h2><p>Invoicely validates your transaction, calculates totals and renders the result immediately.</p></section><section id="payload"><h2>Request body</h2><pre>{payload}</pre></section><section id="formats"><h2>Response formats</h2><div className="format-cards"><div><b>PDF</b><code>?format=pdf</code><p>80mm printable invoice.</p></div><div><b>HTML</b><code>?format=html</code><p>Ready-to-display markup.</p></div><div><b>JSON</b><code>?format=json</code><p>Validated data + totals.</p></div></div></section><section id="examples"><h2>cURL</h2><pre>{curl}</pre><h2>JavaScript</h2><pre>{js}</pre><h2>Python</h2><pre>{py}</pre></section></article></div></main>
}
