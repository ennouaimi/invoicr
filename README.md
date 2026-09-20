# Receiptly

Receipt maker + stateless receipt API. Built with Next.js and designed to work without a database.

## Web receipt maker
- Live receipt preview
- Logo, items, tax, discount and currencies
- PDF / PNG / JPG export
- No signup or storage

## Receipt API

```http
POST /api/v1/receipts?format=pdf
Content-Type: application/json
```

Send merchant, items, tax and payment data. The endpoint returns a generated receipt.

Formats:
- `pdf` — raw PDF download
- `html` — rendered receipt HTML
- `json` — normalized receipt and calculated totals

Interactive documentation is available at `/docs`.

## Local development

```bash
npm install
npm run dev
```

No database or environment variables are required for the MVP.

## License
MIT
