'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/Providers';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaPalette, FaDesktop, FaMobileAlt, FaShoppingCart, FaBlog, FaBusinessTime,
  FaCamera, FaMusic, FaUtensils, FaGraduationCap, FaMedkit, FaHome,
  FaCheck, FaArrowRight, FaTimes, FaLock, FaUser, FaEnvelope, FaPhone,
  FaGlobe, FaRocket, FaCreditCard, FaSearch, FaShare, FaUsers, FaCog,
  FaDatabase, FaCloud, FaMobile, FaCode, FaPaintBrush, FaChartLine
} from 'react-icons/fa';
import ProjectImage from '@/components/ProjectImage';

interface WebsiteRequirements {
  // Basic Info
  projectName: string;
  companyName: string;
  industry: string;
  websiteType: string;
  
  // Goals & Audience
  primaryGoal: string;
  targetAudience: string;
  
  // Design Preferences
  designStyle: string[];
  colorPreferences: string;
  existingBranding: boolean;
  
  // Features & Functionality
  features: string[];
  contentManagement: boolean;
  userAccounts: boolean;
  ecommerce: boolean;
  multiLanguage: boolean;
  
  // Technical Requirements
  hostingNeeds: string;
  domainNeeds: string;
  integrations: string[];
  
  // Timeline & Budget
  timeline: string;
  budgetRange: string;
  
  // Additional Details
  additionalRequirements: string;
  inspiration: string;
}

const initialRequirements: WebsiteRequirements = {
  projectName: '',
  companyName: '',
  industry: '',
  websiteType: '',
  primaryGoal: '',
  targetAudience: '',
  designStyle: [],
  colorPreferences: '',
  existingBranding: false,
  features: [],
  contentManagement: false,
  userAccounts: false,
  ecommerce: false,
  multiLanguage: false,
  hostingNeeds: '',
  domainNeeds: '',
  integrations: [],
  timeline: '',
  budgetRange: '',
  additionalRequirements: '',
  inspiration: ''
};

const websiteTypes = [
  { id: 'business', label: 'Business/Corporate', icon: FaBusinessTime },
  { id: 'ecommerce', label: 'E-commerce Store', icon: FaShoppingCart },
  { id: 'portfolio', label: 'Portfolio/Creative', icon: FaPalette },
  { id: 'blog', label: 'Blog/News', icon: FaBlog },
  { id: 'restaurant', label: 'Restaurant/Food', icon: FaUtensils },
  { id: 'photography', label: 'Photography', icon: FaCamera },
  { id: 'music', label: 'Music/Entertainment', icon: FaMusic },
  { id: 'education', label: 'Education/Learning', icon: FaGraduationCap },
  { id: 'healthcare', label: 'Healthcare/Medical', icon: FaMedkit },
  { id: 'realestate', label: 'Real Estate', icon: FaHome },
  { id: 'saas', label: 'SaaS/Software', icon: FaRocket },
  { id: 'nonprofit', label: 'Non-profit', icon: FaUsers }
];

const designStyles = [
  'Modern/Minimalist', 'Bold/Vibrant', 'Classic/Traditional', 'Creative/Artistic',
  'Professional/Corporate', 'Playful/Fun', 'Elegant/Luxury', 'Industrial/Tech'
];

const websiteFeatures = [
  { id: 'contact-forms', label: 'Contact Forms', icon: FaEnvelope },
  { id: 'online-booking', label: 'Online Booking/Scheduling', icon: FaBusinessTime },
  { id: 'photo-gallery', label: 'Photo/Video Gallery', icon: FaCamera },
  { id: 'testimonials', label: 'Customer Testimonials', icon: FaUsers },
  { id: 'live-chat', label: 'Live Chat Support', icon: FaPhone },
  { id: 'newsletter', label: 'Newsletter Signup', icon: FaEnvelope },
  { id: 'social-media', label: 'Social Media Integration', icon: FaShare },
  { id: 'search', label: 'Search Functionality', icon: FaSearch },
  { id: 'analytics', label: 'Analytics Dashboard', icon: FaChartLine },
  { id: 'seo-tools', label: 'SEO Optimization', icon: FaGlobe },
  { id: 'payment-gateway', label: 'Payment Processing', icon: FaCreditCard },
  { id: 'inventory', label: 'Inventory Management', icon: FaDatabase },
  { id: 'blog-system', label: 'Blog/News System', icon: FaBlog },
  { id: 'membership', label: 'Membership System', icon: FaUser },
  { id: 'forums', label: 'Community Forums', icon: FaUsers },
  { id: 'mobile-app', label: 'Mobile App Integration', icon: FaMobile }
];

const integrationOptions = [
  'Google Analytics', 'Google Ads', 'Facebook Pixel', 'Mailchimp', 'Constant Contact',
  'HubSpot', 'Salesforce', 'Stripe', 'PayPal', 'Square', 'Shopify', 'WooCommerce',
  'Zoom', 'Calendly', 'DocuSign', 'Slack', 'Microsoft 365', 'Zapier'
];

export default function WebsiteDesignPage() {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const [requirements, setRequirements] = useState<WebsiteRequirements>(initialRequirements);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!isLoading && !session) {
      router.push('/login?redirect=/services/web-design&message=Please log in to access the website builder');
    }
  }, [session, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <FaLock className="text-6xl text-gray-600 mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-gray-300 mb-6">
            You need to be logged in to access our website builder. Please sign in or create an account to continue.
          </p>
          <Link 
            href="/login?redirect=/services/web-design"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 transition duration-200"
          >
            Sign In to Continue
          </Link>
        </div>
      </div>
    );
  }

  const handleInputChange = (field: keyof WebsiteRequirements, value: any) => {
    setRequirements(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayToggle = (field: keyof WebsiteRequirements, value: string) => {
    setRequirements(prev => {
      const currentArray = prev[field] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return {
        ...prev,
        [field]: newArray
      };
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Here you would typically send the data to your backend
      console.log('Website Requirements:', requirements);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        // Reset form or redirect
        setRequirements(initialRequirements);
        setCurrentStep(1);
      }, 3000);
    } catch (error) {
      console.error('Error submitting requirements:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepTitles = [
    'Project Overview',
    'Website Type & Goals',
    'Design Preferences', 
    'Features & Functionality',
    'Technical Requirements',
    'Timeline & Budget',
    'Review & Submit'
  ];

  const isStepComplete = (step: number) => {
    switch (step) {
      case 1: return requirements.projectName && requirements.companyName;
      case 2: return requirements.websiteType && requirements.primaryGoal;
      case 3: return requirements.designStyle.length > 0;
      case 4: return requirements.features.length > 0;
      case 5: return requirements.hostingNeeds && requirements.domainNeeds;
      case 6: return requirements.timeline && requirements.budgetRange;
      default: return false;
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheck className="text-2xl text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Requirements Submitted!</h1>
          <p className="text-gray-300 mb-6">
            Thank you for providing detailed information about your website project. Our team will review your requirements and get back to you within 24 hours.
          </p>
          <p className="text-sm text-gray-400">
            You'll receive a detailed proposal and project timeline via email.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-4">
      {/* Header */}
      <header className="w-full px-4 md:px-8 py-8 border-b border-gray-800">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-cyan-400">//</span> Website Builder
          </h1>
          <p className="text-xl text-gray-300 max-w-4xl">
            Let's create the perfect website for your needs. Fill out the details below to get a custom proposal.
          </p>
          <div className="mt-4 text-sm text-gray-400">
            Welcome back, <span className="text-cyan-400">{session.user.email}</span>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full px-4 md:px-8 py-6 bg-gray-900 border-b border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Step {currentStep} of {stepTitles.length}</h2>
            <div className="text-sm text-gray-400">
              {stepTitles[currentStep - 1]}
            </div>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div 
              className="bg-cyan-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / stepTitles.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        
        {/* Step 1: Project Overview */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-6">Project Overview</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Project Name *</label>
                <input
                  type="text"
                  value={requirements.projectName}
                  onChange={(e) => handleInputChange('projectName', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white"
                  placeholder="My Awesome Website"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Company/Organization Name *</label>
                <input
                  type="text"
                  value={requirements.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white"
                  placeholder="Acme Corp"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Industry/Business Type</label>
              <input
                type="text"
                value={requirements.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white"
                placeholder="e.g., Technology, Healthcare, Retail, Education"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Target Audience</label>
              <textarea
                value={requirements.targetAudience}
                onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white"
                rows={3}
                placeholder="Describe your ideal visitors/customers..."
              />
            </div>
          </div>
        )}

        {/* Step 2: Website Type & Goals */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-6">Website Type & Goals</h3>
            
            <div>
              <label className="block text-sm font-medium mb-4">What type of website do you need? *</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {websiteTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <div
                      key={type.id}
                      onClick={() => handleInputChange('websiteType', type.id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        requirements.websiteType === type.id
                          ? 'border-cyan-400 bg-cyan-400/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <Icon className="text-2xl mb-2 text-cyan-400" />
                      <h4 className="font-medium">{type.label}</h4>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Primary Goal for Your Website *</label>
              <select
                value={requirements.primaryGoal}
                onChange={(e) => handleInputChange('primaryGoal', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white"
              >
                <option value="">Select primary goal...</option>
                <option value="generate-leads">Generate Leads</option>
                <option value="sell-products">Sell Products/Services</option>
                <option value="build-brand">Build Brand Awareness</option>
                <option value="showcase-portfolio">Showcase Work/Portfolio</option>
                <option value="provide-information">Provide Information</option>
                <option value="engage-community">Engage Community</option>
                <option value="support-customers">Support Customers</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 3: Design Preferences */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-6">Design Preferences</h3>
            
            <div>
              <label className="block text-sm font-medium mb-4">Design Style (select all that apply) *</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {designStyles.map((style) => (
                  <div
                    key={style}
                    onClick={() => handleArrayToggle('designStyle', style)}
                    className={`p-3 border rounded-lg cursor-pointer transition-all text-center ${
                      requirements.designStyle.includes(style)
                        ? 'border-cyan-400 bg-cyan-400/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    {style}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Color Preferences</label>
              <input
                type="text"
                value={requirements.colorPreferences}
                onChange={(e) => handleInputChange('colorPreferences', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white"
                placeholder="e.g., Blue and white, Earth tones, Bright and colorful"
              />
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="existing-branding"
                checked={requirements.existingBranding}
                onChange={(e) => handleInputChange('existingBranding', e.target.checked)}
                className="w-5 h-5 text-cyan-400 bg-gray-800 border-gray-600 rounded focus:ring-cyan-400"
              />
              <label htmlFor="existing-branding" className="text-sm font-medium">
                I have existing branding (logo, colors, fonts) to incorporate
              </label>
            </div>
          </div>
        )}

        {/* Step 4: Features & Functionality */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-6">Features & Functionality</h3>
            
            <div>
              <label className="block text-sm font-medium mb-4">Select the features you need *</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {websiteFeatures.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={feature.id}
                      onClick={() => handleArrayToggle('features', feature.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all flex items-center space-x-3 ${
                        requirements.features.includes(feature.id)
                          ? 'border-cyan-400 bg-cyan-400/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <Icon className="text-cyan-400" />
                      <span>{feature.label}</span>
                      {requirements.features.includes(feature.id) && (
                        <FaCheck className="text-green-400 ml-auto" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="content-management"
                  checked={requirements.contentManagement}
                  onChange={(e) => handleInputChange('contentManagement', e.target.checked)}
                  className="w-5 h-5 text-cyan-400 bg-gray-800 border-gray-600 rounded focus:ring-cyan-400"
                />
                <label htmlFor="content-management" className="text-sm font-medium">
                  Content Management System (edit content yourself)
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="user-accounts"
                  checked={requirements.userAccounts}
                  onChange={(e) => handleInputChange('userAccounts', e.target.checked)}
                  className="w-5 h-5 text-cyan-400 bg-gray-800 border-gray-600 rounded focus:ring-cyan-400"
                />
                <label htmlFor="user-accounts" className="text-sm font-medium">
                  User Registration/Login System
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="ecommerce"
                  checked={requirements.ecommerce}
                  onChange={(e) => handleInputChange('ecommerce', e.target.checked)}
                  className="w-5 h-5 text-cyan-400 bg-gray-800 border-gray-600 rounded focus:ring-cyan-400"
                />
                <label htmlFor="ecommerce" className="text-sm font-medium">
                  E-commerce Functionality
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="multi-language"
                  checked={requirements.multiLanguage}
                  onChange={(e) => handleInputChange('multiLanguage', e.target.checked)}
                  className="w-5 h-5 text-cyan-400 bg-gray-800 border-gray-600 rounded focus:ring-cyan-400"
                />
                <label htmlFor="multi-language" className="text-sm font-medium">
                  Multi-language Support
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Technical Requirements */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-6">Technical Requirements</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Hosting Needs *</label>
                <select
                  value={requirements.hostingNeeds}
                  onChange={(e) => handleInputChange('hostingNeeds', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white"
                >
                  <option value="">Select hosting option...</option>
                  <option value="include-hosting">Include hosting in project</option>
                  <option value="have-hosting">I have existing hosting</option>
                  <option value="need-recommendation">Need hosting recommendation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Domain Name *</label>
                <select
                  value={requirements.domainNeeds}
                  onChange={(e) => handleInputChange('domainNeeds', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white"
                >
                  <option value="">Select domain option...</option>
                  <option value="have-domain">I have a domain</option>
                  <option value="need-domain">Need help purchasing domain</option>
                  <option value="need-consultation">Need domain consultation</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-4">Third-party Integrations</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {integrationOptions.map((integration) => (
                  <div
                    key={integration}
                    onClick={() => handleArrayToggle('integrations', integration)}
                    className={`p-3 border rounded-lg cursor-pointer transition-all text-center text-sm ${
                      requirements.integrations.includes(integration)
                        ? 'border-cyan-400 bg-cyan-400/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    {integration}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Timeline & Budget */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-6">Timeline & Budget</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Project Timeline *</label>
                <select
                  value={requirements.timeline}
                  onChange={(e) => handleInputChange('timeline', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white"
                >
                  <option value="">Select timeline...</option>
                  <option value="asap">ASAP (Rush job)</option>
                  <option value="1-2-weeks">1-2 weeks</option>
                  <option value="3-4-weeks">3-4 weeks</option>
                  <option value="1-2-months">1-2 months</option>
                  <option value="3-6-months">3-6 months</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Budget Range *</label>
                <select
                  value={requirements.budgetRange}
                  onChange={(e) => handleInputChange('budgetRange', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white"
                >
                  <option value="">Select budget range...</option>
                  <option value="under-1k">Under £1,000</option>
                  <option value="1k-3k">£1,000 - £3,000</option>
                  <option value="3k-5k">£3,000 - £5,000</option>
                  <option value="5k-10k">£5,000 - £10,000</option>
                  <option value="10k-25k">£10,000 - £25,000</option>
                  <option value="25k-plus">£25,000+</option>
                  <option value="discussion">Let's discuss</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Website Inspiration</label>
              <textarea
                value={requirements.inspiration}
                onChange={(e) => handleInputChange('inspiration', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white"
                rows={3}
                placeholder="Share URLs of websites you like or describe the style you're looking for..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Additional Requirements</label>
              <textarea
                value={requirements.additionalRequirements}
                onChange={(e) => handleInputChange('additionalRequirements', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white"
                rows={4}
                placeholder="Any specific requirements, preferences, or questions not covered above..."
              />
            </div>
          </div>
        )}

        {/* Step 7: Review & Submit */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-6">Review Your Requirements</h3>
            
            <div className="bg-gray-900 p-6 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-cyan-400 mb-2">Project Details</h4>
                  <p><strong>Project:</strong> {requirements.projectName}</p>
                  <p><strong>Company:</strong> {requirements.companyName}</p>
                  <p><strong>Industry:</strong> {requirements.industry || 'Not specified'}</p>
                  <p><strong>Type:</strong> {websiteTypes.find(t => t.id === requirements.websiteType)?.label}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-cyan-400 mb-2">Timeline & Budget</h4>
                  <p><strong>Timeline:</strong> {requirements.timeline}</p>
                  <p><strong>Budget:</strong> {requirements.budgetRange}</p>
                  <p><strong>Goal:</strong> {requirements.primaryGoal}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-cyan-400 mb-2">Design Style</h4>
                <p>{requirements.designStyle.join(', ') || 'Not specified'}</p>
              </div>

              <div>
                <h4 className="font-semibold text-cyan-400 mb-2">Selected Features ({requirements.features.length})</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {requirements.features.map(featureId => {
                    const feature = websiteFeatures.find(f => f.id === featureId);
                    return (
                      <div key={featureId} className="text-sm bg-gray-800 p-2 rounded">
                        {feature?.label}
                      </div>
                    );
                  })}
                </div>
              </div>

              {requirements.integrations.length > 0 && (
                <div>
                  <h4 className="font-semibold text-cyan-400 mb-2">Integrations</h4>
                  <p>{requirements.integrations.join(', ')}</p>
                </div>
              )}
            </div>

            <div className="text-center">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-4 px-8 rounded-lg transition duration-200 flex items-center justify-center mx-auto space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <FaRocket />
                    <span>Submit Website Requirements</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-800">
          <div>
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition duration-200 flex items-center space-x-2"
              >
                <span>Previous</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* Step indicators */}
            <div className="hidden md:flex items-center space-x-2">
              {stepTitles.map((_, index) => (
                <div
                  key={index}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    index + 1 === currentStep
                      ? 'bg-cyan-400 text-black'
                      : index + 1 < currentStep
                      ? 'bg-green-600 text-white'
                      : isStepComplete(index + 1)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {index + 1 < currentStep ? <FaCheck /> : index + 1}
                </div>
              ))}
            </div>
          </div>

          <div>
            {currentStep < stepTitles.length && (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={!isStepComplete(currentStep)}
                className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition duration-200 flex items-center space-x-2"
              >
                <span>Next</span>
                <FaArrowRight />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 