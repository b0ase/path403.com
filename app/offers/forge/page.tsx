import { Metadata } from "next";
import ForgeOfferClient from "./ForgeOfferClient";

export const metadata: Metadata = {
  title: 'AI Forge Partnership Package | b0ase.com',
  description: 'Tailored development services for AI Forge portfolio companies. MVP acceleration, token infrastructure, and pitch deck automation.',
  robots: {
    index: false, // Don't index this demo page
    follow: false,
  },
};

export default function ForgeOfferPage() {
  return <ForgeOfferClient />;
}
