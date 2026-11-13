import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppApolloProvider } from "@/src/shared/providers/apollo-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Crawlix | SEO Audit Dashboard",
  description: "Run website audits and turn search signals into a clear growth plan.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppApolloProvider>{children}</AppApolloProvider>
      </body>
    </html>
  );
}
