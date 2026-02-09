'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import getSupabaseBrowserClient from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { FaEnvelope, FaSpinner, FaUsers, FaQuestionCircle, FaComments } from 'react-icons/fa';

// Helper to map icon names to components (copied from other pages)
const iconMap: { [key: string]: React.ElementType } = {
  FaUsers,
  FaQuestionCircle,
  // Add other icons as needed from your project's iconMap
};

interface ColorScheme {
  bgColor: string;
  textColor: string;
  borderColor: string;
}

interface UserTeam {
  id: string;
  name: string;
  slug: string | null;
  icon_name: string | null;
  color_scheme: ColorScheme | null;
  last_message_preview?: string | null;
  unread_count: number;
}

interface DirectThread {
  id: string;
  display_name: string | null;
  avatar_url?: string | null;
  unread_count: number;
}

export default function MessagesPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userTeams, setUserTeams] = useState<UserTeam[]>([]);
  const [directThreads, setDirectThreads] = useState<DirectThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
      } else {
        router.push('/login?message=Please log in to view your messages.');
      }
    };
    fetchUser();
  }, [supabase, router]);

  const fetchUserTeamsWithMessages = useCallback(async (userId: string) => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const { data: teamUserEntries, error: teamUserError } = await supabase
        .from('user_team_memberships')
        .select('team_id')
        .eq('user_id', userId);

      if (teamUserError) throw teamUserError;

      if (!teamUserEntries || teamUserEntries.length === 0) {
        setUserTeams([]);
        return;
      }

      const teamIds = teamUserEntries.map(entry => entry.team_id);

      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('id, name, slug, icon_name, color_scheme')
        .in('id', teamIds)
        .order('name', { ascending: true });

      if (teamsError) throw teamsError;

      if (!teamsData) {
        setUserTeams([]);
        return;
      }

      const processedTeamsData = await Promise.all(
        teamsData.map(async (team) => {
          let unreadCount = 0;
          const defaultColorScheme: ColorScheme = { bgColor: 'bg-gray-700', textColor: 'text-gray-100', borderColor: 'border-gray-500' };
          
          let finalColorScheme: ColorScheme | null = defaultColorScheme;
          // Type guard for ColorScheme
          const isColorScheme = (obj: any): obj is ColorScheme => {
            return obj && typeof obj === 'object' &&
                   'bgColor' in obj && typeof obj.bgColor === 'string' &&
                   'textColor' in obj && typeof obj.textColor === 'string' &&
                   'borderColor' in obj && typeof obj.borderColor === 'string';
          };

          if (team.color_scheme === null) {
            finalColorScheme = null;
          } else if (isColorScheme(team.color_scheme)) {
            // If it matches the shape, create a new object to ensure it's treated as ColorScheme
            finalColorScheme = { 
              bgColor: team.color_scheme.bgColor,
              textColor: team.color_scheme.textColor,
              borderColor: team.color_scheme.borderColor
            };
          } // Otherwise, it remains defaultColorScheme

          try {
            const { data: lastSeenData, error: lastSeenError } = await supabase
              .from('user_team_last_seen')
              .select('last_seen_message_created_at')
              .eq('user_id', userId)
              .eq('team_id', team.id)
              .single();

            if (lastSeenError && lastSeenError.code !== 'PGRST116') { // PGRST116: no rows found
              console.warn(`Error fetching last seen for team ${team.id}:`, lastSeenError.message);
            }
            const lastSeenTimestamp = lastSeenData?.last_seen_message_created_at;

            // Assuming 'team_messages' table with 'team_id' and 'created_at' columns.
            // And that team_messages are ordered by created_at descending to get the latest.
            const messageQuery = supabase
              .from('team_messages') // TODO: Verify this table name and structure
              .select('id', { count: 'exact', head: true })
              .eq('team_id', team.id);

            if (lastSeenTimestamp) {
              // Count messages strictly newer than the last seen timestamp.
              const { count, error: messagesError } = await messageQuery.gt('created_at', lastSeenTimestamp);
              if (messagesError) {
                console.warn(`Error fetching unread message count for team ${team.id}:`, messagesError.message);
              } else {
                unreadCount = count || 0;
              }
            } else {
              // If never seen, all messages are unread.
              const { count, error: messagesError } = await messageQuery;
               if (messagesError) {
                console.warn(`Error fetching total message count for team ${team.id}:`, messagesError.message);
              } else {
                unreadCount = count || 0;
              }
            }
          } catch (e: any) {
            console.error(`Error processing unread count for team ${team.id}:`, e.message);
          }
          
          return {
            id: team.id,
            name: team.name,
            slug: team.slug,
            icon_name: team.icon_name || 'FaQuestionCircle',
            color_scheme: finalColorScheme,
            unread_count: unreadCount,
          } as UserTeam;
        })
      );
      setUserTeams(processedTeamsData);
    } catch (e: any) {
      console.error('Error fetching user teams for messages page:', e);
      setError(`Failed to load your teams: ${e.message}`);
      setUserTeams([]);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const fetchDirectThreads = useCallback(async (userId: string) => {
    if (!userId) return;
    try {
      // Fetch all DM relations for the current user
      const { data: dms, error: dmError } = await supabase
        .from('direct_messages')
        .select('sender_id, receiver_id')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
        
      if (dmError) throw dmError;

      const otherUserIds = new Set<string>();
      dms?.forEach(dm => {
        if (dm.sender_id === userId) otherUserIds.add(dm.receiver_id);
        else if (dm.receiver_id === userId) otherUserIds.add(dm.sender_id);
      });

      if (otherUserIds.size > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url')
          .in('id', Array.from(otherUserIds));

        if (profilesError) throw profilesError;

        if (profiles) {
          const threadsWithUnreadCounts = await Promise.all(
            profiles.map(async (profile) => {
              const { count, error: unreadError } = await supabase
                .from('direct_messages')
                .select('*', { count: 'exact', head: true })
                .eq('receiver_id', userId) // Current user is the receiver
                .eq('sender_id', profile.id)   // Message is from the other user in the thread
                .eq('is_read', false);        // And it's unread

              if (unreadError) {
                console.error(`Error fetching unread count for DM with ${profile.id}:`, unreadError);
                return { ...profile, unread_count: 0 };
              }
              return { ...profile, unread_count: count || 0 };
            })
          );
          setDirectThreads(threadsWithUnreadCounts);
        } else {
          setDirectThreads([]);
        }
      } else {
        setDirectThreads([]);
      }
    } catch (e: any) {
      console.error('Error fetching direct threads:', e);
      setError(`Failed to load direct messages: ${e.message}`);
      setDirectThreads([]);
    }
  }, [supabase]);

  useEffect(() => {
    if (currentUser?.id) {
      fetchUserTeamsWithMessages(currentUser.id);
      fetchDirectThreads(currentUser.id);
    }
  }, [currentUser, fetchUserTeamsWithMessages, fetchDirectThreads]);

  if (loading || !currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <FaSpinner className="animate-spin text-4xl text-sky-500 mb-4" />
        <p className="text-xl text-gray-400">Loading your messages...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex items-center mb-8">
        <FaComments className="text-3xl text-sky-500 mr-3" />
        <h1 className="text-3xl font-bold text-white">My Messages</h1>
      </div>

      <div className="flex flex-col md:flex-row md:space-x-8">
        {/* Column 1: Direct Messages */}
        <div className="w-full md:w-1/2 mb-8 md:mb-0">
          <h2 className="text-2xl font-semibold text-white mb-4">Direct Messages</h2>
          {directThreads.length > 0 ? (
            <div className="space-y-4">
              {directThreads.map(user => (
                <Link
                  key={user.id}
                  href={`/messages/${user.id}`}
                  className="block p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-4"
                >
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.display_name || 'User'} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <FaUsers className="w-10 h-10 text-gray-500" />
                  )}
                  <div>
                    <span className="text-lg text-white">{user.display_name || 'Unknown User'}</span>
                    {/* Placeholder for unread indicator */}
                    {user.unread_count > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-sky-500 text-white text-xs font-semibold rounded-full">
                        {user.unread_count}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            !loading && ( // Only show "No direct messages" if not loading
              <div className="text-center py-10 bg-gray-800 rounded-lg">
                <FaEnvelope className="mx-auto text-4xl text-gray-500 mb-3" />
                <p className="text-gray-400">No direct messages.</p>
              </div>
            )
          )}
        </div>

        {/* Column 2: Team Messages */}
        <div className="w-full md:w-1/2">
          <h2 className="text-2xl font-semibold text-white mb-4">Team Messages</h2>
          {userTeams.length > 0 ? (
            <div className="space-y-4">
              {userTeams.map((team) => {
                const IconComponent = iconMap[team.icon_name || 'FaQuestionCircle'] || FaQuestionCircle;
                const cardBgColor = team.color_scheme?.bgColor || 'bg-slate-800';
                const cardTextColor = team.color_scheme?.textColor || 'text-slate-100';
                const cardBorderColor = team.color_scheme?.borderColor || 'border-slate-700';

                return (
                  <Link
                    key={team.id}
                    href={team.slug ? `/teams/${team.slug}` : `/teams/${team.id}`}
                    className={`flex items-center p-4 rounded-lg border transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl ${cardBgColor} ${cardTextColor} ${cardBorderColor}`}
                  >
                    <IconComponent className="text-3xl mr-4 shrink-0" style={{ color: team.color_scheme?.textColor || 'inherit' }} />
                    <div className="flex-grow">
                      <h3 className="text-xl font-semibold">{team.name}</h3>
                      {/* Placeholder for last message preview & unread count */}
                    </div>
                    {/* Placeholder for unread indicator */}
                    {team.unread_count > 0 && (
                      <span className="ml-auto px-2.5 py-1 bg-sky-500 text-white text-xs font-bold rounded-full self-center">
                        {team.unread_count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ) : (
             !loading && ( // Only show "You are not part of any teams" if not loading
              <div className="text-center py-10 bg-gray-800 rounded-lg">
                <FaUsers className="mx-auto text-4xl text-gray-500 mb-3" />
                <p className="text-gray-400">You are not part of any teams.</p>
                 <p className="text-gray-400 mt-2 text-sm">
                   <Link href="/teams/join" className="text-sky-500 hover:underline">Join a team</Link> or 
                   <Link href="/teams/new" className="text-sky-500 hover:underline ml-1">create a new one</Link> to start collaborating.
                 </p>
              </div>
            )
          )}
        </div>
      </div>

      {error && (
        <div className="mt-8 bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-md">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}

      {/* Combined message for no DMs and no Teams when not loading */}
      {!loading && directThreads.length === 0 && userTeams.length === 0 && !error && (
        <div className="text-center py-10 mt-8">
          <FaEnvelope className="mx-auto text-5xl text-gray-500 mb-4" />
          <p className="text-gray-400 text-lg">You have no messages yet.</p>
          <p className="text-gray-500 mt-2">
            Start a conversation or join a team to see messages here.
          </p>
        </div>
      )}

    </div>
  );
} 