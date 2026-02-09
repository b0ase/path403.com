import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Components - Pre-Built Modules",
  description: "Production-ready components for your next project. Dashboards, payment systems, AI integrations - delivered as clean, maintainable code.",
  openGraph: {
    title: "Components - Pre-Built Modules",
    description: "Production-ready components for your next project. Dashboards, payment systems, AI integrations.",
    url: "https://b0ase.com/components",
    type: "website",
    images: [
      {
        url: "https://b0ase.com/og-components.png",
        width: 1200,
        height: 630,
        alt: "B0ASE Components - Pre-Built Modules",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Components - Pre-Built Modules",
    description: "Production-ready components for your next project. Dashboards, payment systems, AI integrations.",
    images: ["https://b0ase.com/og-components.png"],
  },
};

export default function ComponentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
