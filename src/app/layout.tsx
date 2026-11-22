import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const figtree = Figtree({ variable: "--font-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tanztraining",
  description: "Übungen von deinem Trainer",
};

// cover: lets env(safe-area-inset-*) report the home indicator so the progress toast can clear it
export const viewport: Viewport = { viewportFit: "cover" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" suppressHydrationWarning data-scroll-behavior="smooth" className={`${figtree.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
