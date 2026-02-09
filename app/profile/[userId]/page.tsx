'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { FaUserCircle, FaEnvelope, FaIdBadge, FaArrowLeft, FaSpinner, FaSignature, FaInfoCircle, FaBriefcase, FaLightbulb, FaUsers, FaPaintBrush, FaCommentDots } from 'react-icons/fa';
import { usePageHeader, PageContextType } from '@/components/MyCtx';

interface ViewedProfile {
  id: string;
  avatar_url: string | null;
  display_name: string | null;
  username: string | null;
  bio: string | null;
}

interface Skill {
  id: string;
  name: string;
  category: string | null;
}

interface Team {
  id: string;
  name: string;
  slug: string;
  color_scheme: {
    bgColor?: string;
    textColor?: string;
    borderColor?: string;
    accentColor?: string;
  } | null;
}

const predefinedSkillColorClasses = [
  "bg-sky-600/80 text-white",
  "bg-emerald-600/80 text-white",
  "bg-rose-600/80 text-white",
  "bg-amber-500/90 text-amber-950",
  "bg-violet-600/80 text-white",
  "bg-cyan-600/80 text-white",
  "bg-pink-600/80 text-white",
  "bg-indigo-600/80 text-white",
  "bg-teal-600/80 text-white",
  "bg-fuchsia-600/80 text-white",
  "bg-lime-600/80 text-white",
  "bg-orange-600/80 text-white",
];

const getSkillColorClass = (str: string | null): string => {
  if (!str) {
    return predefinedSkillColorClasses[0]; // Default color if no string
  }
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32bit integer
  }
  const index = Math.abs(hash) % predefinedSkillColorClasses.length;
  return predefinedSkillColorClasses[index];
};

export default function UserProfilePage() {
  const supabase = createClient();
  const params = useParams();
  const router = useRouter();
  const viewedUserId = params?.userId as string;
  const { setPageContext } = usePageHeader();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [viewedProfile, setViewedProfile] = useState<ViewedProfile | null>(null);
  const [userSkills, setUserSkills] = useState<Skill[]>([]);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = useCallback(async () => {
    if (!viewedUserId) {
      setError('User ID not provided.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser) {
      console.error('Auth error on profile view:', authError);
      setCurrentUser(null);
    } else {
      setCurrentUser(authUser);
    }

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id,
        avatar_url,
        display_name,
        username,
        bio
      `)
      .eq('id', viewedUserId)
      .single();

    if (profileError || !profileData) {
      console.error('Error fetching viewed profile. Details:', {
        message: profileError?.message,
        details: profileError?.details,
        hint: profileError?.hint,
        code: profileError?.code,
        fullError: profileError
      });
      setError('Could not load user profile. The user may not exist or there was a data fetching issue. Check console for details.');
      setViewedProfile(null);
      setLoading(false);
      setPageContext({ title: 'Profile Not Found', href: `/profile/${viewedUserId}`, icon: FaUserCircle });
      return;
    }
    
    setViewedProfile(profileData as ViewedProfile);
    const pageTitle = profileData.username ? `@${profileData.username}` : profileData.display_name || "User Profile";
    setPageContext({ title: pageTitle, href: `/profile/${viewedUserId}`, icon: FaUserCircle });
    
    const { data: skillsData, error: skillsError } = await supabase
      .from('user_skills')
      .select(`
        skills (id, name, category) 
      `)
      .eq('user_id', viewedUserId);

    if (skillsError) {
      console.error('Error fetching user skills. Details:', {
        message: skillsError?.message,
        details: skillsError?.details,
        hint: skillsError?.hint,
        code: skillsError?.code,
        fullError: skillsError
      });
      setUserSkills([]);
    } else {
      const flattenedSkills = skillsData
        ?.flatMap(us => us.skills || [])
        .map(skill => Array.isArray(skill) ? skill[0] : skill)
        .filter(skill => skill && typeof skill === 'object' && skill.id && skill.name) as Skill[] || [];
      setUserSkills(flattenedSkills);
    }
    
    const { data: teamMemberships, error: teamsError } = await supabase
      .from('user_team_memberships')
      .select(`teams (id, name, slug, color_scheme)`)
      .eq('user_id', viewedUserId);

    if (teamsError) {
      console.error('Error fetching user teams. Details:', teamsError);
      setUserTeams([]);
    } else {
      const teams = teamMemberships
        ?.flatMap(tm => tm.teams ? (Array.isArray(tm.teams) ? tm.teams : [tm.teams]) : [])
        .filter(team => team && typeof team === 'object' && team.id && team.name && team.slug) as Team[] || [];
      setUserTeams(teams);
    }
    
    setLoading(false);

  }, [viewedUserId, supabase, setPageContext]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 text-gray-300 flex flex-col items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-sky-500" />
        <p className="mt-3 text-lg">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 text-gray-300 flex flex-col items-center justify-center p-4">
        <div className="bg-red-900/30 border border-red-700 text-red-300 px-6 py-4 rounded-md text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p>{error}</p>
          <button onClick={() => router.back()} className="mt-4 inline-flex items-center bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2 px-4 rounded-md transition-colors">
            <FaArrowLeft className="mr-2" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!viewedProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 text-gray-300 flex flex-col items-center justify-center p-4">
         <div className="text-center max-w-md">
            <FaUserCircle className="mx-auto text-6xl text-gray-600 mb-4" />
            <h2 className="text-2xl font-semibold text-white mb-2">Profile Not Found</h2>
            <p className="text-gray-400 mb-6">The user profile could not be displayed.</p>
            <button onClick={() => router.back()} className="inline-flex items-center bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2 px-4 rounded-md transition-colors">
              <FaArrowLeft className="mr-2" /> Go Back
            </button>
        </div>
      </div>
    );
  }
  
  const displayName = viewedProfile.display_name || viewedProfile.username || 'User';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 text-gray-300 flex flex-col pt-6 md:pt-10 pb-12">
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <button 
              onClick={() => router.back()} 
              className="inline-flex items-center text-sky-400 hover:text-sky-300 transition-colors text-sm mb-4 group"
            >
              <FaArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-150" />
              Back
            </button>
          </div>

          <div className="bg-slate-800 shadow-2xl rounded-xl p-6 md:p-10 border border-slate-700">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 md:gap-8 mb-8">
              {viewedProfile.avatar_url ? (
                <img 
                  src={viewedProfile.avatar_url} 
                  alt={displayName} 
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-slate-700 ring-2 ring-sky-500" 
                />
              ) : (
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-slate-700 flex items-center justify-center border-4 border-slate-600 ring-2 ring-sky-500">
                  <FaUserCircle className="text-6xl md:text-7xl text-slate-500" />
                </div>
              )}
              <div className="text-center sm:text-left flex-grow">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">{displayName}</h1>
                {viewedProfile.username && <p className="text-md text-sky-400 mb-1">@{viewedProfile.username}</p>}
                {currentUser && viewedProfile && currentUser.id !== viewedProfile.id && (
                  <div className="sm:ml-auto flex-shrink-0 mt-4 sm:mt-0">
                    <button
                      onClick={() => router.push(`/messages/user/${viewedProfile.id}`)}
                      className="inline-flex items-center bg-green-600 hover:bg-green-500 text-white font-semibold py-2 px-4 rounded-md transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
                    >
                      <FaCommentDots className="mr-2" />
                      Message @{viewedProfile.username || 'User'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {viewedProfile.bio && (
              <div className="mb-8 p-4 bg-slate-850/50 rounded-lg border border-slate-700/70">
                <h2 className="text-xl font-semibold text-sky-300 mb-2 flex items-center"><FaInfoCircle className="mr-2 text-sky-400"/>Bio</h2>
                <p className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">{viewedProfile.bio}</p>
              </div>
            )}

            {userSkills.length > 0 && (
              <div className="mb-6 p-4 bg-slate-850/50 rounded-lg border border-slate-700/70">
                <h2 className="text-xl font-semibold text-sky-300 mb-3 flex items-center"><FaLightbulb className="mr-2 text-yellow-400"/>Skills</h2>
                {userSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {userSkills.map(skill => (
                      <span 
                        key={skill.id} 
                        className={`text-xs font-medium px-2.5 py-1 rounded-full shadow-sm ${getSkillColorClass(skill.category || skill.name)}`}
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No skills listed yet.</p>
                )}
              </div>
            )}

            {userTeams.length > 0 && (
              <div className="mb-6 p-4 bg-slate-850/50 rounded-lg border border-slate-700/70">
                <h2 className="text-xl font-semibold text-sky-300 mb-3 flex items-center"><FaUsers className="mr-2 text-teal-400"/>Teams</h2>
                <div className="flex flex-wrap gap-3">
                  {userTeams.map(team => (
                    <Link key={team.id} href={`/teams/${team.slug}`} passHref>
                      <div 
                        className={`text-xs font-medium px-3 py-1.5 rounded-full shadow-md cursor-pointer hover:opacity-90 transition-opacity flex items-center gap-2 border`}
                        style={{
                          backgroundColor: team.color_scheme?.bgColor || '#334155',
                          color: team.color_scheme?.textColor || '#e2e8f0',
                          borderColor: team.color_scheme?.borderColor || '#475569'
                        }}
                      >
                        {team.name}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
            {/* Placeholder for more sections like 'Projects Involved In', 'Recent Activity', etc. */}

          </div>
        </div>
      </main>
    </div>
  );
}