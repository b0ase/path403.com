import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PackagePage from './PackagePage';

const packages: Record<string, {
  name: string;
  price: string;
  monthly: string | null;
  description: string;
  includes: { item: string; value: string }[];
  addOns: { item: string; price: string }[];
  tag: string | null;
}> = {
  'starter': {
    name: 'Starter',
    price: '£499',
    monthly: null,
    description: 'Everything you need to get online. Perfect for freelancers, small businesses, and personal brands looking to establish their digital presence.',
    includes: [
      { item: 'Landing page', value: 'Custom designed, mobile responsive' },
      { item: 'Logo design', value: '3 concepts, 2 revisions' },
      { item: 'Basic SEO', value: 'Meta tags, sitemap, Google indexing' },
      { item: 'Contact form', value: 'Email notifications, spam protection' },
      { item: 'Hosting setup', value: '1 year included' },
      { item: 'SSL certificate', value: 'HTTPS enabled' },
    ],
    addOns: [
      { item: 'Additional pages', price: '£80/page' },
      { item: 'Blog setup', price: '£150' },
      { item: 'Social media kit', price: '£100' },
    ],
    tag: 'Most Popular',
  },
  'ai-agent': {
    name: 'AI Agent',
    price: '£800',
    monthly: '£99/mo',
    description: 'Custom AI agent with ongoing maintenance. Your agent stays up-to-date, monitored, and optimized with monthly maintenance included.',
    includes: [
      { item: 'Custom AI agent', value: 'Built for your specific workflow' },
      { item: 'Knowledge base', value: 'Trained on your data' },
      { item: 'Web widget', value: 'Embed on any website' },
      { item: 'Email integration', value: 'Auto-responses, lead capture' },
      { item: 'Analytics dashboard', value: 'Usage & conversation insights' },
      { item: 'Monthly maintenance', value: 'Updates, monitoring, optimization' },
    ],
    addOns: [
      { item: 'Twitter automation', price: '+£99/mo' },
      { item: 'Slack integration', price: '£150 one-time' },
      { item: 'WhatsApp integration', price: '£250 one-time' },
      { item: 'Additional training', price: '£200' },
    ],
    tag: null,
  },
  'ai-twitter': {
    name: 'AI + Twitter',
    price: '£800',
    monthly: '£199/mo',
    description: 'AI agent with full Twitter automation. Auto-reply to mentions, schedule posts, engage with followers - all managed by your AI.',
    includes: [
      { item: 'Custom AI agent', value: 'Built for your specific workflow' },
      { item: 'Knowledge base', value: 'Trained on your data' },
      { item: 'Twitter automation', value: 'Auto-replies, scheduling, engagement' },
      { item: 'Twitter API access', value: 'Included in monthly fee' },
      { item: 'Analytics dashboard', value: 'Usage & engagement insights' },
      { item: 'Monthly maintenance', value: 'Updates, monitoring, optimization' },
    ],
    addOns: [
      { item: 'LinkedIn automation', price: '+£99/mo' },
      { item: 'Instagram integration', price: '+£99/mo' },
      { item: 'Custom workflows', price: '£300 one-time' },
    ],
    tag: 'Automation',
  },
  'growth': {
    name: 'Growth',
    price: '£1,499',
    monthly: null,
    description: 'Scale your digital presence with a complete marketing-ready website, SEO optimization, and social media foundation.',
    includes: [
      { item: '5-page website', value: 'Custom design, CMS included' },
      { item: 'SEO optimization', value: 'Full audit + implementation' },
      { item: 'Social media setup', value: '3 platforms configured' },
      { item: 'Email marketing', value: 'Newsletter system + templates' },
      { item: 'Analytics', value: 'Google Analytics + Search Console' },
      { item: 'Content strategy', value: 'Editorial calendar' },
      { item: 'Training session', value: '1 hour walkthrough' },
    ],
    addOns: [
      { item: 'Additional pages', price: '£100/page' },
      { item: 'Monthly SEO', price: '£300/month' },
      { item: 'Content writing', price: '£150/article' },
    ],
    tag: null,
  },
  'ecommerce': {
    name: 'E-Commerce',
    price: '£2,999',
    monthly: null,
    description: 'Complete online store solution. Everything you need to sell products online, from store setup to payment processing.',
    includes: [
      { item: 'Store setup', value: 'Shopify or WooCommerce' },
      { item: 'Product pages', value: 'Up to 50 products' },
      { item: 'Payment integration', value: 'Stripe, PayPal, Apple Pay' },
      { item: 'Inventory system', value: 'Stock management' },
      { item: 'Shipping setup', value: 'Multiple carriers' },
      { item: 'Email automation', value: 'Order confirmations, abandoned cart' },
      { item: 'Mobile optimized', value: 'Responsive design' },
      { item: 'Training', value: '2 hour session' },
    ],
    addOns: [
      { item: 'Additional products', price: '£2/product' },
      { item: 'Custom theme', price: '£800' },
      { item: 'Subscription system', price: '£500' },
    ],
    tag: null,
  },
  'token-launch': {
    name: 'Token Launch',
    price: '£3,499',
    monthly: null,
    description: 'Full blockchain token deployment on BSV. From smart contract to community, everything you need to launch your token.',
    includes: [
      { item: 'Token contract', value: 'BSV/1Sat Ordinals deployment' },
      { item: 'Website', value: 'Token landing page' },
      { item: 'Whitepaper', value: 'Professional document' },
      { item: 'Tokenomics', value: 'Distribution strategy' },
      { item: 'Exchange listing', value: 'Listing support & guidance' },
      { item: 'Wallet integration', value: 'Yours Wallet / HandCash' },
      { item: 'Social media', value: 'Twitter, Telegram setup' },
      { item: 'Community templates', value: 'Discord/Telegram bots' },
      { item: 'Launch strategy', value: 'Marketing plan' },
    ],
    addOns: [
      { item: 'KYC compliance (powered by Veriff)', price: '£500 + £2.50/user' },
      { item: 'Additional chains', price: '£1,000/chain' },
      { item: 'Audit report', price: '£500' },
      { item: 'Ongoing marketing', price: '£800/month' },
    ],
    tag: 'Crypto',
  },
};

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pkg = packages[slug];

  if (!pkg) {
    return { title: 'Not Found' };
  }

  return {
    title: `${pkg.name} Package - ${pkg.price} | b0ase.com`,
    description: pkg.description,
  };
}

export function generateStaticParams() {
  return Object.keys(packages).map((slug) => ({ slug }));
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const pkg = packages[slug];

  if (!pkg) {
    notFound();
  }

  return <PackagePage pkg={pkg} slug={slug} />;
}
