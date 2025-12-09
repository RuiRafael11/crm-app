import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ToastProvider } from "@/components/Toast";
import { SearchProvider } from "@/contexts/SearchContext";

export const metadata: Metadata = {
  title: "CRM Pro - Customer Relationship Management",
  description: "Professional CRM application for managing contacts, companies, deals, and activities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <ToastProvider>
            <SearchProvider>
              <div className="app-layout">
                <Sidebar />
                <main className="main-content">
                  {children}
                </main>
              </div>
            </SearchProvider>
          </ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
