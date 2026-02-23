'use client';

import Link from "next/link";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const GITHUB_RELEASE = "https://github.com/b0ase/path402/releases/tag/v4.0.0-alpha.3";
const RELEASE_BASE_MAC = "https://github.com/b0ase/path402/releases/download/v4.0.0-alpha.3";
const RELEASE_BASE_WIN_LINUX = "https://github.com/b0ase/path402/releases/download/v4.0.0-alpha.1";

const APPLE_ICON = (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);

const WINDOWS_ICON = (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 12V6.75l6-1.32v6.48L3 12zm17-9v8.75l-10 .15V5.21L20 3zM3 13l6 .09v6.81l-6-1.15V13zm17 .25V22l-10-1.91V13.1l10 .15z"/>
  </svg>
);

const LINUX_ICON = (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a.424.424 0 00-.11.135c-.26.268-.45.6-.663.839-.199.199-.485.267-.797.4-.313.136-.658.269-.864.68-.09.189-.136.394-.132.602 0 .199.027.4.055.536.058.399.116.728.04.97-.249.68-.28 1.145-.106 1.484.174.334.535.47.94.601.81.2 1.91.135 2.774.6.926.466 1.866.67 2.616.47.526-.116.97-.464 1.208-.946.587-.003 1.23-.269 2.26-.334.699-.058 1.574.267 2.577.2.025.134.063.198.114.333l.003.003c.391.778 1.113 1.132 1.884 1.071.771-.06 1.592-.536 2.257-1.306.631-.765 1.683-1.084 2.378-1.503.348-.199.629-.469.649-.853.023-.4-.2-.811-.714-1.376v-.097l-.003-.003c-.17-.2-.25-.535-.338-.926-.085-.401-.182-.786-.492-1.046h-.003c-.059-.054-.123-.067-.188-.135a.357.357 0 00-.19-.064c.431-1.278.264-2.55-.173-3.694-.533-1.41-1.465-2.638-2.175-3.483-.796-1.005-1.576-1.957-1.56-3.368.026-2.152.236-6.133-3.544-6.139z"/>
  </svg>
);

const DOWNLOADS = [
  {
    platform: "macOS",
    subtitle: "Apple Silicon",
    filename: "path402-4.0.0-alpha.3-arm64.dmg",
    url: `${RELEASE_BASE_MAC}/path402-4.0.0-alpha.3-arm64.dmg`,
    icon: APPLE_ICON,
    note: "For M1, M2, M3, M4 Macs",
    label: "Download DMG"
  },
  {
    platform: "macOS",
    subtitle: "Intel",
    filename: "path402-4.0.0-alpha.3.dmg",
    url: `${RELEASE_BASE_MAC}/path402-4.0.0-alpha.3.dmg`,
    icon: APPLE_ICON,
    note: "For Intel-based Macs",
    label: "Download DMG"
  },
  {
    platform: "Windows",
    subtitle: "Installer",
    filename: "path402.Setup.4.0.0-alpha.1.exe",
    url: `${RELEASE_BASE_WIN_LINUX}/path402.Setup.4.0.0-alpha.1.exe`,
    icon: WINDOWS_ICON,
    note: "NSIS installer for Windows x64",
    label: "Download EXE"
  },
  {
    platform: "Windows",
    subtitle: "Portable",
    filename: "path402.4.0.0-alpha.1.exe",
    url: `${RELEASE_BASE_WIN_LINUX}/path402.4.0.0-alpha.1.exe`,
    icon: WINDOWS_ICON,
    note: "No installation required — run directly",
    label: "Download Portable"
  },
  {
    platform: "Linux",
    subtitle: "AppImage",
    filename: "path402-client-4.0.0-alpha.1-x86_64.AppImage",
    url: `${RELEASE_BASE_WIN_LINUX}/path402-client-4.0.0-alpha.1-x86_64.AppImage`,
    icon: LINUX_ICON,
    note: "Universal Linux package — chmod +x and run",
    label: "Download AppImage"
  },
  {
    platform: "Linux",
    subtitle: "Debian",
    filename: "path402-client-4.0.0-alpha.1-amd64.deb",
    url: `${RELEASE_BASE_WIN_LINUX}/path402-client-4.0.0-alpha.1-amd64.deb`,
    icon: LINUX_ICON,
    note: "For Ubuntu, Debian, and derivatives",
    label: "Download .deb"
  }
];

const RELEASE_NOTES = [
  {
    version: "4.0.0-alpha.3",
    date: "February 2026",
    tag: "latest",
    changes: [
      "One-token model: $402 PoW20 mining only, no equity token",
      "Updated documentation and protocol messaging",
      "macOS builds (arm64 + x64) — signed and notarized",
    ]
  },
  {
    version: "4.0.0-alpha.2",
    date: "February 2026",
    tag: "",
    changes: [
      "BRC-116 Hash-to-Mint: real $402 token mining via on-chain smart contract",
      "Proof-of-Indexing work commitments recorded permanently on BSV",
      "UTXO contention handling with automatic retry + backoff",
      "macOS builds signed AND notarized (no more Gatekeeper bypass)",
      "Mining-only mode: runs without AI API key",
      "Config file support: ~/.pathd/config.json for walletKey + tokenId",
    ]
  },
  {
    version: "4.0.0-alpha.1",
    date: "February 2026",
    tag: "",
    changes: [
      "All platforms: macOS (arm64 + x64), Windows, Linux",
      "macOS builds signed with Developer ID certificate",
      "Content storage layer: download, store, and serve content P2P",
      "Demo content bundled for new users (6 sample videos)",
      "libp2p gossip network (NOISE encrypted TCP)",
      "MCP server integration for Claude Desktop",
      "BSV wallet support (HandCash, Yours, Metanet)",
      "Library, marketplace, portfolio, and chat UIs",
    ]
  }
];

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white font-mono pt-14">
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[10px] uppercase tracking-widest text-zinc-500 mb-8"
              variants={fadeIn}
            >
              VERSION 4.0.0-ALPHA.3
            </motion.div>

            <motion.h1
              className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-4"
              variants={fadeIn}
            >
              Download
            </motion.h1>

            <motion.p
              className="text-zinc-600 dark:text-zinc-400 max-w-2xl mb-12"
              variants={fadeIn}
            >
              Run your own $402 node. Index BSV-21 tokens, serve content to peers, and mine $402 via
              Proof-of-Indexing. macOS builds are latest (alpha.3). Windows and Linux builds available from alpha.1.
            </motion.p>

            {/* Download Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {DOWNLOADS.map((download, i) => (
                <motion.div
                  key={i}
                  className="border p-8 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
                  variants={fadeIn}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-zinc-400 dark:text-zinc-600">
                      {download.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold uppercase tracking-tight">
                        {download.platform}
                      </h3>
                      <p className="text-sm text-zinc-500">{download.subtitle}</p>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-500 mb-6">{download.note}</p>

                  <a
                    href={download.url}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-xs hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors w-full justify-center"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {download.label}
                  </a>
                </motion.div>
              ))}
            </div>

            {/* Installation Note */}
            <motion.div
              className="border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 p-6 mb-12"
              variants={fadeIn}
            >
              <h3 className="text-sm font-bold uppercase tracking-wide mb-2 text-amber-800 dark:text-amber-400">
                Installation Note
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-500">
                macOS builds are code-signed with a Developer ID certificate. On first launch, right-click the app and select &quot;Open&quot; to bypass Gatekeeper.
                Windows builds are unsigned &mdash; you may see a SmartScreen warning. This is alpha software.
              </p>
            </motion.div>

            {/* Running the Network */}
            <motion.div
              className="border border-zinc-200 dark:border-zinc-800 p-8 bg-zinc-50 dark:bg-zinc-950 mb-12"
              variants={fadeIn}
            >
              <h2 className="text-[10px] font-bold text-zinc-500 mb-6 uppercase tracking-widest">
                Running the Network
              </h2>
              <div className="space-y-6 text-sm text-zinc-600 dark:text-zinc-400">
                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-white mb-2 uppercase tracking-wide text-xs">What your node does</h3>
                  <ul className="space-y-1 ml-4">
                    <li>&bull; Indexes the BSV blockchain for $402 token movements</li>
                    <li>&bull; Serves content to peers via the gossip network</li>
                    <li>&bull; Verifies ticket stamps (BRC-105) for content access</li>
                    <li>&bull; Participates in GossipSub for token/transfer discovery</li>
                    <li>&bull; Earns POW20 tokens for useful work performed</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-white mb-2 uppercase tracking-wide text-xs">Network ports</h3>
                  <div className="grid grid-cols-3 gap-4 bg-white dark:bg-black p-4 border border-zinc-200 dark:border-zinc-800">
                    <div>
                      <div className="text-zinc-500 text-[10px] uppercase tracking-widest">Gossip</div>
                      <div className="text-zinc-900 dark:text-white font-bold">:4020</div>
                    </div>
                    <div>
                      <div className="text-zinc-500 text-[10px] uppercase tracking-widest">API / GUI</div>
                      <div className="text-zinc-900 dark:text-white font-bold">:4021</div>
                    </div>
                    <div>
                      <div className="text-zinc-500 text-[10px] uppercase tracking-widest">Protocol</div>
                      <div className="text-zinc-900 dark:text-white font-bold">TCP + NOISE</div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-white mb-2 uppercase tracking-wide text-xs">Data location</h3>
                  <code className="bg-white dark:bg-black px-3 py-2 border border-zinc-200 dark:border-zinc-800 block text-xs">
                    ~/.pathd/    &larr; database, keys, content cache
                  </code>
                </div>
              </div>
            </motion.div>

            {/* Alternative: npm */}
            <motion.div
              className="border border-zinc-200 dark:border-zinc-800 p-8 bg-zinc-50 dark:bg-zinc-950 mb-12"
              variants={fadeIn}
            >
              <h3 className="text-sm font-bold uppercase tracking-wide mb-4">
                Or install via npm
              </h3>
              <pre className="bg-white dark:bg-black p-4 font-mono text-sm text-zinc-600 dark:text-zinc-400 overflow-x-auto border border-zinc-200 dark:border-zinc-800 mb-4">
                npm install -g path402
              </pre>
              <p className="text-xs text-zinc-500 mb-4">
                The npm package includes the daemon, CLI, and MCP server. Run <code className="bg-zinc-200 dark:bg-zinc-800 px-1">path402d start</code> to launch.
              </p>
              <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wide mb-2">Add to Claude Desktop</h4>
              <pre className="bg-white dark:bg-black p-4 font-mono text-xs text-zinc-600 dark:text-zinc-400 overflow-x-auto border border-zinc-200 dark:border-zinc-800">
                {`{
  "mcpServers": {
    "path402": {
      "command": "npx",
      "args": ["path402"]
    }
  }
}`}
              </pre>
            </motion.div>

            {/* Release Notes */}
            <motion.div
              className="mb-12"
              variants={fadeIn}
            >
              <h2 className="text-[10px] font-bold text-zinc-500 mb-6 uppercase tracking-widest">
                Release Notes
              </h2>
              <div className="space-y-6">
                {RELEASE_NOTES.map((release, i) => (
                  <div
                    key={i}
                    className="border border-zinc-200 dark:border-zinc-800 p-6 bg-zinc-50 dark:bg-zinc-950"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-lg font-bold">v{release.version}</h3>
                      {release.tag && (
                        <span className="px-2 py-0.5 bg-zinc-900 dark:bg-white text-white dark:text-black text-[10px] uppercase tracking-widest font-bold">
                          {release.tag}
                        </span>
                      )}
                      <span className="text-zinc-500 text-xs ml-auto">{release.date}</span>
                    </div>
                    <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {release.changes.map((change, j) => (
                        <li key={j} className="flex gap-2">
                          <span className="text-zinc-400 dark:text-zinc-600">&bull;</span>
                          {change}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Links */}
            <motion.div
              className="flex flex-wrap gap-4"
              variants={fadeIn}
            >
              <a
                href={GITHUB_RELEASE}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-100 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-widest text-xs border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                View on GitHub
              </a>
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-100 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-widest text-xs border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                Documentation
              </Link>
              <Link
                href="/token"
                className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-100 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-widest text-xs border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                POW20 Token Info
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
