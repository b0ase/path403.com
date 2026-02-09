/**
 * Canonical Single Source of Truth for All Social Media Links
 *
 * This file contains all social media links for b0ase.com and its projects.
 * Import and use these links throughout the application to ensure consistency.
 *
 * Last Updated: 2026-01-28
 */

// Main b0ase.com Social Links
export const b0aseSocialLinks = {
  twitter: 'https://x.com/b0ase',
  telegram: 'https://t.me/b0ase_com',
  discord: 'https://discord.gg/gbTG9BcM',
  github: 'https://github.com/b0ase',
  linkedin: 'https://www.linkedin.com/in/richardboase/',
  youtube: 'https://youtube.com/@BO4SE',
};

// Founder: Richard Boase
export const richardBoaseSocialLinks = {
  twitter: 'https://x.com/richardboase',
  linkedin: 'https://www.linkedin.com/in/richardboase/',
  github: 'https://github.com/b0ase',
};

// Project Social Links
export const projectSocialLinks = {
  bitcoinWriter: {
    twitter: 'https://x.com/bitcoin_writer',
    github: 'https://github.com/b0ase/bitcoin-writer',
  },
  bitcoinCorp: {
    twitter: 'https://x.com/Bitcoin_Corp_X',
    github: 'https://github.com/b0ase/bitcoin-corp',
  },
  bitcoinEmail: {
    twitter: 'https://x.com/bitcoin-email',
    github: 'https://github.com/b0ase/bitcoin-email',
  },
  bitcoinOS: {
    twitter: 'https://x.com/bitcoin-os',
    github: 'https://github.com/b0ase/bitcoin-os',
  },
  bitcoinDrive: {
    twitter: 'https://x.com/BitcoinDrive',
    github: 'https://github.com/b0ase/bitcoin-drive',
  },
  bitcoinSheets: {
    twitter: 'https://x.com/BitcoinSheets',
    github: 'https://github.com/b0ase/bitcoin-spreadsheet',
  },
  bitcoinMusic: {
    twitter: 'https://x.com/bitcoinmusic',
    github: 'https://github.com/b0ase/bitcoin-music',
  },
  bitcoinApps: {
    twitter: 'https://x.com/bapps',
    github: 'https://github.com/b0ase/bitcoin-apps',
  },
  bitcoinFileUtility: {
    twitter: 'https://x.com/BTCFileUtility',
    github: 'https://github.com/b0ase/bitcoin-file-utility',
  },
  ninjaPunkGirls: {
    twitter: 'https://x.com/NinjaPunkGirls',
    github: 'https://github.com/b0ase/npg-red',
  },
  repositoryTokenizer: {
    twitter: 'https://x.com/RepoTokenizer',
    github: 'https://github.com/b0ase/repository-tokenizer',
  },
  aiGirlFriends: {
    github: 'https://github.com/b0ase/aigirlfriends',
  },
  dnsDex: {
    twitter: 'https://x.com/dnsdex',
    github: 'https://github.com/b0ase/dnsdex',
  },
  moneyButton: {
    github: 'https://github.com/b0ase/moneybutton2',
  },
  kintsugi: {
    github: 'https://github.com/b0ase/kintsugi',
  },
} as const;

// Community Links
export const communitySocialLinks = {
  bitcoinSVDevs: {
    telegram: 'https://t.me/bitcoinsvdevs',
  },
  bsvCommunity: {
    discord: 'https://discord.gg/bsv',
  },
};

// Type-safe helper function to get project social links
export function getProjectSocialLinks(projectSlug: string) {
  // Convert slug to camelCase and look up in projectSocialLinks
  const camelCaseSlug = projectSlug
    .split('-')
    .map((word, index) => {
      if (index === 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join('');

  return (projectSocialLinks as any)[camelCaseSlug] || {
    github: `https://github.com/b0ase/${projectSlug}`,
  };
}

// Utility function to get social link by name and platform
export function getSocialLink(
  account: 'b0ase' | 'richard' | string,
  platform: 'twitter' | 'telegram' | 'discord' | 'github' | 'linkedin' | 'youtube'
): string | null {
  const links = {
    b0ase: b0aseSocialLinks,
    richard: richardBoaseSocialLinks,
  } as any;

  const accountLinks = links[account];
  return accountLinks?.[platform] || null;
}
