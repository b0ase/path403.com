// Shared accessors for dashboard template data. These try to read the live
// arrays exposed by the app (assigned to window.__templates in page.tsx).
// They fall back to small stubs in dev if not present.

export type TemplateItem = { 
  id?: string; 
  name: string; 
  description?: string; 
  icon?: string; 
  country?: string; 
  type?: string; 
  code?: string; 
  size?: string; 
  category?: string;
  status?: string;
  features?: string[];
  lastSync?: string;
  defaultDuration?: number;
  supportedChains?: string[];
}

type TemplateBag = {
  organizationTemplates?: TemplateItem[]
  roleTemplates?: TemplateItem[]
  agentTemplates?: TemplateItem[]
  instrumentTemplates?: TemplateItem[]
  contractTemplates?: TemplateItem[]
  integrationTemplates?: TemplateItem[]
  contactTemplates?: TemplateItem[]
  cryptoTemplates?: TemplateItem[]
  walletTemplates?: TemplateItem[]
}

function readBag(): TemplateBag | null {
  if (typeof window === 'undefined') return null
  const bag = (window as any).__templates as TemplateBag | undefined
  if (bag) return bag
  try {
    const raw = localStorage.getItem('__templates')
    return raw ? (JSON.parse(raw) as TemplateBag) : null
  } catch {
    return null
  }
}

const stubs = {
  organizationTemplates: [
    // Corporations
    { id: 'tech-corp', name: 'Technology Corporation', description: 'Software development and technology services company', icon: '🏢', country: 'US', type: 'CORPORATION', code: 'TECH', size: 'medium', category: 'Technology' },
    { id: 'manu-corp', name: 'Manufacturing Corp', description: 'Industrial manufacturing and production company', icon: '🏭', country: 'US', type: 'CORPORATION', code: 'MANU', size: 'large', category: 'Manufacturing' },
    { id: 'fins-corp', name: 'Financial Services Inc', description: 'Banking and financial services corporation', icon: '🏦', country: 'US', type: 'CORPORATION', code: 'FINS', size: 'enterprise', category: 'Financial Services' },
    { id: 'hlth-corp', name: 'Healthcare Systems Corp', description: 'Healthcare services and medical technology', icon: '🏥', country: 'US', type: 'CORPORATION', code: 'HLTH', size: 'large', category: 'Healthcare' },
    
    // LLCs
    { id: 'crtv-llc', name: 'Creative Studio LLC', description: 'Creative design and marketing agency', icon: '🎨', country: 'US', type: 'LLC', code: 'CRTV', size: 'small', category: 'Creative Services' },
    { id: 'real-llc', name: 'Real Estate Holdings LLC', description: 'Property investment and management company', icon: '🏠', country: 'US', type: 'LLC', code: 'REAL', size: 'medium', category: 'Real Estate' },
    { id: 'cons-llc', name: 'Consulting Group LLC', description: 'Business strategy and management consulting', icon: '💼', country: 'US', type: 'LLC', code: 'CONS', size: 'small', category: 'Consulting' },
    { id: 'food-llc', name: 'Food & Beverage LLC', description: 'Restaurant and food service operations', icon: '🍽️', country: 'US', type: 'LLC', code: 'FOOD', size: 'medium', category: 'Food & Beverage' },
    
    // UK Corporations
    { id: 'inno-ltd', name: 'Innovation Labs Ltd', description: 'R&D and innovation services company', icon: '🔬', country: 'UK', type: 'CORPORATION', code: 'INNO', size: 'medium', category: 'Research & Development' },
    { id: 'digi-ltd', name: 'Digital Marketing Ltd', description: 'Digital marketing and advertising agency', icon: '📱', country: 'UK', type: 'CORPORATION', code: 'DIGI', size: 'small', category: 'Marketing' },
    { id: 'logi-ltd', name: 'Logistics Solutions Ltd', description: 'Supply chain and logistics management', icon: '🚛', country: 'UK', type: 'CORPORATION', code: 'LOGI', size: 'large', category: 'Logistics' },
    { id: 'gren-ltd', name: 'Green Energy Ltd', description: 'Renewable energy solutions provider', icon: '🌱', country: 'UK', type: 'CORPORATION', code: 'GREN', size: 'medium', category: 'Energy' },
    
    // Nonprofits
    { id: 'educ-np', name: 'Education Foundation', description: 'Educational programs and scholarship foundation', icon: '📚', country: 'US', type: 'NONPROFIT', code: 'EDUC', size: 'medium', category: 'Education' },
    { id: 'envr-np', name: 'Environmental Alliance', description: 'Environmental conservation and advocacy organization', icon: '🌍', country: 'US', type: 'NONPROFIT', code: 'ENVR', size: 'large', category: 'Environmental' },
    { id: 'comm-np', name: 'Community Health Network', description: 'Community healthcare services and clinics', icon: '🏥', country: 'US', type: 'NONPROFIT', code: 'COMM', size: 'large', category: 'Healthcare' },
    { id: 'arts-np', name: 'Arts & Culture Society', description: 'Arts education and cultural preservation', icon: '🎭', country: 'US', type: 'NONPROFIT', code: 'ARTS', size: 'medium', category: 'Arts & Culture' },
    
    // Charities
    { id: 'chld-ch', name: 'Children\'s Welfare Charity', description: 'Child welfare and family support services', icon: '👶', country: 'UK', type: 'CHARITY', code: 'CHLD', size: 'large', category: 'Social Services' },
    { id: 'food-ch', name: 'Food Bank Network', description: 'Food distribution and hunger relief', icon: '🍞', country: 'US', type: 'CHARITY', code: 'FOOD', size: 'medium', category: 'Social Services' },
    { id: 'anim-ch', name: 'Animal Rescue Foundation', description: 'Animal rescue and rehabilitation services', icon: '🐕', country: 'CA', type: 'CHARITY', code: 'ANIM', size: 'medium', category: 'Animal Welfare' },
    { id: 'emer-ch', name: 'Disaster Relief Fund', description: 'Emergency response and disaster relief', icon: '🚨', country: 'US', type: 'CHARITY', code: 'EMER', size: 'large', category: 'Emergency Services' },
    
    // Sole Proprietorships
    { id: 'cafe-sp', name: 'Local Coffee Shop', description: 'Neighborhood coffee shop and bakery', icon: '☕', country: 'US', type: 'SOLE_PROPRIETORSHIP', code: 'CAFE', size: 'startup', category: 'Food & Beverage' },
    { id: 'crft-sp', name: 'Handcraft Store', description: 'Handmade crafts and artisan goods', icon: '🧶', country: 'US', type: 'SOLE_PROPRIETORSHIP', code: 'CRFT', size: 'startup', category: 'Retail' },
    { id: 'auto-sp', name: 'Auto Repair Shop', description: 'Automotive repair and maintenance services', icon: '🔧', country: 'US', type: 'LLC', code: 'AUTO', size: 'small', category: 'Automotive' },
    { id: 'fit-sp', name: 'Fitness Studio', description: 'Personal training and fitness classes', icon: '💪', country: 'US', type: 'LLC', code: 'FIT', size: 'small', category: 'Health & Fitness' },
    
    // Partnerships
    { id: 'law-part', name: 'Legal Partnership', description: 'Law firm partnership specializing in corporate law', icon: '⚖️', country: 'US', type: 'PARTNERSHIP', code: 'LAW', size: 'medium', category: 'Legal Services' },
    { id: 'med-part', name: 'Medical Practice', description: 'Multi-physician medical practice', icon: '👩‍⚕️', country: 'US', type: 'PARTNERSHIP', code: 'MED', size: 'medium', category: 'Healthcare' },
    { id: 'cpa-part', name: 'Accounting Firm', description: 'CPA firm providing accounting services', icon: '📊', country: 'US', type: 'PARTNERSHIP', code: 'CPA', size: 'medium', category: 'Professional Services' },
    { id: 'arch-part', name: 'Architecture Studio', description: 'Architectural design and planning services', icon: '🏗️', country: 'US', type: 'PARTNERSHIP', code: 'ARCH', size: 'small', category: 'Architecture' },
    
    // Cooperatives
    { id: 'farm-coop', name: 'Farmers Cooperative', description: 'Agricultural cooperative for local farmers', icon: '🚜', country: 'US', type: 'COOPERATIVE', code: 'FARM', size: 'large', category: 'Agriculture' },
    { id: 'work-coop', name: 'Workers Cooperative', description: 'Worker-owned manufacturing cooperative', icon: '👷', country: 'US', type: 'COOPERATIVE', code: 'WORK', size: 'medium', category: 'Manufacturing' },
    { id: 'home-coop', name: 'Housing Cooperative', description: 'Residential housing cooperative', icon: '🏘️', country: 'US', type: 'COOPERATIVE', code: 'HOME', size: 'large', category: 'Real Estate' },
    { id: 'cred-coop', name: 'Credit Union', description: 'Member-owned financial cooperative', icon: '🏛️', country: 'US', type: 'COOPERATIVE', code: 'CRED', size: 'large', category: 'Financial Services' },
    
    // International
    { id: 'trad-au', name: 'Global Trading Pty Ltd', description: 'International trade and export company', icon: '🌏', country: 'AU', type: 'CORPORATION', code: 'TRAD', size: 'large', category: 'Import/Export' },
    { id: 'euro-de', name: 'European Consulting GmbH', description: 'Management consulting across Europe', icon: '🇪🇺', country: 'DE', type: 'CORPORATION', code: 'EURO', size: 'medium', category: 'Consulting' },
    { id: 'asia-sg', name: 'Asian Holdings Pte Ltd', description: 'Investment holding company in Asia', icon: '🏙️', country: 'SG', type: 'CORPORATION', code: 'ASIA', size: 'large', category: 'Investment' },
    { id: 'frin-fr', name: 'French Innovation SARL', description: 'French technology innovation company', icon: '🇫🇷', country: 'FR', type: 'CORPORATION', code: 'FRIN', size: 'medium', category: 'Technology' },
  ],
  roleTemplates: [
    // C-Suite (Executive Leadership)
    { id: 'ceo', name: 'CEO', description: 'Chief Executive Officer - Strategic leadership and decision making', icon: '👑', category: 'C-Suite', shareAllocation: 25, permissions: ['admin', 'finance', 'operations'], type: 'executive' },
    { id: 'cfo', name: 'CFO', description: 'Chief Financial Officer - Financial planning, analysis, and strategic financial management', icon: '💰', category: 'C-Suite', shareAllocation: 22, permissions: ['admin', 'finance', 'data-analysis'], type: 'executive' },
    { id: 'cto', name: 'CTO', description: 'Chief Technology Officer - Technology strategy, architecture, and innovation leadership', icon: '⚙️', category: 'C-Suite', shareAllocation: 20, permissions: ['admin', 'tech', 'workflow-creation'], type: 'executive' },
    { id: 'coo', name: 'COO', description: 'Chief Operating Officer - Operations management, process optimization, and execution', icon: '🔧', category: 'C-Suite', shareAllocation: 20, permissions: ['admin', 'operations', 'workflow-creation'], type: 'executive' },
    { id: 'cmo', name: 'CMO', description: 'Chief Marketing Officer - Marketing strategy, brand management, and growth initiatives', icon: '📊', category: 'C-Suite', shareAllocation: 18, permissions: ['admin', 'marketing', 'data-analysis'], type: 'executive' },
    { id: 'chro', name: 'CHRO', description: 'Chief Human Resources Officer - People strategy, culture, and organizational development', icon: '👥', category: 'C-Suite', shareAllocation: 12, permissions: ['admin', 'operations'], type: 'executive' },
    { id: 'general-counsel', name: 'General Counsel', description: 'Chief Legal Officer - Legal strategy, compliance, risk management, and corporate governance', icon: '⚖️', category: 'C-Suite', shareAllocation: 14, permissions: ['admin', 'legal'], type: 'executive' },
    
    // Vice Presidents (Senior Leadership)
    { id: 'vp-engineering', name: 'VP of Engineering', description: 'Vice President of Engineering - Engineering leadership, technical delivery, and team management', icon: '🔬', category: 'Vice President', shareAllocation: 18, permissions: ['tech', 'workflow-creation', 'operations'], type: 'senior-leadership' },
    { id: 'vp-sales', name: 'VP of Sales', description: 'Vice President of Sales - Sales strategy, team leadership, and revenue generation', icon: '💼', category: 'Vice President', shareAllocation: 16, permissions: ['marketing', 'data-analysis'], type: 'senior-leadership' },
    { id: 'vp-product', name: 'VP of Product', description: 'Vice President of Product - Product strategy, roadmap, and user experience leadership', icon: '🎯', category: 'Vice President', shareAllocation: 15, permissions: ['workflow-creation', 'data-analysis', 'marketing'], type: 'senior-leadership' },
    
    // Department Heads (Senior Management)
    { id: 'head-of-data', name: 'Head of Data', description: 'Chief Data Officer - Data strategy, analytics, and business intelligence leadership', icon: '📈', category: 'Department Head', shareAllocation: 13, permissions: ['data-analysis', 'tech', 'workflow-creation'], type: 'senior-management' },
    { id: 'head-of-security', name: 'Head of Security', description: 'Chief Security Officer - Information security, risk assessment, and cybersecurity strategy', icon: '🔒', category: 'Department Head', shareAllocation: 11, permissions: ['tech', 'admin', 'operations'], type: 'senior-management' },
    { id: 'head-of-customer-success', name: 'Head of Customer Success', description: 'Customer Success Leadership - Customer retention, satisfaction, and growth strategies', icon: '🎧', category: 'Department Head', shareAllocation: 10, permissions: ['marketing', 'data-analysis', 'operations'], type: 'senior-management' },
    
    // Senior Managers (Middle Management)
    { id: 'tech-lead', name: 'Tech Lead', description: 'Code review, technical documentation, and development workflows', icon: '💻', category: 'Senior Manager', shareAllocation: 25, permissions: ['tech', 'workflow-creation'], type: 'middle-management' },
    { id: 'finance-manager', name: 'Finance Manager', description: 'Financial analysis, budget tracking, and reporting', icon: '📊', category: 'Senior Manager', shareAllocation: 20, permissions: ['finance', 'admin', 'data-analysis'], type: 'middle-management' },
    { id: 'operations-manager', name: 'Operations Manager', description: 'Process management, workflow optimization, and operational efficiency', icon: '⚙️', category: 'Senior Manager', shareAllocation: 12, permissions: ['operations', 'workflow-creation'], type: 'middle-management' },
    { id: 'legal-counsel', name: 'Legal Counsel', description: 'Contract analysis, compliance monitoring, and legal documentation', icon: '⚖️', category: 'Senior Manager', shareAllocation: 18, permissions: ['legal', 'admin', 'data-analysis'], type: 'middle-management' },
    { id: 'creative-director', name: 'Creative Director', description: 'Content creation, brand management, and creative strategy', icon: '🎨', category: 'Senior Manager', shareAllocation: 15, permissions: ['marketing', 'workflow-creation'], type: 'middle-management' },
    
    // Managers (Operational Management)
    { id: 'marketing-manager', name: 'Marketing Manager', description: 'Marketing campaigns, social media management, and customer engagement', icon: '📱', category: 'Manager', shareAllocation: 15, permissions: ['marketing', 'data-analysis'], type: 'management' },
    { id: 'customer-success-manager', name: 'Customer Success Manager', description: 'Customer support, relationship management, and satisfaction monitoring', icon: '🎧', category: 'Manager', shareAllocation: 10, permissions: ['marketing', 'data-analysis'], type: 'management' },
    { id: 'project-manager', name: 'Project Manager', description: 'Project coordination, timeline management, and cross-functional collaboration', icon: '📋', category: 'Manager', shareAllocation: 8, permissions: ['workflow-creation', 'operations'], type: 'management' },
    { id: 'product-manager', name: 'Product Manager', description: 'Product development, feature prioritization, and user research', icon: '🎯', category: 'Manager', shareAllocation: 12, permissions: ['workflow-creation', 'data-analysis', 'marketing'], type: 'management' },
    { id: 'sales-manager', name: 'Sales Manager', description: 'Sales team leadership, pipeline management, and revenue optimization', icon: '💼', category: 'Manager', shareAllocation: 14, permissions: ['marketing', 'data-analysis'], type: 'management' },
    { id: 'hr-manager', name: 'HR Manager', description: 'Recruitment, employee relations, and performance management', icon: '👥', category: 'Manager', shareAllocation: 8, permissions: ['operations', 'admin'], type: 'management' },
    { id: 'it-manager', name: 'IT Manager', description: 'Infrastructure management, system administration, and technical support', icon: '🖥️', category: 'Manager', shareAllocation: 10, permissions: ['tech', 'operations'], type: 'management' },
    { id: 'quality-manager', name: 'Quality Manager', description: 'Quality assurance, testing protocols, and process improvement', icon: '✅', category: 'Manager', shareAllocation: 7, permissions: ['operations', 'workflow-creation'], type: 'management' },
    
    // Senior Specialists (Subject Matter Experts)
    { id: 'senior-developer', name: 'Senior Developer', description: 'Advanced software development, architecture design, and mentoring', icon: '👨‍💻', category: 'Senior Specialist', shareAllocation: 12, permissions: ['tech', 'workflow-creation'], type: 'specialist' },
    { id: 'senior-designer', name: 'Senior Designer', description: 'UI/UX design, design systems, and creative leadership', icon: '🎨', category: 'Senior Specialist', shareAllocation: 10, permissions: ['workflow-creation', 'marketing'], type: 'specialist' },
    { id: 'senior-analyst', name: 'Senior Analyst', description: 'Data analysis, business intelligence, and strategic insights', icon: '📊', category: 'Senior Specialist', shareAllocation: 9, permissions: ['data-analysis', 'finance'], type: 'specialist' },
    { id: 'senior-consultant', name: 'Senior Consultant', description: 'Strategic consulting, process optimization, and business transformation', icon: '💡', category: 'Senior Specialist', shareAllocation: 11, permissions: ['workflow-creation', 'operations'], type: 'specialist' },
    
    // Team Leads (Team Leadership)
    { id: 'dev-team-lead', name: 'Development Team Lead', description: 'Development team coordination, code reviews, and technical guidance', icon: '👨‍💻', category: 'Team Lead', shareAllocation: 8, permissions: ['tech', 'workflow-creation'], type: 'team-lead' },
    { id: 'design-team-lead', name: 'Design Team Lead', description: 'Design team coordination, creative direction, and design standards', icon: '🎨', category: 'Team Lead', shareAllocation: 7, permissions: ['workflow-creation', 'marketing'], type: 'team-lead' },
    { id: 'qa-team-lead', name: 'QA Team Lead', description: 'Quality assurance team leadership, testing strategies, and quality standards', icon: '🔍', category: 'Team Lead', shareAllocation: 6, permissions: ['operations', 'workflow-creation'], type: 'team-lead' },
    { id: 'sales-team-lead', name: 'Sales Team Lead', description: 'Sales team coordination, performance tracking, and client relationships', icon: '📈', category: 'Team Lead', shareAllocation: 9, permissions: ['marketing', 'data-analysis'], type: 'team-lead' },
    
    // TechCorp Inc. Team Members
    { id: 'alice-johnson', name: 'Alice Johnson', description: 'Senior Developer at TechCorp Inc. - Full-stack development and system architecture', icon: '👩‍💻', category: 'Team Member', shareAllocation: 5, permissions: ['tech', 'workflow-creation'], type: 'specialist', handcashHandle: '$alice_dev', email: 'alice@techcorp.com', wallet: 'HandCash', organization: 'TechCorp Inc.', status: '✓' },
    { id: 'bob-smith', name: 'Bob Smith', description: 'Product Manager at TechCorp Inc. - Product strategy and user experience', icon: '👨‍💼', category: 'Team Member', shareAllocation: 4, permissions: ['workflow-creation', 'data-analysis', 'marketing'], type: 'specialist', handcashHandle: '$bob_tech', email: 'bob@techcorp.com', wallet: 'Phantom', organization: 'TechCorp Inc.', status: '⏳' },
    { id: 'sarah-wilson', name: 'Sarah Wilson', description: 'Marketing Director at TechCorp Inc. - Brand strategy and growth marketing', icon: '👩‍💼', category: 'Team Member', shareAllocation: 6, permissions: ['marketing', 'data-analysis'], type: 'specialist', handcashHandle: '$sarah_marketing', email: 'sarah@techcorp.com', wallet: 'MetaMask', organization: 'TechCorp Inc.', status: '✓' },
    { id: 'mike-chen', name: 'Mike Chen', description: 'Financial Analyst at TechCorp Inc. - Financial planning and analysis', icon: '👨‍💼', category: 'Team Member', shareAllocation: 3, permissions: ['finance', 'data-analysis'], type: 'specialist', handcashHandle: '$mike_finance', email: 'mike@techcorp.com', wallet: 'HandCash', organization: 'TechCorp Inc.', status: '✗' },
    { id: 'emma-davis', name: 'Emma Davis', description: 'UX Designer at TechCorp Inc. - User experience and interface design', icon: '👩‍🎨', category: 'Team Member', shareAllocation: 4, permissions: ['workflow-creation', 'marketing'], type: 'specialist', handcashHandle: '$emma_design', email: 'emma@techcorp.com', wallet: 'Bitcoin', organization: 'TechCorp Inc.', status: '✓' },
    { id: 'david-wilson', name: 'David Wilson', description: 'Operations Manager at TechCorp Inc. - Process optimization and team coordination', icon: '👨‍💼', category: 'Team Member', shareAllocation: 5, permissions: ['operations', 'workflow-creation'], type: 'specialist', handcashHandle: '$david_ops', email: 'david@techcorp.com', wallet: 'Ethereum', organization: 'TechCorp Inc.', status: '⏳' },
    
    // Specialists (Individual Contributors)
    { id: 'business-analyst', name: 'Business Analyst', description: 'Requirements analysis, process documentation, and stakeholder communication', icon: '📋', category: 'Specialist', shareAllocation: 5, permissions: ['data-analysis', 'workflow-creation'], type: 'individual-contributor' },
    { id: 'data-scientist', name: 'Data Scientist', description: 'Statistical analysis, machine learning, and predictive modeling', icon: '🔬', category: 'Specialist', shareAllocation: 8, permissions: ['data-analysis', 'tech'], type: 'individual-contributor' },
    { id: 'security-specialist', name: 'Security Specialist', description: 'Cybersecurity implementation, threat analysis, and security protocols', icon: '🔐', category: 'Specialist', shareAllocation: 6, permissions: ['tech', 'operations'], type: 'individual-contributor' },
    { id: 'compliance-officer', name: 'Compliance Officer', description: 'Regulatory compliance, policy development, and risk assessment', icon: '📜', category: 'Specialist', shareAllocation: 5, permissions: ['legal', 'admin'], type: 'individual-contributor' },
    { id: 'content-strategist', name: 'Content Strategist', description: 'Content planning, editorial calendar, and brand messaging', icon: '✍️', category: 'Specialist', shareAllocation: 4, permissions: ['marketing', 'workflow-creation'], type: 'individual-contributor' },
  ],
  agentTemplates: [
    { id: 'marketing-ai', name: 'Marketing AI Agent', description: 'Automated social media posting, content creation, and campaign optimization', icon: '📱', status: 'Active', permissions: ['marketing', 'data-analysis'], shareAllocation: 8, type: 'ai-agent' },
    { id: 'trading-bot', name: 'Trading Bot', description: 'Automated trading strategies, market analysis, and portfolio management', icon: '🤖', status: 'Active', permissions: ['finance', 'data-analysis'], shareAllocation: 12, type: 'ai-agent' },
    { id: 'customer-service-ai', name: 'Customer Service AI', description: 'Automated customer support, ticket routing, and response generation', icon: '🎧', status: 'Active', permissions: ['marketing', 'operations'], shareAllocation: 6, type: 'ai-agent' },
    { id: 'content-generator-ai', name: 'Content Generator AI', description: 'Automated blog posts, product descriptions, and marketing copy creation', icon: '✍️', status: 'Active', permissions: ['marketing', 'workflow-creation'], shareAllocation: 7, type: 'ai-agent' },
    { id: 'data-analysis-ai', name: 'Data Analysis AI', description: 'Automated data processing, insights generation, and report creation', icon: '📊', status: 'Active', permissions: ['data-analysis', 'finance'], shareAllocation: 9, type: 'ai-agent' },
    { id: 'seo-optimization-ai', name: 'SEO Optimization AI', description: 'Automated keyword research, content optimization, and ranking monitoring', icon: '🔍', status: 'Active', permissions: ['marketing', 'data-analysis'], shareAllocation: 5, type: 'ai-agent' },
    { id: 'lead-generation-ai', name: 'Lead Generation AI', description: 'Automated prospect identification, outreach, and lead qualification', icon: '🎯', status: 'Active', permissions: ['marketing', 'operations'], shareAllocation: 8, type: 'ai-agent' },
    { id: 'inventory-management-ai', name: 'Inventory Management AI', description: 'Automated stock monitoring, reorder alerts, and demand forecasting', icon: '📦', status: 'Active', permissions: ['operations', 'data-analysis'], shareAllocation: 6, type: 'ai-agent' },
    { id: 'financial-advisor-ai', name: 'Financial Advisor AI', description: 'Automated budget analysis, expense tracking, and financial recommendations', icon: '💼', status: 'Active', permissions: ['finance', 'data-analysis'], shareAllocation: 10, type: 'ai-agent' },
    { id: 'quality-assurance-ai', name: 'Quality Assurance AI', description: 'Automated testing, bug detection, and quality monitoring', icon: '🔧', status: 'Active', permissions: ['tech', 'operations'], shareAllocation: 7, type: 'ai-agent' },
    { id: 'hr-recruitment-ai', name: 'HR Recruitment AI', description: 'Automated resume screening, candidate matching, and interview scheduling', icon: '👥', status: 'Active', permissions: ['operations', 'data-analysis'], shareAllocation: 6, type: 'ai-agent' },
    { id: 'competitive-analysis-ai', name: 'Competitive Analysis AI', description: 'Automated competitor monitoring, price tracking, and market intelligence', icon: '🕵️', status: 'Active', permissions: ['marketing', 'data-analysis'], shareAllocation: 5, type: 'ai-agent' },
    { id: 'social-media-ai-manager', name: 'Social Media AI Manager', description: 'Automated posting, engagement monitoring, and community management', icon: '📲', status: 'Active', permissions: ['marketing', 'workflow-creation'], shareAllocation: 7, type: 'ai-agent' },
    { id: 'email-marketing-ai', name: 'Email Marketing AI', description: 'Automated email campaigns, personalization, and performance optimization', icon: '📧', status: 'Active', permissions: ['marketing', 'data-analysis'], shareAllocation: 6, type: 'ai-agent' },
    { id: 'fraud-detection-ai', name: 'Fraud Detection AI', description: 'Automated transaction monitoring, anomaly detection, and risk assessment', icon: '🛡️', status: 'Active', permissions: ['finance', 'data-analysis'], shareAllocation: 8, type: 'ai-agent' },
  ],
  instrumentTemplates: [
    { name: 'Common Stock', description: 'equity • Equity — Supply: 1,000,000', icon: '📈' },
    { name: 'Preferred Shares', description: 'equity • Equity — Supply: 100,000', icon: '⭐' },
    { name: 'Employee Stock Options', description: 'equity • Equity — Supply: 50,000', icon: '👥' },
    { name: 'Startup Equity', description: 'equity • Equity — Supply: 10,000,000', icon: '🚀' },
    { name: 'Corporate Bond', description: 'debt • Debt — Supply: 1,000', icon: '🏛️' },
    { name: 'Convertible Note', description: 'debt • Debt — Supply: 500', icon: '🔄' },
    { name: 'Revenue Bond', description: 'debt • Debt — Supply: 2,000', icon: '💰' },
    { name: 'Green Bond', description: 'debt • Debt — Supply: 1,500', icon: '🌱' },
    { name: 'Platform Utility Token', description: 'utility • Utility — Supply: 100,000,000', icon: '🔧' },
    { name: 'Gaming Token', description: 'utility • Utility — Supply: 1,000,000,000', icon: '🎮' },
    { name: 'Loyalty Points', description: 'utility • Utility — Supply: 50,000,000', icon: '🎁' },
    { name: 'Access Token', description: 'utility • Utility — Supply: 10,000,000', icon: '🔑' },
    { name: 'DAO Governance Token', description: 'governance • Governance — Supply: 21,000,000', icon: '🗳️' },
    { name: 'Protocol Governance', description: 'governance • Governance — Supply: 100,000,000', icon: '⚖️' },
    { name: 'Community Token', description: 'governance • Governance — Supply: 1,000,000', icon: '🏛️' },
    { name: 'Voting Rights', description: 'governance • Governance — Supply: 500,000', icon: '✅' },
    { name: 'Cashback Rewards', description: 'reward • Reward — Supply: 100,000,000', icon: '💸' },
    { name: 'Staking Rewards', description: 'reward • Reward — Supply: 50,000,000', icon: '📊' },
    { name: 'Achievement Points', description: 'reward • Reward — Supply: 10,000,000', icon: '🏆' },
    { name: 'Referral Bonus', description: 'reward • Reward — Supply: 25,000,000', icon: '🤝' },
    { name: 'Stock Option', description: 'derivative • Derivative — Supply: 100,000', icon: '📋' },
    { name: 'Futures Contract', description: 'derivative • Derivative — Supply: 10,000', icon: '⏰' },
    { name: 'Warrant', description: 'derivative • Derivative — Supply: 50,000', icon: '🎫' },
    { name: 'Swap Contract', description: 'derivative • Derivative — Supply: 1,000', icon: '🔄' },
    { name: 'Convertible Preferred', description: 'hybrid • Hybrid — Supply: 75,000', icon: '🔀' },
    { name: 'Equity-Linked Note', description: 'hybrid • Hybrid — Supply: 5,000', icon: '🔗' },
    { name: 'Mezzanine Financing', description: 'hybrid • Hybrid — Supply: 25,000', icon: '🏗️' },
    { name: 'REIT Shares', description: 'hybrid • Hybrid — Supply: 200,000', icon: '🏢' },
    { name: 'Carbon Credits', description: 'utility • Environmental — Supply: 1,000,000', icon: '🌿' },
    { name: 'Renewable Energy Credits', description: 'utility • Environmental — Supply: 500,000', icon: '⚡' },
    { name: 'Intellectual Property Rights', description: 'equity • Rights — Supply: 100,000', icon: '🧠' },
    { name: 'Music Royalties', description: 'equity • Rights — Supply: 1,000,000', icon: '🎵' },
    { name: 'Stablecoin', description: 'utility • Digital Currency — Supply: 1,000,000,000', icon: '🪙' },
    { name: 'Central Bank Digital Currency', description: 'utility • Digital Currency — Supply: 10,000,000,000', icon: '🏦' },
    { name: 'DeFi Protocol Token', description: 'governance • DeFi — Supply: 100,000,000', icon: '🌐' },
    { name: 'Yield Farming Token', description: 'reward • DeFi — Supply: 50,000,000', icon: '🌾' },
    { name: 'Cash', description: 'utility • Cash & Equivalents — Supply: 100,000,000', icon: '💵' },
    { name: 'Money Market Fund', description: 'utility • Cash & Equivalents — Supply: 10,000,000', icon: '💰' },
    { name: 'Treasury Bills', description: 'debt • Cash & Equivalents — Supply: 50,000', icon: '🏛️' },
    { name: 'Commercial Paper', description: 'debt • Cash & Equivalents — Supply: 25,000', icon: '📄' },
    { name: 'Discount Coupon', description: 'reward • Coupons — Supply: 1,000,000', icon: '🎟️' },
    { name: 'Gift Voucher', description: 'reward • Coupons — Supply: 100,000', icon: '🎁' },
    { name: 'Store Credit', description: 'reward • Coupons — Supply: 500,000', icon: '💳' },
    { name: 'Promotional Code', description: 'reward • Coupons — Supply: 2,000,000', icon: '🏷️' },
    { name: 'Insurance Policy', description: 'hybrid • Insurance — Supply: 10,000', icon: '🛡️' },
    { name: 'Warranty Token', description: 'hybrid • Insurance — Supply: 100,000', icon: '🔒' },
    { name: 'Health Insurance', description: 'hybrid • Insurance — Supply: 50,000', icon: '🏥' },
    { name: 'Life Insurance', description: 'hybrid • Insurance — Supply: 25,000', icon: '❤️' },
    { name: 'Gold Token', description: 'utility • Commodities — Supply: 1,000,000', icon: '🥇' },
    { name: 'Silver Token', description: 'utility • Commodities — Supply: 10,000,000', icon: '🥈' },
    { name: 'Copper Token', description: 'utility • Commodities — Supply: 50,000,000', icon: '🥉' },
    { name: 'Platinum Token', description: 'utility • Commodities — Supply: 100,000', icon: '💎' },
    { name: 'Natural Gas Futures', description: 'derivative • Commodities — Supply: 25,000', icon: '🔥' },
    { name: 'Wheat Futures', description: 'derivative • Commodities — Supply: 100,000', icon: '🌾' },
    { name: 'Coffee Futures', description: 'derivative • Commodities — Supply: 50,000', icon: '☕' },
    { name: 'Lithium Token', description: 'utility • Commodities — Supply: 1,000,000', icon: '🔋' },
    { name: 'Real Estate Token', description: 'equity • Alternative — Supply: 100,000', icon: '🏠' },
    { name: 'Commercial Real Estate', description: 'equity • Alternative — Supply: 50,000', icon: '🏢' },
    { name: 'Infrastructure Fund', description: 'equity • Alternative — Supply: 25,000', icon: '🏗️' },
    { name: 'Collectible Cars', description: 'equity • Alternative — Supply: 1,000', icon: '🚗' },
    { name: 'Sports Memorabilia', description: 'equity • Alternative — Supply: 10,000', icon: '🏆' },
    { name: 'Timber Investment', description: 'equity • Alternative — Supply: 100,000', icon: '🌲' },
    { name: 'Auto Insurance', description: 'hybrid • Insurance — Supply: 100,000', icon: '🚙' },
    { name: 'Property Insurance', description: 'hybrid • Insurance — Supply: 75,000', icon: '🏡' },
    { name: 'Cyber Insurance', description: 'hybrid • Insurance — Supply: 25,000', icon: '🔐' },
    { name: 'Travel Insurance', description: 'hybrid • Insurance — Supply: 200,000', icon: '✈️' },
    { name: 'Exchange Traded Fund', description: 'equity • Structured — Supply: 1,000,000', icon: '📊' },
    { name: 'Index Fund', description: 'equity • Structured — Supply: 5,000,000', icon: '📈' },
    { name: 'Mutual Fund', description: 'equity • Structured — Supply: 2,000,000', icon: '🏛️' },
    { name: 'Solar Energy Credits', description: 'utility • Environmental — Supply: 1,000,000', icon: '☀️' },
    { name: 'Wind Energy Credits', description: 'utility • Environmental — Supply: 750,000', icon: '💨' },
    { name: 'Film Royalties', description: 'equity • Rights — Supply: 100,000', icon: '🎬' },
    { name: 'Patent Rights', description: 'equity • Rights — Supply: 50,000', icon: '📜' },
    { name: 'Software License', description: 'utility • Rights — Supply: 1,000,000', icon: '💻' },
    
    // Cryptocurrencies
    { id: 'crypto', name: 'Crypto', description: 'Digital cryptocurrencies and tokens', icon: '₿', category: 'Cryptocurrency', type: 'crypto-modal' },
  ],
  contractTemplates: [
    // Service Contracts
    { id: 'service-agreement', name: 'Service Agreement', description: 'Standard service delivery contract', icon: '📋', category: 'Service Contracts', defaultDuration: 12 },
    { id: 'consulting-agreement', name: 'Consulting Agreement', description: 'Professional consulting contract', icon: '💼', category: 'Service Contracts', defaultDuration: 6 },
    { id: 'maintenance-agreement', name: 'Maintenance Agreement', description: 'Ongoing maintenance and support services', icon: '🔧', category: 'Service Contracts', defaultDuration: 24 },
    { id: 'it-consulting', name: 'IT Consulting', description: 'Information technology consulting', icon: '🖥️', category: 'Service Contracts', defaultDuration: 6 },
    { id: 'management-consulting', name: 'Management Consulting', description: 'Business management consulting', icon: '📊', category: 'Service Contracts', defaultDuration: 9 },
    { id: 'legal-consulting', name: 'Legal Consulting', description: 'Legal advisory services', icon: '⚖️', category: 'Service Contracts', defaultDuration: 12 },
    { id: 'financial-consulting', name: 'Financial Consulting', description: 'Financial advisory and planning', icon: '💹', category: 'Service Contracts', defaultDuration: 6 },
    
    // Employment Contracts
    { id: 'employment-contract', name: 'Employment Contract', description: 'Employee hiring agreement', icon: '👤', category: 'Employment', defaultDuration: 24 },
    { id: 'freelance-agreement', name: 'Freelance Agreement', description: 'Independent contractor agreement', icon: '👨‍💻', category: 'Employment', defaultDuration: 3 },
    { id: 'executive-employment', name: 'Executive Employment', description: 'Senior executive employment contract', icon: '👔', category: 'Employment', defaultDuration: 36 },
    { id: 'internship-agreement', name: 'Internship Agreement', description: 'Student internship contract', icon: '🎓', category: 'Employment', defaultDuration: 3 },
    { id: 'remote-work-agreement', name: 'Remote Work Agreement', description: 'Remote work employment contract', icon: '🌐', category: 'Employment', defaultDuration: 12 },
    
    // Business Partnerships
    { id: 'partnership-agreement', name: 'Partnership Agreement', description: 'Business partnership contract', icon: '🤝', category: 'Business Partnerships', defaultDuration: 36 },
    { id: 'joint-venture', name: 'Joint Venture Agreement', description: 'Business joint venture partnership', icon: '🏢', category: 'Business Partnerships', defaultDuration: 24 },
    { id: 'franchise-agreement', name: 'Franchise Agreement', description: 'Business franchise contract', icon: '🍔', category: 'Business Partnerships', defaultDuration: 60 },
    
    // Intellectual Property & Licensing
    { id: 'licensing-agreement', name: 'Licensing Agreement', description: 'IP licensing contract', icon: '📜', category: 'Intellectual Property', defaultDuration: 12 },
    { id: 'software-license', name: 'Software License', description: 'Software licensing agreement', icon: '⚙️', category: 'Intellectual Property', defaultDuration: 12 },
    { id: 'music-licensing', name: 'Music Licensing', description: 'Music and audio licensing contract', icon: '🎵', category: 'Intellectual Property', defaultDuration: 6 },
    { id: 'patent-license', name: 'Patent License', description: 'Patent licensing agreement', icon: '🔬', category: 'Intellectual Property', defaultDuration: 36 },
    { id: 'trademark-license', name: 'Trademark License', description: 'Trademark usage licensing', icon: '™️', category: 'Intellectual Property', defaultDuration: 24 },
    
    // Confidentiality Agreements
    { id: 'nda', name: 'NDA', description: 'Non-disclosure agreement', icon: '🔒', category: 'Confidentiality', defaultDuration: 24 },
    { id: 'mutual-nda', name: 'Mutual NDA', description: 'Bilateral non-disclosure agreement', icon: '🤐', category: 'Confidentiality', defaultDuration: 12 },
    { id: 'employee-nda', name: 'Employee NDA', description: 'Employee confidentiality agreement', icon: '🔐', category: 'Confidentiality', defaultDuration: 60 },
    { id: 'vendor-nda', name: 'Vendor NDA', description: 'Third-party vendor confidentiality', icon: '🛡️', category: 'Confidentiality', defaultDuration: 18 },
    
    // Procurement & Supply
    { id: 'vendor-agreement', name: 'Vendor Agreement', description: 'Supplier/vendor contract', icon: '🏪', category: 'Procurement', defaultDuration: 12 },
    { id: 'supply-chain', name: 'Supply Chain Agreement', description: 'Supply chain management contract', icon: '📦', category: 'Procurement', defaultDuration: 24 },
    { id: 'equipment-lease', name: 'Equipment Lease', description: 'Equipment leasing agreement', icon: '🏭', category: 'Procurement', defaultDuration: 36 },
    
    // Distribution & Sales
    { id: 'distribution-agreement', name: 'Distribution Agreement', description: 'Product distribution partnership', icon: '🚚', category: 'Distribution', defaultDuration: 18 },
    
    // Financial & Investment
    { id: 'investment-contract', name: 'Investment Contract', description: 'Investment agreement with terms', icon: '💰', category: 'Investment', defaultDuration: 60 },
    
    // Technology & Development
    { id: 'software-dev-agreement', name: 'Software Development Agreement', description: 'Custom software development contract', icon: '💻', category: 'Technology', defaultDuration: 6 },
    
    // Marketing & Advertising
    { id: 'marketing-services', name: 'Marketing Services Contract', description: 'Digital marketing and advertising services', icon: '📈', category: 'Marketing', defaultDuration: 12 },
    
    // Construction & Infrastructure
    { id: 'construction-contract', name: 'Construction Contract', description: 'Building and construction services', icon: '🏗️', category: 'Construction', defaultDuration: 18 },
  ],
  integrationTemplates: [
    // CRM & Sales Platforms
    { id: 'salesforce', name: 'Salesforce', description: 'Customer relationship management platform', icon: '🟦', category: 'CRM & Sales', status: 'Connected', features: ['Contact Sync', 'Deal Tracking', 'Revenue Analytics'], lastSync: '2 minutes ago', defaultDuration: 12 },
    { id: 'hubspot', name: 'HubSpot', description: 'Inbound marketing and sales platform', icon: '🟧', category: 'CRM & Sales', status: 'Available', features: ['Lead Management', 'Email Marketing', 'Analytics'], defaultDuration: 12 },
    { id: 'pipedrive', name: 'Pipedrive', description: 'Sales pipeline management', icon: '🔴', category: 'CRM & Sales', status: 'Available', features: ['Pipeline Management', 'Activity Tracking', 'Forecasting'], defaultDuration: 12 },
    
    // Spreadsheets & Data
    { id: 'google-sheets', name: 'Google Sheets', description: 'Cloud-based spreadsheet application', icon: '🟢', category: 'Spreadsheets & Data', status: 'Connected', features: ['Real-time Sync', 'Formula Support', 'Collaboration'], lastSync: '5 minutes ago', defaultDuration: 12 },
    { id: 'microsoft-excel', name: 'Microsoft Excel', description: 'Desktop spreadsheet application', icon: '🟦', category: 'Spreadsheets & Data', status: 'Available', features: ['Advanced Formulas', 'Data Analysis', 'Charts'], defaultDuration: 12 },
    { id: 'airtable', name: 'Airtable', description: 'Database-spreadsheet hybrid', icon: '🟣', category: 'Spreadsheets & Data', status: 'Available', features: ['Database Views', 'Automations', 'API Access'], defaultDuration: 12 },
    
    // Content Management
    { id: 'wordpress', name: 'WordPress', description: 'Content management system', icon: '🔵', category: 'Content Management', status: 'Connected', features: ['Content Sync', 'User Management', 'Plugin Support'], lastSync: '1 hour ago', defaultDuration: 12 },
    
    // E-commerce
    { id: 'shopify', name: 'Shopify', description: 'E-commerce platform', icon: '🟢', category: 'E-commerce', status: 'Available', features: ['Product Management', 'Order Processing', 'Analytics'], defaultDuration: 12 },
    { id: 'woocommerce', name: 'WooCommerce', description: 'WordPress e-commerce plugin', icon: '🟠', category: 'E-commerce', status: 'Available', features: ['Product Catalog', 'Payment Processing', 'Inventory'], defaultDuration: 12 },
    
    // Payment Processing
    { id: 'stripe', name: 'Stripe', description: 'Payment processing platform', icon: '💳', category: 'Payment Processing', status: 'Connected', features: ['Payment Processing', 'Subscription Management', 'Analytics'], lastSync: 'Real-time', defaultDuration: 12 },
    { id: 'paypal', name: 'PayPal', description: 'Digital payment platform', icon: '🔵', category: 'Payment Processing', status: 'Available', features: ['Payment Gateway', 'Business Accounts', 'Mobile Payments'], defaultDuration: 12 },
    { id: 'square', name: 'Square', description: 'Point of sale and payment processing', icon: '🟢', category: 'Payment Processing', status: 'Available', features: ['POS System', 'Payment Processing', 'Inventory Management'], defaultDuration: 12 },
    
    // Team Communication
    { id: 'slack', name: 'Slack', description: 'Team communication platform', icon: '🟣', category: 'Team Communication', status: 'Connected', features: ['Channel Management', 'Bot Integration', 'File Sharing'], lastSync: 'Real-time', defaultDuration: 12 },
    { id: 'microsoft-teams', name: 'Microsoft Teams', description: 'Collaboration and communication platform', icon: '🔵', category: 'Team Communication', status: 'Available', features: ['Video Calls', 'File Collaboration', 'App Integration'], defaultDuration: 12 },
    { id: 'discord', name: 'Discord', description: 'Voice and text communication', icon: '🟣', category: 'Team Communication', status: 'Available', features: ['Voice Channels', 'Bot Support', 'Server Management'], defaultDuration: 12 },
    
    // Social Media
    { id: 'instagram', name: 'Instagram', description: 'Photo and video sharing social network', icon: '📸', category: 'Social Media', status: 'Available', features: ['Post Publishing', 'Story Management', 'Analytics', 'DM Automation'], defaultDuration: 12 },
    { id: 'twitter-x', name: 'Twitter/X', description: 'Microblogging and social networking', icon: '🐦', category: 'Social Media', status: 'Available', features: ['Tweet Scheduling', 'Thread Management', 'Analytics', 'DM Automation'], defaultDuration: 12 },
    { id: 'facebook', name: 'Facebook', description: 'Social networking platform', icon: '📘', category: 'Social Media', status: 'Available', features: ['Page Management', 'Post Scheduling', 'Ad Management', 'Analytics'], defaultDuration: 12 },
    { id: 'linkedin', name: 'LinkedIn', description: 'Professional networking platform', icon: '💼', category: 'Social Media', status: 'Available', features: ['Profile Management', 'Content Publishing', 'Connection Management', 'Analytics'], defaultDuration: 12 },
    { id: 'tiktok', name: 'TikTok', description: 'Short-form video sharing platform', icon: '🎵', category: 'Social Media', status: 'Available', features: ['Video Publishing', 'Trend Analysis', 'Analytics', 'Comment Management'], defaultDuration: 12 },
    { id: 'youtube', name: 'YouTube', description: 'Video sharing and streaming platform', icon: '📺', category: 'Social Media', status: 'Available', features: ['Video Upload', 'Channel Management', 'Analytics', 'Comment Moderation'], defaultDuration: 12 },
    { id: 'snapchat', name: 'Snapchat', description: 'Multimedia messaging and stories', icon: '👻', category: 'Social Media', status: 'Available', features: ['Snap Publishing', 'Story Management', 'Ad Management', 'Analytics'], defaultDuration: 12 },
    { id: 'threads', name: 'Threads', description: 'Text-based conversation platform', icon: '🧵', category: 'Social Media', status: 'Available', features: ['Thread Publishing', 'Community Management', 'Analytics', 'Cross-posting'], defaultDuration: 12 },
    { id: 'reddit', name: 'Reddit', description: 'Social news aggregation and discussion', icon: '🔴', category: 'Social Media', status: 'Available', features: ['Post Management', 'Community Engagement', 'Moderation Tools', 'Analytics'], defaultDuration: 12 },
    
    // Messaging Platforms
    { id: 'telegram', name: 'Telegram', description: 'Cloud-based messaging platform', icon: '✈️', category: 'Messaging', status: 'Available', features: ['Channel Management', 'Bot Integration', 'Message Broadcasting', 'Analytics'], defaultDuration: 12 },
    { id: 'whatsapp-business', name: 'WhatsApp Business', description: 'Business messaging platform', icon: '💚', category: 'Messaging', status: 'Available', features: ['Message Automation', 'Customer Support', 'Broadcast Lists', 'Analytics'], defaultDuration: 12 },
    
    // AI & Machine Learning
    { id: 'openai', name: 'OpenAI', description: 'Advanced AI models and GPT services', icon: '🤖', category: 'AI & Machine Learning', status: 'Available', features: ['Text Generation', 'Code Completion', 'Image Analysis', 'API Integration'], defaultDuration: 12 },
    { id: 'anthropic', name: 'Anthropic', description: 'Claude AI assistant and language models', icon: '🧠', category: 'AI & Machine Learning', status: 'Available', features: ['Conversational AI', 'Content Creation', 'Analysis', 'Reasoning'], defaultDuration: 12 },
    { id: 'eleven-labs', name: 'Eleven Labs', description: 'AI voice generation and cloning', icon: '🎤', category: 'AI & Machine Learning', status: 'Available', features: ['Voice Synthesis', 'Voice Cloning', 'Multiple Languages', 'API Access'], defaultDuration: 12 },
    { id: 'midjourney', name: 'MidJourney', description: 'AI-powered image generation', icon: '🎨', category: 'AI & Machine Learning', status: 'Available', features: ['Image Generation', 'Style Transfer', 'Upscaling', 'Variations'], defaultDuration: 12 },
    { id: 'stability-ai', name: 'Stability AI', description: 'Stable Diffusion and image AI models', icon: '🖼️', category: 'AI & Machine Learning', status: 'Available', features: ['Image Generation', 'Inpainting', 'Outpainting', 'Model Fine-tuning'], defaultDuration: 12 },
    { id: 'runway-ml', name: 'Runway ML', description: 'AI-powered video and creative tools', icon: '🎬', category: 'AI & Machine Learning', status: 'Available', features: ['Video Generation', 'Background Removal', 'Motion Tracking', 'Style Transfer'], defaultDuration: 12 },
    { id: 'replicate', name: 'Replicate', description: 'Platform for running AI models', icon: '🔄', category: 'AI & Machine Learning', status: 'Available', features: ['Model Hosting', 'API Access', 'Custom Models', 'Scaling'], defaultDuration: 12 },
    { id: 'hugging-face', name: 'Hugging Face', description: 'Open-source AI model hub', icon: '🤗', category: 'AI & Machine Learning', status: 'Available', features: ['Model Repository', 'Transformers', 'Datasets', 'Inference API'], defaultDuration: 12 },
    { id: 'cohere', name: 'Cohere', description: 'Language AI platform for enterprises', icon: '🔗', category: 'AI & Machine Learning', status: 'Available', features: ['Text Generation', 'Classification', 'Embeddings', 'Search'], defaultDuration: 12 },
    { id: 'perplexity', name: 'Perplexity', description: 'AI-powered search and research', icon: '🔍', category: 'AI & Machine Learning', status: 'Available', features: ['AI Search', 'Research Assistant', 'Source Citations', 'Real-time Data'], defaultDuration: 12 },
    { id: 'veo3', name: 'Veo3', description: 'Advanced AI video generation', icon: '📹', category: 'AI & Machine Learning', status: 'Available', features: ['Video Generation', 'Scene Creation', 'Character Animation', 'Style Control'], defaultDuration: 12 },
    
    // Legacy Integration Templates (keeping some for backward compatibility)
    { name: 'DocuSign', icon: '✍️' },
    { name: 'Payment Gateway', icon: '💳' },
    { name: 'Email Notifications', icon: '📧' },
  ],
  contactTemplates: [
    { name: 'Individual Contact', icon: '👤' },
    { name: 'Business Contact', icon: '🏢' },
    { name: 'AI Agent Contact', icon: '🤖' },
  ],
  cryptoTemplates: [
    // BitcoinSV Ecosystem (Leading)
    { id: 'bsv', name: 'BitcoinSV (BSV)', description: 'Original Bitcoin protocol with unlimited scalability', icon: '🟡', category: 'BitcoinSV', marketCap: '$1.2B', symbol: 'BSV', type: 'Layer 1' },
    
    // Major Cryptocurrencies
    { id: 'btc', name: 'Bitcoin (BTC)', description: 'The original cryptocurrency and digital gold', icon: '₿', category: 'Major', marketCap: '$800B', symbol: 'BTC', type: 'Layer 1' },
    { id: 'eth', name: 'Ethereum (ETH)', description: 'Smart contract platform and world computer', icon: '⟠', category: 'Major', marketCap: '$400B', symbol: 'ETH', type: 'Layer 1' },
    { id: 'bnb', name: 'BNB', description: 'Binance Smart Chain native token', icon: '🟡', category: 'Major', marketCap: '$90B', symbol: 'BNB', type: 'Layer 1' },
    { id: 'xrp', name: 'XRP', description: 'Cross-border payment solution', icon: '💧', category: 'Major', marketCap: '$75B', symbol: 'XRP', type: 'Layer 1' },
    { id: 'ada', name: 'Cardano (ADA)', description: 'Research-driven blockchain platform', icon: '🔷', category: 'Major', marketCap: '$35B', symbol: 'ADA', type: 'Layer 1' },
    { id: 'sol', name: 'Solana (SOL)', description: 'High-performance blockchain for DeFi and Web3', icon: '🌟', category: 'Major', marketCap: '$45B', symbol: 'SOL', type: 'Layer 1' },
    { id: 'dot', name: 'Polkadot (DOT)', description: 'Multi-chain interoperability protocol', icon: '⚪', category: 'Major', marketCap: '$25B', symbol: 'DOT', type: 'Layer 0' },
    { id: 'avax', name: 'Avalanche (AVAX)', description: 'Fast, low-cost, and eco-friendly blockchain', icon: '🔺', category: 'Major', marketCap: '$20B', symbol: 'AVAX', type: 'Layer 1' },
    { id: 'matic', name: 'Polygon (MATIC)', description: 'Ethereum scaling and infrastructure', icon: '🟣', category: 'Major', marketCap: '$15B', symbol: 'MATIC', type: 'Layer 2' },
    
    // DeFi Tokens
    { id: 'uni', name: 'Uniswap (UNI)', description: 'Decentralized exchange protocol', icon: '🦄', category: 'DeFi', marketCap: '$8B', symbol: 'UNI', type: 'Governance' },
    { id: 'aave', name: 'Aave (AAVE)', description: 'Decentralized lending protocol', icon: '👻', category: 'DeFi', marketCap: '$5B', symbol: 'AAVE', type: 'Governance' },
    { id: 'comp', name: 'Compound (COMP)', description: 'Algorithmic money market protocol', icon: '🏛️', category: 'DeFi', marketCap: '$2B', symbol: 'COMP', type: 'Governance' },
    { id: 'mkr', name: 'Maker (MKR)', description: 'Decentralized autonomous organization for DAI', icon: '🎯', category: 'DeFi', marketCap: '$3B', symbol: 'MKR', type: 'Governance' },
    { id: 'snx', name: 'Synthetix (SNX)', description: 'Synthetic asset protocol', icon: '⚡', category: 'DeFi', marketCap: '$1.5B', symbol: 'SNX', type: 'Utility' },
    
    // Stablecoins
    { id: 'usdt', name: 'Tether (USDT)', description: 'USD-pegged stablecoin', icon: '💵', category: 'Stablecoin', marketCap: '$120B', symbol: 'USDT', type: 'Stablecoin' },
    { id: 'usdc', name: 'USD Coin (USDC)', description: 'Regulated USD stablecoin', icon: '🔵', category: 'Stablecoin', marketCap: '$50B', symbol: 'USDC', type: 'Stablecoin' },
    { id: 'dai', name: 'Dai (DAI)', description: 'Decentralized USD stablecoin', icon: '🟡', category: 'Stablecoin', marketCap: '$8B', symbol: 'DAI', type: 'Stablecoin' },
    { id: 'busd', name: 'Binance USD (BUSD)', description: 'Binance-issued USD stablecoin', icon: '🟨', category: 'Stablecoin', marketCap: '$15B', symbol: 'BUSD', type: 'Stablecoin' },
    
    // Layer 2 Solutions
    { id: 'arb', name: 'Arbitrum (ARB)', description: 'Ethereum Layer 2 scaling solution', icon: '🔷', category: 'Layer 2', marketCap: '$3B', symbol: 'ARB', type: 'Layer 2' },
    { id: 'op', name: 'Optimism (OP)', description: 'Ethereum Layer 2 optimistic rollup', icon: '🔴', category: 'Layer 2', marketCap: '$2B', symbol: 'OP', type: 'Layer 2' },
    
    // Meme Coins
    { id: 'doge', name: 'Dogecoin (DOGE)', description: 'The original meme cryptocurrency', icon: '🐕', category: 'Meme', marketCap: '$25B', symbol: 'DOGE', type: 'Currency' },
    { id: 'shib', name: 'Shiba Inu (SHIB)', description: 'Ethereum-based meme token', icon: '🐕‍🦺', category: 'Meme', marketCap: '$8B', symbol: 'SHIB', type: 'Token' },
    
    // Privacy Coins
    { id: 'xmr', name: 'Monero (XMR)', description: 'Privacy-focused cryptocurrency', icon: '🔒', category: 'Privacy', marketCap: '$3B', symbol: 'XMR', type: 'Currency' },
    { id: 'zec', name: 'Zcash (ZEC)', description: 'Shielded cryptocurrency with privacy', icon: '🛡️', category: 'Privacy', marketCap: '$1B', symbol: 'ZEC', type: 'Currency' },
    
    // Enterprise & Institutional
    { id: 'link', name: 'Chainlink (LINK)', description: 'Decentralized oracle network', icon: '🔗', category: 'Infrastructure', marketCap: '$12B', symbol: 'LINK', type: 'Utility' },
    { id: 'vet', name: 'VeChain (VET)', description: 'Supply chain and business processes', icon: '✅', category: 'Enterprise', marketCap: '$3B', symbol: 'VET', type: 'Utility' },
    { id: 'xlm', name: 'Stellar (XLM)', description: 'Cross-border payments and remittances', icon: '⭐', category: 'Payments', marketCap: '$4B', symbol: 'XLM', type: 'Currency' },
    
    // Gaming & NFT
    { id: 'axs', name: 'Axie Infinity (AXS)', description: 'Play-to-earn gaming ecosystem', icon: '🎮', category: 'Gaming', marketCap: '$2B', symbol: 'AXS', type: 'Governance' },
    { id: 'sand', name: 'The Sandbox (SAND)', description: 'Virtual world and gaming metaverse', icon: '🏖️', category: 'Metaverse', marketCap: '$1.5B', symbol: 'SAND', type: 'Utility' },
    { id: 'mana', name: 'Decentraland (MANA)', description: 'Virtual reality platform', icon: '🌐', category: 'Metaverse', marketCap: '$1B', symbol: 'MANA', type: 'Utility' },
  ],
  walletTemplates: [
    // BitcoinSV Wallets (Leading)
    { id: 'handcash', name: 'HandCash', description: 'User-friendly BitcoinSV wallet with social features', icon: '💳', category: 'BitcoinSV', status: 'Available', features: ['Social Payments', 'Handle System', 'Instant Transactions', 'Low Fees'], supportedChains: ['BSV'], type: 'Mobile' },
    { id: 'yours-wallet', name: 'Yours Wallet', description: 'Professional BitcoinSV wallet for businesses', icon: '👤', category: 'BitcoinSV', status: 'Available', features: ['Business Tools', 'Multi-sig', 'API Access', 'Bulk Payments'], supportedChains: ['BSV'], type: 'Web/Mobile' },
    
    // Multi-Chain Wallets
    { id: 'metamask', name: 'MetaMask', description: 'Popular Ethereum and EVM wallet', icon: '🦊', category: 'Multi-Chain', status: 'Available', features: ['DeFi Access', 'NFT Support', 'dApp Browser', 'Hardware Integration'], supportedChains: ['Ethereum', 'Polygon', 'BSC', 'Avalanche'], type: 'Browser Extension' },
    { id: 'phantom', name: 'Phantom', description: 'Leading Solana wallet with multi-chain support', icon: '👻', category: 'Multi-Chain', status: 'Available', features: ['Solana DeFi', 'NFT Gallery', 'Staking', 'Multi-chain'], supportedChains: ['Solana', 'Ethereum', 'Polygon'], type: 'Browser Extension' },
    { id: 'trust-wallet', name: 'Trust Wallet', description: 'Binance official multi-cryptocurrency wallet', icon: '🛡️', category: 'Multi-Chain', status: 'Available', features: ['Multi-chain', 'DeFi Access', 'NFT Support', 'Staking'], supportedChains: ['Bitcoin', 'Ethereum', 'BSC', 'Solana'], type: 'Mobile' },
    { id: 'coinbase-wallet', name: 'Coinbase Wallet', description: 'Self-custody wallet by Coinbase', icon: '🔵', category: 'Multi-Chain', status: 'Available', features: ['DeFi Access', 'NFT Support', 'Easy Onboarding', 'Recovery Phrase'], supportedChains: ['Ethereum', 'Polygon', 'Avalanche', 'BSC'], type: 'Mobile/Web' },
    
    // Bitcoin Wallets
    { id: 'electrum', name: 'Electrum', description: 'Lightweight Bitcoin wallet', icon: '⚡', category: 'Bitcoin', status: 'Available', features: ['Lightweight', 'Cold Storage', 'Multi-sig', 'Hardware Support'], supportedChains: ['Bitcoin'], type: 'Desktop' },
    { id: 'exodus', name: 'Exodus', description: 'Beautiful multi-asset wallet', icon: '🌈', category: 'Multi-Chain', status: 'Available', features: ['Portfolio Tracker', 'Built-in Exchange', 'Staking', 'NFT Support'], supportedChains: ['Bitcoin', 'Ethereum', 'Solana', 'Cardano'], type: 'Desktop/Mobile' },
    
    // Hardware Wallets
    { id: 'ledger', name: 'Ledger', description: 'Hardware wallet for maximum security', icon: '🔐', category: 'Hardware', status: 'Available', features: ['Cold Storage', 'Multi-chain', 'Secure Element', 'Mobile App'], supportedChains: ['Bitcoin', 'Ethereum', 'Solana', 'Cardano'], type: 'Hardware' },
    { id: 'trezor', name: 'Trezor', description: 'Open-source hardware wallet', icon: '🔒', category: 'Hardware', status: 'Available', features: ['Open Source', 'Cold Storage', 'Multi-chain', 'Recovery Seed'], supportedChains: ['Bitcoin', 'Ethereum', 'Litecoin', 'Cardano'], type: 'Hardware' },
    
    // Enterprise & Institutional
    { id: 'privy', name: 'Privy', description: 'Embedded wallet infrastructure for apps', icon: '🔑', category: 'Enterprise', status: 'Available', features: ['Embedded Wallets', 'Social Login', 'Developer APIs', 'White-label'], supportedChains: ['Ethereum', 'Polygon', 'BSC', 'Solana'], type: 'SDK/API' },
    { id: 'fireblocks', name: 'Fireblocks', description: 'Institutional digital asset platform', icon: '🏦', category: 'Enterprise', status: 'Available', features: ['MPC Technology', 'Compliance', 'Treasury Management', 'DeFi Access'], supportedChains: ['Bitcoin', 'Ethereum', 'Solana', 'Polygon'], type: 'Enterprise' },
    
    // Specialized Wallets
    { id: 'rainbow', name: 'Rainbow', description: 'Ethereum wallet focused on DeFi and NFTs', icon: '🌈', category: 'Ethereum', status: 'Available', features: ['DeFi Portfolio', 'NFT Gallery', 'ENS Support', 'Beautiful UI'], supportedChains: ['Ethereum', 'Polygon', 'Arbitrum', 'Optimism'], type: 'Mobile' },
    { id: 'argent', name: 'Argent', description: 'Smart contract wallet with social recovery', icon: '🛡️', category: 'Ethereum', status: 'Available', features: ['Social Recovery', 'DeFi Integration', 'No Seed Phrase', 'Guardians'], supportedChains: ['Ethereum', 'zkSync'], type: 'Mobile' },
  ],
}

export const getOrganizationTemplates = () => readBag()?.organizationTemplates || stubs.organizationTemplates
export const getRoleTemplates = () => readBag()?.roleTemplates || stubs.roleTemplates
export const getAgentTemplates = () => readBag()?.agentTemplates || stubs.agentTemplates
export const getInstrumentTemplates = () => readBag()?.instrumentTemplates || stubs.instrumentTemplates
export const getContractTemplates = () => readBag()?.contractTemplates || stubs.contractTemplates
export const getIntegrationTemplates = () => readBag()?.integrationTemplates || stubs.integrationTemplates
export const getContactTemplates = () => readBag()?.contactTemplates || stubs.contactTemplates
export const getCryptoTemplates = () => readBag()?.cryptoTemplates || stubs.cryptoTemplates
export const getWalletTemplates = () => readBag()?.walletTemplates || stubs.walletTemplates


