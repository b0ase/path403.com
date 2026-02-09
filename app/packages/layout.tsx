import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Packages - B0ASE Bundled Solutions",
  description: "Bundled solutions for startups. From £499 Starter to £3,499 Token Launch. Everything you need to get online and scale.",
  openGraph: {
    title: "Packages - B0ASE Bundled Solutions",
    description: "Bundled solutions for startups. From £499 Starter to £3,499 Token Launch.",
    images: [
      {
        url: "https://b0ase.com/og-packages.png",
        width: 1200,
        height: 630,
        alt: "B0ASE Packages - Bundled Solutions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Packages - B0ASE Bundled Solutions",
    description: "Bundled solutions for startups. From £499 Starter to £3,499 Token Launch.",
    images: ["https://b0ase.com/og-packages.png"],
  },
};

export default function PackagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
