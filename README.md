# Invoicely

Invoice maker + stateless invoice API. Built with Next.js and designed to work without a database.

## Web invoice maker
- Live invoice preview
- Logo, items, tax, discount and currencies
- PDF / PNG / JPG export
- No signup or storage

## Invoice API

```http
POST /api/v1/invoices?format=pdf
Content-Type: application/json
```

Send merchant, items, tax and payment data. The endpoint returns a generated invoice.

Formats:
- `pdf` — raw PDF download
- `html` — rendered invoice HTML
- `json` — normalized invoice and calculated totals

Interactive documentation is available at `/docs`.

## Local development

```bash
npm install
npm run dev
```

No database or environment variables are required for the MVP.

## License
MIT
