import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '$402 Token — PoW20 Hash-to-Mint on BSV Mainnet',
  description: '$402 is a Proof-of-Work mining token on BSV-21. 21M supply, 0% pre-mine, earned by running nodes. Mirrors Bitcoin: 50/mint, 210K halving, 33 eras.',
  openGraph: {
    title: '$402 — Genesis Proof',
    description: 'PoW20 Hash-to-Mint token live on BSV mainnet. 21M supply, 0% pre-mine. Earned by running the path402 network.',
    url: 'https://path402.com/token',
    siteName: 'PATH402',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '$402 — Genesis Proof',
    description: 'PoW20 Hash-to-Mint token live on BSV mainnet. 21M supply, 0% pre-mine.',
  },
};

export default function TokenLayout({ children }: { children: React.ReactNode }) {
  return children;
}
