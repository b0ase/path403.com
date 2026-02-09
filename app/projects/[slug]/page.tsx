'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import ClientSignupForm from '@/components/ClientSignupForm';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGithub, FaExternalLinkAlt, FaUsers, FaEdit, FaSave, FaTimes, FaPlus, FaYoutube } from 'react-icons/fa';
import { FiActivity, FiArrowRight, FiCheck, FiClock, FiLayers, FiMessageSquare, FiExternalLink, FiPlus } from 'react-icons/fi';
import Link from 'next/link';
import { useAuth } from '@/components/Providers';
import { usePathname } from 'next/navigation';
import { pricingCategories } from '@/lib/pricing-data';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// --- DEBUG LOG: Check if env vars are loaded client-side ---
console.log('Supabase URL:', supabaseUrl ? 'Loaded' : 'MISSING!');
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Loaded' : 'MISSING!');
// -----------------------------------------------------------

const supabase = createClient();

interface Treatment {
  id: string;
  phase: 'current' | 'next' | 'ultimate';
  title: string;
  description: string;
  sort_order: number;
}

interface TimelineEntry {
  id: string;
  phase: 'now' | 'next' | 'roadmap';
  title: string;
  description: string | null;
  sort_order: number;
  is_summary: boolean;
  preview_image_url?: string | null;
  target_date?: string | null;
  status?: string | null;
  designer_notes?: string | null;
}

interface Feature {
  id: string;
  feature: string;
  priority: string;
  est_cost: number | null;
  status: string;
  approved: boolean;
  completed?: boolean;
  target_date?: string | null;
  agreement_status?: string | null;
  designer_agreed_cost?: number | null;
}

interface Feedback {
  id: string;
  email: string;
  message: string;
  created_at: string;
}

interface ManagedProject {
  id: string;
  name: string;
  // Add other relevant project fields if needed
}

interface TeamMember {
  user_id: string;
  role: string;
  email?: string; // From auth.users
  display_name?: string; // From profiles
  project_id?: string; // Added to identify the project for removal context
}

interface PlatformUser {
  id: string;
  display_name: string; // Or username, whatever is best for display
}

interface ProjectData {
  id: string;
  name: string; // Client name
  email: string; // Client email
  project_name: string; // Project name
  project_description: string | null; // Project description, allow null
  project_type: string[] | null; // Project types, allow null
  budget_tier: string | null;
  timeline_preference: string | null;
  required_integrations: string[] | null;
  design_style_preference: string | null;
  key_features: string | null;
  anything_else: string | null;
  slug: string; // Project slug
  github_repo_url: string | null; // Allow null
  preview_url: string | null; // Allow null
  website: string | null; // Project website, allow null
  preview_deployment_url: string | null; // Allow null
  video_url: string | null; // Project video URL, allow null
  user_id: string | null; // Creator user ID, allow null
  target_completion_date: string | null;
  created_at: string; // Assuming created_at is included
}

interface ClientFormData {
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  logo_url?: string;
  project_brief?: string;
  project_types?: string[];
  requested_budget?: number | string | null;
  github_links?: string | null;
  live_website_url?: string | null;
  selected_services?: string[];
}

export default function ProjectPage({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  // Unwrap params and searchParams using React.use()
  const { slug } = React.use(params);
  const resolvedSearchParams = searchParams ? React.use(searchParams) : {};
  const pathname = usePathname();
  const notionUrl = typeof resolvedSearchParams?.notionUrl === 'string' ? resolvedSearchParams.notionUrl : undefined;

  // Project video mapping - add more projects here as needed
  const projectVideos: { [key: string]: { video: string; poster: string } } = {
    'minecraftparty-website': {
      video: '/images/clientprojects/minecraftparty-website/MINECRAFTPARTY.mp4',
      poster: '/images/slugs/minecraftparty-website.jpg'
    },
    'oneshotcomics': {
      video: '/images/clientprojects/one-shot-comics/oneshotcomics.mp4',
      poster: '/images/slugs/oneshotcomics.png'
    }
    // Add more projects here like:
    // 'another-project-slug': {
    //   video: '/images/clientprojects/another-project/video.mp4',
    //   poster: '/images/clientprojects/another-project/poster.jpg'
    // }
  };

  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [feedbackForm, setFeedbackForm] = useState({ email: '', message: '' });
  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  const [newFeatureForm, setNewFeatureForm] = useState({ name: '', priority: 'Medium' });
  const [newFeatureSuccess, setNewFeatureSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [projectMembers, setProjectMembers] = useState<{ display_name: string | null }[]>([]);

  const phases = [
    { key: 'now', label: 'LIVE' },
    { key: 'next', label: 'PREVIEW' },
    { key: 'roadmap', label: 'Roadmap (1-6 Months)' }
  ];

  const phaseLabels: { [key: string]: string } = {
    current: 'Current Focus',
    next: 'Next Up',
    ultimate: 'Ultimate State (Vision)',
  };

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setAuthUser(user);
    };
    getUser();
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Check if the slug parameter looks like a UUID
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

      let coreDataResult: { data: any | null; error: any | null };

      if (isUUID) {
        console.log(`Attempting to fetch project with ID inside fetchData: ${slug}`);
        coreDataResult = await supabase
          .from('projects')
          .select('*, clients(name, email)') // Join clients for name/email
          .eq('id', slug)
          .maybeSingle();
      } else {
        console.log(`Attempting to fetch project with slug inside fetchData: ${slug}`);
        coreDataResult = await supabase
          .from('projects')
          .select('*, clients(name, email)') // Join clients for name/email
          .eq('slug', slug)
          .maybeSingle();
      }

      const { data: rawData, error: coreError } = coreDataResult;

      console.log('Supabase core fetch result:', { rawData, coreError });

      if (coreError) {
        console.error('Supabase error fetching project:', coreError);
        setError(`Error loading project details: ${coreError.message}`);
        setLoading(false);
        return;
      }
      if (!rawData) {
        console.error('No project data returned from Supabase for slug:', slug);
        setError('Could not find project details for this slug.');
        setLoading(false);
        return;
      }

      // Map rawData (from projects table) to ProjectData interface
      // Note: rawData has projects fields. clients data is in rawData.clients
      const mappedData: ProjectData = {
        id: rawData.id,
        name: rawData.clients?.name || 'Unknown Client', // Access joined client name
        email: rawData.clients?.email || '', // Access joined client email
        project_name: rawData.name,
        project_description: rawData.description,
        project_type: null, // Mapped if available, projects table lacks this specific column currently, maybe in future
        budget_tier: rawData.budget ? rawData.budget.toString() : null,
        timeline_preference: null,
        required_integrations: null,
        design_style_preference: null,
        key_features: null,
        anything_else: null,
        slug: rawData.slug,
        github_repo_url: rawData.social_links?.github || null, // Extract from social_links JSON
        preview_url: rawData.url,
        website: rawData.url,
        preview_deployment_url: rawData.url,
        video_url: null, // Add to projects schema if needed
        user_id: rawData.owner_user_id || rawData.created_by,
        target_completion_date: rawData.target_completion_date,
        created_at: rawData.created_at,
      };

      console.log('Successfully fetched and mapped core project data.');
      setProjectData(mappedData);

      const { data: membersData, error: membersError } = await supabase
        .from('project_members')
        .select('display_name, email, user_id')
        .eq('project_id', mappedData.id);

      if (membersError) {
        console.error('Error fetching members for project', mappedData.project_name, ':', membersError);
      }

      let projectMembers: { display_name: string | null }[] = [];
      if (membersData && membersData.length > 0) {
        const memberUserIds = membersData.map(member => member.user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('display_name, username')
          .in('id', memberUserIds);

        if (profilesError) {
          console.error('Error fetching member profiles:', profilesError);
        }

        if (profilesData) {
          projectMembers = profilesData.map(profile => ({ display_name: profile.display_name || profile.username || 'Unnamed Member' }));
        }
      }

      setProjectMembers(projectMembers);
      console.log('Fetched project members and updated state:', projectMembers);

      const [treatmentsRes, timelineRes, featuresRes, feedbackRes] = await Promise.all([
        supabase.from('project_treatments').select('*').eq('project_slug', slug).order('sort_order', { ascending: true }),
        supabase.from('project_timelines').select('*, is_summary, preview_image_url, target_date, status, designer_notes').eq('project_slug', slug).order('sort_order', { ascending: true }),
        supabase.from('project_features').select('*, completed, target_date, agreement_status, designer_agreed_cost').eq('project_slug', slug).order('priority', { ascending: true }),
        supabase.from('project_feedback').select('*').eq('project_slug', slug).order('created_at', { ascending: false })
      ]);

      setTreatments(treatmentsRes.data || []);
      setTimeline(timelineRes.data || []);

      const existingFeatures = featuresRes.data || [];
      console.log(`Fetched ${existingFeatures.length} existing features for slug ${slug}:`, existingFeatures.map(f => f.feature));

      const defaultFeatures = [
        { feature: 'Initial Consultation & Requirements Gathering', priority: 'High', status: 'Core', est_cost: 0, completed: true },
        { feature: 'Domain Name Setup/Configuration', priority: 'High', status: 'Core', est_cost: 15 },
        { feature: 'Hosting Setup & Configuration', priority: 'High', status: 'Core', est_cost: 100 },
        { feature: 'Basic Website Structure (Homepage, About, Contact)', priority: 'High', status: 'Core', est_cost: 250 },
        { feature: 'Responsive Design (Mobile/Tablet)', priority: 'High', status: 'Core', est_cost: 150 },
        { feature: 'Contact Form Setup', priority: 'Medium', status: 'Core', est_cost: 50 },
        { feature: 'Basic SEO Setup (Titles, Metas)', priority: 'Medium', status: 'Core', est_cost: 75 },
        { feature: 'Deployment to Live Server', priority: 'High', status: 'Core', est_cost: 50 },
        { feature: 'Handover & Basic Training', priority: 'Medium', status: 'Core', est_cost: 100 },
      ];

      const featuresToAdd: (Omit<Feature, 'id' | 'approved' | 'completed'> & { project_slug: string, completed?: boolean })[] = [];
      defaultFeatures.forEach(defaultFeature => {
        const currentSlug = slug;
        const exists = existingFeatures.some(existing =>
          existing.feature?.trim().toLowerCase() === defaultFeature.feature.trim().toLowerCase()
        );

        if (!exists) {
          console.log(`[${currentSlug}] Default feature "${defaultFeature.feature}" does not exist, preparing to add.`);
          featuresToAdd.push({
            project_slug: currentSlug,
            ...defaultFeature
          });
        } else {
          console.log(`[${currentSlug}] Default feature "${defaultFeature.feature}" already exists.`);
        }
      });

      let finalFeatures = [...existingFeatures];
      if (featuresToAdd.length > 0) {
        console.log(`[${slug}] Attempting to insert ${featuresToAdd.length} new default features...`);
        const { data: addedFeatures, error: insertError } = await supabase
          .from('project_features')
          .insert(featuresToAdd)
          .select('*, completed');

        if (insertError) {
          console.error(`[${slug}] Error inserting default features:`, insertError);
        } else if (addedFeatures && addedFeatures.length > 0) {
          console.log(`[${slug}] Successfully inserted ${addedFeatures.length} features:`, addedFeatures.map(f => f.feature));
          finalFeatures = [...finalFeatures, ...addedFeatures];
        } else {
          console.log(`[${slug}] Insert call succeeded but returned no added features.`);
        }
      } else {
        console.log(`[${slug}] No new default features needed insertion.`);
      }

      const uniqueFeatures = Array.from(new Map(finalFeatures.map(f => [f.feature?.trim().toLowerCase(), f])).values());
      console.log(`[${slug}] Total features after processing: ${finalFeatures.length}, Unique features set: ${uniqueFeatures.length}`);

      setFeatures(uniqueFeatures);
      setFeedback(feedbackRes.data || []);

    } catch (err) {
      console.error('Unexpected error in fetchData try block:', err);
      setError('An unexpected error occurred while loading project data.');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (slug) {
      fetchData();
    } else {
      console.error('Project slug is missing or undefined, cannot fetch data.');
      setError("Project slug is missing.");
      setLoading(false);
    }
  }, [slug, fetchData]);

  const handleToggleFeatureApproval = async (featureId: string, currentStatus: boolean) => {
    if (!projectData) return;

    const newStatus = !currentStatus;

    setFeatures(currentFeatures =>
      currentFeatures.map(f =>
        f.id === featureId ? { ...f, approved: newStatus } : f
      )
    );

    const { error: updateError } = await supabase
      .from('project_features')
      .update({ approved: newStatus })
      .eq('id', featureId);

    if (updateError) {
      console.error('Error updating feature approval:', updateError);
      setFeatures(currentFeatures =>
        currentFeatures.map(f =>
          f.id === featureId ? { ...f, approved: currentStatus } : f // Revert optimistic update
        )
      );
      setError('Failed to update feature approval.');
    }
  };

  const handleToggleFeatureCompleted = async (featureId: string, currentStatus: boolean | undefined) => {
    if (!projectData) return;
    const newStatus = !currentStatus;

    setFeatures(currentFeatures =>
      currentFeatures.map(f =>
        f.id === featureId ? { ...f, completed: newStatus } : f
      )
    );

    const { error: updateError } = await supabase
      .from('project_features')
      .update({ completed: newStatus })
      .eq('id', featureId);

    if (updateError) {
      console.error('Error updating feature completion:', updateError);
      setFeatures(currentFeatures =>
        currentFeatures.map(f =>
          f.id === featureId ? { ...f, completed: currentStatus } : f
        )
      );
      setError('Failed to update feature completion.');
    }
  };

  const handleNewFeatureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectData || !newFeatureForm.name.trim()) {
      setError('Project data is not loaded or feature name is empty.');
      return;
    }
    setLoading(true);
    setError(null);
    setNewFeatureSuccess('');

    const featureToInsert = {
      project_slug: slug,
      feature: newFeatureForm.name.trim(),
      priority: newFeatureForm.priority,
      status: 'Requested', // Default status for new requests
      est_cost: null, // Can be filled later
      approved: false, // Needs approval
      completed: false,
    };

    const { data: addedFeature, error: insertError } = await supabase
      .from('project_features')
      .insert(featureToInsert)
      .select('*, completed')
      .single();

    if (insertError) {
      console.error('Error inserting new feature:', insertError);
      setError(`Failed to add feature: ${insertError.message}`);
    } else if (addedFeature) {
      setFeatures(currentFeatures => [...currentFeatures, addedFeature]);
      setNewFeatureSuccess(`Feature "${addedFeature.feature}" requested successfully!`);
      setNewFeatureForm({ name: '', priority: 'Medium' }); // Reset form
    } else {
      setError('Failed to add feature for an unknown reason.');
    }
    setLoading(false);
  };

  async function handleFeedbackSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!projectData) return;
    setError(null);
    setFeedbackSuccess('');

    const { data, error: insertError } = await supabase
      .from('project_feedback')
      .insert({
        project_slug: slug,
        email: feedbackForm.email,
        message: feedbackForm.message
      })
      .select()
      .single();

    if (insertError) {
      setError(`Error submitting feedback: ${insertError.message}`);
    } else if (data) {
      setFeedback([data, ...feedback]);
      setFeedbackSuccess('Feedback submitted, thank you!');
      setFeedbackForm({ email: '', message: '' });
    }
  }

  const handleUpdateProject = async (updatedFormData: Partial<ClientFormData>) => {
    if (!projectData) {
      setError("Project data not loaded, cannot update.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const updatePayload: { [key: string]: any } = {};
      if (updatedFormData.name) updatePayload.client_name = updatedFormData.name;
      if (updatedFormData.email) updatePayload.client_email = updatedFormData.email;
      if (updatedFormData.phone) updatePayload.phone = updatedFormData.phone;
      if (updatedFormData.website) updatePayload.website = updatedFormData.website;
      if (updatedFormData.logo_url) updatePayload.logo_url = updatedFormData.logo_url;
      if (updatedFormData.project_brief) updatePayload.project_description = updatedFormData.project_brief;
      if (updatedFormData.project_types) updatePayload.project_type = updatedFormData.project_types;

      const { data: updatedClientData, error: updateError } = await supabase
        .from('clients')
        .update(updatePayload)
        .eq('id', projectData.id)
        .select('*, user_id')
        .single();

      if (updateError) {
        throw updateError;
      }
      if (updatedClientData) {
        // Handle selected_services persistence to project_features
        if (updatedFormData.selected_services && updatedFormData.selected_services.length > 0) {
          const newFeatures = updatedFormData.selected_services.map(serviceName => {
            const pricingItem = pricingCategories.flatMap(c => c.items).find(i => i.service === serviceName);
            const estCost = pricingItem ? parseFloat(pricingItem.price.replace(/[£,]/g, '')) : null;

            return {
              project_slug: slug,
              feature: serviceName,
              status: 'Proposed',
              agreement_status: 'proposed',
              est_cost: estCost,
              approved: false,
              completed: false
            };
          });

          // Filter out features that already exist
          const existingFeatureNames = new Set(features.map(f => f.feature));
          const featuresToInsert = newFeatures.filter(f => !existingFeatureNames.has(f.feature));

          if (featuresToInsert.length > 0) {
            const { data: insertedFeatures, error: insertError } = await supabase
              .from('project_features')
              .insert(featuresToInsert)
              .select('*, completed');

            if (insertError) {
              console.error('Error inserting features from checklist:', insertError);
            } else if (insertedFeatures) {
              setFeatures(prev => [...prev, ...insertedFeatures]);
            }
          }
        }

        setProjectData(updatedClientData);
        setIsEditing(false);
      } else {
        setError("Failed to update project details: No data returned.");
      }
    } catch (err: any) {
      console.error('Error updating project:', err);
      setError(`Failed to update project details: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const isOwner = authUser && projectData && projectData.user_id === authUser.id;
  const showManageMembersButton = pathname?.startsWith('/myprojects/') && isOwner;

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen bg-gray-950 text-gray-300"><p>Loading project details...</p></div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen bg-gray-950 text-red-400"><p>Error: {error}</p></div>;
  }

  if (!projectData) {
    return <div className="flex justify-center items-center min-h-screen bg-gray-950 text-gray-300"><p>No project data found for this slug.</p></div>;
  };

  return (
    <motion.div
      className="min-h-screen bg-black text-white relative font-sans"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <main className="px-4 md:px-8 py-16 relative z-10 w-full">
        {/* Project Header */}
        <motion.header
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mb-12 border-b border-zinc-900 pb-8"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter uppercase">
                {projectData.project_name?.replace(/\s+/g, '_')}
              </h1>
              <div className="text-xs text-zinc-500 mb-2 font-mono uppercase tracking-widest">
                PROJECT_SPECIFICATION
              </div>
            </div>
            {projectData.target_completion_date && (
              <div className="text-right">
                <div className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-1">DATE_TARGET</div>
                <div className="text-sm font-bold text-white font-mono uppercase">
                  {new Date(projectData.target_completion_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
            <p className="text-gray-400 max-w-3xl text-lg leading-relaxed font-light">
              {projectData.project_description}
            </p>

            <div className="flex flex-wrap gap-2">
              {projectData.github_repo_url && (
                <a href={projectData.github_repo_url} target="_blank" rel="noopener noreferrer"
                  className="px-3 py-1 bg-white text-black text-xs font-bold hover:bg-gray-200 transition-colors uppercase flex items-center gap-2">
                  <FaGithub size={14} /> Repository
                </a>
              )}
              {projectData.preview_deployment_url && (
                <a href={projectData.preview_deployment_url} target="_blank" rel="noopener noreferrer"
                  className="px-3 py-1 bg-zinc-800 text-zinc-300 text-xs font-bold hover:bg-zinc-700 transition-colors uppercase flex items-center gap-2 border border-zinc-700">
                  <FiArrowRight size={14} /> Preview
                </a>
              )}
              {projectData.website && (
                <a href={projectData.website} target="_blank" rel="noopener noreferrer"
                  className="px-3 py-1 bg-zinc-800 text-zinc-300 text-xs font-bold hover:bg-zinc-700 transition-colors uppercase flex items-center gap-2 border border-zinc-700">
                  <FiArrowRight size={14} /> Live_Site
                </a>
              )}
              {showManageMembersButton && (
                <Link href={`/myprojects/${slug}/manage-members`}
                  className="px-3 py-1 bg-zinc-800 text-zinc-300 text-xs font-bold hover:bg-zinc-700 transition-colors uppercase flex items-center gap-2 border border-zinc-700">
                  <FaUsers size={14} /> Members
                </Link>
              )}
            </div>
          </div>
        </motion.header>

        {/* Status/Chat Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          {projectData && projectMembers.length > 0 ? (
            <div className="border border-zinc-900 p-8 bg-black relative group">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-left">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 font-mono">Team_Collaboration</h2>
                  <p className="text-gray-400 font-mono text-sm leading-relaxed">
                    Collaborating with: {projectMembers.map(m => m.display_name).join(' / ')}
                  </p>
                </div>
                <div className="flex -space-x-1">
                  {projectMembers.map((m, i) => (
                    <div key={i} className="w-8 h-8 bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-400 font-mono">
                      {m.display_name?.charAt(0)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : projectData && !loading && (
            <div className="border border-zinc-900 border-dashed p-12 text-center text-zinc-600 font-mono text-xs uppercase tracking-widest">
              Initializing_Environment...
            </div>
          )}
        </motion.div>

        {isOwner && !isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mb-12 flex"
          >
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-3 bg-white text-black text-sm font-bold hover:bg-gray-200 transition-all uppercase flex items-center gap-2"
            >
              Update_Technical_Spec <FiArrowRight size={16} />
            </button>
          </motion.div>
        )}

        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-20 bg-black p-8 border border-zinc-900"
          >
            <h3 className="text-xl font-bold text-white mb-8 uppercase tracking-tighter border-b border-zinc-900 pb-4">
              Modify_Specification
            </h3>
            <ClientSignupForm
              initialData={{
                name: projectData.name,
                email: projectData.email,
                project_brief: projectData.project_description ?? '',
                project_types: projectData.project_type ?? [],
                website: projectData.website ?? '',
                phone: '',
                logo_url: '',
                requested_budget: projectData.budget_tier ?? '',
                github_links: projectData.github_repo_url ?? '',
                id: projectData.id,
                slug: projectData.slug,
              }}
              onSave={handleUpdateProject}
              onCancel={() => setIsEditing(false)}
            />
          </motion.div>
        )}

        {/* Notion Blueprint Section */}
        {notionUrl && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <h3 className="text-xl font-bold uppercase tracking-tight mb-6 text-zinc-500">
              Project_Blueprint
            </h3>
            <div className="border border-zinc-900 bg-black p-1">
              <iframe
                src={notionUrl}
                className="w-full h-[600px] border-none filter grayscale opacity-90 hover:opacity-100 transition-opacity"
                title="Project Brief"
              />
            </div>
          </motion.section>
        )}

        {/* Video Asset Section */}
        {(projectData.video_url || projectVideos[slug]) && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <h3 className="text-xl font-bold uppercase tracking-tight mb-6 text-zinc-500">
              Media_Asset_Review
            </h3>
            <div className="border border-zinc-900 bg-black p-1 relative aspect-video overflow-hidden">
              <video
                src={projectData.video_url || projectVideos[slug]?.video}
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                controls
                poster={projectVideos[slug]?.poster}
              />
              <div className="absolute top-4 left-4">
                <span className="px-2 py-1 bg-white text-black text-[10px] font-bold uppercase tracking-widest">v0.1_PREVIEW</span>
              </div>
            </div>
          </motion.section>
        )}

        {/* Creative Phases Sections */}
        {treatments && treatments.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <h3 className="text-xl font-bold uppercase tracking-tight mb-8 text-zinc-500">
              Creative_Directives
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(phaseLabels).map(([phaseKey, phaseLabel], idx) => {
                const phaseTreatments = treatments.filter(t => t.phase === phaseKey);
                if (phaseTreatments.length === 0) return null;
                return (
                  <motion.div
                    key={phaseKey}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="border border-zinc-900 bg-black hover:border-zinc-700 hover:bg-zinc-900 p-8 transition-all group"
                  >
                    <div className="text-[10px] font-mono text-zinc-600 mb-6 flex items-center gap-2">
                      <span className="w-4 h-[1px] bg-zinc-800" /> PHASE_0{idx + 1}
                    </div>
                    <h4 className="text-xl font-bold text-white mb-8 tracking-tighter border-b border-zinc-900 pb-4 uppercase">
                      {phaseLabel}
                    </h4>
                    <div className="space-y-8">
                      {phaseTreatments.map(treatment => (
                        <div key={treatment.id} className="relative pl-6 border-l border-zinc-800 hover:border-white transition-colors">
                          <h5 className="text-xs font-bold text-zinc-300 uppercase tracking-widest mb-2">{treatment.title}</h5>
                          <p className="text-xs text-zinc-500 leading-relaxed font-light">{treatment.description}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* Timeline Section */}
        {timeline && timeline.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <h3 className="text-xl font-bold uppercase tracking-tight mb-12 text-zinc-500">
              Technical_Milestones
            </h3>

            <div className="space-y-16">
              {phases.map((phase, pIdx) => {
                const entriesForPhase = timeline.filter(t => t.phase === phase.key && !t.is_summary);
                const summaryForPhase = timeline.find(t => t.phase === phase.key && t.is_summary);
                if (entriesForPhase.length === 0 && !summaryForPhase) return null;

                return (
                  <div key={phase.key} className="relative border-l border-zinc-900 pl-8">
                    <div className="absolute top-0 left-[-5px] w-2 h-2 bg-white" />
                    <div className="mb-8">
                      <h4 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-2">{phase.label}</h4>
                      {summaryForPhase && (
                        <p className="text-xl font-bold text-white tracking-tighter uppercase">{summaryForPhase.title}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {entriesForPhase.map((entry, eIdx) => (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: eIdx * 0.1 }}
                          className="border border-zinc-900 bg-black p-4 flex gap-6 hover:bg-zinc-900 transition-all group"
                        >
                          {entry.preview_image_url && (
                            <div className="w-20 h-20 shrink-0 bg-zinc-900 border border-zinc-800 overflow-hidden grayscale group-hover:grayscale-0 transition-all">
                              {entry.preview_image_url.toLowerCase().endsWith('.mp4') ? (
                                <video src={entry.preview_image_url} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                              ) : (
                                <img src={entry.preview_image_url} alt={entry.title} className="w-full h-full object-cover" />
                              )}
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <h5 className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">{entry.title}</h5>
                              {entry.target_date && (
                                <span className="text-[9px] font-mono text-zinc-600 uppercase">ETA: {new Date(entry.target_date).toLocaleDateString()}</span>
                              )}
                            </div>
                            <p className="text-[10px] text-zinc-500 leading-relaxed font-mono mb-3">{entry.description}</p>

                            {isOwner && (
                              <div className="flex gap-2 border-t border-zinc-900 pt-3">
                                <button className={`px-2 py-1 text-[8px] font-bold uppercase transition-all ${entry.status === 'agreed' ? 'bg-zinc-800 text-zinc-400 cursor-default' : 'bg-white text-black hover:bg-zinc-200'}`}>
                                  {entry.status === 'agreed' ? 'AGREED' : 'AGREE'}
                                </button>
                                <button className="px-2 py-1 border border-zinc-800 text-zinc-500 text-[8px] font-bold uppercase hover:text-white transition-all">
                                  DISCUSS
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* Features Section */}
        {features && features.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-24"
          >
            <h3 className="text-xl font-bold uppercase tracking-tight mb-8 text-zinc-500">
              Architecture_&_Scope
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-left">
                    <th className="px-4 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Component</th>
                    <th className="px-4 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Priority</th>
                    <th className="px-4 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-right">Investment</th>
                    <th className="px-4 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-center">Protocol_Status</th>
                    {isOwner && <th className="px-4 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-center">Protocol</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {features.map((feature, fIdx) => (
                    <motion.tr
                      key={feature.id}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: fIdx * 0.05 }}
                      className="hover:bg-zinc-900 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div className="text-sm font-bold text-white uppercase tracking-tight">{feature.feature}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-[10px] font-mono uppercase ${feature.priority === 'High' ? 'text-red-500' :
                          feature.priority === 'Medium' ? 'text-yellow-500' :
                            'text-blue-500'
                          }`}>
                          {feature.priority}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right font-mono text-zinc-400 text-sm">
                        {feature.est_cost != null ? `£${Number(feature.est_cost).toLocaleString()}` : '—'}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col items-center">
                          <span className={`text-[10px] font-mono uppercase tracking-tighter ${feature.agreement_status === 'agreed' ? 'text-green-500' : 'text-zinc-500'
                            }`}>
                            {feature.agreement_status || 'PROPOSED'}
                          </span>
                          {feature.target_date && (
                            <span className="text-[8px] font-mono text-zinc-700 uppercase mt-0.5">
                              {new Date(feature.target_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </td>
                      {isOwner && (
                        <td className="px-4 py-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => { }}
                              className={`px-3 py-1 text-[10px] font-bold uppercase transition-colors
                                ${feature.agreement_status === 'agreed' ? 'bg-zinc-900 text-zinc-500 border border-zinc-800' : 'bg-white text-black hover:bg-zinc-200'}`}
                            >
                              {feature.agreement_status === 'agreed' ? 'LOCKED' : 'AGREE'}
                            </button>
                            <button
                              className="px-3 py-1 text-[10px] font-bold border border-zinc-800 text-zinc-500 uppercase hover:text-white transition-colors"
                            >
                              DISCUSS
                            </button>
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.section>
        )}

        {/* New Feature Request */}
        {isOwner && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-24 border border-zinc-900 p-8 md:p-12 relative overflow-hidden bg-black"
          >
            <div className="absolute top-0 right-0 p-4 font-mono text-[60px] text-white/5 pointer-events-none uppercase font-bold">AUGMENT</div>
            <h3 className="text-xl font-bold uppercase tracking-tight mb-8 text-white">Augmentation_Protocol</h3>
            <form onSubmit={handleNewFeatureSubmit} className="max-w-xl relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Feature Definition</label>
                  <input
                    type="text"
                    value={newFeatureForm.name}
                    onChange={(e) => setNewFeatureForm({ ...newFeatureForm, name: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-900 p-4 text-white focus:outline-none focus:border-white transition-colors font-mono text-sm"
                    placeholder="E.G. REAL_TIME_SYNC"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Priority Level</label>
                  <select
                    value={newFeatureForm.priority}
                    onChange={(e) => setNewFeatureForm({ ...newFeatureForm, priority: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-900 p-4 text-white focus:outline-none focus:border-white transition-colors font-mono text-sm uppercase appearance-none"
                  >
                    <option value="Low">Alpha (Low)</option>
                    <option value="Medium">Beta (Medium)</option>
                    <option value="High">Priority (High)</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={loading} className="px-10 py-4 bg-white text-black font-bold text-xs uppercase hover:bg-zinc-200 transition-all flex items-center gap-3 active:scale-95">
                {loading ? 'Transmitting...' : 'Submit_Proposal'} <FiArrowRight size={14} />
              </button>
              {newFeatureSuccess && <p className="text-green-400 mt-6 text-xs font-mono flex items-center gap-2 uppercase tracking-widest"><FiCheck /> {newFeatureSuccess}</p>}
            </form>
          </motion.section>
        )}

        {/* Feedback Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24"
        >
          <h3 className="text-xl font-bold uppercase tracking-tight mb-8 text-zinc-500">
            Advisory_Channel
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="border border-zinc-900 p-8">
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6 font-mono">Transmit_Instruction</h4>
              <form onSubmit={handleFeedbackSubmit}>
                <div className="mb-6">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Reply Route (Optional)</label>
                  <input
                    type="email"
                    value={feedbackForm.email}
                    onChange={e => setFeedbackForm({ ...feedbackForm, email: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-900 p-4 text-white outline-none focus:border-white transition-all font-mono text-sm"
                    placeholder="EMAIL_ADDR"
                  />
                </div>
                <div className="mb-8">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Content / Directive</label>
                  <textarea
                    rows={6}
                    value={feedbackForm.message}
                    onChange={e => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-900 p-4 text-white outline-none focus:border-white transition-all font-mono text-sm resize-none"
                    placeholder="Enter technical requirement or general feedback..."
                    required
                  ></textarea>
                </div>
                <button type="submit" className="px-12 py-4 bg-white text-black text-xs font-bold uppercase hover:bg-zinc-200 transition-all flex items-center gap-2">
                  <FiMessageSquare /> Transmit
                </button>
                {feedbackSuccess && <p className="text-green-400 mt-6 text-xs font-mono flex items-center gap-2 uppercase tracking-widest"><FiCheck /> Processed</p>}
              </form>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.2em] mb-4 px-2">History_Archives</h4>
              {feedback.length > 0 ? (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
                  {feedback.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      className="border border-zinc-900 p-4 bg-zinc-900/50 relative group"
                    >
                      <p className="text-zinc-400 text-xs mb-4 leading-relaxed font-light">{item.message}</p>
                      <div className="flex items-center justify-between border-t border-zinc-900 pt-3">
                        <span className="text-[9px] font-mono text-zinc-600 uppercase italic tracking-widest">{item.email || 'ANON_CLIENT'}</span>
                        <span className="text-[9px] font-mono text-zinc-700">{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="border border-zinc-900 border-dashed p-12 text-center text-zinc-700 font-mono text-xs uppercase tracking-widest">
                  No historical data.
                </div>
              )}
            </div>
          </div>
        </motion.section>
      </main>
    </motion.div>
  );
}
