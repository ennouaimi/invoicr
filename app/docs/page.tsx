"use client";

import { useState } from "react";

const payload=`{
  "merchant": {
    "name": "Northstar Studio",
    "address": "San Francisco, CA"
  },
  "invoiceNumber": "INV-1001",
  "date": "2026-09-20",
  "currency": "USD",
  "language": "fr",
  "items": [
    {
      "name": "Design services",
      "quantity": 1,
      "unitPrice": 250
    }
  ],
  "tax": { "rate": 8.5 },
  "payment": {
    "method": "Card"
  },
  "note": "Thank you for your business!"
}`;

const curl=`curl -X POST "https://try-invoicr.vercel.app/api/v1/invoices?format=pdf" \\\n  -H "Content-Type: application/json" \\\n  -d '${payload.replace(/\n/g," ")}' \\\n  --output invoice.pdf`;

const js=`const response = await fetch(
  "https://try-invoicr.vercel.app/api/v1/invoices?format=pdf",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(invoice)
  }
);
const pdf = await response.blob();`;

const py=`import requests

r = requests.post(
    "https://try-invoicr.vercel.app/api/v1/invoices?format=pdf",
    json=invoice
)
open("invoice.pdf", "wb").write(r.content)`;

function CodeBlock({code,label}:{code:string;label:string}){
  const [copied,setCopied]=useState(false);
  async function copy(){
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(()=>setCopied(false),1600);
  }
  return <div className="code-block">
    <div className="code-toolbar"><span>{label}</span><button onClick={copy} aria-label={`Copy ${label}`}>{copied?"Copied!":"Copy"}</button></div>
    <pre>{code}</pre>
  </div>;
}

export default function Docs(){

 return <main className="docs-shell">
   <nav className="docs-nav"><a className="brand" href="/"><span className="brand-icon">I</span>Invoicr</a><a className="ghost-button" href="/">Invoice Maker</a></nav>
   <header className="docs-hero"><div className="eyebrow">INVOICE API</div><h1>Generate invoices<br/>with one request.</h1><p>A stateless invoice API. Send transaction data and get a PDF, HTML invoice or calculated JSON back. No database required.</p></header>
   <div className="docs-grid">
     <aside className="docs-sidebar"><b>API Reference</b><a href="#endpoint">Create invoice</a><a href="#payload">Payload</a><a href="#examples">Examples</a><a href="#formats">Formats</a></aside>
     <article className="docs-content">
       <section id="endpoint"><span className="method">POST</span><code>/api/v1/invoices</code><h2>Create an invoice</h2><p>Invoicr validates your transaction, calculates totals and renders the result immediately.</p></section>
       <section id="payload"><h2>Request body</h2><CodeBlock code={payload} label="JSON"/><p>Set <code>language</code> to <code>en</code> (default) or <code>fr</code> to translate invoice labels. Unsupported values fall back to English.</p></section>
       <section id="formats"><h2>Response formats</h2><div className="format-cards"><div><b>PDF</b><code>?format=pdf</code><p>A4 printable invoice.</p></div><div><b>HTML</b><code>?format=html</code><p>Ready-to-display markup.</p></div><div><b>JSON</b><code>?format=json</code><p>Validated data + totals.</p></div></div></section>
       <section id="examples">
         <h2>cURL</h2>
         <CodeBlock code={curl} label="cURL"/>
         <h2>JavaScript</h2><CodeBlock code={js} label="JavaScript"/>
         <h2>Python</h2><CodeBlock code={py} label="Python"/>
       </section>
     </article>
   </div>
 </main>
}
