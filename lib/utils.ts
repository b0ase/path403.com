import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Project } from "./data"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Universal project sorting logic:
 * 1. AI projects first (identified by "AI" in title or tech stack)
 * 2. Alphabetical by title
 */
export function sortProjects(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => {
    // Strict AI detection: matches "AI" as a whole word, or at start/end of string
    // e.g. "AI Agents", "Tribify AI", "OpenAI" (no), "Blockchain" (no)
    const aiRegex = /\bAI\b/i;
    
    // Check title and tech stack
    const isA_AI = aiRegex.test(a.title) || a.tech?.some(t => aiRegex.test(t));
    const isB_AI = aiRegex.test(b.title) || b.tech?.some(t => aiRegex.test(t));

    // If one is AI and the other isn't, AI goes first
    if (isA_AI && !isB_AI) return -1;
    if (!isA_AI && isB_AI) return 1;

    // Otherwise, alphabetical by title
    return a.title.localeCompare(b.title);
  });
}

