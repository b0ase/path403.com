import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Orbitron } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { WalletProvider } from "@/components/WalletProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ClientNavigation } from "@/components/ClientNavigation";
import { Sticky402Button } from "@/components/Sticky402Button";

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
  title: "$403 — The Forbidden Path",
  description: "Programmable conditions for the open web. Geo-gates, time-locks, compliance rules, multi-party approvals — all enforced on-chain, composable with $401 identity and $402 payment.",
  keywords: ["$403", "path protocol", "BSV", "conditions", "access control", "programmable rules", "HTTP 403", "x403", "forbidden", "smart conditions"],
  authors: [{ name: "b0ase", url: "https://x.com/b0ase" }],
  creator: "b0ase",
  openGraph: {
    title: "$403 — The Forbidden Path",
    description: "Programmable conditions for the open web. x401/x402/x403 — three DNS records give any website identity, payment, and conditions.",
    url: "https://path403.com",
    siteName: "$403 Protocol",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "$403 — The Forbidden Path",
    description: "Programmable conditions for the open web. Three DNS records. Three subdomains.",
    creator: "@b0ase",
    site: "@b0ase",
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "ai-content-declaration": "This website provides tokenised content services for AI agents via MCP",
    "ai-integration": "MCP server available via npm: path402",
    "ai-plugin": "https://path402.com/.well-known/ai-plugin.json",
    "llms-txt": "https://path402.com/llms.txt",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="ai-plugin" href="https://path402.com/.well-known/ai-plugin.json" />
        <link rel="alternate" type="text/plain" href="https://path402.com/llms.txt" title="LLMs.txt" />
      </head>
      <body className={`${inter.variable} ${mono.variable} ${orbitron.variable} font-mono antialiased`}>
        <ThemeProvider>
          <WalletProvider>
            <ClientNavigation />
            {children}
            <Sticky402Button />

            {/* Footer */}
            <footer className="border-t border-zinc-200 dark:border-zinc-800 py-16 mt-20 bg-white dark:bg-black">
              <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div>
                    <h3 className="font-bold mb-4 text-zinc-900 dark:text-white text-sm uppercase tracking-widest">$402</h3>
                    <p className="text-zinc-500 text-sm">
                      Access tokens for anything addressable. Run a node, earn $402 through Proof of Work.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 mb-4 uppercase tracking-widest">Resources</h4>
                    <ul className="space-y-2 text-sm">
                      <li><Link href="/docs" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">Documentation</Link></li>
                      <li><Link href="/402" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">Whitepaper</Link></li>
                      <li><a href="https://github.com/b0ase/path402" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">GitHub</a></li>
                      <li><a href="https://www.npmjs.com/package/path402" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">npm Package</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 mb-4 uppercase tracking-widest">Ecosystem</h4>
                    <ul className="space-y-2 text-sm">
                      <li><Link href="/download" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">Download Client</Link></li>
                      <li><Link href="/token" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">POW20 Token</Link></li>
                      <li><Link href="/protocol" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">Protocol Economics</Link></li>
                      <li><a href="https://fnews.online" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">F.NEWS</a></li>
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
                  © 2026 b0ase. Open BSV License v4.
                </div>
              </div>
            </footer>
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
