// Client and Project Types
export interface Client {
  slug: string;
  name: string;
  email?: string;
  company?: string;
  status: 'active' | 'completed' | 'pending';
  createdAt: string;
}

export interface Project {
  slug: string;
  clientSlug: string;
  name: string;
  description?: string;
  status: 'draft' | 'in_progress' | 'completed' | 'on_hold';
  createdAt: string;
}

export interface ChecklistItem {
  category: string;
  service: string;
  price: number;
  unit: string;
  quantity: number;
  selected: boolean;
}

export type PaymentPlan = '30-30-30' | '100-upfront' | '50-50';

export interface ProjectChecklist {
  projectSlug: string;
  clientSlug: string;
  items: ChecklistItem[];
  paymentPlan: PaymentPlan;
  lockedIn: boolean;
  lockedAt?: string;
  total: number;
}

// Client data - in production this comes from database via API
export const clients: Client[] = [];

// Project data - in production this comes from database via API
export const projects: Project[] = [];

// Pricing data - imported from pricing page structure
export const pricingCategories = [
  {
    category: "Web Design & Development",
    items: [
      { service: "Landing page", price: 180, unit: "one-time" },
      { service: "Additional page", price: 80, unit: "per page" },
      { service: "5-page website", price: 500, unit: "starting" },
      { service: "10-page website", price: 900, unit: "starting" },
      { service: "E-commerce store", price: 2000, unit: "starting" },
      { service: "Custom web app", price: 3000, unit: "starting" },
      { service: "Website redesign", price: 400, unit: "starting" },
      { service: "Mobile optimization", price: 200, unit: "one-time" },
      { service: "Speed optimization", price: 150, unit: "one-time" },
      { service: "Accessibility audit", price: 200, unit: "one-time" },
    ],
  },
  {
    category: "Branding & Design",
    items: [
      { service: "Logo design", price: 150, unit: "one-time" },
      { service: "Logo redesign", price: 100, unit: "one-time" },
      { service: "Brand guidelines", price: 300, unit: "one-time" },
      { service: "Business card design", price: 50, unit: "one-time" },
      { service: "Social media kit", price: 100, unit: "one-time" },
      { service: "Presentation design", price: 150, unit: "per deck" },
      { service: "Icon set", price: 200, unit: "up to 20" },
      { service: "Illustration", price: 80, unit: "per piece" },
      { service: "Infographic", price: 120, unit: "per piece" },
      { service: "UI/UX mockups", price: 300, unit: "starting" },
    ],
  },
  {
    category: "Content & Copywriting",
    items: [
      { service: "Website copy", price: 100, unit: "per page" },
      { service: "Blog article", price: 80, unit: "per article" },
      { service: "Product description", price: 15, unit: "per product" },
      { service: "Email sequence", price: 200, unit: "5 emails" },
      { service: "Newsletter", price: 50, unit: "per issue" },
      { service: "Press release", price: 150, unit: "one-time" },
      { service: "Case study", price: 200, unit: "per study" },
      { service: "Whitepaper", price: 500, unit: "one-time" },
      { service: "Script writing", price: 100, unit: "per minute" },
      { service: "Proofreading", price: 30, unit: "per 1000 words" },
    ],
  },
  {
    category: "Video & Motion",
    items: [
      { service: "Promo video (30s)", price: 150, unit: "one-time" },
      { service: "Promo video (60s)", price: 200, unit: "one-time" },
      { service: "Social media clip", price: 50, unit: "per clip" },
      { service: "Motion graphics", price: 100, unit: "per scene" },
      { service: "Logo animation", price: 80, unit: "one-time" },
      { service: "Explainer video", price: 400, unit: "per minute" },
      { service: "Video editing", price: 40, unit: "per hour" },
      { service: "Color grading", price: 50, unit: "per video" },
      { service: "Subtitles/captions", price: 30, unit: "per video" },
      { service: "Thumbnail design", price: 25, unit: "per thumbnail" },
    ],
  },
  {
    category: "SEO & Marketing",
    items: [
      { service: "SEO audit", price: 250, unit: "one-time" },
      { service: "Keyword research", price: 100, unit: "one-time" },
      { service: "On-page SEO", price: 80, unit: "per page" },
      { service: "Technical SEO", price: 300, unit: "one-time" },
      { service: "Monthly SEO", price: 300, unit: "per month" },
      { service: "Google Ads setup", price: 200, unit: "one-time" },
      { service: "Google Ads management", price: 150, unit: "per month" },
      { service: "Facebook Ads setup", price: 150, unit: "one-time" },
      { service: "Analytics setup", price: 100, unit: "one-time" },
      { service: "Conversion tracking", price: 80, unit: "one-time" },
    ],
  },
  {
    category: "Social Media",
    items: [
      { service: "Profile setup", price: 50, unit: "per platform" },
      { service: "Content calendar", price: 100, unit: "per month" },
      { service: "Post design", price: 20, unit: "per post" },
      { service: "Story design", price: 15, unit: "per story" },
      { service: "Carousel post", price: 40, unit: "per post" },
      { service: "Monthly management", price: 300, unit: "per month" },
      { service: "Community management", price: 200, unit: "per month" },
      { service: "Influencer outreach", price: 150, unit: "per campaign" },
      { service: "Social media audit", price: 150, unit: "one-time" },
      { service: "Competitor analysis", price: 100, unit: "one-time" },
    ],
  },
  {
    category: "AI & Automation",
    items: [
      { service: "AI chatbot (basic)", price: 500, unit: "one-time" },
      { service: "AI chatbot (advanced)", price: 1200, unit: "one-time" },
      { service: "Custom AI agent", price: 800, unit: "starting" },
      { service: "Workflow automation", price: 300, unit: "per workflow" },
      { service: "Email automation", price: 200, unit: "one-time" },
      { service: "CRM integration", price: 250, unit: "one-time" },
      { service: "API integration", price: 200, unit: "per integration" },
      { service: "Data pipeline", price: 400, unit: "one-time" },
      { service: "AI training/fine-tuning", price: 500, unit: "starting" },
      { service: "AI consultation", price: 100, unit: "per hour" },
    ],
  },
  {
    category: "Blockchain & Crypto",
    items: [
      { service: "Token deployment (BSV)", price: 800, unit: "one-time" },
      { service: "Token deployment (EVM)", price: 1200, unit: "one-time" },
      { service: "Smart contract audit", price: 500, unit: "starting" },
      { service: "Tokenomics design", price: 300, unit: "one-time" },
      { service: "Whitepaper", price: 500, unit: "one-time" },
      { service: "Token website", price: 400, unit: "one-time" },
      { service: "Wallet integration", price: 300, unit: "one-time" },
      { service: "Exchange listing support", price: 500, unit: "one-time" },
      { service: "NFT collection", price: 600, unit: "starting" },
      { service: "DApp development", price: 2000, unit: "starting" },
    ],
  },
  {
    category: "KYC & Compliance",
    items: [
      { service: "KYC integration setup", price: 500, unit: "one-time" },
      { service: "Identity verification", price: 2.50, unit: "per user" },
      { service: "AML screening setup", price: 300, unit: "one-time" },
      { service: "AML monitoring", price: 50, unit: "per month" },
      { service: "Investor accreditation", price: 150, unit: "one-time" },
      { service: "Shareholder verification", price: 200, unit: "one-time" },
      { service: "Boardroom KYC setup", price: 300, unit: "one-time" },
      { service: "Compliance dashboard", price: 100, unit: "per month" },
      { service: "Re-verification flow", price: 100, unit: "one-time" },
      { service: "Compliance consultation", price: 150, unit: "per hour" },
    ],
  },
  {
    category: "Support & Maintenance",
    items: [
      { service: "Website maintenance", price: 100, unit: "per month" },
      { service: "Security updates", price: 50, unit: "per month" },
      { service: "Backup management", price: 30, unit: "per month" },
      { service: "Bug fixes", price: 50, unit: "per hour" },
      { service: "Feature updates", price: 60, unit: "per hour" },
      { service: "Emergency support", price: 100, unit: "per hour" },
      { service: "Training session", price: 80, unit: "per hour" },
      { service: "Documentation", price: 150, unit: "per project" },
      { service: "Hosting setup", price: 100, unit: "one-time" },
      { service: "Domain management", price: 30, unit: "per year" },
    ],
  },
  {
    category: "Consulting",
    items: [
      { service: "Strategy session", price: 150, unit: "per hour" },
      { service: "Technical consultation", price: 100, unit: "per hour" },
      { service: "Code review", price: 200, unit: "per project" },
      { service: "Architecture planning", price: 300, unit: "per project" },
      { service: "Startup advisory", price: 500, unit: "per month" },
      { service: "Product roadmap", price: 400, unit: "one-time" },
      { service: "Technology audit", price: 300, unit: "one-time" },
      { service: "Vendor selection", price: 200, unit: "one-time" },
      { service: "Team training", price: 400, unit: "per day" },
      { service: "Fractional CTO", price: 1500, unit: "per month" },
    ],
  },
];

// Helper functions
export function getClient(slug: string): Client | undefined {
  return clients.find(c => c.slug === slug);
}

export function getClientProjects(clientSlug: string): Project[] {
  return projects.filter(p => p.clientSlug === clientSlug);
}

export function getProject(clientSlug: string, projectSlug: string): Project | undefined {
  return projects.find(p => p.clientSlug === clientSlug && p.slug === projectSlug);
}

export function formatPrice(amount: number): string {
  return `£${amount.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function getPaymentPlanBreakdown(total: number, plan: PaymentPlan) {
  switch (plan) {
    case '100-upfront':
      return [{ label: 'Full payment', amount: total, when: 'Now' }];
    case '50-50':
      return [
        { label: 'Deposit', amount: total * 0.5, when: 'Now' },
        { label: 'On delivery', amount: total * 0.5, when: 'On delivery' },
      ];
    case '30-30-30':
    default:
      return [
        { label: 'Deposit', amount: total * 0.3, when: 'Now' },
        { label: 'On delivery', amount: total * 0.3, when: 'On delivery' },
        { label: 'Final payment', amount: total * 0.4, when: '30 days after delivery' },
      ];
  }
}
