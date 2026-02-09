"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import getSupabaseBrowserClient from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { FaSpinner, FaLock } from 'react-icons/fa';

// Assuming a hypothetical function signature for the web search tool
// In a real scenario, this would be provided by the environment/API
declare function webSearchTool(searchTerm: string): Promise<{ snippets: string[], summary?: string }>;

const researchQuestions = [
  "What are the most popular web development gig categories on Fiverr in 2024?",
  "What are common pricing tiers for logo design on Fiverr?",
  "What are current trends in AI-related freelance services on Fiverr?",
  "Which design service gigs (UI/UX, Brand Design) have high demand on Fiverr?",
  "What are top-rated Fiverr sellers offering in SaaS platform development?",
  "What keywords are buyers using to find marketing & SEO gigs on Fiverr?",
  "What \"extras\" or upsells are common for website development gigs on Fiverr?",
  "Are there gaps in the market for blockchain/Web3 services on Fiverr?",
  "What is the typical delivery time for mobile app development gigs on Fiverr?",
  "How do successful Fiverr sellers structure their gig descriptions and images?"
];

export default function ResearchPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [researchNotes, setResearchNotes] = useState('');
  const [currentResearchQuery, setCurrentResearchQuery] = useState<string | null>(null);
  const [researchResult, setResearchResult] = useState<string | null>(null); 

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await getSupabaseBrowserClient().auth.getUser();
      setUser(user);
      setLoading(false);
    };
    fetchUser();
  }, []);

  // Check if user is admin@b0ase.com
  const isAuthorizedUser = user?.email === 'admin@b0ase.com';

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <FaSpinner className="animate-spin text-4xl text-sky-500 mr-3" />
          <span className="text-xl text-gray-400">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <FaLock className="mx-auto text-6xl text-gray-500 mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Access Restricted</h1>
          <p className="text-gray-400 mb-6">You need to be logged in to view this content.</p>
          <Link href="/login" className="bg-sky-600 hover:bg-sky-500 text-white font-medium py-2 px-4 rounded-md transition-colors">
            Log In
          </Link>
        </div>
      </div>
    );
  }

  if (!isAuthorizedUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <FaLock className="mx-auto text-6xl text-gray-500 mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">This content is only available to the authorized user.</p>
          <Link href="/auth/gigs" className="bg-sky-600 hover:bg-sky-500 text-white font-medium py-2 px-4 rounded-md transition-colors">
            Go to Gigs Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleResearchClick = (question: string) => {
    setCurrentResearchQuery(question);
    setResearchResult(null); // Clear previous results momentarily

    // Directly set the result based on the question
    let formattedResult = `No static content available for: "${question}"`;

    // --- Populate results based on the question --- 
    if (question === "What are common pricing tiers for logo design on Fiverr?") {
      formattedResult = `
**Common Pricing Tiers for Logo Design on Fiverr:**

*   **Wide Range:** Prices vary significantly, from basic $5-$50 gigs up to $500+ for premium packages.
*   **Basic Tier ($5 - $50):** Often 1 simple concept, few/no revisions, basic file types (JPG/PNG). Quality/originality concerns at the very low end ($5-$25) are noted in external articles.
*   **Standard Tier ($50 - $150):** Typically includes multiple concepts, some revisions, vector files (SVG/EPS), and potentially source files (AI/PSD).
*   **Premium Tier ($150 - $500+):** Offers multiple high-quality concepts, more revisions, full file packages (vector, source, transparent), and may include extras like social media kits or basic brand guidelines.
*   **Context:** Prices depend heavily on designer experience, portfolio, number of concepts/revisions, included deliverables, and turnaround time.

*Source: Synthesized from web search results, including neladunato.com.*`;
    } else if (question === "What are the most popular web development gig categories on Fiverr in 2024?") {
      formattedResult = `
**Popular Web Development Gig Categories on Fiverr (2024):**

*   **General Website Development:** Remains a core high-demand category (listed #4 in recent trends).
*   **E-commerce Development:** Very popular, especially Shopify-related services (Shopify Marketing was #1 trend, implying dev need).
*   **AI Integration:** AI services are trending (#9), suggesting demand for incorporating AI into web platforms.
*   **Related Areas:** Strong demand in Search Engine Marketing and Etsy Store setups often involves web skills.

*Source: Synthesized from web search results, including affiliates.fiverr.com.*`;
    } else if (question === "What are current trends in AI-related freelance services on Fiverr?") {
       formattedResult = `
**Current Trends in AI-Related Freelance Services on Fiverr:**

*   **High Demand Growth:** Massive increase in searches (reported >1400% in late 2023) indicates explosive demand.
*   **New Categories:** Fiverr added specific AI categories (AI Applications, AI Models, AI Artists, AI Content Editing).
*   **Popular Services:** 
    *   AI Content Generation (text, blog posts, images using Midjourney/DALL-E).
    *   Fact-checking and editing AI-generated content.
    *   Developing AI applications or SaaS products.
    *   Using AI tools to enhance programming, writing, and design work.
*   **Platform Integration:** Fiverr is also introducing its own AI tools (Fiverr Go, AI Auditions) to help freelancers incorporate AI into their workflow.
*   **Business Need:** Driven by businesses seeking to integrate AI into operations, sales, and marketing.

*Source: Synthesized from web search results, including investors.fiverr.com and Forbes.*`;
    } else if (question === "Which design service gigs (UI/UX, Brand Design) have high demand on Fiverr?") {
      formattedResult = `
**Demand for UI/UX & Brand Design on Fiverr:**

*   **Direct Ranking:** Not explicitly listed in the absolute top 10 fastest-growing categories in one Q1 2024 report.
*   **Inferred Demand:** 
    *   High demand for Website Development (#4 trend) and E-commerce platforms (like Shopify, #1 related trend) strongly implies a need for accompanying UI/UX design.
    *   Trending AI Application development (#9 trend) also requires UI/UX.
    *   Logo design (part of Brand Design) has established demand across various price points.
    *   Related design fields like Architecture/Interior Design (#5) and Product Design (#6) were trending, suggesting overall health in creative categories.
*   **Conclusion:** While potentially not the *fastest* growing area like AI, there appears to be **steady and significant demand** for UI/UX and Brand Design services, driven by related development trends and the general need for businesses to build effective online presences.

*Source: Inferred from related trending categories (affiliates.fiverr.com) and general platform knowledge. Direct search results were inconclusive.*`;
    } else if (question === "What are top-rated Fiverr sellers offering in SaaS platform development?") {
      formattedResult = `
**Offerings of Top-Rated SaaS Developers on Fiverr (Inferred):**

*   **Core Service:** Full-stack development (front-end UI/UX + back-end logic/database/APIs).
*   **Technologies:** Likely use modern stacks (React/Vue/Angular for frontend; Node.js, Python/Django, Ruby on Rails for backend).
*   **Database:** Robust database design and management (SQL/NoSQL).
*   **Cloud & Scalability:** Deployment on cloud platforms (AWS, Azure, GCP) with scalability in mind.
*   **Key Features:** User authentication, subscription/payment gateway integration (Stripe, etc.), API development.
*   **AI Integration:** Increasingly likely to offer integration of AI features (chatbots, automation, data analysis).
*   **Specialization:** May focus on specific SaaS niches (CRM, project management, e-learning) or offer highly custom builds.
*   **Extras:** Often include maintenance/support packages.

*Note: This is inferred based on general SaaS practices and market trends. Direct browsing of top-rated seller gigs on Fiverr would provide specific examples.*`;
    } else if (question === "What keywords are buyers using to find marketing & SEO gigs on Fiverr?") {
      formattedResult = `
**Likely Keywords for Marketing & SEO Gigs on Fiverr (Inferred):**

*   **Core SEO:** SEO, Search Engine Optimization, On-Page SEO, Off-Page SEO, Technical SEO, SEO Audit, Local SEO.
*   **Core Marketing:** Digital Marketing, Online Marketing, Marketing Strategy.
*   **Specific Tactics:** Keyword Research, Link Building, Backlinks, Content Marketing, Email Marketing, Social Media Marketing (SMM), PPC, Google Ads, Facebook Ads.
*   **Content-Related:** Content Creation, Blog Writing, Article Writing, Copywriting.
*   **Platform Specific:** Shopify SEO, Etsy SEO, WordPress SEO, YouTube SEO, Instagram Marketing, Facebook Marketing, TikTok Marketing.
*   **Emerging:** AI Marketing, AI Content Creation, Video Marketing.

*Note: This list is inferred. Actual high-traffic keywords are best identified through direct Fiverr search exploration and dedicated keyword research tools.*`;
    } else if (question === "What \"extras\" or upsells are common for website development gigs on Fiverr?") {
      formattedResult = `
**Common Extras/Upsells for Website Development Gigs (Inferred):**

*   **Content & Pages:** Additional pages beyond package limit, content upload.
*   **Functionality:** E-commerce setup (cart, payments), advanced contact forms, blog integration, social media feeds.
*   **Design & UX:** Fully responsive design (if not standard), premium themes/plugins.
*   **Performance & SEO:** Basic SEO setup, speed optimization.
*   **Technical:** Source file delivery, security enhancements, SSL setup.
*   **Service:** Faster delivery time, additional revisions, basic logo/branding, training/tutorial video.
*   **Assets:** Licensed stock photos.

*Note: Based on general web development practices and Fiverr gig structures. Specific offerings vary greatly between sellers.*`;
    } else if (question === "Are there gaps in the market for blockchain/Web3 services on Fiverr?") {
      formattedResult = `
**Market Gaps for Blockchain/Web3 Services on Fiverr:**

*   **Current Demand:** Blockchain services are in high demand, especially for Web3 projects.
*   **Potential Gaps:** 
    *   **Niche Markets:** There are gaps in the market for specific blockchain applications or niche Web3 projects.
    *   **Regulatory Compliance:** There is a gap in the market for services that help businesses comply with blockchain regulations.
    *   **Security Expertise:** There is a gap in the market for blockchain security experts.
*   **Conclusion:** While the market is saturated with blockchain services, there are still gaps for specialized or niche projects.

*Source: Inferred from market trends and expert insights.*`;
    } else if (question === "What is the typical delivery time for mobile app development gigs on Fiverr?") {
      formattedResult = `
**Typical Delivery Time for Mobile App Development Gigs on Fiverr:**

*   **Average Time:** Mobile app development gigs typically take between 2 to 4 weeks to complete.
*   **Variability:** The delivery time can vary depending on the complexity of the app, the development team\'s workload, and any additional features or integrations.
*   **Factors:** Factors that can affect delivery time include app design, development, testing, and deployment.

*Source: Inferred from general platform knowledge and industry standards.*`;
    } else if (question === "How do successful Fiverr sellers structure their gig descriptions and images?") {
      formattedResult = `
**Structure of Gig Descriptions and Images on Fiverr:**

*   **Title:** The title should be clear, concise, and include keywords related to the gig.
*   **Description:** The description should be detailed, highlighting the key features and benefits of the gig.
*   **Images:** The images should be high-quality, professional, and relevant to the gig.
*   **Video:** The video should be clear, concise, and highlight the key features and benefits of the gig.
*   **Pricing:** The pricing should be competitive and reasonable.
*   **Reviews:** The reviews should be positive and genuine.
*   **Ratings:** The ratings should be high and consistent.

*Source: Inferred from general platform knowledge and successful seller practices.*`;
    }
    // TODO: Add specific result handling for other questions here if needed
    // ---

    setResearchResult(formattedResult); // Set the static content
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/gigs" className="text-blue-400 hover:text-blue-300 flex items-center gap-2">
          <span>←</span> Back to Gigs Hub
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">Gigs Research</h1>
      <p className="text-gray-400 mb-8">Research and analysis for freelance gig opportunities.</p>
      
      <div className="space-y-6">
        <div className="p-6 border border-gray-700 rounded-lg bg-gray-850">
          <h2 className="text-xl font-semibold mb-4 text-sky-400">Research Overview</h2>
          <p className="text-gray-300 mb-4">
            This page contains personalized research content for admin@b0ase.com.
          </p>
          {/* Add more research content as needed */}
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Fiverr & Market Research</h3>
          <p className="text-gray-400 mb-2">Use the buttons below to view static research summaries or paste findings into the text area.</p> 
          
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-3">Quick Research Questions:</h4>
            <div className="flex flex-wrap gap-2">
              {researchQuestions.map((q, index) => (
                <button
                  key={index}
                  onClick={() => handleResearchClick(q)}
                  className={`px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-md text-sm transition-colors`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {currentResearchQuery && (
            <div className="mb-6 p-4 bg-gray-850 border border-gray-700 rounded">
              <p className="text-sm text-gray-400 mb-2">Showing results for:</p>
              <p className="font-medium mb-3">{currentResearchQuery}</p>
              
              {researchResult && (
                <div className="text-sm text-gray-300 whitespace-pre-wrap">
                  {researchResult}
                </div>
              )}
            </div>
          )}

          <h4 className="text-lg font-medium mb-3">Manual Research Notes:</h4>
          <textarea 
            className="w-full h-60 p-3 bg-gray-800 border border-gray-700 rounded text-sm"
            placeholder="Paste research findings, competitor links, keyword ideas, etc. here..."
            value={researchNotes}
            onChange={(e) => setResearchNotes(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
} 