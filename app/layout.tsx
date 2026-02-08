import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Orbitron } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navigation } from "@/components/Navigation";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://path403.com'),
  title: "$403 — Access Control for the Open Web",
  description: "Programmable permissions on the blockchain. Geo-gates, time-locks, blacklists, and compliance rules — the access control layer of the $402 Protocol.",
  keywords: ["$403", "access control", "BSV", "permissions", "geo-gating", "blockchain", "path protocol", "$402", "$401"],
  authors: [{ name: "b0ase", url: "https://x.com/b0ase" }],
  creator: "b0ase",
  openGraph: {
    title: "$403 — Access Control for the Open Web",
    description: "Programmable permissions on the blockchain. Gate, restrict, comply.",
    url: "https://path403.com",
    siteName: "$403 Access Control Protocol",
    locale: "en_US",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "$403 — Access Control for the Open Web",
    description: "Programmable permissions on the blockchain.",
    creator: "@b0ase",
    site: "@b0ase",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.jpg",
    apple: "/favicon.jpg",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${mono.variable} ${orbitron.variable} font-mono antialiased`}>
        <ThemeProvider>
          <Navigation />
          <div className="pt-12">
            {children}
          </div>

          <footer className="border-t border-zinc-200 dark:border-zinc-800 py-16 mt-20 bg-white dark:bg-black">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <h3 className="font-bold mb-4 text-zinc-900 dark:text-white text-sm uppercase tracking-widest">$403</h3>
                  <p className="text-zinc-500 text-sm">
                    Programmable access control. Gate content, enforce compliance, set the rules for who sees what.
                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 mb-4 uppercase tracking-widest">Resources</h4>
                  <ul className="space-y-2 text-sm">
                    <li><Link href="/spec" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">Specification</Link></li>
                    <li><Link href="/blog" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">Blog</Link></li>
                    <li><a href="https://github.com/b0ase/path403" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">GitHub</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 mb-4 uppercase tracking-widest">Ecosystem</h4>
                  <ul className="space-y-2 text-sm">
                    <li><a href="https://path401.com" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">$401 Identity</a></li>
                    <li><a href="https://path402.com" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">$402 Protocol</a></li>
                    <li><a href="https://path402.com/download" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">Download Client</a></li>
                    <li><a href="https://dns-dex.com" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">DNS-DEX</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 mb-4 uppercase tracking-widest">Contact</h4>
                  <ul className="space-y-2 text-sm">
                    <li><a href="mailto:hello@b0ase.com" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">hello@b0ase.com</a></li>
                    <li><a href="https://t.me/b0ase_com" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">Telegram</a></li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-zinc-200 dark:border-zinc-800 mt-12 pt-8 text-center text-zinc-400 dark:text-zinc-600 text-xs uppercase tracking-widest">
                &copy; 2026 b0ase. Open BSV License v4.
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
