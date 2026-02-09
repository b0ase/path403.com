import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PlatformPackagePage from './PlatformPackagePage';

const packages: Record<string, {
  name: string;
  price: string;
  unit: string;
  monthly?: string;
  description: string;
  longDescription: string;
  includes: { item: string; detail: string }[];
  process: { step: string; description: string }[];
  faqs: { question: string; answer: string }[];
  ideal: string;
  cta: string;
  nextPackage: string | null;
  prevPackage: string | null;
}> = {
  'cohort': {
    name: 'Cohort License',
    price: '£5,000',
    unit: 'per cohort',
    monthly: '+ startup fees',
    description: 'Pay per cohort. Each startup gets their own dashboard.',
    longDescription: 'The Cohort License is perfect for incubators who want to test the platform model before committing to a larger investment. Run a single cohort with full platform access, then decide if you want to continue with additional cohorts or upgrade to a managed or licensed solution.',
    includes: [
      { item: 'Platform access for 6 months', detail: 'Full cohort duration with all features enabled' },
      { item: 'Up to 15 startups', detail: 'Each startup gets their own branded dashboard' },
      { item: 'Individual startup dashboards', detail: 'Separate login and data for each company' },
      { item: 'Cohort analytics', detail: 'Track progress across all startups in your program' },
      { item: 'We maintain everything', detail: 'Updates, security, and infrastructure handled by us' },
      { item: 'Onboarding support', detail: 'Help getting your cohort set up and running' },
      { item: 'Renews per cohort', detail: 'No long-term commitment, pay as you run cohorts' },
    ],
    process: [
      { step: 'Discovery call', description: 'We understand your cohort needs and timeline' },
      { step: 'Platform setup', description: 'We configure your instance with your branding' },
      { step: 'Startup onboarding', description: 'We help onboard each startup to their dashboard' },
      { step: 'Cohort runs', description: '6 months of full platform access' },
      { step: 'Review & renew', description: 'Decide to run another cohort or upgrade' },
    ],
    faqs: [
      { question: 'What happens after the cohort ends?', answer: 'Startups can export their data. If you run another cohort, we can migrate relevant data to the new instance.' },
      { question: 'Can I add more than 15 startups?', answer: 'Yes, additional startups are £200 each for the cohort duration.' },
      { question: 'What are the startup fees?', answer: 'Each startup pays their monthly automation fee (£99-299/mo) directly, covering their AI agent and social media automation.' },
      { question: 'Can I upgrade mid-cohort?', answer: 'Yes, you can upgrade to Managed or License at any time. We\'ll credit your cohort payment toward the upgrade.' },
    ],
    ideal: 'Incubators testing the model or running multiple cohorts',
    cta: 'Start Your Cohort',
    nextPackage: 'managed',
    prevPackage: null,
  },
  'managed': {
    name: 'Managed Platform',
    price: '£10,000',
    unit: 'setup',
    monthly: '£1,000/mo',
    description: 'We host and maintain everything. You focus on your startups.',
    longDescription: 'The Managed Platform is our most popular option. You get a fully dedicated instance of the platform, hosted and maintained by us. We handle all updates, security patches, and infrastructure so you can focus entirely on running your incubator program.',
    includes: [
      { item: 'Dedicated instance', detail: 'Your own isolated platform environment' },
      { item: 'Hosted & maintained by us', detail: 'AWS/Vercel infrastructure, fully managed' },
      { item: 'All updates included', detail: 'New features and improvements automatically deployed' },
      { item: 'Priority support', detail: '4-hour response time, dedicated Slack channel' },
      { item: 'Custom branding', detail: 'Your logo, colors, domain, and email templates' },
      { item: '99.9% uptime SLA', detail: 'Guaranteed availability with credits for downtime' },
      { item: 'Monthly analytics reports', detail: 'Platform usage and startup progress reports' },
    ],
    process: [
      { step: 'Discovery & planning', description: 'We map your requirements and branding needs' },
      { step: 'Platform deployment', description: 'We spin up your dedicated instance (1-2 weeks)' },
      { step: 'Branding & customization', description: 'Apply your visual identity and configure settings' },
      { step: 'Training session', description: '2-hour walkthrough with your team' },
      { step: 'Go live', description: 'Launch to your startups with ongoing support' },
    ],
    faqs: [
      { question: 'What\'s included in the monthly fee?', answer: 'Hosting, maintenance, updates, security patches, backups, and priority support. Infrastructure costs are covered.' },
      { question: 'Can I customize the platform?', answer: 'Yes, branding is fully customizable. For feature customization, we can scope additional development work.' },
      { question: 'How many startups can I have?', answer: 'Unlimited startups. Each pays their automation fee directly.' },
      { question: 'What if I want to own the code later?', answer: 'You can upgrade to a Platform License at any time. We\'ll credit 6 months of managed fees toward the license.' },
    ],
    ideal: 'Incubators who want hands-off operations',
    cta: 'Get Started',
    nextPackage: 'license',
    prevPackage: 'cohort',
  },
  'license': {
    name: 'Platform License',
    price: '£25,000',
    unit: 'one-time',
    description: 'Own the entire platform outright. White-label ready, deploy anywhere.',
    longDescription: 'The Platform License gives you complete ownership of the entire codebase. Deploy it on your own infrastructure, customize it however you want, and run it independently. This is for incubators who want full control and the ability to modify the platform to their exact specifications.',
    includes: [
      { item: 'Full source code ownership', detail: 'Complete codebase with perpetual license' },
      { item: 'All 252 pages & 97 APIs', detail: 'Every feature, component, and endpoint' },
      { item: 'White-label ready', detail: 'No b0ase branding, fully rebrandable' },
      { item: '1 month setup & customization', detail: 'We help deploy and customize for your needs' },
      { item: 'Training session (2 hours)', detail: 'Technical walkthrough with your development team' },
      { item: 'Documentation', detail: 'Complete technical documentation and API reference' },
      { item: 'Deploy to your infrastructure', detail: 'AWS, Vercel, or any Node.js hosting' },
    ],
    process: [
      { step: 'License agreement', description: 'Sign the license and transfer terms' },
      { step: 'Code transfer', description: 'Full codebase delivered via private repository' },
      { step: 'Deployment support', description: 'We help deploy to your chosen infrastructure' },
      { step: 'Customization sprint', description: '1 month of customization to your specifications' },
      { step: 'Handover & training', description: 'Technical training and documentation review' },
    ],
    faqs: [
      { question: 'Do I need a development team?', answer: 'Yes, you\'ll need developers to maintain and customize the platform after handover. We can recommend partners if needed.' },
      { question: 'What\'s included in the 1-month customization?', answer: 'Branding, configuration, and reasonable feature modifications. Major new features are scoped separately.' },
      { question: 'Can I resell the platform?', answer: 'The license is for your organization\'s use. Resale requires a separate agreement.' },
      { question: 'What ongoing support is available?', answer: 'After handover, support is available at £150/hour or via a retainer agreement.' },
    ],
    ideal: 'Incubators who want full control and ownership',
    cta: 'Buy Platform',
    nextPackage: null,
    prevPackage: 'managed',
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
    title: `${pkg.name} - ${pkg.price} | Platform | b0ase.com`,
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

  return <PlatformPackagePage pkg={pkg} slug={slug} />;
}
