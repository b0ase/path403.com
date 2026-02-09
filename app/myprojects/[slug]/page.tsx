'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { FaArrowLeft, FaSave, FaTimesCircle, FaSpinner, FaEdit, FaProjectDiagram, FaTrash, FaPlus, FaCheckSquare, FaRegSquare, FaUsers, FaUserPlus } from 'react-icons/fa';
import { useAuth } from '@/components/Providers';

// Interface matching the one in MyProjectsPage (ideally share this)
interface ClientProject {
  id: string;
  name: string;
  project_slug: string;
  status: string | null; // Keep for potential display, though badge1 is primary
  project_brief?: string | null;
  badge1?: string | null;
  badge2?: string | null;
  badge3?: string | null;
  badge4?: string | null;
  badge5?: string | null;
  is_featured?: boolean;
  created_at?: string; // For display
  user_id?: string; // For authorization checks
}

// New Todo Interface
interface Todo {
  id: string;
  task: string;
  is_completed: boolean;
  created_at: string;
  project_id: string; // Should match ClientProject.id
  user_id: string; // Should match User.id
  updated_at?: string; // Added to resolve linter error
}

// --- NEW TodoComment Interface ---
interface TodoComment {
  id: string;
  todo_id: string;
  user_id: string;
  comment_text: string;
  created_at: string;
  updated_at: string;
  // Optional: to display commenter's name if fetched separately
  commenter_display_name?: string; 
}
// --- End NEW TodoComment Interface ---

// --- NEW ProjectMemberDetail Interface ---
interface ProjectMemberDetail {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  username: string | null; // Added username as fallback for display name
}
// --- END ProjectMemberDetail Interface ---

// ADD THE FOLLOWING INTERFACE
interface ProjectWebsiteInfo {
  id: string;
  url: string | null;
  git_repository_url: string | null;
  hosting_details: { production_url?: string; vercel_project_id?: string; [key: string]: any } | null;
  // Add other fields from project_websites if needed
}

// Badge options (ideally share these)
const badge1Options = ['Pending_setup', 'Planning', 'In Development', 'Live', 'Maintenance', 'On Hold', 'Archived', 'Needs Review', 'Completed', 'Requires Update'];
const badge2Options = ['SaaS', 'Mobile App', 'Website', 'E-commerce', 'AI/ML', 'Consulting', 'Internal Tool', 'Web3/Blockchain', 'Creative Services', 'Platform', 'Service'];
const badge3Options = ['High Priority', 'Medium Priority', 'Low Priority', 'Needs Feedback', 'Client Approved', 'Phase 1', 'Phase 2', 'Experimental', 'Showcase Ready', 'Internal'];

// Badge styling functions (ideally share these)
const getBadgeStyle = (badgeValue: string | null): string => {
  let baseStyle = "text-xs font-semibold rounded-md p-1.5 appearance-none min-w-[100px] focus:ring-sky-500 focus:border-sky-500 border";
  switch (badgeValue?.toLowerCase()) {
    case 'pending_setup': return `${baseStyle} bg-yellow-700 text-yellow-200 border-yellow-600`;
    case 'planning': return `${baseStyle} bg-indigo-700 text-indigo-200 border-indigo-600`;
    case 'in development': return `${baseStyle} bg-sky-700 text-sky-200 border-sky-600`;
    case 'live': return `${baseStyle} bg-green-700 text-green-200 border-green-600`;
    default: return `${baseStyle} bg-gray-800 text-gray-300 border-gray-700`;
  }
};
const getBadge2Style = (badgeValue: string | null): string => {
  let baseStyle = "text-xs font-semibold rounded-md p-1.5 appearance-none min-w-[100px] focus:ring-sky-500 focus:border-sky-500 border";
  switch (badgeValue?.toLowerCase()) {
    case 'saas': return `${baseStyle} bg-purple-700 text-purple-200 border-purple-600`;
    case 'mobile app': return `${baseStyle} bg-pink-700 text-pink-200 border-pink-600`;
    case 'website': return `${baseStyle} bg-cyan-600 text-cyan-100 border-cyan-500`;
    case 'web3/blockchain': return `${baseStyle} bg-orange-700 text-orange-200 border-orange-600`;
    case 'platform': return `${baseStyle} bg-blue-700 text-blue-200 border-blue-600`;
    default: return `${baseStyle} bg-gray-800 text-gray-300 border-gray-700`;
  }
};
const getBadge3Style = (badgeValue: string | null): string => {
  let baseStyle = "text-xs font-semibold rounded-md p-1.5 appearance-none min-w-[100px] focus:ring-sky-500 focus:border-sky-500 border";
  switch (badgeValue?.toLowerCase()) {
    case 'high priority': return `${baseStyle} bg-red-700 text-red-200 border-red-600`;
    case 'medium priority': return `${baseStyle} bg-amber-600 text-amber-100 border-amber-500`;
    case 'low priority': return `${baseStyle} bg-emerald-700 text-emerald-200 border-emerald-600`;
    case 'needs feedback': return `${baseStyle} bg-teal-700 text-teal-200 border-teal-600`;
    default: return `${baseStyle} bg-gray-800 text-gray-300 border-gray-700`;
  }
};


export default function ProjectDetailPage() {
  const supabaseClient = createClient(); // Keep this if needed for specific calls outside of auth context
  const { session, isLoading: authLoading, supabase } = useAuth(); // Correctly destructure from useAuth
  const user = session?.user ?? null; // Derive user from session
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug ? (Array.isArray(params.slug) ? params.slug[0] : params.slug) : undefined;

  const [project, setProject] = useState<ClientProject | null>(null);
  const [projectWebsiteInfo, setProjectWebsiteInfo] = useState<ProjectWebsiteInfo | null>(null);
  const [editableName, setEditableName] = useState('');
  const [editableBrief, setEditableBrief] = useState('');
  const [editableStatus, setEditableStatus] = useState('');
  const [editableTimeline, setEditableTimeline] = useState('');
  const [originalMembers, setOriginalMembers] = useState<ProjectMemberDetail[]>([]);
  const [currentMembers, setCurrentMembers] = useState<ProjectMemberDetail[]>([]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingBrief, setIsEditingBrief] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [updatingField, setUpdatingField] = useState<string | null>(null); // Tracks which specific field/badge is updating
  const [error, setError] = useState<string | null>(null);

  // --- TODO States ---
  const [projectTodos, setProjectTodos] = useState<Todo[]>([]);
  const [newTodoTask, setNewTodoTask] = useState('');
  const [loadingTodos, setLoadingTodos] = useState(false);
  const [addingTodo, setAddingTodo] = useState(false);
  // --- End TODO States ---

  // --- NEW TodoComment States ---
  const [comments, setComments] = useState<{[todoId: string]: TodoComment[]}>({}); // Store comments per todo_id
  const [loadingComments, setLoadingComments] = useState<{[todoId: string]: boolean}>({});
  const [addingComment, setAddingComment] = useState<{[todoId: string]: boolean}>({});
  const [newCommentText, setNewCommentText] = useState<{[todoId: string]: string}>({});
  const [expandedComments, setExpandedComments] = useState<{[todoId: string]: boolean}>({}); // Track which todo's comments are visible
  // --- End NEW TodoComment States ---

  // --- NEW State for Project Members ---
  const [projectMembers, setProjectMembers] = useState<ProjectMemberDetail[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  // --- END State for Project Members ---

  const fetchProjectDetails = useCallback(async () => {
    console.log('fetchProjectDetails called');
    console.log('fetchProjectDetails - user:', user);
    console.log('fetchProjectDetails - params:', params);
    console.log('fetchProjectDetails - params.slug:', params?.slug);

    if (!user || !params || !params.slug) {
      setLoading(false); // Ensure loading is false if pre-conditions aren't met
      setError('Authentication required or project slug missing.');
      return;
    }

    setLoading(true);
    setError(null);
    const slugFromParams = Array.isArray(params.slug) ? params.slug[0] : params.slug;

    try {
      // *** MODIFIED LOGIC: Prioritize fetching from 'projects' table by slug and owner_user_id ***
      const { data: projectOwnerData, error: projectOwnerError } = await supabase
        .from('projects')
        .select('*, client_id') // Fetch all project fields
        .eq('slug', slugFromParams)
        .eq('owner_user_id', user.id)
        .single();

      console.log('Fetch from projects table (owner check):', { projectOwnerData, projectOwnerError });

      if (projectOwnerData) {
        // Found project as owner, use this data
        // Adapt projectOwnerData structure to match ClientProject interface if necessary
        // Assuming projectOwnerData structure from 'projects' is compatible or can be mapped
        const projectData: ClientProject = { // Map fields as needed
          id: projectOwnerData.id,
          name: projectOwnerData.name,
          project_slug: projectOwnerData.slug,
          status: projectOwnerData.status, // Use project status
          project_brief: projectOwnerData.project_brief,
          badge1: projectOwnerData.badge1,
          badge2: projectOwnerData.badge2,
          badge3: projectOwnerData.badge3,
          badge4: projectOwnerData.badge4,
          badge5: projectOwnerData.badge5,
          is_featured: projectOwnerData.is_featured,
          url: projectOwnerData.url, // Assuming url is on projects table or fetched later
          user_id: projectOwnerData.owner_user_id, // Set to owner_user_id
          created_at: projectOwnerData.created_at,
          is_public: projectOwnerData.is_public,
          // Add other fields if available in projects table and needed
        };
        setProject(projectData);
        setEditableName(projectData.name || projectData.project_slug || '');
        setEditableBrief(projectData.project_brief || '');
        // Note: Status/Timeline from projects table might need separate handling if they exist

        // NOW, FETCH ASSOCIATED DATA like website info, members etc. using projectData.id
        // Fetch Website Info (using the project ID we just got)
        const { data: websiteData, error: websiteError } = await supabase
          .from('project_websites')
          .select('id, url, git_repository_url, hosting_details')
          .eq('project_id', projectData.id) // Use the ID from the projects table
          .maybeSingle();

        if (websiteError) {
          console.warn('Error fetching project website details:', websiteError.message);
        }
        setProjectWebsiteInfo(websiteData as ProjectWebsiteInfo | null);

        // TODO: Fetch project members similarly using projectData.id

      } else if (projectOwnerError?.code === 'PGRST116') { // No row found in projects table for owner
        // If not found as owner, try fetching from the 'clients' table
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('project_slug', slugFromParams)
          .eq('user_id', user.id) // Check if current user is the client associated
          .single();

        console.log('Fetch from clients table (fallback):', { clientData, clientError });

        if (clientData) {
          // Found project via client association, use this data
          setProject(clientData as ClientProject); // Assuming clientData is compatible with ClientProject
          setEditableName(clientData.name || clientData.project_slug || '');
          setEditableBrief(clientData.project_brief || '');
          // Set other editable states based on clientData fields

          // NOW, FETCH ASSOCIATED DATA like website info, members etc. using clientData.project_id or clientData.id
          // This part might need adjustment depending on which ID to use for related tables
          // If clientData has project_id, use that. Otherwise, the logic is complex.
          // Assuming for now project_id on client matches the project ID in the projects table.
          const mainProjectIdForClient = (clientData as any).project_id || clientData.id; // Adjust as needed

          const { data: websiteData, error: websiteError } = await supabase
            .from('project_websites')
            .select('id, url, git_repository_url, hosting_details')
            .eq('project_id', mainProjectIdForClient) // Use the appropriate project ID
            .maybeSingle();

          if (websiteError) {
            console.warn('Error fetching project website details (client fallback):', websiteError.message);
          }
          setProjectWebsiteInfo(websiteData as ProjectWebsiteInfo | null);

          // TODO: Fetch project members similarly using mainProjectIdForClient or clientData.id

        } else if (clientError?.code === 'PGRST116') { // Not found as client either
          setError('Project not found or you do not have access.');
        } else if (clientError) {
          console.error('Error fetching project from clients table:', clientError);
          setError('Failed to load project details via client association.');
        }

      } else if (projectOwnerError) { // Other error fetching from projects table as owner
        console.error('Error fetching project from projects table (owner check):', projectOwnerError);
        setError('Failed to load project details via ownership check.');
      } else { // Should not happen if single() is used, but as a safeguard
           setError('Project not found or unexpected data.');
      }

    } catch (e: any) {
      console.error('General error fetching project details:', e.message);
      setError('An unexpected error occurred while loading project details.');
    } finally {
      setLoading(false);
    }
  }, [user, params, supabase]); // Dependencies

  // --- TODO Functions ---
  const fetchProjectTodos = useCallback(async (currentProjectId: string) => {
    if (!user) return;
    setLoadingTodos(true);
    const { data: todosData, error: todosError } = await supabase
      .from('todos')
      .select('*')
      .eq('project_id', currentProjectId)
      .order('created_at', { ascending: true });

    if (todosError) {
      console.error('Error fetching project todos:', todosError);
      setError(prev => prev ? `${prev}\nFailed to load project to-dos.` : 'Failed to load project to-dos.');
      setProjectTodos([]);
    } else {
      setProjectTodos(todosData || []);
    }
    setLoadingTodos(false);
  }, [supabase, user]);

  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  // Fetch todos when project is loaded and user is available
  useEffect(() => {
    if (project && project.id && user) {
      fetchProjectTodos(project.id);
    }
  }, [project, user, fetchProjectTodos]);

  const handleAddProjectTodo = async () => {
    if (!newTodoTask.trim() || !project || !user) return;
    setAddingTodo(true);
    setError(null);

    const { data: newTodo, error: insertError } = await supabase
      .from('todos')
      .insert({
        task: newTodoTask.trim(),
        user_id: user.id,
        project_id: project.id,
        is_completed: false,
      })
      .select()
      .single();

    if (insertError || !newTodo) {
      console.error('Error adding todo:', insertError);
      setError('Failed to add to-do item.');
    } else {
      if (newTodo && typeof newTodo === 'object' && 'id' in newTodo) {
        const confirmedTodo: Todo = { ...newTodo } as Todo; // Ensure it is a plain object of type Todo
        setProjectTodos(prevTodos => [...prevTodos, confirmedTodo]);
      }
      setNewTodoTask('');
    }
    setAddingTodo(false);
  };

  const handleToggleProjectTodoComplete = async (todoId: string, currentStatus: boolean) => {
    if(!user) return;
    setUpdatingField(`todo_complete_${todoId}`);
    const { error: updateError } = await supabase
      .from('todos')
      .update({ is_completed: !currentStatus, updated_at: new Date().toISOString() })
      .eq('id', todoId);

    if (updateError) {
      console.error('Error updating todo status:', updateError);
      setError('Failed to update to-do status.');
    } else {
      setProjectTodos(prevTodos => 
        prevTodos.map(t => { 
          if (t.id === todoId) {
            const updatedTodo: Todo = { 
              ...t, 
              is_completed: !currentStatus, 
              updated_at: new Date().toISOString() 
            };
            return updatedTodo;
          }
          return t;
        })
      );
    }
    setUpdatingField(null);
  };

  const handleDeleteProjectTodo = async (todoId: string) => {
    if(!user) return;
    setUpdatingField(`todo_delete_${todoId}`);
    const { error: deleteError } = await supabase
      .from('todos')
      .delete()
      .eq('id', todoId);

    if (deleteError) {
      console.error('Error deleting todo:', deleteError);
      setError('Failed to delete to-do item.');
    } else {
      setProjectTodos(prevTodos => prevTodos.filter(todo => todo.id !== todoId));
    }
    setUpdatingField(null);
  };
  // --- End TODO Functions ---

  // --- NEW TodoComment Functions ---
  const fetchTodoComments = useCallback(async (todoId: string) => {
    if (!user) return;
    setLoadingComments(prev => {
      const currentPrev = typeof prev === 'object' && prev !== null ? prev : {};
      return { ...currentPrev, [todoId]: true };
    });
    setError(null);

    const { data: commentsData, error: commentsError } = await supabase
      .from('todo_comments')
      .select(`
        *,
        profiles (
          display_name,
          username
        )
      `)
      .eq('todo_id', todoId)
      .order('created_at', { ascending: true });

    if (commentsError) {
      console.error(`Error fetching comments for todo ${todoId}:`, commentsError);
      setError(`Failed to load comments for to-do ${todoId}: ${commentsError.message}`);
      setComments(prev => ({ ...prev, [todoId]: [] }));
    } else {
      const formattedComments = commentsData?.map(c => ({
        ...c,
        commenter_display_name: c.profiles?.display_name || c.profiles?.username || 'User' 
      })) || [];
      setComments(prev => ({ ...prev, [todoId]: formattedComments as TodoComment[] }));
    }
    setLoadingComments(prev => {
      const currentPrev = typeof prev === 'object' && prev !== null ? prev : {};
      return { ...currentPrev, [todoId]: false };
    });
  }, [supabase, user]);

  const handleAddTodoComment = async (todoId: string) => {
    if (!newCommentText[todoId]?.trim() || !project || !user) return;
    setAddingComment(prev => {
      const currentPrev = typeof prev === 'object' && prev !== null ? prev : {};
      return { ...currentPrev, [todoId]: true };
    });
    setError(null);

    const { data: newComment, error: insertError } = await supabase
      .from('todo_comments')
      .insert({
        todo_id: todoId,
        user_id: user.id,
        comment_text: newCommentText[todoId].trim(),
      })
      .select(`
        *,
        profiles (
          display_name,
          username
        )
      `)
      .single();

    if (insertError || !newComment) {
      console.error('Error adding comment:', insertError);
      setError('Failed to add comment.');
    } else {
      const formattedComment = {
        ...newComment,
        commenter_display_name: newComment.profiles?.display_name || newComment.profiles?.username || 'User'
      };
      setComments(prev => ({
        ...prev,
        [todoId]: [...(prev[todoId] || []), formattedComment as TodoComment],
      }));
      setNewCommentText(prev => ({ ...prev, [todoId]: '' }));
    }
    setAddingComment(prev => {
      const currentPrev = typeof prev === 'object' && prev !== null ? prev : {};
      return { ...currentPrev, [todoId]: false };
    });
  };
  
  const toggleCommentExpansion = (todoId: string) => {
    setExpandedComments(prev => {
      const isCurrentlyExpanded = !!prev[todoId];
      const newExpandedState = { ...prev, [todoId]: !isCurrentlyExpanded };
      if (!isCurrentlyExpanded && (!comments[todoId] || comments[todoId].length === 0)) {
        // If opening for the first time and no comments loaded, fetch them
        fetchTodoComments(todoId);
      }
      return newExpandedState;
    });
  };

  // --- End NEW TodoComment Functions ---

  const handleUpdateProjectField = async (field: keyof ClientProject, value: any, fieldNameForLoading: string) => {
    if (!project || !user) return;
    setUpdatingField(fieldNameForLoading);
    setError(null);

    const { error: updateError } = await supabase
      .from('clients')
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq('id', project.id)
      .eq('user_id', user.id);

    if (updateError) {
      console.error(`Error updating ${field}:`, updateError);
      setError(`Failed to update ${field}. ${updateError.message}`);
    } else {
      setProject(prev => prev ? { ...prev, [field]: value } : null);
      if (field === 'name') setEditableName(value);
      if (field === 'project_brief') setEditableBrief(value);
    }
    setUpdatingField(null);
    return !updateError;
  };

  const handleSaveName = async () => {
    const success = await handleUpdateProjectField('name', editableName, 'name');
    if (success) setIsEditingName(false);
  };

  const handleSaveBrief = async () => {
    const success = await handleUpdateProjectField('project_brief', editableBrief, 'brief');
    if (success) setIsEditingBrief(false);
  };
  
  const handleBadgeChange = async (badgeKey: 'badge1' | 'badge2' | 'badge3' | 'badge4' | 'badge5', newValue: string | null) => {
    if (!project || !user) return;
    const valueToSet = newValue === '' ? null : newValue;
    const success = await handleUpdateProjectField(badgeKey, valueToSet, badgeKey);
    // UI updates via setProject in handleUpdateProjectField
  };

  const handleIsFeaturedToggle = async (currentIsFeatured: boolean) => {
    if (!project || !user) return;
    const success = await handleUpdateProjectField('is_featured', !currentIsFeatured, 'is_featured');
    // UI updates via setProject
  };

  const openDeleteModal = () => setIsDeleteModalOpen(true);
  const closeDeleteModal = () => setIsDeleteModalOpen(false);

  const handleConfirmDelete = async () => {
    if (!project || !user) {
      setError("Project data or user authentication is missing. Cannot delete.");
      return;
    }
    setUpdatingField('delete_project'); // Indicate loading
    setError(null);

    const { error: deleteError } = await supabase
      .from('clients')
      .delete()
      .eq('id', project.id)
      .eq('user_id', user.id);
    
    setUpdatingField(null);
    if (deleteError) {
      console.error('Error deleting project:', deleteError);
      setError(`Failed to delete project: ${deleteError.message}`);
      closeDeleteModal(); // Close modal even on error, error message will show
    } else {
      // On successful deletion, navigate back to the projects list
      router.push('/myprojects');
      // No need to close modal explicitly if we are navigating away
      // No need to update local project state as we are leaving the page
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 text-gray-300 flex flex-col items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-sky-500" />
        <p className="text-xl mt-4">Loading project details...</p>
      </div>
    );
  }

  if (error && !project) { // Show full page error if project couldn't load
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 text-gray-300 flex flex-col items-center justify-center p-6">
        <FaTimesCircle className="text-5xl text-red-500 mb-4" />
        <h2 className="text-2xl font-semibold text-white mb-2">Error Loading Project</h2>
        <p className="text-red-400 text-center mb-6">{error}</p>
        {/* <Link href="/myprojects" legacyBehavior>
          <a className="inline-flex items-center bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2 px-4 rounded-md transition-colors">
            <FaArrowLeft className="mr-2" />
            Back to My Projects
          </a>
        </Link> */}
      </div>
    );
  }
  
  if (!project) { // Fallback if no project and no specific error, or user not authorized
     return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 text-gray-300 flex flex-col items-center justify-center p-6">
        <FaTimesCircle className="text-5xl text-yellow-500 mb-4" />
        <h2 className="text-2xl font-semibold text-white mb-2">Project Not Found</h2>
        <p className="text-yellow-300 text-center mb-6">The project you are looking for does not exist or you may not have permission to view it.</p>
        {/* <Link href="/myprojects" legacyBehavior>
          <a className="inline-flex items-center bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2 px-4 rounded-md transition-colors">
            <FaArrowLeft className="mr-2" />
            Back to My Projects
          </a>
        </Link> */}
      </div>
    );
  }

  // Determine if the current user is the owner for conditional rendering
  const isProjectOwner = user && project && user.id === project.user_id;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 text-gray-300 flex flex-col">
      {/* Header section */}
      <div className="bg-gray-900 shadow-md sticky top-0 z-30"> {/* Make AppNavbar effectively sticky */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/myprojects" className="text-sky-400 hover:text-sky-500 transition-colors mr-3 p-2 rounded-md hover:bg-gray-700">
                <FaArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-xl md:text-2xl font-semibold text-white truncate">
                My Projects / <span className="text-sky-400">{project?.name || 'Loading...'}</span>
              </h1>
            </div>
            <div className="flex items-center">
              {/* Potentially add other global project actions here if needed */}
            </div>
          </div>
        </div>
      </div>
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && !project && (
          <div className="flex flex-col items-center justify-center h-64">
            <FaSpinner className="animate-spin text-4xl text-sky-500" />
            <p className="mt-3 text-lg text-gray-400">Loading project details...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-md text-center">
            <p className="text-lg font-semibold">Error Loading Project</p>
            <p>{error}</p>
            <Link href="/myprojects" className="mt-4 inline-block text-sky-400 hover:text-sky-300 underline">
              &larr; Back to My Projects
            </Link>
          </div>
        )}

        {!loading && !project && !error && (
          <div className="text-center py-10">
            <FaProjectDiagram className="mx-auto text-6xl text-gray-600 mb-4" />
            <p className="text-xl text-gray-500">Project not found or you do not have access.</p>
            <Link href="/myprojects" className="mt-4 inline-block text-sky-400 hover:text-sky-300 underline">
              &larr; Back to My Projects
            </Link>
          </div>
        )}

        {project && (
          <div className="space-y-8">

            {/* --- NEW Project Members Header --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
              <div className="flex items-center space-x-3 mb-3 sm:mb-0">
                <h2 className="text-lg font-semibold text-gray-200">Project Team:</h2>
                {loadingMembers ? (
                  <FaSpinner className="animate-spin text-sky-400" />
                ) : projectMembers.length > 0 ? (
                  <div className="flex -space-x-2 overflow-hidden">
                    {projectMembers.map(member => {
                      const avatarTitle = `View profile: ${member.display_name || member.username || 'Member'}`;
                      const avatarContent = member.avatar_url ? (
                        <img
                          className="inline-block h-8 w-8 rounded-full ring-2 ring-gray-800 object-cover"
                          src={member.avatar_url}
                          alt={member.display_name || member.username || 'Member'}
                        />
                      ) : (
                        <div 
                          className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-sky-600 ring-2 ring-gray-800 text-xs font-medium text-white"
                        >
                          {(member.display_name || member.username || 'U').substring(0, 2).toUpperCase()}
                        </div>
                      );

                      return (
                        <Link key={member.user_id} href={`/profile/${member.user_id}`} passHref legacyBehavior>
                          <a className="cursor-pointer hover:opacity-80 transition-opacity" title={avatarTitle}>
                            {avatarContent}
                          </a>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No members assigned yet.</p>
                )}
              </div>
              {/* Conditionally render Invite Members button - e.g., only for project owners/managers */}
              {/* For now, assume current user can always see it if they can see the project page */}
              {user && project && (project.user_id === user.id /* Example: Only project creator */ ) && (
                <Link href={`./${slug}/manage-members`} passHref legacyBehavior>
                  <a className="inline-flex items-center bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors shadow hover:shadow-md">
                    <FaUserPlus className="mr-2 h-4 w-4" />
                    Invite Members
                  </a>
                </Link>
              )}
            </div>
            {/* --- END NEW Project Members Header --- */}

            {/* Project Badges & Settings Section */}
            <div className="bg-gray-800/50 shadow-lg rounded-lg p-6 border border-gray-700/60">
              <div className="bg-slate-800 shadow-xl rounded-lg p-6 md:p-8 mb-8 relative border border-slate-700">
                <div className="mt-2 mb-6 p-4 border border-slate-700 rounded-md bg-slate-850/30">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">Project Badges & Settings:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-center">
                    {[1, 2, 3, 4, 5].map(num => {
                      const badgeKey = `badge${num}` as 'badge1' | 'badge2' | 'badge3' | 'badge4' | 'badge5';
                      const options = num === 1 ? badge1Options : num === 3 ? badge3Options : badge2Options;
                      const styleGetter = num === 1 ? getBadgeStyle : num === 3 ? getBadge3Style : getBadge2Style;
                      const value = project[badgeKey] || (num === 1 ? 'Pending_setup' : '');
                      const placeholder = num === 1 && !project[badgeKey] ? '' : `Badge ${num}...`;
                      
                      return (
                        <div key={badgeKey} className="flex-shrink-0">
                          <label htmlFor={`${badgeKey}-detail`} className="sr-only">{`Badge ${num}`}</label>
                          <select 
                            id={`${badgeKey}-detail`}
                            value={value}
                            onChange={(e) => handleBadgeChange(badgeKey, e.target.value)}
                            disabled={!!updatingField}
                            className={styleGetter(value)}
                          >
                            {placeholder && <option value="">{placeholder}</option>}
                            {num === 1 && !project.badge1 && <option value="Pending_setup">Pending_setup</option>}
                            {options.map(opt => (
                              (num === 1 && opt === 'Pending_setup' && project.badge1) ? null :
                              <option key={opt} value={opt} className="bg-gray-800 text-gray-300">{opt}</option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                     <div className="flex items-center flex-shrink-0 sm:ml-0 pt-2 sm:pt-0 md:col-span-1 lg:col-span-1 xl:col-span-1 justify-self-start">
                      <input 
                        type="checkbox" 
                        id={`featured-detail-${project.id}`} 
                        checked={project.is_featured || false} 
                        onChange={() => handleIsFeaturedToggle(project.is_featured || false)}
                        disabled={!!updatingField}
                        className="h-4 w-4 text-sky-600 bg-gray-700 border-gray-600 rounded focus:ring-sky-500 focus:ring-offset-gray-900 cursor-pointer"
                      />
                      <label htmlFor={`featured-detail-${project.id}`} className="ml-2 text-xs text-gray-400 cursor-pointer select-none whitespace-nowrap">
                        Showcase on Landing Page
                      </label>
                    </div>
                  </div>
                   {updatingField && <p className="text-xs text-sky-400 mt-2 flex items-center"><FaSpinner className="animate-spin mr-1.5" /> Updating {updatingField}...</p>}
                </div>


                <div className="mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-semibold text-sky-300">Project Brief</h2>
                    {!isEditingBrief && (
                      <button onClick={() => setIsEditingBrief(true)} className="text-sm text-sky-400 hover:text-sky-300 flex items-center">
                        <FaEdit className="mr-1" /> Edit Brief
                      </button>
                    )}
                  </div>
                  {isEditingBrief ? (
                    <div>
                      <textarea
                        value={editableBrief}
                        onChange={(e) => setEditableBrief(e.target.value)}
                        rows={6}
                        className="w-full bg-slate-700 text-gray-300 p-3 rounded-md border border-slate-600 focus:ring-sky-500 focus:border-sky-500 text-sm"
                        autoFocus
                      />
                      <div className="mt-3 flex items-center gap-3">
                        <button onClick={handleSaveBrief} disabled={updatingField === 'brief'} className="bg-green-600 hover:bg-green-500 text-white font-semibold py-2 px-3 rounded-md text-sm disabled:opacity-50 flex items-center">
                          {updatingField === 'brief' ? <FaSpinner className="animate-spin mr-1.5" /> : <FaSave className="mr-1.5" />} Save Brief
                        </button>
                        <button onClick={() => { setIsEditingBrief(false); setEditableBrief(project.project_brief || ''); }} className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-3 rounded-md text-sm flex items-center">
                           <FaTimesCircle className="mr-1.5" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    project.project_brief ? (
                      <div className="prose prose-sm prose-invert max-w-none text-gray-300 bg-slate-850/30 p-4 rounded-md border border-slate-700 whitespace-pre-wrap">
                        {project.project_brief}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic p-4 bg-slate-850/30 rounded-md border border-slate-700">No project brief available. Click 'Edit Brief' to add one.</p>
                    )
                  )}
                </div>

                <div className="bg-slate-850/30 p-4 rounded-md border border-slate-700 mb-8">
                  <h2 className="text-xl font-semibold text-sky-300 mb-3">Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Project ID: </span>
                      <span className="text-gray-300 break-all">{project.id}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Slug: </span>
                      <span className="text-gray-300">{project.project_slug}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Created: </span>
                      <span className="text-gray-300">{project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                {/* NEW DEPLOYMENT INFORMATION CARD START */}
                {projectWebsiteInfo && (
                  <div className="bg-slate-850/30 p-4 rounded-md border border-slate-700 mb-8">
                    <h2 className="text-xl font-semibold text-sky-300 mb-3">Deployment Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {projectWebsiteInfo.url && (
                        <div>
                          <span className="text-gray-500">Production URL: </span>
                          <a 
                            href={projectWebsiteInfo.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sky-400 hover:text-sky-300 underline break-all"
                          >
                            {projectWebsiteInfo.url}
                          </a>
                        </div>
                      )}
                      {projectWebsiteInfo.git_repository_url && (
                        <div>
                          <span className="text-gray-500">Git Repository: </span>
                          <a 
                            href={projectWebsiteInfo.git_repository_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sky-400 hover:text-sky-300 underline break-all"
                          >
                            {projectWebsiteInfo.git_repository_url}
                          </a>
                        </div>
                      )}
                      {projectWebsiteInfo.hosting_details?.vercel_project_id && (
                        <div>
                          <span className="text-gray-500">Vercel Project ID: </span>
                          <span className="text-gray-300 break-all">
                            {projectWebsiteInfo.hosting_details.vercel_project_id}
                          </span>
                        </div>
                      )}
                       {projectWebsiteInfo.hosting_details?.production_url && !projectWebsiteInfo.url && (
                        // Fallback if top-level URL is not set but hosting_details has one
                        <div>
                          <span className="text-gray-500">Production URL (from Hosting): </span>
                          <a 
                            href={projectWebsiteInfo.hosting_details.production_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sky-400 hover:text-sky-300 underline break-all"
                          >
                            {projectWebsiteInfo.hosting_details.production_url}
                          </a>
                        </div>
                      )}
                    </div>
                    {!projectWebsiteInfo.url && !projectWebsiteInfo.git_repository_url && !projectWebsiteInfo.hosting_details?.vercel_project_id && (
                        <p className="text-xs text-gray-500 italic">(No deployment details available)</p>
                    )}
                  </div>
                )}
                {/* NEW DEPLOYMENT INFORMATION CARD END */}
                
                {error && <p className="text-red-400 bg-red-900/30 p-3 rounded-md mb-6 text-sm shadow">Error: {error}</p>}

                <div className="mt-10 text-center text-gray-500 text-sm">
                  <p>More project-specific details, communication tools, and management features will go here.</p>
                </div>

                <div className="mt-10 pt-6 border-t border-slate-700">
                  <h2 className="text-xl font-semibold text-sky-300 mb-4">Project To-Do List</h2>
                  <div className="mb-6 bg-slate-850/50 p-4 rounded-md border border-slate-700">
                    <div className="flex gap-3">
                      <input 
                        type="text"
                        value={newTodoTask}
                        onChange={(e) => setNewTodoTask(e.target.value)}
                        placeholder="Add a new task for this project..."
                        className="flex-grow bg-slate-700 text-gray-300 p-2.5 rounded-md border border-slate-600 focus:ring-sky-500 focus:border-sky-500 text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && !addingTodo && handleAddProjectTodo()}
                      />
                      <button 
                        onClick={handleAddProjectTodo} 
                        disabled={addingTodo || !newTodoTask.trim()}
                        className="bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2.5 px-4 rounded-md text-sm disabled:opacity-50 flex items-center justify-center min-w-[90px]"
                      >
                        {addingTodo ? <FaSpinner className="animate-spin" /> : <><FaPlus className="mr-1.5" /> Add</>}
                      </button>
                    </div>
                  </div>

                  {loadingTodos && (
                    <div className="flex items-center justify-center py-6">
                      <FaSpinner className="animate-spin text-2xl text-sky-500" />
                      <p className="ml-3 text-gray-400">Loading to-dos...</p>
                    </div>
                  )}

                  {!loadingTodos && projectTodos.length === 0 && (
                    <p className="text-sm text-gray-500 italic text-center py-4">No to-do items for this project yet.</p>
                  )}

                  {!loadingTodos && projectTodos.length > 0 && (
                    <ul className="space-y-3">
                      {projectTodos.map(todo => (
                        <li 
                          key={todo.id} 
                          className="bg-slate-800 p-3 rounded-md border border-slate-700 hover:border-slate-600 transition-colors duration-150"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <button 
                                onClick={() => handleToggleProjectTodoComplete(todo.id, todo.is_completed)}
                                disabled={updatingField === `todo_complete_${todo.id}`}
                                className="mr-3 text-xl disabled:opacity-50 focus:outline-none"
                                aria-label={todo.is_completed ? "Mark as incomplete" : "Mark as complete"}
                              >
                                {updatingField === `todo_complete_${todo.id}` ? 
                                  <FaSpinner className="animate-spin text-sky-500" /> :
                                  todo.is_completed ? 
                                    <FaCheckSquare className="text-green-500 hover:text-green-400" /> : 
                                    <FaRegSquare className="text-gray-500 hover:text-sky-400" />
                                }
                              </button>
                              <span className={`text-sm ${todo.is_completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                                {todo.task}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                  onClick={() => toggleCommentExpansion(todo.id)}
                                  className="text-xs text-sky-400 hover:text-sky-300 p-1 rounded hover:bg-sky-800/50 transition-colors"
                                  aria-label={expandedComments[todo.id] ? "Hide comments" : "Show comments"}
                                >
                                  {expandedComments[todo.id] ? 'Hide Comments' : `Comments (${comments[todo.id]?.length || 0})`}
                                  {loadingComments[todo.id] && <FaSpinner className="animate-spin ml-1.5 text-xs" />}
                              </button>
                              <button 
                                onClick={() => handleDeleteProjectTodo(todo.id)}
                                disabled={updatingField === `todo_delete_${todo.id}`}
                                className="text-red-600 hover:text-red-500 disabled:opacity-50 p-1 rounded hover:bg-red-900/30 transition-colors"
                                aria-label="Delete to-do item"
                              >
                                {updatingField === `todo_delete_${todo.id}` ? 
                                  <FaSpinner className="animate-spin text-xs" /> : 
                                  <FaTimesCircle className="text-sm" />
                                }
                              </button>
                            </div>
                          </div>
                          {expandedComments[todo.id] && (
                            <div className="mt-3 pt-3 border-t border-slate-700/50">
                              {loadingComments[todo.id] && !comments[todo.id]?.length && (
                                 <div className="flex items-center justify-center py-3">
                                   <FaSpinner className="animate-spin text-sky-500" /> 
                                   <p className="ml-2 text-xs text-gray-400">Loading comments...</p>
                                 </div>
                              )}
                              {!loadingComments[todo.id] && comments[todo.id]?.length === 0 && (
                                <p className="text-xs text-gray-500 italic text-center py-2">No comments yet.</p>
                              )}
                              {comments[todo.id] && comments[todo.id].length > 0 && (
                                <ul className="space-y-2.5 mb-3 max-h-60 overflow-y-auto pr-1">
                                  {comments[todo.id].map(comment => (
                                    <li key={comment.id} className="text-xs bg-slate-750 p-2 rounded-md border border-slate-600/70">
                                      <div className="flex justify-between items-center mb-0.5">
                                        <span className="font-semibold text-sky-300 text-[11px]">
                                          {comment.commenter_display_name || 'User'}
                                        </span>
                                        <span className="text-gray-500 text-[10px]">
                                          {new Date(comment.created_at).toLocaleString([], { year:'2-digit', month:'2-digit', day:'2-digit', hour: '2-digit', minute:'2-digit' })}
                                        </span>
                                      </div>
                                      <p className="text-gray-300 whitespace-pre-wrap">{comment.comment_text}</p>
                                    </li>
                                  ))}
                                </ul>
                              )}
                              <div className="flex gap-2 mt-2">
                                <input
                                  type="text"
                                  value={newCommentText[todo.id] || ''}
                                  onChange={(e) => setNewCommentText(prev => ({ ...prev, [todo.id]: e.target.value }))}
                                  placeholder="Add a comment..."
                                  className="flex-grow bg-slate-700 text-gray-300 p-1.5 rounded-md border border-slate-600 focus:ring-sky-500 focus:border-sky-500 text-xs"
                                  onKeyPress={(e) => e.key === 'Enter' && !addingComment[todo.id] && handleAddTodoComment(todo.id)}
                                />
                                <button
                                  onClick={() => handleAddTodoComment(todo.id)}
                                  disabled={addingComment[todo.id] || !newCommentText[todo.id]?.trim()}
                                  className="bg-sky-700 hover:bg-sky-600 text-white font-semibold py-1.5 px-2.5 rounded-md text-xs disabled:opacity-50 flex items-center justify-center min-w-[60px]"
                                >
                                  {addingComment[todo.id] ? <FaSpinner className="animate-spin" /> : 'Post'}
                                </button>
                              </div>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mt-10 pt-6 border-t border-slate-700 flex justify-end">
                  <button 
                    onClick={openDeleteModal}
                    disabled={!!updatingField}
                    className="inline-flex items-center bg-red-700 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md transition-colors shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    <FaTrash className="mr-2" />
                    Delete Project
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {isDeleteModalOpen && project && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 p-6 md:p-8 rounded-lg shadow-xl border border-gray-700 max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-4">Confirm Deletion</h3>
            <p className="text-gray-300 mb-1">
              Are you sure you want to delete the project:
            </p>
            <p className="text-sky-400 font-semibold mb-6 break-words">
              {project.name || 'this project'}?
            </p>
            <p className="text-xs text-orange-400 mb-6">This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeDeleteModal}
                disabled={updatingField === 'delete_project'}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={updatingField === 'delete_project'}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 flex items-center justify-center"
              >
                {updatingField === 'delete_project' ? (
                  <FaSpinner className="animate-spin mr-2" />
                ) : (
                  <FaTrash className="mr-2" />
                )}
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 