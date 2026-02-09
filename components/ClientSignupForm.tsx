import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { FaChevronDown, FaChevronUp, FaCheck } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { pricingCategories, projectTypeToCategories } from "@/lib/pricing-data";

const supabase = createClient();

// Define the type for the form data based on your state
interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  website?: string; // Project's Live Website URL - Made optional
  logo_url: string;
  project_brief: string;
  requested_budget: string | number; // Allow string for input, number for processing
  how_heard: string;
  socials: string;
  github_links: string;
  inspiration_links: string;
  project_types: string[];
  selected_services: string[]; // Added for dynamic checklist
  id?: string; // Optional id if editing
  slug?: string; // Optional slug if editing
}

// Define the props the component accepts
interface ClientSignupFormProps {
  initialData?: Partial<ClientFormData>; // Optional initial data for editing
  onSave?: (data: Partial<ClientFormData>) => Promise<void>; // Optional save handler for editing
  onCancel?: () => void; // Added for cancellation
}

export default function ClientSignupForm({ initialData, onSave, onCancel }: ClientSignupFormProps) {
  // Initialize state from initialData if provided, otherwise default
  const [form, setForm] = useState<ClientFormData>(() => ({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    website: initialData?.website || undefined, // Project Live Website URL - can be undefined
    logo_url: initialData?.logo_url || "",
    project_brief: initialData?.project_brief || "",
    requested_budget: initialData?.requested_budget || "",
    how_heard: initialData?.how_heard || "",
    socials: initialData?.socials || "",
    github_links: initialData?.github_links || "",
    inspiration_links: initialData?.inspiration_links || "",
    project_types: initialData?.project_types || [],
    selected_services: [], // Start with empty selection
    id: initialData?.id,
    slug: initialData?.slug,
  }));
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Populate form when initialData changes (e.g., when switching to edit mode)
  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        website: initialData.website || undefined, // Project Live Website URL - can be undefined
        logo_url: initialData.logo_url || "",
        project_brief: initialData.project_brief || "",
        requested_budget: initialData.requested_budget || "",
        how_heard: initialData.how_heard || "",
        socials: initialData.socials || "",
        github_links: initialData.github_links || "",
        inspiration_links: initialData.inspiration_links || "",
        project_types: initialData?.project_types || [],
        selected_services: [], // Or map from initialData if available in schema later
        id: initialData.id,
        slug: initialData.slug,
      });
    }
  }, [initialData]);

  const allProjectTypes = [
    "3D Design",
    "AI/ML",
    "Analytics Setup",
    "Animation",
    "API Development",
    "Brand Design",
    "Blockchain",
    "CI/CD Pipeline",
    "Cloud Architecture",
    "Code Review",
    "Computer Vision",
    "Consulting",
    "Content",
    "Content Strategy",
    "Conversion Optimization",
    "Cross-Platform App",
    "Custom CMS",
    "DAO Tools",
    "Data Science",
    "Database Design",
    "DeFi",
    "Design System",
    "DevOps",
    "E-Commerce Store",
    "Email Marketing",
    "Environmental Design",
    "Growth Strategy",
    "Icon Design",
    "Illustration",
    "Influencer Marketing",
    "Infrastructure Setup",
    "Interactive Design",
    "IoT Platform",
    "Lead Generation",
    "Legacy System Modernization",
    "Logo Design",
    "Machine Learning",
    "Marketing",
    "Marketing Automation",
    "Marketplace Platform",
    "Mobile App",
    "Motion Graphics",
    "Native Mobile App",
    "Natural Language Processing",
    "NFT Platform",
    "Packaging Design",
    "Performance Marketing",
    "Performance Optimization",
    "PPC Advertising",
    "Predictive Analytics",
    "Print Design",
    "Progressive Web App",
    "Project Management",
    "SaaS Platform",
    "Security",
    "Security Audit",
    "SEO",
    "Smart Contracts",
    "Social Media",
    "Subscription Platform",
    "System Integration",
    "Team Training",
    "Technical Documentation",
    "Typography",
    "UI/UX",
    "Video",
    "Web3",
    "Website"
  ].sort();

  const toggleProjectType = (type: string) => {
    setForm(f => ({
      ...f,
      project_types: f.project_types.includes(type)
        ? f.project_types.filter(t => t !== type)
        : [...f.project_types, type]
    }));
  };

  const toggleService = (serviceName: string) => {
    setForm(f => ({
      ...f,
      selected_services: f.selected_services.includes(serviceName)
        ? f.selected_services.filter(s => s !== serviceName)
        : [...f.selected_services, serviceName]
    }));
  };

  // Get relevant categories and items based on selected project types
  const getRelevantServices = () => {
    const categories = new Set<string>();
    form.project_types.forEach(type => {
      const mapped = projectTypeToCategories[type];
      if (mapped) mapped.forEach(cat => categories.add(cat));
    });

    return pricingCategories.filter(cat => categories.has(cat.category));
  };

  const relevantCategories = getRelevantServices();

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    console.log("handleLogoUpload triggered"); // Log function start
    if (e.target.files && e.target.files[0]) {
      console.log("File selected:", e.target.files[0]); // Log selected file
      setUploading(true);
      setError(""); // Clear previous errors
      const file = e.target.files[0];
      const filePath = `logos/${Date.now()}_${file.name}`;
      console.log("Uploading to filePath:", filePath); // Log target path

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("client-logos") // Make sure this bucket name is correct in your Supabase project
        .upload(filePath, file, { upsert: true });

      console.log("Supabase upload result:", { uploadData, uploadError }); // Log upload result

      if (uploadError) {
        console.error("Supabase upload error object:", uploadError);
        setError(`Logo upload failed: ${uploadError.message}`);
      } else if (uploadData) {
        console.log("Upload successful, getting public URL for path:", uploadData.path);
        try {
          // Get public URL - this might throw on error or return data only
          const { data: urlData } = supabase.storage
            .from("client-logos")
            .getPublicUrl(uploadData.path);

          console.log("Supabase getPublicUrl result:", { urlData }); // Log URL data

          if (urlData && urlData.publicUrl) {
            console.log("Setting logo_url:", urlData.publicUrl);
            setForm(f => ({ ...f, logo_url: urlData.publicUrl }));
            setSuccess("Logo uploaded successfully!");
          } else {
            // Handle case where getPublicUrl succeeded but returned unexpected data
            console.warn("getPublicUrl did not return expected publicUrl data.", urlData);
            setError("Failed to retrieve logo URL after upload.");
          }
        } catch (urlError) {
          // Catch any error thrown by getPublicUrl
          console.error("Supabase getPublicUrl error object:", urlError);
          setError(`Failed to get logo URL: ${urlError instanceof Error ? urlError.message : String(urlError)}`);
        }
      } else {
        // Should not happen if uploadError is null, but handle just in case
        console.warn("Upload seemed successful but no data returned?");
        setError("Logo upload failed: Unknown reason");
      }
      setUploading(false);
    } else {
      console.log("No file selected or e.target.files is empty.");
    }
  }

  // Updated handleSubmit to check if it's in edit mode (onSave prop exists)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const submissionData: Partial<ClientFormData> = {
      ...form,
      requested_budget: form.requested_budget ? Number(form.requested_budget) : undefined
    };

    if (onSave) {
      // EDIT MODE: Call the onSave handler passed from the parent
      await onSave(submissionData);
      // Parent component (ClientProjectPage) handles success/error state
    } else {
      // CREATE MODE (New flow for /signup page)

      // 1. Store form data in localStorage for the new user flow
      try {
        localStorage.setItem('pendingProjectData', JSON.stringify(submissionData));

        // Check if there's template data and merge it
        const templateDataString = localStorage.getItem('selectedProjectTemplate');
        if (templateDataString) {
          const templateData = JSON.parse(templateDataString);

          // Merge template data with signup data
          const mergedData = {
            ...submissionData,
            // Template data takes precedence for project details
            name: submissionData.name || templateData.name,
            project_brief: submissionData.project_brief || templateData.description,
            project_types: submissionData.project_types?.length ? submissionData.project_types : [templateData.category],
            // Keep both in localStorage for the project creation page
          };

          localStorage.setItem('pendingProjectData', JSON.stringify(mergedData));
          console.log('[ClientSignupForm] Merged template data with signup data');
        }
      } catch (storageError) {
        console.error("Error saving to localStorage:", storageError);
        setError("Could not initiate project setup. Please try again or contact support.");
        return;
      }

      // 2. Send data to the agency (existing mechanism - fire and forget)
      fetch("/api/client-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      })
        .then(async (res) => {
          if (!res.ok) {
            const data = await res.json();
            console.error('Error sending client request to agency:', data.error || 'Unknown error');
            // Log this error, but don't necessarily block the user's signup/project creation flow
          } else {
            console.log('Client request data sent to agency successfully.');
          }
        })
        .catch(err => {
          console.error('Failed to send client request to agency:', err);
          // Log this error
        });

      // 3. Initiate Google OAuth Sign-In
      // Use the existing supabase client which is initialized with createClient()
      const supabaseAuth = supabase;

      // Clear any existing session to prevent conflicts
      await supabaseAuth.auth.signOut();

      // Small delay to ensure cleanup
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check if this is a template-based signup
      const urlParams = new URLSearchParams(window.location.search);
      const source = urlParams.get('source') || 'signup';

      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent('/projects/new')}&source=${source}`;

      console.log('[ClientSignupForm] Initiating OAuth with redirectTo:', redirectTo);

      const { error: oauthError } = await supabaseAuth.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });

      if (oauthError) {
        console.error("Error initiating Google OAuth:", oauthError);
        setError(`Could not start Google Sign-In: ${oauthError.message}. Please try again.`);
        localStorage.removeItem('pendingProjectData'); // Clean up if OAuth fails to start
      }
      // No success message here as user will be redirected.
      // Resetting the form is also not needed as the page will navigate away.
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <motion.div
      className="space-y-12"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
    >
      <form onSubmit={handleSubmit} className="space-y-10">
        <motion.div variants={itemVariants}>
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6 font-mono">
            {onSave ? 'MODIFY_SPECIFICATION' : 'PROJECT_TYPES'}
          </h3>
          <div className="flex flex-wrap gap-2 items-center">
            {allProjectTypes.map((type, tIdx) => (
              <motion.button
                key={type}
                type="button"
                variants={itemVariants}
                onClick={() => toggleProjectType(type)}
                className={`px-4 py-2 border transition-all font-mono text-[10px] uppercase tracking-tighter ${form.project_types.includes(type)
                  ? 'bg-white text-black border-white'
                  : 'bg-zinc-900 text-white border-zinc-800 hover:border-zinc-500'
                  }`}
              >
                {type.replace(/\s+/g, '_')}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Dynamic Service Checklist */}
        <AnimatePresence>
          {relevantCategories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6 font-mono">SERVICE_CHECKLIST</h3>
              <p className="text-[10px] text-zinc-600 mb-6 font-mono uppercase tracking-tight">Select specific line items to price into your project specification:</p>

              <div className="space-y-8">
                {relevantCategories.map((cat, cIdx) => (
                  <div key={cat.category} className="border border-zinc-900 bg-zinc-900/5 p-6">
                    <h4 className="text-[10px] font-bold text-white mb-4 font-mono uppercase tracking-wider flex items-center gap-2">
                      <span className="w-4 h-[1px] bg-zinc-800" /> {cat.category.replace(/\s+/g, '_')}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {cat.items.map((item, iIdx) => (
                        <motion.div
                          key={item.service}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: iIdx * 0.05 }}
                          onClick={() => toggleService(item.service)}
                          className={`flex items-center justify-between p-3 border cursor-pointer transition-all group ${form.selected_services.includes(item.service)
                            ? 'bg-white border-white'
                            : 'bg-black border-zinc-900 hover:border-zinc-700'
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 border flex items-center justify-center transition-colors ${form.selected_services.includes(item.service)
                              ? 'bg-black border-black'
                              : 'bg-zinc-900 border-zinc-800 group-hover:border-zinc-500'
                              }`}>
                              {form.selected_services.includes(item.service) && <FaCheck size={7} className="text-white" />}
                            </div>
                            <span className={`text-[10px] font-mono uppercase font-bold tracking-tight ${form.selected_services.includes(item.service) ? 'text-black' : 'text-zinc-400 group-hover:text-zinc-200'
                              }`}>
                              {item.service.replace(/\s+/g, '_')}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className={`text-[10px] font-mono font-bold ${form.selected_services.includes(item.service) ? 'text-black' : 'text-zinc-300'
                              }`}>
                              {item.price}
                            </div>
                            <div className={`text-[8px] font-mono uppercase ${form.selected_services.includes(item.service) ? 'text-zinc-600' : 'text-zinc-600'
                              }`}>
                              {item.unit}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Investment Totalizer */}
              {form.selected_services.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-6 border border-white bg-zinc-900/50 flex flex-col md:flex-row justify-between items-center gap-4"
                >
                  <div>
                    <h4 className="text-[10px] font-bold text-white mb-1 font-mono uppercase">ESTIMATED_INVESTMENT</h4>
                    <p className="text-[8px] text-zinc-500 font-mono uppercase">Based on current service selections (Admin will review and confirm)</p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div className="text-2xl font-bold font-mono text-white">
                      £{form.selected_services.reduce((acc, s) => {
                        const item = pricingCategories.flatMap(c => c.items).find(i => i.service === s);
                        if (!item) return acc;
                        const price = parseFloat(item.price.replace(/[£,]/g, ''));
                        return isNaN(price) ? acc : acc + price;
                      }, 0).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-1">GBP_ESTIMATE</div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={itemVariants}>
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6 font-mono">CONTACT_DETAILS</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.input variants={itemVariants} required className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-white transition-colors font-mono text-sm" placeholder="NAME" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <motion.input variants={itemVariants} required type="email" className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-white transition-colors font-mono text-sm" placeholder="EMAIL" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            <motion.input variants={itemVariants} className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-white transition-colors font-mono text-sm" placeholder="PHONE (OPTIONAL)" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            <motion.input
              variants={itemVariants}
              type="url"
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-white transition-colors font-mono text-sm"
              placeholder="PROJECT_LIVE_URL (OPTIONAL)"
              value={form.website || ""}
              onChange={e => setForm(f => ({ ...f, website: e.target.value || undefined }))}
            />
          </div>

          <div className="mt-4 md:col-span-2">
            <label htmlFor="logo-upload" className="block text-[10px] font-bold text-zinc-600 mb-2 font-mono uppercase">UPLOAD_LOGO (OPTIONAL)</label>
            <motion.div variants={itemVariants} className="border border-zinc-900 border-dashed p-4 bg-zinc-900/10">
              <input
                type="file"
                id="logo-upload"
                accept="image/png, image/jpeg, image/gif, image/svg+xml"
                onChange={handleLogoUpload}
                className="block w-full text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:border file:border-zinc-800 file:text-[10px] file:font-bold file:bg-zinc-900 file:text-zinc-300 hover:file:bg-zinc-800 file:transition-colors file:uppercase font-mono cursor-pointer"
                disabled={uploading}
              />
            </motion.div>
            {uploading && <p className="text-[10px] text-zinc-500 mt-2 font-mono uppercase animate-pulse">UPLOADING...</p>}
            {form.logo_url && (
              <div className="mt-4 border border-zinc-900 p-2 inline-block bg-black">
                <img src={form.logo_url} alt="Logo" className="h-12 w-auto grayscale contrast-125" />
              </div>
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6 font-mono">PROJECT_DETAILS</h3>
          <motion.textarea variants={itemVariants} className="w-full px-4 py-4 bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-white transition-colors font-mono text-sm min-h-[160px] resize-none" placeholder="TELL US ABOUT YOUR VISION, GOALS, AND AUDIENCE..." value={form.project_brief} onChange={e => setForm(f => ({ ...f, project_brief: e.target.value }))} />
        </motion.div>

        <motion.div variants={itemVariants}>
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6 font-mono">BUDGET_&_DISCOVERY</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.input variants={itemVariants} className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-white transition-colors font-mono text-sm" placeholder="REQUESTED_BUDGET (USD)" type="number" value={form.requested_budget} onChange={e => setForm(f => ({ ...f, requested_budget: e.target.value }))} />
            <motion.input variants={itemVariants} className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-white transition-colors font-mono text-sm" placeholder="SOURCE_REFERRAL (OPTIONAL)" value={form.how_heard} onChange={e => setForm(f => ({ ...f, how_heard: e.target.value }))} />
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6 font-mono">LINKS_&_INSPIRATION</h3>
          <div className="space-y-6 text-sm">
            <motion.div variants={itemVariants}>
              <label className="block text-[10px] font-bold text-zinc-600 mb-2 font-mono uppercase tracking-tight">SOCIAL_MEDIA_LINKS</label>
              <textarea
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-white transition-colors font-mono text-sm min-h-[80px] resize-none"
                placeholder="TWITTER, LINKEDIN, INSTAGRAM, ETC."
                value={form.socials}
                onChange={e => setForm(f => ({ ...f, socials: e.target.value }))}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <label className="block text-[10px] font-bold text-zinc-600 mb-2 font-mono uppercase tracking-tight">GITHUB_REPOSITORY_LINKS</label>
              <textarea
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-white transition-colors font-mono text-sm min-h-[80px] resize-none"
                placeholder="SHARE RELEVANT CODE REPOSITORIES..."
                value={form.github_links}
                onChange={e => setForm(f => ({ ...f, github_links: e.target.value }))}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <label className="block text-[10px] font-bold text-zinc-600 mb-2 font-mono uppercase tracking-tight">INSPIRATION_SOURCES</label>
              <textarea
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-white transition-colors font-mono text-sm min-h-[80px] resize-none"
                placeholder="SITES, APPS, OR DESIGNS THAT INSPIRE YOUR VISION..."
                value={form.inspiration_links}
                onChange={e => setForm(f => ({ ...f, inspiration_links: e.target.value }))}
              />
            </motion.div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex justify-end gap-4 pt-8 border-t border-zinc-900">
          {onCancel && (
            <motion.button
              variants={itemVariants}
              type="button"
              onClick={onCancel}
              className="px-8 py-3 border border-zinc-800 text-zinc-500 font-bold text-xs uppercase hover:bg-zinc-900 hover:text-zinc-400 transition-all font-mono"
            >
              DISCARD
            </motion.button>
          )}
          <motion.button
            variants={itemVariants}
            type="submit"
            disabled={uploading}
            className="px-10 py-3 bg-white text-black font-bold text-xs uppercase hover:bg-zinc-200 transition-all active:scale-95 disabled:opacity-50 font-mono"
          >
            {onSave ? 'COMMIT_CHANGES' : 'SUBMIT_REQUEST'}
          </motion.button>
        </motion.div>

        {success && <p className="mt-6 text-xs text-white bg-zinc-900 p-4 border-l-2 border-white font-mono uppercase tracking-tighter">{success}</p>}
        {error && <p className="mt-6 text-xs text-red-500 bg-red-950/20 p-4 border-l-2 border-red-500 font-mono uppercase tracking-tighter">{error}</p>}
      </form>
    </motion.div>
  );
}