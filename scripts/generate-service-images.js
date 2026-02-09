// Add dotenv configuration to load environment variables from .env file
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuration for image generation
const STABILITY_AI_API = process.env.STABILITY_AI_API; // Correct environment variable name
const STABILITY_API_URL = 'https://api.stability.ai/v1/generation/stable-diffusion-v1-6/text-to-image';

// Delete existing images to force regeneration
function deleteExistingImages() {
  console.log('Deleting existing images to force regeneration...');
  projectImages.forEach(imgConfig => {
    if (fs.existsSync(imgConfig.outputPath)) {
      try {
        fs.unlinkSync(imgConfig.outputPath);
        console.log(`Deleted existing image: ${imgConfig.outputPath}`);
      } catch (err) {
        console.error(`Failed to delete file ${imgConfig.outputPath}: ${err.message}`);
      }
    }
  });
}

// Project image definitions
const projectImages = [
  // Web Development Projects
  {
    prompt: "Realistic professional e-commerce platform UI with dark theme, showing product catalog with high-quality product images, shopping cart, checkout flow, payment gateway integration, inventory management dashboard with sales metrics and graphs, photorealistic rendering",
    outputPath: 'public/images/services/web-development/ecommerce-platform.png',
    serviceName: 'Web Development',
    projectName: 'E-commerce Platform',
    projectId: 'ecommerce-platform'
  },
  {
    prompt: "Realistic corporate web portal interface with secure login screen, document management system with file browser, team collaboration tools, notification center, and user profiles, dark professional theme with blue accents, photorealistic rendering",
    outputPath: 'public/images/services/web-development/corporate-portal.png',
    serviceName: 'Web Development',
    projectName: 'Corporate Web Portal',
    projectId: 'corporate-portal'
  },
  {
    prompt: "Realistic progressive web app interface showing multiple device screens (smartphone, tablet, laptop) with offline functionality indicators, data synchronization status bars, responsive design elements that adapt to different screen sizes, photorealistic rendering",
    outputPath: 'public/images/services/web-development/progressive-app.png',
    serviceName: 'Web Development',
    projectName: 'Progressive Web App',
    projectId: 'progressive-app'
  },
  
  // Software Development Projects
  {
    prompt: "Realistic cryptocurrency trading platform dashboard with dark theme, multiple real-time price charts and candlestick graphs, order book display, trading pair selection, advanced order type controls, live market data ticker, wallet balance overview, photorealistic rendering",
    outputPath: 'public/images/services/software-development/crypto-trading.png',
    serviceName: 'Software Development',
    projectName: 'Crypto Trading Platform',
    projectId: 'crypto-trading'
  },
  {
    prompt: "Realistic smart contract audit tool interface showing code analysis panel with highlighted vulnerabilities, security validation across multiple blockchain networks, technical metrics dashboard, risk assessment report, detailed code scanning results with severity levels, photorealistic rendering",
    outputPath: 'public/images/services/software-development/smart-contract-audit.png',
    serviceName: 'Software Development',
    projectName: 'Smart Contract Audit Tool',
    projectId: 'smart-contract-audit'
  },
  {
    prompt: "Realistic AI-powered analytics dashboard with machine learning insights, data visualization panels showing predictive trends with colorful graphs, business intelligence metrics, actionable insight recommendations highlighted in a sidebar, real-time data processing indicators, photorealistic rendering",
    outputPath: 'public/images/services/software-development/ai-analytics.png',
    serviceName: 'Software Development',
    projectName: 'AI-Powered Analytics Dashboard',
    projectId: 'ai-analytics'
  },
  
  // Content Copywriting Projects
  {
    prompt: "Realistic tech industry whitepaper page layout with blockchain technology analysis, executive summary section with elegant typography, professional document design with branded elements, data visualization charts, technical diagrams explaining complex concepts, table of contents, photorealistic rendering",
    outputPath: 'public/images/services/content-copywriting/tech-whitepaper.png',
    serviceName: 'Content Copywriting',
    projectName: 'Tech Industry Whitepaper',
    projectId: 'tech-whitepaper'
  },
  {
    prompt: "Realistic luxury e-commerce product description page layout showing premium product presentation with professional photography, compelling marketing copy with elegant typography, persuasive text layout highlighting features and benefits, price and purchase options, customer reviews section, photorealistic rendering",
    outputPath: 'public/images/services/content-copywriting/product-descriptions.png',
    serviceName: 'Content Copywriting',
    projectName: 'E-commerce Product Descriptions',
    projectId: 'product-descriptions'
  },
  {
    prompt: "Realistic finance blog series webpage layout showing educational articles on personal finance, professional financial content with clear section headings, engaging visuals including charts and infographics, newsletter signup form, featured posts sidebar, structured information hierarchy, photorealistic rendering",
    outputPath: 'public/images/services/content-copywriting/finance-blog.png',
    serviceName: 'Content Copywriting',
    projectName: 'Finance Blog Series',
    projectId: 'finance-blog'
  },

  // Web Design Projects (New) - Assuming a general showcase image
  {
    prompt: "Collage of stunning website designs for various industries (e-commerce, corporate, portfolio), showcasing modern UI/UX, responsive layouts, and creative branding, photorealistic rendering",
    outputPath: 'public/images/services/web-design/showcase-collage.png',
    serviceName: 'Web Design',
    projectName: 'Website Design Showcase',
    projectId: 'showcase-collage'
  },
  
  // Video Production Projects (New)
  {
    prompt: "Dynamic product launch video still frame, cinematic style, high-energy visuals, clear product focus, professional lighting and composition, suitable for online marketing, photorealistic rendering",
    outputPath: 'public/images/services/video-production/product-launch-video.png',
    serviceName: 'Video Production',
    projectName: 'Product Launch Video',
    projectId: 'product-launch-video'
  },
  {
    prompt: "Professional corporate brand photography setup, showing a photography studio with lighting equipment, a model posing for a headshot, and a backdrop, capturing a sense of professionalism and quality, photorealistic rendering",
    outputPath: 'public/images/services/video-production/corporate-brand-photo.png',
    serviceName: 'Video Production',
    projectName: 'Corporate Brand Photography',
    projectId: 'corporate-brand-photo'
  },
  {
    prompt: "Event highlight reel still frame, capturing the energy of a conference with attendees networking, a speaker on stage, and dynamic visuals, suitable for social media promotion, photorealistic rendering",
    outputPath: 'public/images/services/video-production/event-highlight-reel.png',
    serviceName: 'Video Production',
    projectName: 'Event Highlight Reel',
    projectId: 'event-highlight-reel'
  },

  // Logo & Branding Projects (New)
  {
    prompt: "Modern tech startup logo and branding guide presentation, showcasing a sleek logo design, color palette, typography, and mockups of the brand on various digital and print assets, photorealistic rendering",
    outputPath: 'public/images/services/logo-branding/tech-startup-rebrand.png',
    serviceName: 'Logo Branding',
    projectName: 'Tech Startup Rebrand',
    projectId: 'tech-startup-rebrand'
  },
  {
    prompt: "Luxurious product branding and packaging design for a high-end consumer good, featuring an elegant logo, premium materials, and sophisticated visual elements, photorealistic rendering",
    outputPath: 'public/images/services/logo-branding/luxury-product-branding.png',
    serviceName: 'Logo Branding',
    projectName: 'Luxury Product Branding',
    projectId: 'luxury-product-branding'
  },
  {
    prompt: "Impactful visual identity for a nonprofit organization, showcasing an accessible logo, a warm color scheme, and mockups of branding on community outreach materials, photorealistic rendering",
    outputPath: 'public/images/services/logo-branding/nonprofit-visual-identity.png',
    serviceName: 'Logo Branding',
    projectName: 'Nonprofit Visual Identity',
    projectId: 'nonprofit-visual-identity'
  },

  // SEO & Digital Marketing Projects (New)
  {
    prompt: "Dashboard showing significant e-commerce traffic growth graph with upward trend, highlighting increased organic traffic and conversion rates, alongside relevant SEO keywords and metrics, photorealistic rendering",
    outputPath: 'public/images/services/seo-marketing/ecommerce-traffic-growth.png',
    serviceName: 'SEO Marketing',
    projectName: 'E-commerce Traffic Growth',
    projectId: 'ecommerce-traffic-growth'
  },
  {
    prompt: "SaaS lead generation funnel visualization, showing stages from awareness to conversion, with metrics indicating a high increase in qualified leads for a B2B software provider, professional and clean design, photorealistic rendering",
    outputPath: 'public/images/services/seo-marketing/saas-lead-generation.png',
    serviceName: 'SEO Marketing',
    projectName: 'SaaS Lead Generation',
    projectId: 'saas-lead-generation'
  },
  {
    prompt: "Local business SEO results display, showing a map with a business ranking in the top 3 for local search queries, alongside positive customer reviews and Google My Business profile elements, photorealistic rendering",
    outputPath: 'public/images/services/seo-marketing/local-business-seo.png',
    serviceName: 'SEO Marketing',
    projectName: 'Local Business SEO',
    projectId: 'local-business-seo'
  },

  // Social Media Management Projects (New)
  {
    prompt: "Vibrant Instagram grid layout for a retail brand, showcasing significant follower growth and high engagement rates on visually appealing posts, with analytics overlay, photorealistic rendering",
    outputPath: 'public/images/services/social-media-management/retail-brand-growth.png',
    serviceName: 'Social Media Management',
    projectName: 'Retail Brand Growth',
    projectId: 'retail-brand-growth'
  },
  {
    prompt: "Professional LinkedIn article and profile mockup for a B2B SaaS company, highlighting thought leadership content, increased lead generation form, and industry engagement, photorealistic rendering",
    outputPath: 'public/images/services/social-media-management/b2b-thought-leadership.png',
    serviceName: 'Social Media Management',
    projectName: 'B2B Thought Leadership',
    projectId: 'b2b-thought-leadership'
  },
  {
    prompt: "Collage of diverse social media posts (Twitter, Facebook, Instagram) for a tech startup, showing community building efforts, high engagement metrics, and a growing follower count, photorealistic rendering",
    outputPath: 'public/images/services/social-media-management/startup-community-building.png',
    serviceName: 'Social Media Management',
    projectName: 'Startup Community Building',
    projectId: 'startup-community-building'
  },

  // Technical Consulting Projects (New)
  {
    prompt: "Architectural diagram illustrating a scalable fintech startup technology stack, showcasing microservices, databases, cloud infrastructure, and API integrations, clean and professional design, photorealistic rendering",
    outputPath: 'public/images/services/technical-consulting/startup-tech-stack.png',
    serviceName: 'Technical Consulting',
    projectName: 'Startup Technology Stack',
    projectId: 'startup-tech-stack'
  },
  {
    prompt: "Comparison graphic showing a complex legacy enterprise system transforming into a modernized, streamlined cloud-based architecture, highlighting cost reduction, performance improvement, and enhanced reliability, photorealistic rendering",
    outputPath: 'public/images/services/technical-consulting/enterprise-architecture-overhaul.png',
    serviceName: 'Technical Consulting',
    projectName: 'Enterprise Architecture Overhaul',
    projectId: 'enterprise-architecture-overhaul'
  },
  {
    prompt: "Visual representation of a blockchain integration strategy for a supply chain company, depicting secure and transparent product tracking from origin to consumer, with data flows and key technology components, photorealistic rendering",
    outputPath: 'public/images/services/technical-consulting/blockchain-integration-strategy.png',
    serviceName: 'Technical Consulting',
    projectName: 'Blockchain Integration Strategy',
    projectId: 'blockchain-integration-strategy'
  }
];

// Function to ensure directory exists
function ensureDirectoryExists(filePath) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

// Function to generate an image using Stability AI
async function generateImage(prompt, outputPath) {
  if (!STABILITY_AI_API) {
    console.error('STABILITY_AI_API is not set. Please set it in your environment variables.');
    return false;
  }

  try {
    console.log(`Generating image for: ${prompt}`);
    
    const response = await axios.post(
      STABILITY_API_URL,
      {
        text_prompts: [
          {
            text: prompt,
            weight: 1
          }
        ],
        cfg_scale: 12, // Increased from 7 to 12 for better prompt adherence
        height: 512,
        width: 768,
        samples: 1,
        steps: 40, // Increased from 30 to 40 for more detailed images
        style_preset: "photographic" // Changed from "digital-art" to "photographic"
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${STABILITY_AI_API}`
        }
      }
    );

    // Check if we have artifacts in the response
    if (response.data && response.data.artifacts && response.data.artifacts.length > 0) {
      // Get the base64 image data from the first artifact
      const base64Image = response.data.artifacts[0].base64;
      
      if (!base64Image) {
        console.error('No base64 image data found in the response');
        return false;
      }
      
      // Convert base64 to binary
      const imageBuffer = Buffer.from(base64Image, 'base64');
      
      // Ensure the directory exists
      ensureDirectoryExists(outputPath);
      
      // Save the image
      fs.writeFileSync(outputPath, imageBuffer);
      console.log(`Image saved to ${outputPath}`);
      return true;
    } else {
      console.error('No artifacts found in the API response');
      console.error('Response:', JSON.stringify(response.data, null, 2));
      return false;
    }
  } catch (error) {
    console.error(`Error generating image: ${error.message}`);
    if (error.response) {
      console.error(`Status code: ${error.response.status}`);
      try {
        const responseData = error.response.data.toString();
        console.error(`Response data: ${responseData}`);
      } catch (e) {
        console.error('Could not convert response data to string');
      }
    }
    return false;
  }
}

// Main function to generate all images
async function generateAllImages() {
  console.log('Starting image generation process...');
  
  // Delete existing images first to force regeneration
  deleteExistingImages();
  
  for (const imgConfig of projectImages) {
    console.log(`\nProcessing: ${imgConfig.serviceName} - ${imgConfig.projectName}`);
    await generateImage(imgConfig.prompt, imgConfig.outputPath);
  }
  
  console.log('\nImage generation process completed!');
}

// Run the script
generateAllImages().catch(error => {
  console.error('An error occurred during image generation:', error);
});