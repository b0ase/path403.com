import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '$401 — Follow Your Own Path',
  description: 'Decentralised identity protocol. Prove who you are without giving yourself away.',
};

export default function Layout401({ children }: { children: React.ReactNode }) {
  return children;
}
