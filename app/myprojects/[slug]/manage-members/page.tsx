'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { FaArrowLeft, FaEnvelope, FaPaperPlane, FaSpinner } from 'react-icons/fa';

interface ProjectDetails {
  id: string;
  name: string;
  project_slug: string; 
  user_id: string; // Owner ID
}

export default function ManageProjectMembersPage() {
  const supabase = createClient();
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [authUser, setAuthUser] = useState<User | null>(null);
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // const [inviteEmail, setInviteEmail] = useState('');
  // const [inviteMessage, setInviteMessage] = useState<string | null>(null);
  // const [inviting, setInviting] = useState(false);

  const fetchProjectAndUser = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data: { user: currentUser } } = await supabase.auth.getUser();
    setAuthUser(currentUser);

    if (!currentUser) {
      setError('You must be logged in to manage members.');
      setLoading(false);
      // Optionally redirect: router.push('/login');
      return;
    }

    if (!slug) {
      setError('Project slug is missing.');
      setLoading(false);
      return;
    }

    const { data: projectData, error: projectError } = await supabase
      .from('clients')
      .select('id, name, project_slug, user_id') 
      .eq('project_slug', slug)
      .single();

    if (projectError) {
      console.error('Error fetching project:', projectError);
      setError(`Failed to load project details: ${projectError.message}`);
      setProject(null);
    } else if (projectData) {
      setProject(projectData as ProjectDetails);
      if (projectData.user_id === currentUser.id) {
        setIsOwner(true);
      } else {
        setError('You are not authorized to manage members for this project.');
        setIsOwner(false);
      }
    } else {
      setError('Project not found.');
      setProject(null);
    }
    setLoading(false);
  }, [slug, supabase]);

  useEffect(() => {
    fetchProjectAndUser();
  }, [fetchProjectAndUser]);

  /*
  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !project || !isOwner) {
      // setInviteMessage('Invalid email or insufficient permissions.');
      return;
    }
    // setInviting(true);
    // setInviteMessage(null);

    // const { error: insertError } = await supabase
    //   .from('project_memberships')
    //   .insert({
    //     project_id: project.id,
    //     // invitee_email: inviteEmail.trim(), // This needs to align with your table
    //     status: 'invited',
    //     role: 'member', 
    //     invited_by: authUser?.id
    //   });

    // if (insertError) {
    //   console.error('Error sending invitation:', insertError);
    //   // setInviteMessage(`Failed to send invitation: ${insertError.message}`);
    // } else {
    //   // setInviteMessage(`Invitation sent to ${inviteEmail}.`);
    //   // setInviteEmail(''); 
    // }
    // setInviting(false);
  };
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4">
        <FaSpinner className="animate-spin text-4xl mb-4" />
        <p>Loading project details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4">
        <p className="text-red-400 text-lg mb-4">{error}</p>
        <Link href="/myprojects" legacyBehavior>
          <a className="text-sky-400 hover:text-sky-300 flex items-center">
            <FaArrowLeft className="mr-2" /> Go back to My Projects
          </a>
        </Link>
      </div>
    );
  }

  if (!project) {
    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4">
            <p className="text-red-400 text-lg mb-4">Project could not be loaded.</p>
            <Link href="/myprojects" legacyBehavior>
            <a className="text-sky-400 hover:text-sky-300 flex items-center">
                <FaArrowLeft className="mr-2" /> Go back to My Projects
            </a>
            </Link>
        </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4">
        <p className="text-red-400 text-lg mb-4">You are not authorized to manage members for this project.</p>
        <Link href={`/myprojects/${slug}`} legacyBehavior>
          <a className="text-sky-400 hover:text-sky-300 flex items-center">
            <FaArrowLeft className="mr-2" /> Go back to Project
          </a>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-8">
      <main className="container mx-auto max-w-2xl">
        <div className="mb-6">
          <Link href={`/myprojects/${slug}`} legacyBehavior>
            <a className="text-sky-400 hover:text-sky-300 inline-flex items-center mb-4">
              <FaArrowLeft className="mr-2" /> Back to Project: {project.name}
            </a>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-sky-400">Manage Members</h1>
          <p className="text-gray-400">Project: {project.name} (ID: {project.id})</p>
        </div>

        <section className="bg-gray-800 shadow-xl rounded-lg p-6 mb-8 border border-gray-700/50">
          <h2 className="text-2xl font-semibold text-gray-200 mb-4">Invite New Member</h2>
          <p className="text-gray-400 italic">(Invitation form functionality is temporarily disabled.)</p>
          {/* 
          <form 
            // onSubmit={handleInviteUser} 
            className="space-y-4"
          >
            <div>
              <label htmlFor="inviteEmail" className="block text-sm font-medium text-gray-300 mb-1">
                User Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  type="email"
                  id="inviteEmail"
                  name="inviteEmail"
                  // value={inviteEmail}
                  // onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="user@example.com"
                  required
                  className="bg-gray-700 border border-gray-600 text-gray-100 focus:ring-sky-500 focus:border-sky-500 block w-full pl-10 p-2.5 rounded-md shadow-sm"
                />
              </div>
            </div>
            <button
              type="submit"
              // disabled={inviting || !inviteEmail.trim()}
              disabled={true} // Temporarily disable
              className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              { // inviting 
                false ? ( 
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaPaperPlane className="mr-2" />
              )}
              Send Invitation
            </button>
          </form>
          { // inviteMessage && (
            // <p className={`mt-4 text-sm ${inviteMessage.startsWith('Failed') ? 'text-red-400' : 'text-green-400'}`}>
            //   {inviteMessage}
            // </p>
          // )
          }
          */}
        </section>

        <section className="bg-gray-800 shadow-xl rounded-lg p-6 border border-gray-700/50">
            <h2 className="text-2xl font-semibold text-gray-200 mb-4">Current Members & Invitations</h2>
            <p className="text-gray-400 italic">(List of current members, pending invitations, and management options will go here.)</p>
        </section>

      </main>
    </div>
  );
}