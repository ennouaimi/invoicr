import "./globals.css";

export const metadata = {
  title: "Invoicr — Free Invoice Maker",
  description: "Create clean, branded invoices in your browser. No signup, no storage.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
