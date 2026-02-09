import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '$403 — Access Control for the Open Web',
  description: 'Programmable permissions on the blockchain. Geo-gates, time-locks, identity-gates, blacklists.',
};

export default function Layout403({ children }: { children: React.ReactNode }) {
  return children;
}
