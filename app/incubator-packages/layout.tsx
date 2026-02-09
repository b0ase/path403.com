import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Incubator Packages - B0ASE Startup Infrastructure",
  description: "Startup infrastructure in 6 phases. From Foundation to Tokenize. No overlap, no wasted spend. Full journey: £7,150 setup + monthly automation.",
  openGraph: {
    title: "Incubator Packages - B0ASE Startup Infrastructure",
    description: "Startup infrastructure in 6 phases. We grow with you from pre-seed to tokenized equity.",
    images: [
      {
        url: "https://b0ase.com/og-incubator-packages.png",
        width: 1200,
        height: 630,
        alt: "B0ASE Incubator Packages - Startup Infrastructure",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Incubator Packages - B0ASE Startup Infrastructure",
    description: "Startup infrastructure in 6 phases. We grow with you from pre-seed to tokenized equity.",
    images: ["https://b0ase.com/og-incubator-packages.png"],
  },
};

export default function IncubatorPackagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
