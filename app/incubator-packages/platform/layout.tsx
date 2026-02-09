import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Platform - B0ASE Incubator Infrastructure",
  description: "The complete incubator infrastructure. 252 pages, 97 API endpoints, 81,000+ lines of production code. License, managed, or cohort options.",
  openGraph: {
    title: "Platform - B0ASE Incubator Infrastructure",
    description: "The complete incubator infrastructure. Own the platform powering b0ase.com.",
    url: "https://www.b0ase.com/incubator-packages/platform",
    type: "website",
    images: [
      {
        url: "https://www.b0ase.com/og-platform.png",
        width: 1200,
        height: 630,
        alt: "B0ASE Platform - Incubator Infrastructure",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Platform - B0ASE Incubator Infrastructure",
    description: "The complete incubator infrastructure. Own the platform powering b0ase.com.",
    images: ["https://www.b0ase.com/og-platform.png"],
  },
};

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
