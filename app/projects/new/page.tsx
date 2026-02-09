'use client';

import React, { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { FaRocket, FaSave, FaSpinner, FaGithub, FaTwitter, FaTiktok, FaInstagram, FaDiscord, FaTelegramPlane, FaFacebook, FaLinkedin, FaUsers, FaCoins, FaUserSecret, FaGlobe } from 'react-icons/fa';
import { useTheme } from 'next-themes';

// Interface for the form data
interface NewProjectData {
  name: string; // Project Idea
  project_brief: string; // What is your big idea?
  what_to_build: string;
  desired_domain_name: string;
  website_url: string;
  logo_url: string;
  requested_budget: string | number;
  project_type: string;
  socialLinks: { [key: string]: string }; // New: For all social media links
  inspiration_links: string;
  how_heard: string;
  addProjectTeam: boolean; // New
  addProjectToken: boolean; // New
  addProjectAgent: boolean; // New: For creating an agent
  addProjectWebsite: boolean; // New: For creating a website
}

// Interface for data from localStorage
interface PendingProjectData {
  name?: string;
  project_brief?: string;
  website?: string;
  logo_url?: string;
  requested_budget?: string | number;
  project_types?: string[]; // Kept for backward compatibility with old localStorage
  socials?: string; // Kept for backward compatibility
  github_links?: string; // Kept for backward compatibility
  inspiration_links?: string;
  how_heard?: string;
}

const socialPlatforms = [
  { name: 'GitHub', key: 'github', icon: FaGithub, placeholder: 'https://github.com/yourproject' },
  { name: 'Twitter', key: 'x', icon: FaTwitter, placeholder: 'https://x.com/yourprofile' },
  { name: 'TikTok', key: 'tiktok', icon: FaTiktok, placeholder: 'https://tiktok.com/@yourprofile' },
  { name: 'Instagram', key: 'instagram', icon: FaInstagram, placeholder: 'https://instagram.com/yourprofile' },
  { name: 'Discord', key: 'discord', icon: FaDiscord, placeholder: 'https://discord.gg/yourserver or YourName#1234' },
  { name: 'Telegram', key: 'telegram', icon: FaTelegramPlane, placeholder: 'https://t.me/yourchannel or @yourusername' },
  { name: 'Facebook', key: 'facebook', icon: FaFacebook, placeholder: 'https://facebook.com/yourpage' },
  { name: 'LinkedIn', key: 'linkedin', icon: FaLinkedin, placeholder: 'https://linkedin.com/in/yourprofile' }
];

export default function NewProjectPage() {
  const supabase = createClient();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState<NewProjectData>({
    name: '',
    project_brief: '',
    what_to_build: '',
    desired_domain_name: '',
    website_url: '',
    logo_url: '',
    requested_budget: '',
    project_type: '',
    socialLinks: {}, // Initialized
    inspiration_links: '',
    how_heard: '',
    addProjectTeam: true, // Changed to true
    addProjectToken: true, // Changed to true
    addProjectAgent: true, // New: Default to true
    addProjectWebsite: true, // New: Default to true
  });
  const [visibleSocialInputs, setVisibleSocialInputs] = useState<{ [key: string]: boolean }>({});
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      setLoadingUser(true);

      // Add retry logic for session establishment after OAuth
      const maxRetries = 5;
      let retryCount = 0;

      while (retryCount < maxRetries) {
        try {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            console.log('[NewProject] User authenticated successfully:', authUser.email);
            setUser(authUser);
            setLoadingUser(false);
            return;
          }

          // If no user and this is a signup redirect, wait and retry
          const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
          const source = urlParams.get('source');

          if (source === 'signup' && retryCount < maxRetries - 1) {
            console.log(`[NewProject] Waiting for session establishment, retry ${retryCount + 1}/${maxRetries}`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            retryCount++;
            continue;
          }

          // No user found after retries
          break;
        } catch (error) {
          console.error('[NewProject] Error fetching user:', error);
          break;
        }
      }

      // If we get here, no user was found
      console.log('[NewProject] No authenticated user found, redirecting to login');
      router.push('/login?message=Please login to create a new project&next=/projects/new');
      setLoadingUser(false);
    };

    fetchUser();
  }, [supabase, router]);

  useEffect(() => {
    if (user) {
      try {
        const pendingDataString = localStorage.getItem('pendingProjectData');
        const templateDataString = localStorage.getItem('selectedProjectTemplate');

        if (pendingDataString || templateDataString) {
          let formData = { ...form };
          let shouldAutoSubmit = false;

          // Handle signup data
          if (pendingDataString) {
            const pendingData: PendingProjectData = JSON.parse(pendingDataString);
            const initialSocialLinks: { [key: string]: string } = {};

            // Map old social fields to new socialLinks object
            if (pendingData.github_links) initialSocialLinks.github = pendingData.github_links;
            if (pendingData.socials) initialSocialLinks.instagram = pendingData.socials;
            if (pendingData.inspiration_links) initialSocialLinks.behance = pendingData.inspiration_links;

            formData = {
              ...formData,
              name: pendingData.name || 'My Project',
              project_brief: pendingData.project_brief || '',
              website_url: pendingData.website || '',
              logo_url: pendingData.logo_url || '',
              requested_budget: pendingData.requested_budget || '',
              project_type: (pendingData.project_types && pendingData.project_types.length > 0) ? pendingData.project_types[0] : 'Website',
              socialLinks: initialSocialLinks,
              inspiration_links: pendingData.inspiration_links || '',
              how_heard: pendingData.how_heard || '',
            };
            shouldAutoSubmit = true;
          }

          // Handle template data
          if (templateDataString) {
            const templateData = JSON.parse(templateDataString);
            formData = {
              ...formData,
              name: templateData.name || formData.name,
              project_brief: templateData.description || formData.project_brief,
              project_type: templateData.category || formData.project_type,
              requested_budget: templateData.price || formData.requested_budget,
              what_to_build: templateData.title || formData.what_to_build,
              // Set template-specific flags
              addProjectTeam: templateData.needsTeam !== false,
              addProjectToken: templateData.needsToken !== false,
              addProjectAgent: templateData.needsAgent !== false,
              addProjectWebsite: templateData.needsWebsite !== false,
            };
            shouldAutoSubmit = true;
          }

          // Update form state
          setForm(formData);

          // Auto-submit if we have valid data
          if (shouldAutoSubmit && formData.name && formData.name.trim()) {
            console.log('[NewProject] Auto-submitting project with data:', formData);
            setTimeout(() => {
              handleAutoSubmit(formData);
            }, 1000); // Small delay to ensure form is fully rendered
          }
        }
      } catch (error) {
        console.error('[NewProject] Error processing pending data:', error);
      }
    }
  }, [user]); // Removed form and handleAutoSubmit to avoid infinite loop

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSocialLinkChange = (platformKey: string, value: string) => {
    setForm(prevForm => ({
      ...prevForm,
      socialLinks: {
        ...prevForm.socialLinks,
        [platformKey]: value,
      },
    }));
  };

  const toggleSocialInput = (platformKey: string) => {
    setVisibleSocialInputs(prev => ({ ...prev, [platformKey]: !prev[platformKey] }));
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // remove non-word [a-zA-Z0-9_], non-whitespace, non-hyphen characters
      .replace(/\s+/g, '-') // Gg.
      .replace(/--+/g, '-') // replace multiple hyphens with a single hyphen
      .replace(/^-+|-+$/g, ''); // remove leading/trailing hyphens
  };

  const generateTicker = (projectName: string): string => {
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'on', 'for', 'with']);
    const words = projectName.toLowerCase().split(/\s+/).filter(word => word.length > 0 && !commonWords.has(word));
    let ticker = '';
    if (words.length === 0 && projectName.length > 0) { // Handle empty after filter or single non-word string
      ticker = projectName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 5);
    } else if (words.length === 1) {
      ticker = words[0].replace(/[^a-zA-Z0-9]/g, '').substring(0, 5);
    } else {
      for (const word of words) {
        if (ticker.length < 5 && word.length > 0) {
          ticker += word.charAt(0);
        }
        if (ticker.length === 5) break;
      }
      // If not enough from first letters, take from start of first significant word
      if (ticker.length < 5 && words.length > 0) {
        ticker = (ticker + words[0].substring(1)).replace(/[^a-zA-Z0-9]/g, '');
        ticker = ticker.substring(0, 5);
      }
    }
    // Pad if shorter than 5 chars, then uppercase and prefix with $
    return '$' + ticker.padEnd(5, 'X').substring(0, 5).toUpperCase();
  };

  const handleAutoSubmit = async (formData: NewProjectData) => {
    if (!user) {
      setError('You must be logged in to create a project.');
      return;
    }
    if (!formData.name.trim()) {
      setError('Project name is required.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/projects/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(`${result.error}${result.details ? `: ${result.details}` : ''}` || 'Failed to create project. Please try again.');
      }

      // Clear localStorage after successful project creation
      localStorage.removeItem('pendingProjectData');
      localStorage.removeItem('selectedProjectTemplate');

      setSuccessMessage(result.message || 'Project created successfully!');

      // Redirect to the new project page
      if (result.project && result.project.slug) {
        router.push(`/projects/${result.project.slug}`);
      } else {
        router.push('/projects');
      }

    } catch (submissionError: any) {
      console.error('Auto-submission error:', submissionError);
      setError(submissionError.message || 'An unexpected error occurred during project creation.');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await handleAutoSubmit(form);
  };

  if (loadingUser) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <FaSpinner className="animate-spin text-4xl mb-4" />
        <p className="text-xl">Loading user information...</p>
        <p className={`text-sm mt-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
          {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('source') === 'signup'
            ? 'Setting up your account after signup...'
            : typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('source') === 'template'
              ? 'Preparing your selected template...'
              : 'Verifying your authentication...'}
        </p>
      </div>
    );
  }

  if (saving) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <FaSpinner className="animate-spin text-4xl mb-4" />
        <p className="text-xl">Creating your project...</p>
        <p className={`text-sm mt-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
          This may take a moment as we set up your workspace, team, and resources.
        </p>
      </div>
    );
  }

  const projectTypeOptions = [
    "Website", "Mobile App", "E-Commerce Store", "SaaS Platform", "API Development",
    "Brand Design", "UI/UX", "Video", "Motion Graphics", "3D Design",
    "AI/ML", "Blockchain", "Web3", "Consulting", "DevOps", "Other Idea"
  ];

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div>

          {/* Header section with title and sticky button */}
          <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-6">
            <div className="text-left w-full md:w-3/4">
              <h1 className="text-3xl font-bold uppercase tracking-wide mb-4">Start a Project</h1>
              <div className={`space-y-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <p>
                  Launch a project, form a team with integrated chat, and issue a token.
                </p>
                <p>
                  Team contributions are rewarded with tokens, which can represent direct equity and potentially convert to shares if your project incorporates.
                </p>
              </div>
              <div className={`mt-6 p-4 border ${isDark ? 'border-white/20 bg-white/5' : 'border-black/20 bg-black/5'}`}>
                <p className={`text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <strong>Need professional development services?</strong> We offer full-stack development, design, and consulting.
                </p>
                <a
                  href="/services"
                  className={`inline-flex items-center text-sm font-bold hover:underline ${isDark ? 'text-white' : 'text-black'}`}
                >
                  View Our Services →
                </a>
              </div>
            </div>
            {/* Sticky Create Button */}
            <div className="z-20 self-start md:ml-4 flex-shrink-0 md:sticky" style={{ top: '1.5rem' }}>
              <button
                type="button"
                onClick={() => (document.getElementById('project-creation-form') as HTMLFormElement)?.requestSubmit()}
                disabled={saving || loadingUser || !user || !form.name}
                className={`w-full md:w-auto inline-flex items-center justify-center px-6 py-3 text-sm font-bold uppercase tracking-wide transition-all disabled:opacity-60 disabled:cursor-not-allowed ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
              >
                {saving ? <FaSpinner className="animate-spin mr-2.5 h-4 w-4" /> : <FaSave className="mr-2.5 h-4 w-4" />}
                {saving ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 border border-red-500/30 bg-red-500/10 p-3 mb-6 text-sm">{error}</p>}
          {successMessage && !error && <p className="text-green-500 border border-green-500/30 bg-green-500/10 p-3 mb-6 text-sm">{successMessage}</p>}

          <form onSubmit={handleSubmit} id="project-creation-form">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-8">
              {/* Left Column: Main project details */}
              <div className="lg:col-span-2 space-y-8">
                {/* Options Checkboxes */}
                <div className={`pb-4 border-b ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                  <div className="flex flex-wrap items-start gap-x-6 gap-y-4">
                    {/* Team Checkbox */}
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        name="addProjectTeam"
                        checked={form.addProjectTeam}
                        onChange={handleChange}
                        className="w-4 h-4 accent-current"
                      />
                      <FaUsers className="w-4 h-4" /> Team
                    </label>
                    {/* Token Checkbox */}
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        name="addProjectToken"
                        checked={form.addProjectToken}
                        onChange={handleChange}
                        className="w-4 h-4 accent-current"
                      />
                      <FaCoins className="w-4 h-4" /> Token
                    </label>
                    {/* Agent Checkbox */}
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        name="addProjectAgent"
                        checked={form.addProjectAgent}
                        onChange={handleChange}
                        className="w-4 h-4 accent-current"
                      />
                      <FaUserSecret className="w-4 h-4" /> Agent
                    </label>
                    {/* Website Checkbox */}
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        name="addProjectWebsite"
                        checked={form.addProjectWebsite}
                        onChange={handleChange}
                        className="w-4 h-4 accent-current"
                      />
                      <FaGlobe className="w-4 h-4" /> Website
                    </label>
                  </div>
                </div>

                <div>
                  <label htmlFor="name" className={`block text-xs font-bold uppercase tracking-wide mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Project Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text" name="name" id="name" required value={form.name} onChange={handleChange}
                    placeholder="e.g., An AI for custom meal plans"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
                <div>
                  <label htmlFor="project_brief" className={`block text-xs font-bold uppercase tracking-wide mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Brief Description
                  </label>
                  <textarea
                    name="project_brief" id="project_brief" value={form.project_brief} onChange={handleChange}
                    rows={3} placeholder="What is your big idea and what problem does it solve?"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
                <div>
                  <label htmlFor="what_to_build" className={`block text-xs font-bold uppercase tracking-wide mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    What to Build
                  </label>
                  <textarea
                    name="what_to_build" id="what_to_build" value={form.what_to_build} onChange={handleChange}
                    rows={5} placeholder="Describe core features, target users, and the problem it solves..."
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
                <div>
                  <label htmlFor="desired_domain_name" className="block text-sm font-medium text-gray-300 mb-1.5">What is your desired Domain Name? (Optional)</label>
                  <input
                    type="text" name="desired_domain_name" id="desired_domain_name" value={form.desired_domain_name} onChange={handleChange}
                    placeholder="e.g., myawesomeidea.com"
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
                <div>
                  <label htmlFor="project_type" className="block text-sm font-medium text-gray-300 mb-1.5">Project Type:</label>
                  <select
                    name="project_type" id="project_type" value={form.project_type} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  >
                    <option value="">Select a type...</option>
                    {projectTypeOptions.map(type => (<option key={type} value={type}>{type}</option>))}
                  </select>
                </div>
                <div>
                  <label htmlFor="website_url" className="block text-sm font-medium text-gray-300 mb-1.5">Current Website URL (if any)</label>
                  <input
                    type="url" name="website_url" id="website_url" value={form.website_url} onChange={handleChange}
                    placeholder="https://example.com"
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
                <div>
                  <label htmlFor="logo_url" className="block text-sm font-medium text-gray-300 mb-1.5">Logo URL (if you have one hosted)</label>
                  <input
                    type="url" name="logo_url" id="logo_url" value={form.logo_url} onChange={handleChange}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                  {form.logo_url && <img src={form.logo_url} alt="Logo Preview" className="mt-3 h-16 w-auto object-contain bg-gray-700 p-1 rounded shadow" />}
                </div>
                <div>
                  <label htmlFor="requested_budget" className="block text-sm font-medium text-gray-300 mb-1.5">What's your estimated budget to bring this idea to life? (Optional - helps gauge project scale)</label>
                  <input
                    type="number" name="requested_budget" id="requested_budget" value={form.requested_budget} onChange={handleChange}
                    placeholder="e.g., 10000 (numeric value, e.g., USD)"
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
                <div className="space-y-4 pt-4 border-t border-gray-800">
                  <h3 className="text-md font-medium text-gray-300">Additional Information</h3>
                  <div>
                    <label htmlFor="inspiration_links" className="block text-sm font-medium text-gray-300 mb-1.5">Inspiration Links (sites, apps, designs - one per line)</label>
                    <textarea name="inspiration_links" id="inspiration_links" value={form.inspiration_links} onChange={handleChange} rows={3} placeholder="e.g., https://inspiration1.com\nhttps://inspiration2.com" className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
                  </div>
                  <div>
                    <label htmlFor="how_heard" className="block text-sm font-medium text-gray-300 mb-1.5">How did you hear about us? (Optional)</label>
                    <input
                      type="text" name="how_heard" id="how_heard" value={form.how_heard} onChange={handleChange}
                      placeholder="e.g., Google Search, Friend, Social Media"
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Socials and Extras */}
              <div className="lg:col-span-1 space-y-8">
                <div className="space-y-4 pb-4 border-b border-gray-800">
                  <h3 className="text-md font-medium text-gray-300">Connect Social Profiles</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {socialPlatforms.map((platform) => (
                      <div key={platform.key}>
                        <button
                          type="button"
                          onClick={() => toggleSocialInput(platform.key)}
                          className={`w-full inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md transition-colors
                            ${visibleSocialInputs[platform.key]
                              ? 'bg-sky-700 text-white border-sky-700'
                              : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'}`}
                        >
                          {platform.key === 'x' ? (
                            <span className="mr-2 text-lg font-bold">X</span>
                          ) : (
                            <platform.icon className="w-5 h-5 mr-2" />
                          )}
                          {platform.name}
                        </button>
                        {visibleSocialInputs[platform.key] && (
                          <input
                            type="text"
                            name={`socialLinks.${platform.key}`}
                            value={form.socialLinks[platform.key] || ''}
                            onChange={(e) => handleSocialLinkChange(platform.key, e.target.value)}
                            placeholder={platform.placeholder}
                            className="mt-2 w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-700 flex justify-center">
              <button
                type="submit"
                disabled={saving || loadingUser || !user || !form.name}
                className={`w-full md:w-auto px-8 py-4 text-sm font-bold uppercase tracking-wide transition-all disabled:opacity-60 disabled:cursor-not-allowed ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
              >
                {saving ? <FaSpinner className="animate-spin inline mr-2" /> : <FaSave className="inline mr-2" />}
                Save New Project and Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 