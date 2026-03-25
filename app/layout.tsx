import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DentalKart Blog Generator",
  description: "Automated blog generation for DentalKart.com",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <header className="bg-white border-b px-6 py-4">
          <h1 className="text-xl font-bold text-blue-600">
            DentalKart Blog Generator
          </h1>
          <p className="text-sm text-gray-500">Automated blog generation status</p>
        </header>
        <main className="max-w-4xl mx-auto p-6">{children}</main>
      </body>
    </html>
  );
}
