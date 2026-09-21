import type { InvoiceLanguage } from "./invoice";

export type InvoiceUiLabels = {
  invoiceDetails: string;
  instantUpdate: string;
  businessName: string;
  invoiceNumber: string;
  address: string;
  issueDate: string;
  dueDate: string;
  paymentMethod: string;
  currency: string;
  invoiceLanguage: string;
  logo: string;
  billTo: string;
  clientCompany: string;
  clientEmail: string;
  billingAddress: string;
  itemsServices: string;
  addItem: string;
  description: string;
  quantity: string;
  price: string;
  removeItem: string;
  tax: string;
  discount: string;
  footerNote: string;
  paymentMethods: {
    bankTransfer: string;
    card: string;
    cash: string;
    paypal: string;
    other: string;
  };
};

const UI_LABELS: Record<InvoiceLanguage, InvoiceUiLabels> = {
  en: {
    invoiceDetails: "Invoice details",
    instantUpdate: "Everything updates instantly.",
    businessName: "Business name",
    invoiceNumber: "Invoice number",
    address: "Address",
    issueDate: "Issue date",
    dueDate: "Due date",
    paymentMethod: "Payment method",
    currency: "Currency",
    invoiceLanguage: "Invoice language",
    logo: "Logo",
    billTo: "Bill to",
    clientCompany: "Client / company",
    clientEmail: "Client email",
    billingAddress: "Billing address",
    itemsServices: "Items & services",
    addItem: "Add item",
    description: "Description",
    quantity: "Qty",
    price: "Price",
    removeItem: "Remove item",
    tax: "Tax",
    discount: "Discount",
    footerNote: "Footer note",
    paymentMethods: {
      bankTransfer: "Bank transfer",
      card: "Card",
      cash: "Cash",
      paypal: "PayPal",
      other: "Other",
    },
  },
  fr: {
    invoiceDetails: "Détails de la facture",
    instantUpdate: "Tout se met à jour instantanément.",
    businessName: "Nom de l'entreprise",
    invoiceNumber: "Numéro de facture",
    address: "Adresse",
    issueDate: "Date d'émission",
    dueDate: "Date d'échéance",
    paymentMethod: "Mode de paiement",
    currency: "Devise",
    invoiceLanguage: "Langue de la facture",
    logo: "Logo",
    billTo: "Facturé à",
    clientCompany: "Client / entreprise",
    clientEmail: "E-mail du client",
    billingAddress: "Adresse de facturation",
    itemsServices: "Articles et services",
    addItem: "Ajouter un article",
    description: "Description",
    quantity: "Qté",
    price: "Prix",
    removeItem: "Supprimer l'article",
    tax: "TVA",
    discount: "Remise",
    footerNote: "Note de bas de page",
    paymentMethods: {
      bankTransfer: "Virement bancaire",
      card: "Carte",
      cash: "Espèces",
      paypal: "PayPal",
      other: "Autre",
    },
  },
};

/** Returns editor labels in the language selected for the invoice. */
export function getInvoiceUiLabels(
  language: InvoiceLanguage,
): InvoiceUiLabels {
  return UI_LABELS[language];
}
