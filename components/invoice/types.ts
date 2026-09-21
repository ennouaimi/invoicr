import type { InvoiceLanguage } from "../../lib/invoice";

export type EditorItem = {
  id: number;
  description: string;
  quantity: number;
  price: number;
};

export type InvoiceEditorValue = {
  business: string;
  address: string;
  client: string;
  clientAddress: string;
  clientEmail: string;
  invoiceNo: string;
  date: string;
  dueDate: string;
  payment: string;
  currency: string;
  language: InvoiceLanguage;
  tax: number;
  discount: number;
  note: string;
  logo: string | null;
  items: EditorItem[];
};

export type InvoiceAmounts = {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
};
