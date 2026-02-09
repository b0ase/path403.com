'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FaUsers, FaQuestionCircle, FaSpinner, FaDatabase, FaPalette, FaBolt, FaCloud, FaLightbulb, FaBrain, FaHandshake, FaPlus } from 'react-icons/fa';
import getSupabaseBrowserClient from '@/lib/supabase/client';

// Import or define necessary interfaces and iconMap
const iconMap: { [key: string]: React.ElementType } = {
  FaDatabase,
  FaPalette,
  FaBolt,
  FaCloud,
  FaLightbulb,
  FaBrain,
  FaUsers, // For a generic team icon
  FaQuestionCircle, // Default
  FaSpinner, // For loading states
};

interface ColorScheme {
  bgColor: string;
  textColor: string;
  borderColor: string;
}

interface Team {
  id: string;
  name: string;
  slug: string | null;
  icon_name: string | null;
  color_scheme: ColorScheme | null;
}

interface UserTeamsProps {
  userTeams: Team[];
  loadingUserTeams: boolean;
  errorUserTeams: string | null;
  userId: string;
}

export default function UserTeams({
  userTeams,
  loadingUserTeams,
  errorUserTeams,
  userId,
}: UserTeamsProps) {
  const supabase = getSupabaseBrowserClient();

  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [joinableTeams, setJoinableTeams] = useState<Team[]>([]);
  const [selectedTeamToJoin, setSelectedTeamToJoin] = useState<string>('');
  const [loadingAllTeams, setLoadingAllTeams] = useState<boolean>(false);
  const [joiningTeam, setJoiningTeam] = useState<boolean>(false);
  const [joinTeamError, setJoinTeamError] = useState<string | null>(null);
  const [customTeamName, setCustomTeamName] = useState<string>('');
  const [creatingTeam, setCreatingTeam] = useState<boolean>(false);
  const [createTeamError, setCreateTeamError] = useState<string | null>(null);

  // Fetch all teams
  useEffect(() => {
    const fetchTeams = async () => {
      setLoadingAllTeams(true);
      const { data, error } = await supabase
        .from('teams')
        .select('id, name, slug, icon_name, color_scheme');
      if (error) {
        console.error('Error fetching all teams:', error);
        setJoinTeamError('Could not load available teams.');
      } else {
        // Supabase returns color_scheme as JSON string or object, ensure it matches Team interface
        const typedData = data?.map(team => ({
          ...team,
          color_scheme: typeof team.color_scheme === 'string' 
            ? JSON.parse(team.color_scheme) 
            : team.color_scheme
        })) || [];
        setAllTeams(typedData as Team[]);
      }
      setLoadingAllTeams(false);
    };
    fetchTeams();
  }, [supabase]);

  // Calculate joinable teams
  useEffect(() => {
    const currentUserTeamIds = new Set(userTeams.map(team => team.id));
    const filteredTeams = allTeams.filter(team => !currentUserTeamIds.has(team.id));
    setJoinableTeams(filteredTeams);
  }, [allTeams, userTeams]);

  const handleJoinTeam = useCallback(async () => {
    if (!selectedTeamToJoin || !userId) {
      setJoinTeamError('Please select a team to join.');
      return;
    }
    setJoiningTeam(true);
    setJoinTeamError(null);

    const { error } = await supabase
      .from('user_team_memberships')
      .insert({ user_id: userId, team_id: selectedTeamToJoin, role: 'member' }); 
      // Assuming 'member' is a default role

    if (error) {
      console.error('Error joining team:', error);
      setJoinTeamError(`Failed to join team: ${error.message}`);
    } else {
      // Success!
      setSelectedTeamToJoin('');
      // Ideally, trigger a refresh of profile data here to update userTeams list
      // This might involve calling a prop function like onTeamJoined()
      // For now, the user might need to manually refresh or navigate away/back
      alert('Team joined successfully! The team list will update on next profile load or refresh.');
      // To force a re-fetch of user teams, we'd need to lift state or pass a callback from useProfileData
      // Example: if (onTeamJoined) onTeamJoined();
    }
    setJoiningTeam(false);
  }, [selectedTeamToJoin, userId, supabase]);

  const handleCreateTeam = useCallback(async () => {
    if (!customTeamName.trim()) {
      setCreateTeamError('Please enter a team name.');
      return;
    }
    if (!userId) {
      setCreateTeamError('User ID not found. Cannot create team.');
      return;
    }

    setCreatingTeam(true);
    setCreateTeamError(null);

    // 1. Create the team
    const teamNameToSlug = customTeamName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const { data: newTeamData, error: createTeamErrorMsg } = await supabase
      .from('teams')
      .insert({ name: customTeamName.trim(), slug: teamNameToSlug }) // Add other default fields if necessary, e.g., icon_name
      .select()
      .single();

    if (createTeamErrorMsg || !newTeamData) {
      console.error('Error creating team:', createTeamErrorMsg);
      setCreateTeamError(`Failed to create team: ${createTeamErrorMsg?.message || 'Unknown error'}`);
      setCreatingTeam(false);
      return;
    }

    // 2. Add the current user as a member of the new team
    const { error: addUserToTeamError } = await supabase
      .from('user_team_memberships')
      .insert({ user_id: userId, team_id: newTeamData.id, role: 'admin' }); // Or 'owner'

    if (addUserToTeamError) {
      console.error('Error adding user to new team:', addUserToTeamError);
      // Potentially try to delete the team if adding user fails, or inform user.
      setCreateTeamError(`Team created, but failed to add you as a member: ${addUserToTeamError.message}. Please try joining it manually.`);
    } else {
      // Success!
      setCustomTeamName('');
      alert('Team created successfully and you have been added as a member! The team list will update on next profile load or refresh.');
      // Ideally, trigger a refresh of profile data here.
    }
    setCreatingTeam(false);
  }, [customTeamName, userId, supabase]);

  return (
    <section className="pb-6 lg:w-1/2 p-6 bg-black rounded-xl shadow-md border border-gray-800 flex flex-col">
      <h2 className="text-sm font-medium text-gray-300 mb-4 flex items-center">
        <FaHandshake className="mr-2 text-sky-400"/>
        <Link href="/teams/join" className="hover:underline">
          Your Teams
        </Link>
      </h2>
      {loadingUserTeams ? (
         <div className="flex items-center text-gray-400"><FaSpinner className="animate-spin mr-2" /> Loading teams...</div>
      ) : userTeams.length === 0 ? (
        <p className="text-gray-400">Not a member of any teams yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2 mb-6">
          {userTeams.map(team => {
            const IconComponent = iconMap[team.icon_name || 'FaQuestionCircle'] || FaQuestionCircle;
            // Define card-specific styles based on the /team page aesthetic
            const cardBgColor = team.color_scheme?.bgColor || 'bg-black';
            const cardBorderColor = team.color_scheme?.borderColor || 'border-gray-800';
            // const cardTextColor = team.color_scheme?.textColor || 'text-gray-400'; // Base text color for card

            return (
              <Link 
                key={team.id} 
                href={`/teams/${team.slug || team.id}`}
                // Updated className to match /team page style
                className={`group p-3 flex flex-col justify-between border border-gray-700 bg-black shadow-none transition-all duration-200 ease-in-out hover:border-gray-500 text-gray-300 cursor-pointer`}
              >
                <div className="flex items-center"> {/* Retain flex for icon and name alignment */}
                  <IconComponent className="mr-2 text-lg text-white opacity-90" /> {/* Adjusted icon style */}
                  <h3 className="font-normal text-white text-sm truncate">{team.name}</h3> {/* Adjusted text style for name */}
                </div>
                {/* If you plan to add more details like on /team page, they would go here, styled accordingly */}
                {/* For now, it keeps the minimalist look of icon + name */}
              </Link>
            );
          })}
        </div>
      )}
      {errorUserTeams && <p className="mt-4 text-sm text-red-400">{errorUserTeams}</p>}

      {/* Join and Create Team Section Wrapper */}
      <div className="mt-auto pt-6 border-t border-gray-800">
        {/* Join Existing Team Section */}
        <div className="mb-4">
          <label htmlFor="join-team-select" className="block text-sm font-medium text-gray-300 mb-2">Join Existing Team:</label>
          {loadingAllTeams ? (
            <div className="flex items-center text-gray-400"><FaSpinner className="animate-spin mr-2" /> Loading available teams...</div>
          ) : joinableTeams.length === 0 && allTeams.length > 0 ? (
             <p className="text-gray-400 text-xs">You are a member of all available teams.</p>
          ) : joinableTeams.length === 0 && allTeams.length === 0 ? (
            <p className="text-gray-400 text-xs">No other teams available to join currently.</p>
          ) : (
            <div className="flex items-center gap-2">
              <select
                id="join-team-select"
                value={selectedTeamToJoin}
                onChange={(e) => setSelectedTeamToJoin(e.target.value)}
                className="block w-full px-3 py-1.5 pr-8 rounded bg-black border border-gray-800 text-gray-300 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-xs disabled:opacity-50"
                disabled={joiningTeam || loadingAllTeams}
              >
                <option value="">-- Select a team to join --</option>
                {joinableTeams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
              <button
                onClick={handleJoinTeam}
                disabled={!selectedTeamToJoin || joiningTeam || loadingAllTeams}
                className="inline-flex items-center px-3 py-1.5 border border-sky-500 text-xs font-medium rounded text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-offset-black focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
              >
                {joiningTeam ? <FaSpinner className="animate-spin mr-1.5" /> : <FaPlus className="mr-1.5" />}
                Join Team
              </button>
            </div>
          )}
          {joinTeamError && <p className="mt-2 text-xs text-red-400">{joinTeamError}</p>}
        </div>

        {/* Create Custom Team Section */}
        <div className="mb-4">
          <label htmlFor="create-team-input" className="block text-sm font-medium text-gray-300 mb-2">Add Custom Team:</label>
          <div className="flex items-center gap-2">
            <input
              id="create-team-input"
              type="text"
              value={customTeamName}
              onChange={(e) => setCustomTeamName(e.target.value)}
              placeholder="e.g., The Innovators"
              className="block w-full px-3 py-1.5 rounded bg-black border border-gray-800 shadow-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-xs disabled:opacity-50"
              disabled={creatingTeam}
            />
            <button
              onClick={handleCreateTeam}
              disabled={!customTeamName.trim() || creatingTeam}
              className="inline-flex items-center px-3 py-1.5 border border-gray-800 text-xs font-medium rounded text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-offset-black focus:ring-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              {creatingTeam ? <FaSpinner className="animate-spin mr-1.5" /> : <FaPlus className="mr-1.5" />}
              Create Team
            </button>
          </div>
          {createTeamError && <p className="mt-2 text-xs text-red-400">{createTeamError}</p>}
        </div>
      </div>
    </section>
  );
}
