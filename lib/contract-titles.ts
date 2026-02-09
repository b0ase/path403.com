// Helper to create proper verb phrase for contracts
export function getContractTitle(service: string): string {
  const lower = service.toLowerCase();

  // Services that need specific verbs - comprehensive mapping
  const titleMap: Record<string, string> = {
    // Web Design & Development
    'landing page': 'Landing Page Design & Development',
    'additional page': 'Additional Website Page Development',
    '5-page website': '5-Page Website Design & Development',
    '10-page website': '10-Page Website Design & Development',
    'e-commerce store': 'Foundational E-Commerce Store Build',
    'custom web app': 'Custom Web Application Development',
    'website redesign': 'Complete Website Redesign',
    'mobile optimization': 'Mobile Responsiveness Optimization',
    'speed optimization': 'Website Performance & Speed Optimization',
    'accessibility audit': 'WCAG Accessibility Audit',

    // Branding & Design
    'logo design': 'Professional Logo Design',
    'logo redesign': 'Logo Redesign & Modernization',
    'brand guidelines': 'Brand Identity Guidelines & Style Guide',
    'business card design': 'Business Card Design',
    'social media kit': 'Social Media Asset Kit Design',
    'presentation design': 'Corporate Presentation Design',
    'icon set': 'Custom Icon Set Design',
    'illustration': 'Custom Illustration Services',
    'infographic': 'Infographic Design & Layout',
    'ui/ux mockups': 'UI/UX Interface Mockups',

    // Content & Copywriting
    'website copy': 'Website Copywriting',
    'blog article': 'SEO-Optimized Blog Article',
    'product description': 'Product Description Copywriting',
    'email sequence': 'Email Marketing Sequence',
    'newsletter': 'Newsletter Content Writing',
    'press release': 'Press Release Writing',
    'case study': 'Case Study Development',
    'whitepaper': 'Technical Whitepaper Writing',
    'script writing': 'Video Script Writing',
    'proofreading': 'Content Proofreading & Editing',

    // Video & Motion
    'promo video (30s)': '30-Second Promotional Video Production',
    'promo video (60s)': '60-Second Promotional Video Production',
    'social media clip': 'Social Media Video Clip Production',
    'motion graphics': 'Custom Motion Graphics',
    'logo animation': 'Logo Animation Services',
    'explainer video': 'Explainer Video Production',
    'video editing': 'Professional Video Editing',
    'color grading': 'Video Color Grading',
    'subtitles/captions': 'Subtitle & Caption Implementation',
    'thumbnail design': 'Video Thumbnail Design',

    // SEO & Marketing
    'seo audit': 'Comprehensive SEO Audit',
    'keyword research': 'SEO Keyword Research & Strategy',
    'on-page seo': 'On-Page SEO Optimization',
    'technical seo': 'Technical SEO Optimization',
    'monthly seo': 'Monthly SEO Management',
    'google ads setup': 'Google Ads Campaign Setup',
    'google ads management': 'Google Ads Campaign Management',
    'facebook ads setup': 'Facebook Ads Campaign Setup',
    'analytics setup': 'Analytics & Tracking Setup',
    'conversion tracking': 'Conversion Tracking Implementation',

    // Social Media
    'profile setup': 'Social Media Profile Setup',
    'content calendar': 'Social Media Content Calendar Strategy',
    'post design': 'Social Media Post Design',
    'story design': 'Social Media Story Design',
    'carousel post': 'Carousel Post Creation',
    'monthly management': 'Monthly Social Media Management',
    'community management': 'Online Community Management',
    'influencer outreach': 'Influencer Outreach Service',
    'social media audit': 'Social Media Performance Audit',
    'competitor analysis': 'Competitor Social Media Analysis',

    // AI & Automation
    'ai chatbot (basic)': 'Basic AI Chatbot Development',
    'ai chatbot (advanced)': 'Advanced AI Chatbot Development',
    'custom ai agent': 'Custom AI Agent Development',
    'workflow automation': 'Business Workflow Automation',
    'email automation': 'Email Marketing Automation Setup',
    'crm integration': 'CRM System Integration',
    'api integration': 'Third-Party API Integration',
    'data pipeline': 'Data Pipeline Architecture',
    'ai training/fine-tuning': 'AI Model Fine-Tuning Service',
    'ai consultation': 'Artificial Intelligence Consultation',

    // Blockchain & Crypto
    'token deployment (bsv)': 'BSV Token Deployment',
    'token deployment (evm)': 'EVM Token Deployment',
    'smart contract audit': 'Smart Contract Security Audit',
    'tokenomics design': 'Tokenomics Design & Strategy',
    'token website': 'Token Project Website Development',
    'wallet integration': 'Crypto Wallet Integration',
    'exchange listing support': 'Exchange Listing Support Services',
    'nft collection': 'NFT Collection Generation',
    'dapp development': 'Decentralized Application (DApp) Development',

    // KYC & Compliance
    'kyc integration setup': 'KYC Provider Integration Setup',
    'identity verification': 'Identity Verification Process Setup',
    'aml screening setup': 'AML Screening Workflow Setup',
    'aml monitoring': 'Ongoing AML Monitoring Service',
    'investor accreditation': 'Investor Accreditation Verification',
    'shareholder verification': 'Shareholder Verification Service',
    'boardroom kyc setup': 'Boardroom KYC/AML Configuration',
    'compliance dashboard': 'Compliance Dashboard Implementation',
    're-verification flow': 'User Re-Verification Workflow',
    'compliance consultation': 'Regulatory Compliance Consultation',

    // Cyber Security
    'penetration test (web)': 'Web Application Penetration Test',
    'penetration test (network)': 'Network Security Penetration Test',
    'vulnerability scan': 'Automated Vulnerability Scanning',
    'shannon agent monitoring': 'Shannon Agent Security Monitoring',
    'security consultation': 'Cybersecurity Consultation',
    'incident response retainer': 'Incident Response Retainer',

    // Support & Maintenance
    'website maintenance': 'Monthly Website Maintenance',
    'security updates': 'Security Patch Management',
    'backup management': 'Data Backup & Recovery Management',
    'bug fixes': 'Code Debugging & Fixes',
    'feature updates': 'Feature Update Implementation',
    'emergency support': 'Emergency Technical Support',
    'training session': 'Technical Training Session',
    'documentation': 'Technical Documentation Writing',
    'hosting setup': 'Server & Hosting Configuration',
    'domain management': 'Domain Name Management',

    // Consulting
    'strategy session': 'Strategic Planning Session',
    'technical consultation': 'Technical Architecture Consultation',
    'code review': 'Comprehensive Code Review',
    'architecture planning': 'System Architecture Planning',
    'startup advisory': 'Startup Technical Advisory',
    'product roadmap': 'Product Roadmap Development',
    'technology audit': 'Technology Stack Audit',
    'vendor selection': 'Vendor Selection & Evaluation',
    'team training': 'Development Team Training',
    'fractional cto': 'Fractional CTO Services',
  };

  // Check if we have a specific mapping
  if (titleMap[lower]) {
    return titleMap[lower];
  }

  // Capitalize words for fallback
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  return lower.split(' ').map(capitalize).join(' ');
}
