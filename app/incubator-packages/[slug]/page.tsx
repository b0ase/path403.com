import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PackagePage from './PackagePage';

const phases: Record<string, {
  name: string;
  price: string;
  timing: string;
  phaseNumber: number;
  description: string;
  includes: { item: string; value: string }[];
  addOns: { item: string; price: string }[];
  tag: string | null;
  nextPhase: string | null;
  prevPhase: string | null;
}> = {
  'foundation': {
    name: 'Foundation',
    price: '£500',
    timing: 'Month 1-2',
    phaseNumber: 1,
    description: 'Get online with a professional presence. The essential starting point for any startup - your digital foundation that everything else builds upon.',
    includes: [
      { item: 'Landing page', value: 'Custom designed, mobile responsive' },
      { item: 'Logo design', value: '3 concepts, 2 revisions, all formats' },
      { item: 'Basic SEO setup', value: 'Meta tags, sitemap, Google indexing' },
      { item: 'Contact form', value: 'Email notifications, spam protection' },
      { item: 'Hosting setup', value: 'First year included' },
      { item: 'SSL certificate', value: 'HTTPS enabled' },
      { item: 'Domain connection', value: 'DNS configuration' },
    ],
    addOns: [
      { item: 'Additional pages', price: '£80/page' },
      { item: 'Blog setup', price: '£150' },
      { item: 'Analytics dashboard', price: '£100' },
    ],
    tag: 'Start Here',
    nextPhase: 'identity',
    prevPhase: null,
  },
  'identity': {
    name: 'Identity',
    price: '£400',
    timing: 'Month 3-4',
    phaseNumber: 2,
    description: 'Establish your brand across all touchpoints. Professional brand assets that make you look established and trustworthy to investors and customers.',
    includes: [
      { item: 'Brand guidelines', value: 'Colors, typography, usage rules' },
      { item: 'Social media kit', value: 'Profile images, cover photos, templates' },
      { item: 'Business card design', value: 'Print-ready files' },
      { item: 'Email signature', value: 'HTML signature for team' },
      { item: 'Favicon & icons', value: 'All sizes for web & app' },
      { item: 'Letterhead template', value: 'Word/Google Docs format' },
    ],
    addOns: [
      { item: 'Presentation template', price: '£150' },
      { item: 'Merchandise designs', price: '£200' },
      { item: 'Brand video intro', price: '£250' },
    ],
    tag: null,
    nextPhase: 'fundraising',
    prevPhase: 'foundation',
  },
  'fundraising': {
    name: 'Fundraising',
    price: '£750',
    timing: 'Month 5-6',
    phaseNumber: 3,
    description: 'Everything you need to raise your seed round. Professional investor materials that get you in the door and help you close.',
    includes: [
      { item: 'Pitch deck', value: '15-20 slides, professionally designed' },
      { item: 'One-pager', value: 'Executive summary document' },
      { item: 'Data room setup', value: 'Secure document sharing' },
      { item: 'Investor CRM', value: 'Track your pipeline' },
      { item: 'Financial model template', value: 'Customizable spreadsheet' },
      { item: 'Investor update template', value: 'Monthly email format' },
    ],
    addOns: [
      { item: 'Pitch coaching', price: '£200/session' },
      { item: 'Investor intro emails', price: '£150' },
      { item: 'Due diligence prep', price: '£300' },
    ],
    tag: 'Raising',
    nextPhase: 'scale',
    prevPhase: 'identity',
  },
  'scale': {
    name: 'Scale',
    price: '£1,000',
    timing: 'Month 7-9',
    phaseNumber: 4,
    description: 'Full marketing infrastructure to acquire customers. You\'ve raised - now it\'s time to grow. Everything you need to build traction.',
    includes: [
      { item: '5-page website', value: 'Full site with CMS' },
      { item: 'SEO optimization', value: 'Technical + on-page SEO' },
      { item: 'Email marketing setup', value: 'Newsletter system + templates' },
      { item: 'Analytics dashboard', value: 'Google Analytics + Search Console' },
      { item: 'Content strategy', value: 'Editorial calendar, 3 months' },
      { item: 'Social media strategy', value: 'Posting schedule + templates' },
      { item: 'Training session', value: '1 hour walkthrough' },
    ],
    addOns: [
      { item: 'Additional pages', price: '£100/page' },
      { item: 'Blog content', price: '£150/article' },
      { item: 'Video production', price: '£300/video' },
    ],
    tag: null,
    nextPhase: 'series-a',
    prevPhase: 'fundraising',
  },
  'series-a': {
    name: 'Series A',
    price: '£1,500',
    timing: 'Month 10-12',
    phaseNumber: 5,
    description: 'Sophisticated investor relations for institutional investors. Series A requires a different level of professionalism and reporting.',
    includes: [
      { item: 'Cap table visualization', value: 'Interactive cap table tool' },
      { item: 'Board deck template', value: 'Monthly reporting format' },
      { item: 'Press kit', value: 'Media-ready materials' },
      { item: 'Investor update system', value: 'Automated monthly updates' },
      { item: 'Metrics dashboard', value: 'KPI tracking for investors' },
      { item: 'Due diligence room', value: 'Full legal/financial docs' },
      { item: 'Competitor analysis', value: 'Market positioning' },
      { item: 'IR training', price: '2 hour session' },
    ],
    addOns: [
      { item: 'Investor relations retainer', price: '£500/month' },
      { item: 'Board meeting prep', price: '£300/meeting' },
      { item: 'Custom integrations', price: '£400' },
    ],
    tag: null,
    nextPhase: 'tokenize',
    prevPhase: 'scale',
  },
  'tokenize': {
    name: 'Tokenize',
    price: '£3,000',
    timing: 'Month 13+',
    phaseNumber: 6,
    description: 'Tokenize your equity and launch on-chain. The future of company ownership - compliant, liquid, and global.',
    includes: [
      { item: 'Token contract', value: 'BSV or EVM deployment' },
      { item: 'Whitepaper', value: 'Professional document' },
      { item: 'Tokenomics design', value: 'Distribution strategy' },
      { item: 'KYC integration', value: 'Veriff-powered verification' },
      { item: 'Exchange listing support', value: 'Listing guidance & submission' },
      { item: 'Wallet integration', value: 'Yours / HandCash / MetaMask' },
      { item: 'Token landing page', value: 'Dedicated token site' },
      { item: 'Community setup', value: 'Telegram, Discord bots' },
      { item: 'Launch strategy', value: 'Go-to-market plan' },
    ],
    addOns: [
      { item: 'Additional chains', price: '£1,000/chain' },
      { item: 'Smart contract audit', price: '£500' },
      { item: 'Market making support', price: '£1,000/month' },
      { item: 'Additional KYC users', price: '£2.50/user' },
    ],
    tag: 'Equity',
    nextPhase: null,
    prevPhase: 'series-a',
  },
};

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const phase = phases[slug];

  if (!phase) {
    return { title: 'Not Found' };
  }

  return {
    title: `${phase.name} - Phase ${phase.phaseNumber} - ${phase.price} | b0ase.com`,
    description: phase.description,
  };
}

export function generateStaticParams() {
  return Object.keys(phases).map((slug) => ({ slug }));
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const phase = phases[slug];

  if (!phase) {
    notFound();
  }

  return <PackagePage pkg={phase} slug={slug} />;
}
