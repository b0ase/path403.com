'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    FiUsers,
    FiUserPlus,
    FiFolder,
    FiChevronUp,
    FiChevronDown,
    FiTrash2,
    FiAlertTriangle,
    FiArrowLeft
} from 'react-icons/fi';

enum ProjectRole {
    Owner = 'Owner',
    Client = 'Client',
    Developer = 'Developer',
    Designer = 'Designer',
    Manager = 'Manager',
    Freelancer = 'Freelancer',
    Consultant = 'Consultant',
    Investor = 'Investor',
    Advisor = 'Advisor',
    Contributor = 'Contributor'
}

interface TeamMember {
    id: string;
    user_id: string;
    project_id: string;
    role: ProjectRole;
    display_name: string;
    email: string;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
}

interface PlatformUser {
    id: string;
    email: string;
    display_name?: string;
    avatar_url?: string;
    role?: string;
}

interface ManagedProject {
    id: string;
    name: string;
}

export default function UserTeamsPage() {
    const supabase = createClient();
    const router = useRouter();
    const [user, setUser] = useState<any | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);

    const [managedProjects, setManagedProjects] = useState<ManagedProject[]>([]);
    const [isLoadingProjects, setIsLoadingProjects] = useState(true);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [isLoadingTeamMembers, setIsLoadingTeamMembers] = useState(false);

    const [platformUsers, setPlatformUsers] = useState<PlatformUser[]>([]);
    const [selectedPlatformUserId, setSelectedPlatformUserId] = useState<string>('');
    const [newMemberRole, setNewMemberRole] = useState<ProjectRole>(ProjectRole.Freelancer);
    const [isAddingMember, setIsAddingMember] = useState(false);

    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState<{ userId: string; displayName: string; projectId: string; projectName: string; } | null>(null);
    const [isRemovingMember, setIsRemovingMember] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        const getUser = async () => {
            setLoadingUser(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) setUser(session.user);
            else router.push('/login?redirectedFrom=' + encodeURIComponent('/user/account/teams'));
            setLoadingUser(false);
        };
        getUser();
    }, [supabase, router]);

    const fetchManagedProjects = useCallback(async (userId: string) => {
        setIsLoadingProjects(true);
        setError(null);
        try {
            // 1. Get projects owned by user
            const { data: ownedProjects, error: ownedError } = await supabase
                .from('projects')
                .select('id, name')
                .eq('owner_user_id', userId);

            if (ownedError) throw ownedError;

            const ownedProjectList = ownedProjects || [];

            // 2. Get projects where user is a Client (via project_members)
            const { data: clientProjectMemberships, error: clientMembershipError } = await supabase
                .from('project_members')
                .select('project_id')
                .eq('user_id', userId)
                .eq('role', 'Client');

            if (clientMembershipError) throw clientMembershipError;

            let clientRoleProjects: ManagedProject[] = [];
            if (clientProjectMemberships && clientProjectMemberships.length > 0) {
                const clientProjectIds = clientProjectMemberships.map(pm => pm.project_id);
                const { data: projectsForClientRole, error: projectsForClientError } = await supabase
                    .from('projects')
                    .select('id, name')
                    .in('id', clientProjectIds);
                if (projectsForClientError) throw projectsForClientError;
                clientRoleProjects = projectsForClientRole || [];
            }

            let finalProjects = [...ownedProjectList, ...clientRoleProjects];

            // Remove duplicates just in case
            finalProjects = finalProjects.filter((p, index, self) =>
                index === self.findIndex((t) => t.id === p.id)
            );

            setManagedProjects(finalProjects);
        } catch (err: any) {
            console.error('Error fetching projects:', err);
            setError(err.message || 'Failed to load projects');
        } finally {
            setIsLoadingProjects(false);
        }
    }, [supabase]);

    const fetchTeamMembers = useCallback(async (projectId: string) => {
        if (!projectId) return;
        setIsLoadingTeamMembers(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('project_members')
                .select('id, user_id, project_id, role, display_name, email, avatar_url, created_at, updated_at')
                .eq('project_id', projectId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setTeamMembers(data || []);
        } catch (err: any) {
            console.error('Error fetching team members:', err);
            setError(err.message || 'Failed to load team members');
        } finally {
            setIsLoadingTeamMembers(false);
        }
    }, [supabase]);

    const fetchPlatformUsers = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, username, full_name, avatar_url')
                .order('full_name', { ascending: true });

            if (error) throw error;

            const mappedUsers = (data || []).map((p: any) => ({
                id: p.id,
                email: p.username || 'No email',
                display_name: p.full_name || p.username || 'Unknown',
                avatar_url: p.avatar_url
            }));

            setPlatformUsers(mappedUsers);
        } catch (err: any) {
            console.error('Error fetching platform users:', err);
        }
    }, [supabase]);

    useEffect(() => {
        if (user) {
            fetchManagedProjects(user.id);
            fetchPlatformUsers();
        }
    }, [user, fetchManagedProjects, fetchPlatformUsers]);

    useEffect(() => {
        if (selectedProjectId) {
            fetchTeamMembers(selectedProjectId);
        }
    }, [selectedProjectId, fetchTeamMembers]);

    const handleAddMember = async () => {
        if (!selectedProjectId || !selectedPlatformUserId || !newMemberRole) {
            setError('Please select a user and role');
            return;
        }

        setIsAddingMember(true);
        setError(null);
        try {
            const selectedUser = platformUsers.find(u => u.id === selectedPlatformUserId);
            if (!selectedUser) throw new Error('Selected user not found');

            const { error } = await supabase
                .from('project_members')
                .insert({
                    project_id: selectedProjectId,
                    user_id: selectedPlatformUserId,
                    role: newMemberRole,
                    display_name: selectedUser.display_name || selectedUser.email,
                    email: selectedUser.email
                });

            if (error) throw error;

            setSuccessMessage(`Added ${selectedUser.display_name || selectedUser.email} as ${newMemberRole}`);
            setSelectedPlatformUserId('');
            setNewMemberRole(ProjectRole.Freelancer);
            fetchTeamMembers(selectedProjectId);
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: any) {
            console.error('Error adding member:', err);
            setError(err.message || 'Failed to add member');
        } finally {
            setIsAddingMember(false);
        }
    };

    const handleRemoveMember = async () => {
        if (!memberToRemove) return;

        setIsRemovingMember(true);
        setError(null);
        try {
            const { error } = await supabase
                .from('project_members')
                .delete()
                .eq('project_id', memberToRemove.projectId)
                .eq('user_id', memberToRemove.userId);

            if (error) throw error;

            setSuccessMessage(`Removed ${memberToRemove.displayName}`);
            setShowRemoveModal(false);
            setMemberToRemove(null);
            fetchTeamMembers(memberToRemove.projectId);
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: any) {
            console.error('Error removing member:', err);
            setError(err.message || 'Failed to remove member');
        } finally {
            setIsRemovingMember(false);
        }
    };

    if (loadingUser || (user && isLoadingProjects)) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white font-mono text-sm">LOADING TEAMS...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white font-mono">
            <div className="w-full px-8 py-8">
                {/* Header */}
                <header className="mb-12">
                    <div className="flex items-center gap-4 mb-6">
                        <Link href="/user/account" className="text-gray-500 hover:text-white transition-colors">
                            <FiArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">MY TEAMS</h1>
                            <p className="text-sm text-gray-500">MANAGE YOUR PROJECT TEAMS</p>
                        </div>
                    </div>
                </header>

                {/* Messages */}
                {error && <div className="mb-6 p-3 border border-red-900 text-red-400 text-sm">{error}</div>}
                {successMessage && <div className="mb-6 p-3 border border-green-900 text-green-400 text-sm">{successMessage}</div>}

                {/* Projects List */}
                <main>
                    {managedProjects.length === 0 ? (
                        <div className="text-center py-16 border border-gray-900">
                            <FiUsers className="mx-auto text-4xl text-gray-600 mb-4" />
                            <p className="text-gray-500 mb-4">NO PROJECTS FOUND</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {managedProjects.map(mp => (
                                <div key={mp.id} className="border border-gray-900 hover:border-gray-700 transition-colors">
                                    <button
                                        onClick={() => setSelectedProjectId(prev => prev === mp.id ? null : mp.id)}
                                        className="w-full flex items-center justify-between p-4 hover:bg-gray-950 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <FiFolder className="text-gray-500" size={16} />
                                            <span className="font-medium">{mp.name.toUpperCase()}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-gray-600">
                                                {selectedProjectId === mp.id ? 'CLOSE' : 'VIEW'}
                                            </span>
                                            {selectedProjectId === mp.id ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                                        </div>
                                    </button>

                                    {selectedProjectId === mp.id && (
                                        <div className="border-t border-gray-900 p-6 bg-gray-950">
                                            {/* Add Member Form */}
                                            <div className="mb-8 p-4 border border-gray-800 bg-black">
                                                <h4 className="text-xs text-gray-400 mb-4 uppercase">ADD TEAM MEMBER</h4>
                                                <div className="flex gap-4">
                                                    <select
                                                        value={selectedPlatformUserId}
                                                        onChange={(e) => setSelectedPlatformUserId(e.target.value)}
                                                        className="bg-black border border-gray-800 text-white text-sm p-2 flex-1 focus:border-white outline-none"
                                                    >
                                                        <option value="">SELECT USER...</option>
                                                        {platformUsers.map(u => (
                                                            <option key={u.id} value={u.id}>{u.display_name} ({u.email})</option>
                                                        ))}
                                                    </select>
                                                    <select
                                                        value={newMemberRole}
                                                        onChange={(e) => setNewMemberRole(e.target.value as ProjectRole)}
                                                        className="bg-black border border-gray-800 text-white text-sm p-2 w-40 focus:border-white outline-none"
                                                    >
                                                        {Object.values(ProjectRole).map(role => (
                                                            <option key={role} value={role}>{role}</option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        onClick={handleAddMember}
                                                        disabled={isAddingMember}
                                                        className="bg-white text-black px-4 py-2 text-sm font-bold hover:bg-gray-200 disabled:opacity-50"
                                                    >
                                                        {isAddingMember ? 'ADDING...' : 'ADD'}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Members List */}
                                            {isLoadingTeamMembers ? (
                                                <div className="text-gray-500 text-sm">LOADING MEMBERS...</div>
                                            ) : teamMembers.length === 0 ? (
                                                <div className="text-gray-500 text-sm border-t border-gray-800 pt-4">NO TEAM MEMBERS</div>
                                            ) : (
                                                <div className="grid gap-2">
                                                    {teamMembers.map(member => (
                                                        <div key={member.id} className="flex items-center justify-between p-3 border border-gray-800 bg-black">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs">
                                                                    {member.avatar_url ? (
                                                                        <img src={member.avatar_url} alt={member.display_name} className="w-full h-full rounded-full" />
                                                                    ) : (
                                                                        member.display_name.charAt(0).toUpperCase()
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-bold">{member.display_name}</div>
                                                                    <div className="text-xs text-gray-500">{member.email}</div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <span className="text-xs bg-gray-900 px-2 py-1 text-gray-400 border border-gray-800">
                                                                    {member.role.toUpperCase()}
                                                                </span>
                                                                <button
                                                                    onClick={() => {
                                                                        setMemberToRemove({
                                                                            userId: member.user_id,
                                                                            displayName: member.display_name,
                                                                            projectId: member.project_id,
                                                                            projectName: mp.name
                                                                        });
                                                                        setShowRemoveModal(true);
                                                                    }}
                                                                    className="text-gray-600 hover:text-red-500 transition-colors"
                                                                >
                                                                    <FiTrash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </main>

                {/* Remove Modal */}
                {showRemoveModal && memberToRemove && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-black border border-gray-800 p-6 max-w-md w-full">
                            <div className="flex items-center gap-3 mb-4">
                                <FiAlertTriangle className="text-red-400" size={20} />
                                <h3 className="font-bold">REMOVE MEMBER</h3>
                            </div>
                            <p className="text-gray-400 mb-6 text-sm">
                                Remove <span className="text-white">{memberToRemove.displayName}</span> from <span className="text-white">{memberToRemove.projectName}</span>?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setShowRemoveModal(false); setMemberToRemove(null); }}
                                    className="flex-1 border border-gray-700 px-4 py-2 text-sm hover:border-white transition-colors"
                                >
                                    CANCEL
                                </button>
                                <button
                                    onClick={handleRemoveMember}
                                    disabled={isRemovingMember}
                                    className="flex-1 bg-red-600 text-white px-4 py-2 text-sm font-bold hover:bg-red-700 disabled:bg-gray-700 transition-colors"
                                >
                                    {isRemovingMember ? 'REMOVING...' : 'REMOVE'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
