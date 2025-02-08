import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Question and Answer - Certificate of Authenticity",
  description: "Question and Answer - Certificate of Authenticity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
