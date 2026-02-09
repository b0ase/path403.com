'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import getSupabaseBrowserClient from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { FiMail, FiUsers, FiMessageSquare, FiArrowLeft } from 'react-icons/fi';
import Image from 'next/image';

interface UserTeam {
    id: string;
    name: string;
    slug: string | null;
    unread_count: number;
}

interface DirectThread {
    id: string;
    display_name: string | null;
    avatar_url?: string | null;
    unread_count: number;
}

export default function DashboardMessagesPage() {
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
                router.push('/login?redirectedFrom=/dashboard/messages');
            }
        };
        fetchUser();
    }, [supabase, router]);

    const fetchUserTeamsWithMessages = useCallback(async (userId: string) => {
        if (!userId) return;
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
                .select('id, name, slug')
                .in('id', teamIds)
                .order('name', { ascending: true });

            if (teamsError) throw teamsError;

            const processedTeams = (teamsData || []).map(team => ({
                id: team.id,
                name: team.name,
                slug: team.slug,
                unread_count: 0
            }));
            setUserTeams(processedTeams);
        } catch (e: any) {
            console.error('Error fetching user teams:', e);
            setError(e.message);
        }
    }, [supabase]);

    const fetchDirectThreads = useCallback(async (userId: string) => {
        if (!userId) return;
        try {
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

                const threads = (profiles || []).map(p => ({
                    id: p.id,
                    display_name: p.display_name,
                    avatar_url: p.avatar_url,
                    unread_count: 0
                }));
                setDirectThreads(threads);
            } else {
                setDirectThreads([]);
            }
        } catch (e: any) {
            console.error('Error fetching direct threads:', e);
        }
    }, [supabase]);

    useEffect(() => {
        if (currentUser?.id) {
            Promise.all([
                fetchUserTeamsWithMessages(currentUser.id),
                fetchDirectThreads(currentUser.id)
            ]).finally(() => setLoading(false));
        }
    }, [currentUser, fetchUserTeamsWithMessages, fetchDirectThreads]);

    if (loading || !currentUser) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white font-mono text-sm">LOADING MESSAGES...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white font-mono">
            <div className="w-full px-8 py-8">
                {/* Header */}
                <header className="mb-12">
                    <div className="flex items-center gap-4 mb-6">
                        <Link href="/dashboard" className="text-gray-500 hover:text-white transition-colors">
                            <FiArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">MESSAGES</h1>
                            <p className="text-sm text-gray-500">DIRECT & TEAM MESSAGES</p>
                        </div>
                    </div>
                </header>

                {error && <div className="mb-6 p-3 border border-red-900 text-red-400 text-sm">{error}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Direct Messages */}
                    <div>
                        <h2 className="text-sm text-gray-500 mb-4">DIRECT MESSAGES</h2>
                        {directThreads.length > 0 ? (
                            <div className="space-y-2">
                                {directThreads.map(user => (
                                    <Link
                                        key={user.id}
                                        href={`/messages/${user.id}`}
                                        className="block p-4 border border-gray-900 hover:border-gray-700 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            {user.avatar_url ? (
                                                <Image
                                                    src={user.avatar_url}
                                                    alt={user.display_name || 'User'}
                                                    width={32}
                                                    height={32}
                                                    className="w-8 h-8 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 border border-gray-700 flex items-center justify-center">
                                                    <FiUsers size={14} className="text-gray-500" />
                                                </div>
                                            )}
                                            <span className="text-white">{user.display_name || 'UNKNOWN'}</span>
                                            {user.unread_count > 0 && (
                                                <span className="ml-auto text-xs bg-white text-black px-2 py-0.5 font-bold">
                                                    {user.unread_count}
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 border border-gray-900">
                                <FiMail className="mx-auto text-3xl text-gray-600 mb-3" />
                                <p className="text-gray-500 text-sm">NO DIRECT MESSAGES</p>
                            </div>
                        )}
                    </div>

                    {/* Team Messages */}
                    <div>
                        <h2 className="text-sm text-gray-500 mb-4">TEAM MESSAGES</h2>
                        {userTeams.length > 0 ? (
                            <div className="space-y-2">
                                {userTeams.map(team => (
                                    <Link
                                        key={team.id}
                                        href={team.slug ? `/teams/${team.slug}` : `/teams/${team.id}`}
                                        className="block p-4 border border-gray-900 hover:border-gray-700 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <FiMessageSquare size={14} className="text-gray-500" />
                                            <span className="text-white">{team.name.toUpperCase()}</span>
                                            {team.unread_count > 0 && (
                                                <span className="ml-auto text-xs bg-white text-black px-2 py-0.5 font-bold">
                                                    {team.unread_count}
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 border border-gray-900">
                                <FiUsers className="mx-auto text-3xl text-gray-600 mb-3" />
                                <p className="text-gray-500 text-sm">NO TEAM MESSAGES</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
