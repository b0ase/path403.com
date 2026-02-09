export type SubscriptionTier = {
    id: string;
    name: string;
    price: number;
    label: string;
    description: string;
    benefits: string[];
    popular?: boolean;
    color: string; // Tailwind color name (e.g. "purple", "blue")
};

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
    {
        id: 'founder',
        name: 'Founder',
        price: 1000,
        label: 'Architecture Class',
        description: 'For those who want to build the future. Full governance rights and maximum equity allocation.',
        benefits: [
            '10x Equity Allocation',
            'Direct Boardroom Access',
            'Architecture Voting Rights',
            'Private Founder Group'
        ],
        color: 'purple',
        popular: true
    },
    {
        id: 'copilot',
        name: 'Co-Pilot',
        price: 500,
        label: 'Engineering Class',
        description: 'Serious commitment to the codebase. Significant influence on technical direction.',
        benefits: [
            '5x Equity Allocation',
            'Technical Roadmap Access',
            'Priority Feature Requests',
            'Developer Discord Channel'
        ],
        color: 'blue'
    },
    {
        id: 'associate',
        name: 'Associate',
        price: 250,
        label: 'Management Class',
        description: 'Strategic involvement. Perfect for those who want to guide product market fit.',
        benefits: [
            '2.5x Equity Allocation',
            'Quarterly Strategy Calls',
            'Beta Access to All Apps',
            'Community Badge'
        ],
        color: 'green'
    },
    {
        id: 'contributor',
        name: 'Contributor',
        price: 100,
        label: 'Builder Class',
        description: 'Active participation. Help us test, refine, and grow the ecosystem.',
        benefits: [
            '1x Equity Allocation',
            'Early Access to Tools',
            'Contributor Recognition',
            'Voting on Minor Features'
        ],
        color: 'yellow'
    },
    {
        id: 'supporter',
        name: 'Supporter',
        price: 50,
        label: 'Believer Class',
        description: 'Show your support for the mission. Get a stake in the outcome.',
        benefits: [
            '0.5x Equity Allocation',
            'Supporter Badges',
            'Newsletter Shoutouts'
        ],
        color: 'pink'
    },
    {
        id: 'observer',
        name: 'Observer',
        price: 20,
        label: 'Watcher Class',
        description: 'Keep an eye on progress. A small stake to stay in the loop.',
        benefits: [
            '0.2x Equity Allocation',
            'Public Updates',
            'Discord Access'
        ],
        color: 'zinc'
    }
];
