import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import DentalkartLogo from "./dentalkart-logo";

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
      <body className="bg-slate-50 text-slate-900 min-h-screen antialiased">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50 backdrop-blur-sm bg-white/90">
          <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <DentalkartLogo size={32} />
              <div className="hidden sm:block pl-3 border-l border-slate-200">
                <div className="text-sm font-semibold text-slate-900">
                  Blog Generator
                </div>
                <div className="text-xs text-slate-500">
                  AI-powered content for dental professionals
                </div>
              </div>
            </Link>
            <nav className="flex items-center gap-1">
              <a
                href="https://www.dentalkart.com/blogs/admin/posts"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors"
              >
                Admin &rarr;
              </a>
            </nav>
          </div>
        </header>
        <main className="max-w-6xl mx-auto p-6">{children}</main>
      </body>
    </html>
  );
}
