export interface PricingItem {
    service: string;
    price: string;
    unit: string;
}

export interface PricingCategory {
    category: string;
    items: PricingItem[];
}

export const pricingCategories: PricingCategory[] = [
    {
        category: "Web Design & Development",
        items: [
            { service: "Landing page", price: "£180", unit: "one-time" },
            { service: "Additional page", price: "£80", unit: "per page" },
            { service: "5-page website", price: "£500", unit: "starting" },
            { service: "10-page website", price: "£900", unit: "starting" },
            { service: "E-commerce store", price: "£2,000", unit: "starting" },
            { service: "Custom web app", price: "£3,000", unit: "starting" },
            { service: "Website redesign", price: "£400", unit: "starting" },
            { service: "Mobile optimization", price: "£200", unit: "one-time" },
            { service: "Speed optimization", price: "£150", unit: "one-time" },
            { service: "Accessibility audit", price: "£200", unit: "one-time" },
        ],
    },
    {
        category: "Branding & Design",
        items: [
            { service: "Logo design", price: "£150", unit: "one-time" },
            { service: "Logo redesign", price: "£100", unit: "one-time" },
            { service: "Brand guidelines", price: "£300", unit: "one-time" },
            { service: "Business card design", price: "£50", unit: "one-time" },
            { service: "Social media kit", price: "£100", unit: "one-time" },
            { service: "Presentation design", price: "£150", unit: "per deck" },
            { service: "Icon set", price: "£200", unit: "up to 20" },
            { service: "Illustration", price: "£80", unit: "per piece" },
            { service: "Infographic", price: "£120", unit: "per piece" },
            { service: "UI/UX mockups", price: "£300", unit: "starting" },
        ],
    },
    {
        category: "Content & Copywriting",
        items: [
            { service: "Website copy", price: "£100", unit: "per page" },
            { service: "Blog article", price: "£80", unit: "per article" },
            { service: "Product description", price: "£15", unit: "per product" },
            { service: "Email sequence", price: "£200", unit: "5 emails" },
            { service: "Newsletter", price: "£50", unit: "per issue" },
            { service: "Press release", price: "£150", unit: "one-time" },
            { service: "Case study", price: "£200", unit: "per study" },
            { service: "Whitepaper", price: "£500", unit: "one-time" },
            { service: "Script writing", price: "£100", unit: "per minute" },
            { service: "Proofreading", price: "£30", unit: "per 1000 words" },
        ],
    },
    {
        category: "Video & Motion",
        items: [
            { service: "Promo video (30s)", price: "£200", unit: "one-time" },
            { service: "Promo video (60s)", price: "£300", unit: "one-time" },
            { service: "Social media clip", price: "£50", unit: "per clip" },
            { service: "Motion graphics", price: "£100", unit: "per scene" },
            { service: "Logo animation", price: "£80", unit: "one-time" },
            { service: "Explainer video", price: "£400", unit: "per minute" },
            { service: "Video editing", price: "£40", unit: "per hour" },
            { service: "Color grading", price: "£50", unit: "per video" },
            { service: "Subtitles/captions", price: "£30", unit: "per video" },
            { service: "Thumbnail design", price: "£25", unit: "per thumbnail" },
        ],
    },
    {
        category: "SEO & Marketing",
        items: [
            { service: "SEO audit", price: "£250", unit: "one-time" },
            { service: "Keyword research", price: "£100", unit: "one-time" },
            { service: "On-page SEO", price: "£80", unit: "per page" },
            { service: "Technical SEO", price: "£300", unit: "one-time" },
            { service: "Monthly SEO", price: "£300", unit: "per month" },
            { service: "Google Ads setup", price: "£200", unit: "one-time" },
            { service: "Google Ads management", price: "£150", unit: "per month" },
            { service: "Facebook Ads setup", price: "£150", unit: "one-time" },
            { service: "Analytics setup", price: "£100", unit: "one-time" },
            { service: "Conversion tracking", price: "£80", unit: "one-time" },
        ],
    },
    {
        category: "Social Media",
        items: [
            { service: "Profile setup", price: "£50", unit: "per platform" },
            { service: "Content calendar", price: "£100", unit: "per month" },
            { service: "Post design", price: "£20", unit: "per post" },
            { service: "Story design", price: "£15", unit: "per story" },
            { service: "Carousel post", price: "£40", unit: "per post" },
            { service: "Monthly management", price: "£300", unit: "per month" },
            { service: "Community management", price: "£200", unit: "per month" },
            { service: "Influencer outreach", price: "£150", unit: "per campaign" },
            { service: "Social media audit", price: "£150", unit: "one-time" },
            { service: "Competitor analysis", price: "£100", unit: "one-time" },
        ],
    },
    {
        category: "AI & Automation",
        items: [
            { service: "AI chatbot (basic)", price: "£500", unit: "one-time" },
            { service: "AI chatbot (advanced)", price: "£1,200", unit: "one-time" },
            { service: "Custom AI agent", price: "£800", unit: "starting" },
            { service: "Workflow automation", price: "£300", unit: "per workflow" },
            { service: "Email automation", price: "£200", unit: "one-time" },
            { service: "CRM integration", price: "£250", unit: "one-time" },
            { service: "API integration", price: "£200", unit: "per integration" },
            { service: "Data pipeline", price: "£400", unit: "one-time" },
            { service: "AI training/fine-tuning", price: "£500", unit: "starting" },
            { service: "AI consultation", price: "£100", unit: "per hour" },
        ],
    },
    {
        category: "Blockchain & Crypto",
        items: [
            { service: "Token deployment (BSV)", price: "£800", unit: "one-time" },
            { service: "Token deployment (EVM)", price: "£1,200", unit: "one-time" },
            { service: "Smart contract audit", price: "£500", unit: "starting" },
            { service: "Tokenomics design", price: "£300", unit: "one-time" },
            { service: "Whitepaper", price: "£500", unit: "one-time" },
            { service: "Token website", price: "£400", unit: "one-time" },
            { service: "Wallet integration", price: "£300", unit: "one-time" },
            { service: "Exchange listing support", price: "£500", unit: "one-time" },
            { service: "NFT collection", price: "£600", unit: "starting" },
            { service: "DApp development", price: "£2,000", unit: "starting" },
        ],
    },
    {
        category: "KYC & Compliance",
        items: [
            { service: "KYC integration setup", price: "£500", unit: "one-time" },
            { service: "Identity verification", price: "£2.50", unit: "per user" },
            { service: "AML screening setup", price: "£300", unit: "one-time" },
            { service: "AML monitoring", price: "£50", unit: "per month" },
            { service: "Investor accreditation", price: "£150", unit: "one-time" },
            { service: "Shareholder verification", price: "£200", unit: "one-time" },
            { service: "Boardroom KYC setup", price: "£300", unit: "one-time" },
            { service: "Compliance dashboard", price: "£100", unit: "per month" },
            { service: "Re-verification flow", price: "£100", unit: "one-time" },
            { service: "Compliance consultation", price: "£150", unit: "per hour" },
        ],
    },
    {
        category: "Cyber Security",
        items: [
            { service: "Penetration test (Web)", price: "£2,500", unit: "starting" },
            { service: "Penetration test (Network)", price: "£3,500", unit: "starting" },
            { service: "Smart Contract Audit", price: "£1,500", unit: "starting" },
            { service: "Vulnerability Scan", price: "£500", unit: "one-time" },
            { service: "Shannon Agent Monitoring", price: "£300", unit: "per month" },
            { service: "Security Consultation", price: "£200", unit: "per hour" },
            { service: "Incident Response Retainer", price: "£1,000", unit: "per month" },
        ]
    },
    {
        category: "Support & Maintenance",
        items: [
            { service: "Website maintenance", price: "£100", unit: "per month" },
            { service: "Security updates", price: "£50", unit: "per month" },
            { service: "Backup management", price: "£30", unit: "per month" },
            { service: "Bug fixes", price: "£50", unit: "per hour" },
            { service: "Feature updates", price: "£60", unit: "per hour" },
            { service: "Emergency support", price: "£100", unit: "per hour" },
            { service: "Training session", price: "£80", unit: "per hour" },
            { service: "Documentation", price: "£150", unit: "per project" },
            { service: "Hosting setup", price: "£100", unit: "one-time" },
            { service: "Domain management", price: "£30", unit: "per year" },
        ],
    },
    {
        category: "Consulting",
        items: [
            { service: "Strategy session", price: "£150", unit: "per hour" },
            { service: "Technical consultation", price: "£100", unit: "per hour" },
            { service: "Code review", price: "£200", unit: "per project" },
            { service: "Architecture planning", price: "£300", unit: "per project" },
            { service: "Startup advisory", price: "£500", unit: "per month" },
            { service: "Product roadmap", price: "£400", unit: "one-time" },
            { service: "Technology audit", price: "£300", unit: "one-time" },
            { service: "Vendor selection", price: "£200", unit: "one-time" },
            { service: "Team training", price: "£400", unit: "per day" },
            { service: "Fractional CTO", price: "£1,500", unit: "per month" },
        ],
    },
];

export const projectTypeToCategories: Record<string, string[]> = {
    // Digital
    "Website": ["Web Design & Development", "SEO & Marketing", "Support & Maintenance"],
    "Mobile App": ["Web Design & Development", "AI & Automation", "Consulting"],
    "E-Commerce Store": ["Web Design & Development", "SEO & Marketing", "Support & Maintenance"],
    "SaaS Platform": ["Web Design & Development", "Consulting", "Cyber Security", "AI & Automation"],
    "API Development": ["AI & Automation", "Consulting", "Cyber Security"],

    // Creative
    "Brand Design": ["Branding & Design"],
    "UI/UX": ["Branding & Design"],
    "Video": ["Video & Motion"],
    "Motion Graphics": ["Video & Motion", "Branding & Design"],
    "3D Design": ["Video & Motion", "Branding & Design"],

    // Innovation
    "AI/ML": ["AI & Automation", "Consulting"],
    "Blockchain": ["Blockchain & Crypto", "Consulting", "Cyber Security"],
    "Web3": ["Blockchain & Crypto", "Consulting", "Branding & Design"],

    // Growth
    "Marketing": ["SEO & Marketing", "Social Media", "Content & Copywriting"],
    "Social Media": ["Social Media", "Video & Motion", "Content & Copywriting"],
    "SEO": ["SEO & Marketing", "Content & Copywriting"],
    "Content": ["Content & Copywriting", "Social Media"],
    "Email Marketing": ["Content & Copywriting", "AI & Automation"],

    // Support
    "Consulting": ["Consulting"],
    "DevOps": ["Consulting", "Support & Maintenance", "Cyber Security"],

    // Specialized Apps
    "Progressive Web App": ["Web Design & Development", "Support & Maintenance"],
    "Native Mobile App": ["Web Design & Development", "Consulting"],
    "Cross-Platform App": ["Web Design & Development", "Consulting"],
    "Marketplace Platform": ["Web Design & Development", "SEO & Marketing", "Consulting"],
    "Subscription Platform": ["Web Design & Development", "AI & Automation", "Consulting"],
    "Custom CMS": ["Web Design & Development", "AI & Automation"],
    "Database Design": ["Consulting", "AI & Automation"],
    "System Integration": ["AI & Automation", "Consulting"],
    "Legacy System Modernization": ["Consulting", "Web Design & Development"],

    // Creative Advanced
    "Design System": ["Branding & Design", "Web Design & Development"],
    "Interactive Design": ["Branding & Design", "Video & Motion"],
    "Animation": ["Video & Motion"],
    "Illustration": ["Branding & Design"],
    "Logo Design": ["Branding & Design"],
    "Typography": ["Branding & Design"],
    "Icon Design": ["Branding & Design"],
    "Print Design": ["Branding & Design"],
    "Packaging Design": ["Branding & Design"],
    "Environmental Design": ["Branding & Design"],

    // Innovation Advanced
    "Machine Learning": ["AI & Automation"],
    "Natural Language Processing": ["AI & Automation"],
    "Computer Vision": ["AI & Automation"],
    "Smart Contracts": ["Blockchain & Crypto", "Cyber Security"],
    "DeFi": ["Blockchain & Crypto", "Cyber Security", "Consulting"],
    "NFT Platform": ["Blockchain & Crypto", "Branding & Design", "Web Design & Development"],
    "DAO Tools": ["Blockchain & Crypto", "Consulting"],
    "Data Science": ["AI & Automation", "Consulting"],
    "Predictive Analytics": ["AI & Automation"],
    "IoT Platform": ["Consulting", "AI & Automation"],

    // Growth Advanced
    "Growth Strategy": ["Consulting", "SEO & Marketing"],
    "Content Strategy": ["Consulting", "Content & Copywriting"],
    "Influencer Marketing": ["Social Media"],
    "PPC Advertising": ["SEO & Marketing"],
    "Marketing Automation": ["AI & Automation", "SEO & Marketing"],
    "Lead Generation": ["SEO & Marketing", "Content & Copywriting"],
    "Conversion Optimization": ["SEO & Marketing", "Web Design & Development"],
    "Analytics Setup": ["SEO & Marketing"],
    "Performance Marketing": ["SEO & Marketing"],

    // Additional
    "Security Audit": ["Cyber Security"],
    "Cloud Architecture": ["Consulting"],
    "Infrastructure Setup": ["Consulting"],
    "CI/CD Pipeline": ["Consulting"],
    "Technical Documentation": ["Support & Maintenance"],
    "Team Training": ["Consulting"],
    "Project Management": ["Consulting"],
};
