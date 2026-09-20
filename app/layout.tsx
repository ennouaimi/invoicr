import "./globals.css";

export const metadata = {
  title: "Receiptly — Free Receipt Maker",
  description: "Create clean, branded receipts in your browser. No signup, no storage.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
