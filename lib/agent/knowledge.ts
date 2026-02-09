import { portfolioData } from '@/lib/data';

export function getPortfolioKnowledge(): string {
  const { about, projects, skills, services, boaseStats, investmentPackages } = portfolioData;

  const projectList = projects.map(p =>
    `- **${p.title}** (${p.type}): ${p.description} ${p.tech ? `(Tech: ${p.tech.join(', ')})` : ''} [Status: ${p.status}]`
  ).join('\n');

  const servicesList = services.map(s =>
    `- **${s.title}**: ${s.description}`
  ).join('\n');

  const skillsList = `
  - Languages: ${skills.languages?.join(', ') || 'N/A'}
  - Frameworks: ${skills.frameworks?.join(', ') || 'N/A'}
  - Tools: ${skills.tools?.join(', ') || 'N/A'}
  `;

  const stats = `
  - Experience: ${boaseStats?.yearsExperience || '8'} years
  - Projects Shipped: ${boaseStats?.projectsLaunched || '50+'}
  - Token Price (Simulated): ${boaseStats?.tokenPrice || '$0.01'}
  `;

  const investmentPackagesList = investmentPackages ? investmentPackages.map(pkg => 
    `- **${pkg.name}** ($${pkg.price}): ${pkg.description}`
  ).join('\n') : 'No active investment packages.';

  return `
  # KNOWLEDGE BASE: b0ase.com Portfolio

  ## ABOUT
  Name: ${about.name}
  Tagline: ${about.tagline}
  Bio: ${about.bio}
  
  ## KEY STATS
  ${stats}

  ## SKILLS
  ${skillsList}

  ## SERVICES OFFERED
  ${servicesList}

  ## PROJECT PORTFOLIO
  ${projectList}

  ## INVESTMENT OPPORTUNITIES (Personal IPO)
  ${investmentPackagesList}

  ## IMPORTANT LINKS
  - GitHub: ${about.socials.github}
  - LinkedIn: ${about.socials.linkedin}
  - X (Twitter): ${about.socials.x}
  - $BOASE Token: ${about.token.marketLink}
  `;
}
