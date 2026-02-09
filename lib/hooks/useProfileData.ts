'use client';

import { useEffect, useState, FormEvent, ChangeEvent, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import getSupabaseBrowserClient from '@/lib/supabase/client'; // Adjust path if needed
import { User, Session } from '@supabase/supabase-js';
import { useAuth } from '@/components/Providers';

// Define interfaces needed by the hook
export interface Profile {
  id?: string; // Added id for profile matching in useEffect
  username: string | null;
  display_name: string | null;
  avatar_url?: string | null;
  full_name?: string | null;
  bio?: string | null;
  website_url?: string | null;
  twitter_url?: string | null;
  linkedin_url?: string | null;
  github_url?: string | null;
  instagram_url?: string | null;
  discord_url?: string | null;
  phone_whatsapp?: string | null;
  tiktok_url?: string | null;
  telegram_url?: string | null;
  facebook_url?: string | null;
  dollar_handle?: string | null;
  token_name?: string | null;
  supply?: string | null;
  has_seen_welcome_card?: boolean | null;
}

// Uncomment Skill and UserSkill interfaces
/*
interface ProfileForUpdate { ... }
*/
interface Skill {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
}

interface UserSkill {
  id: string;
  user_id: string;
  skill_id: string;
  skills?: Pick<Skill, 'id' | 'name' | 'category'>; // UserSkill might reference Skill
}

// Uncomment Team and ColorScheme interfaces
/*
interface ProfileForUpdate { ... }
*/
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

export default function useProfileData() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const pathname = usePathname() ?? '';
  const { session, isLoading: isAuthLoading } = useAuth();
  
  // Use session from auth context instead of managing separately
  const user = session?.user || null;
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Skill-related states
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
  const [userSkillIds, setUserSkillIds] = useState<Set<string>>(new Set());
  const [loadingSkills, setLoadingSkills] = useState<boolean>(true);
  const [savingSkills, setSavingSkills] = useState<boolean>(false);

  // Team-related states
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [loadingUserTeams, setLoadingUserTeams] = useState<boolean>(true);
  const [errorUserTeams, setErrorUserTeams] = useState<string | null>(null);

  // Form states
  const [newUsername, setNewUsername] = useState<string>('');
  const [newDisplayName, setNewDisplayName] = useState<string>('');
  const [newFullName, setNewFullName] = useState<string>('');
  const [newBio, setNewBio] = useState<string>('');
  const [newWebsiteUrl, setNewWebsiteUrl] = useState<string>('');
  const [newTwitterUrl, setNewTwitterUrl] = useState<string>('');
  const [newLinkedInUrl, setNewLinkedInUrl] = useState<string>('');
  const [newGitHubUrl, setNewGitHubUrl] = useState<string>('');
  const [newInstagramUrl, setNewInstagramUrl] = useState<string>('');
  const [newDiscordUrl, setNewDiscordUrl] = useState<string>('');
  const [newPhoneWhatsapp, setNewPhoneWhatsapp] = useState<string>('');
  const [newTikTokUrl, setNewTikTokUrl] = useState<string>('');
  const [newTelegramUrl, setNewTelegramUrl] = useState<string>('');
  const [newFacebookUrl, setNewFacebookUrl] = useState<string>('');
  const [newDollarHandle, setNewDollarHandle] = useState<string>('');
  const [newTokenName, setNewTokenName] = useState<string>('');
  const [newSupply, setNewSupply] = useState<string>('1,000,000,000');
  const [showWelcomeCard, setShowWelcomeCard] = useState<boolean>(true);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState<boolean>(false);
  const [avatarUploadError, setAvatarUploadError] = useState<string | null>(null);
  const [customSkillInput, setCustomSkillInput] = useState<string>('');
  const [skillChoiceInAdder, setSkillChoiceInAdder] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  // Ref for debounce timer
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load profile, skills, and teams when user changes
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      if (!user?.id) {
        if (mounted) {
          setProfile(null);
          setLoading(false);
          setLoadingSkills(false);
          setLoadingUserTeams(false);
        }
        return;
      }

      try {
        console.log('[useProfileData] Loading profile for user:', user.id);
        setLoading(true);
        setLoadingSkills(true);
        setLoadingUserTeams(true);
        setError(null);
        setErrorUserTeams(null);

        // Step 1: Fetch Basic Profile Data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          // Create default profile if none exists
          console.log('[useProfileData] No profile found, creating default');
          const defaultProfile: Omit<Profile, 'id'> = {
            username: user.email?.split('@')[0] || '',
            display_name: user.email?.split('@')[0] || '',
            full_name: null,
            bio: null,
            website_url: null,
            twitter_url: null,
            linkedin_url: null,
            github_url: null,
            instagram_url: null,
            discord_url: null,
            phone_whatsapp: null,
            tiktok_url: null,
            telegram_url: null,
            facebook_url: null,
            dollar_handle: null,
            token_name: null,
            supply: '1,000,000,000',
            has_seen_welcome_card: false,
          };

          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([{ id: user.id, ...defaultProfile }])
            .select()
            .single();

          if (createError) {
            throw createError;
          }

          if (mounted && newProfile) {
            setProfile(newProfile);
            // Initialize form fields with new profile
            setNewUsername(newProfile.username || '');
            setNewDisplayName(newProfile.display_name || '');
            setNewFullName(newProfile.full_name || '');
            setNewBio(newProfile.bio || '');
            setNewWebsiteUrl(newProfile.website_url || '');
            setNewTwitterUrl(newProfile.twitter_url || '');
            setNewLinkedInUrl(newProfile.linkedin_url || '');
            setNewGitHubUrl(newProfile.github_url || '');
            setNewInstagramUrl(newProfile.instagram_url || '');
            setNewDiscordUrl(newProfile.discord_url || '');
            setNewPhoneWhatsapp(newProfile.phone_whatsapp || '');
            setNewTikTokUrl(newProfile.tiktok_url || '');
            setNewTelegramUrl(newProfile.telegram_url || '');
            setNewFacebookUrl(newProfile.facebook_url || '');
            setNewDollarHandle(newProfile.dollar_handle || '');
            setNewTokenName(newProfile.token_name || '');
            setNewSupply(newProfile.supply || '1,000,000,000');
          }
        } else if (profileData && mounted) {
          setProfile(profileData);
          // Initialize form fields with profile data
          setNewUsername(profileData.username || '');
          setNewDisplayName(profileData.display_name || '');
          setNewFullName(profileData.full_name || '');
          setNewBio(profileData.bio || '');
          setNewWebsiteUrl(profileData.website_url || '');
          setNewTwitterUrl(profileData.twitter_url || '');
          setNewLinkedInUrl(profileData.linkedin_url || '');
          setNewGitHubUrl(profileData.github_url || '');
          setNewInstagramUrl(profileData.instagram_url || '');
          setNewDiscordUrl(profileData.discord_url || '');
          setNewPhoneWhatsapp(profileData.phone_whatsapp || '');
          setNewTikTokUrl(profileData.tiktok_url || '');
          setNewTelegramUrl(profileData.telegram_url || '');
          setNewFacebookUrl(profileData.facebook_url || '');
          setNewDollarHandle(profileData.dollar_handle || '');
          setNewTokenName(profileData.token_name || '');
          setNewSupply(profileData.supply || '1,000,000,000');
        }

        // Step 2: Fetch All Available Skills
        const { data: allSkillsData, error: allSkillsError } = await supabase
          .from('skills')
          .select('id, name, category, description');

        if (allSkillsError) {
          console.error('[useProfileData] Error fetching all skills:', allSkillsError);
          setAllSkills([]);
        } else if (allSkillsData && mounted) {
          setAllSkills(allSkillsData as Skill[]);
        }

        // Step 3: Fetch User's Selected Skills
        const { data: userSkillsData, error: userSkillsError } = await supabase
          .from('user_skills')
          .select('skill_id, skills (id, name, category, description)')
          .eq('user_id', user.id);

        if (userSkillsError) {
          console.error('[useProfileData] Error fetching user skills:', userSkillsError);
          setSelectedSkills([]);
          setUserSkillIds(new Set());
        } else if (userSkillsData && mounted) {
          const fetchedSelectedSkills = userSkillsData.map(us => us.skills).filter(Boolean) as Skill[];
          setSelectedSkills(fetchedSelectedSkills);
          setUserSkillIds(new Set(fetchedSelectedSkills.map(s => s.id)));
        }
        
        // Step 4: Fetch User's Teams
        const { data: userTeamsData, error: teamsError } = await supabase
            .from('user_team_memberships')
            .select(`
              user_id, 
              teams (
                id, 
                name, 
                slug, 
                icon_name, 
                color_scheme
              )
            `)
            .eq('user_id', user.id);

        if (teamsError) {
            console.error('[useProfileData] Error fetching user teams:', teamsError);
            setErrorUserTeams('Failed to load teams: ' + teamsError.message);
            setUserTeams([]);
        } else if (userTeamsData && mounted) {
            const teams = userTeamsData.map(utm => utm.teams).filter(Boolean) as Team[]; 
            setUserTeams(teams);
            setErrorUserTeams(null);
        } else if (mounted) {
            setUserTeams([]);
            setErrorUserTeams(null);
        }

      } catch (error: any) {
        console.error('[useProfileData] Error loading data:', error);
        if (mounted) {
          setError(error.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setLoadingSkills(false);
          setLoadingUserTeams(false);
        }
      }
    };

    // Only load if not in auth loading state
    if (!isAuthLoading) {
      loadData();
    }

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Add Google avatar sync effect
  useEffect(() => {
    const syncGoogleAvatar = async () => {
      if (user && profile && !profile.avatar_url) {
        console.log('[useProfileData] Profile has no avatar, attempting to sync Google avatar...');
        try {
          const response = await fetch('/api/profile/sync-google-avatar', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log('[useProfileData] Google avatar sync result:', result);
            
            if (result.updated && result.changes.avatar_url) {
              // Update the profile state with the new avatar
              setProfile(prev => prev ? { ...prev, avatar_url: result.changes.avatar_url } : null);
              console.log('[useProfileData] Profile updated with Google avatar:', result.changes.avatar_url);
            }
          } else {
            console.warn('[useProfileData] Failed to sync Google avatar:', response.status);
          }
        } catch (error) {
          console.error('[useProfileData] Error syncing Google avatar:', error);
        }
      }
    };

    // Only run sync if we have a user and profile loaded, and the profile has no avatar
    if (user && profile && !loading && !profile.avatar_url) {
      syncGoogleAvatar();
    }
  }, [user, profile, loading]);

  // Make handleSaveProfile callable without an event for auto-save
  const performSaveProfile = useCallback(async () => {
    if (!user?.id || !profile) {
      setError("User or profile not loaded. Cannot save.");
      return;
    }
    console.log('[useProfileData] performSaveProfile called.');
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    // Define updates without updated_at initially
    const updates: Omit<Partial<Profile>, 'id' | 'has_seen_welcome_card'> = {
      username: newUsername,
      display_name: newDisplayName,
      full_name: newFullName,
      bio: newBio,
      website_url: newWebsiteUrl,
      twitter_url: newTwitterUrl,
      linkedin_url: newLinkedInUrl,
      github_url: newGitHubUrl,
      instagram_url: newInstagramUrl,
      discord_url: newDiscordUrl,
      phone_whatsapp: newPhoneWhatsapp,
      tiktok_url: newTikTokUrl,
      telegram_url: newTelegramUrl,
      facebook_url: newFacebookUrl,
      dollar_handle: newDollarHandle,
      token_name: newTokenName,
      supply: newSupply,
      // Supabase typically handles updated_at automatically
    };

    const changedUpdates: Partial<Profile> = {};
    let hasChanges = false;

    if (profile) {
      for (const key in updates) {
        const typedKey = key as keyof typeof updates;
        if (updates[typedKey] !== profile[typedKey]) {
          // @ts-ignore - We know typedKey is a valid key of Profile here
          changedUpdates[typedKey] = updates[typedKey];
          hasChanges = true;
        }
      }
    } else {
      Object.assign(changedUpdates, updates);
      hasChanges = true;
    }

    if (!hasChanges) {
      console.log('[useProfileData] No changes detected, skipping save.');
      setSaving(false);
      return;
    }
    console.log('[useProfileData] Saving profile with updates:', changedUpdates);

    try {
      const { error: saveError } = await supabase
        .from('profiles')
        // Pass only the changed fields to update
        .update(changedUpdates)
        .eq('id', user.id);

      if (saveError) {
        console.error('[useProfileData] Error saving profile:', saveError);
        setError('Failed to save profile: ' + saveError.message);
        setSuccessMessage(null);
      } else {
        console.log('[useProfileData] Profile saved successfully.');
        setSuccessMessage('Profile saved successfully!');
        // Update local profile state with the saved data to reflect changes immediately
        // and ensure "no changes" logic works correctly on subsequent saves.
        setProfile(prevProfile => ({ ...prevProfile, ...changedUpdates } as Profile));
        setError(null);
        // Clear success message after a few seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (e: any) {
      console.error('[useProfileData] Exception saving profile:', e);
      setError('An unexpected error occurred while saving: ' + e.message);
      setSuccessMessage(null);
    } finally {
      setSaving(false);
    }
  }, [
    user, profile, supabase, newUsername, newDisplayName, newFullName, newBio,
    newWebsiteUrl, newTwitterUrl, newLinkedInUrl, newGitHubUrl, newInstagramUrl,
    newDiscordUrl, newPhoneWhatsapp, newTikTokUrl, newTelegramUrl, newFacebookUrl,
    newDollarHandle, newTokenName, newSupply
  ]);

  const handleSaveProfile = useCallback(async (event?: FormEvent) => {
    if (event) {
      event.preventDefault();
      console.log('[useProfileData] handleSaveProfile called with form event.');
    }
    await performSaveProfile();
  }, [performSaveProfile]);

  const handleAutoSave = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(async () => {
      console.log('[useProfileData] Debounced auto-save triggered.');
      await performSaveProfile();
    }, 1500); // Adjust debounce time as needed (e.g., 1.5 seconds)
  }, [performSaveProfile]);

  // Full loadProfileAndSkills function
  const loadProfileAndSkills = useCallback(async (currentUserParam: User, currentPathname: string) => {
    if (!currentUserParam?.id) {
      console.warn('[useProfileData] loadProfileAndSkills called without a current user ID. Aborting.');
      setLoading(false);
      setLoadingSkills(false);
      setLoadingUserTeams(false);
      return;
    }
    console.log('[useProfileData] Restored Full loadProfileAndSkills called for user:', currentUserParam.id, 'pathname:', currentPathname);
    setLoading(true);
    setLoadingSkills(true);
    setLoadingUserTeams(true);
    setError(null);
    setErrorUserTeams(null); // Clear specific team errors too

    try {
      // Step 1: Fetch Basic Profile Data
      console.log('[useProfileData] Fetching basic profile data for user:', currentUserParam.id);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUserParam.id)
        .single();

      if (profileError) {
        console.error('[useProfileData] Error fetching profile:', profileError);
        setError('Failed to load profile: ' + profileError.message);
        setProfile(null);
      } else if (profileData) {
        console.log("[useProfileData] Profile data fetched:", profileData);
        setProfile(profileData);
        setNewUsername(profileData.username || '');
        setNewDisplayName(profileData.display_name || '');
        setNewFullName(profileData.full_name || '');
        setNewBio(profileData.bio || '');
        setNewWebsiteUrl(profileData.website_url || '');
        setNewTwitterUrl(profileData.twitter_url || '');
        setNewLinkedInUrl(profileData.linkedin_url || '');
        setNewGitHubUrl(profileData.github_url || '');
        setNewInstagramUrl(profileData.instagram_url || '');
        setNewDiscordUrl(profileData.discord_url || '');
        setNewPhoneWhatsapp(profileData.phone_whatsapp || '');
        setNewTikTokUrl(profileData.tiktok_url || '');
        setNewTelegramUrl(profileData.telegram_url || '');
        setNewFacebookUrl(profileData.facebook_url || '');
        setNewDollarHandle(profileData.dollar_handle || '');
        setNewTokenName(profileData.token_name || '');
        setNewSupply(profileData.supply || '1,000,000,000');
        // Always show welcome card if profile data is loaded for an authenticated user
        setShowWelcomeCard(true);
      } else {
        console.warn('[useProfileData] No profile data returned for user (and no error):', currentUserParam.id);
        setProfile(null);
      }

      // Step 2: Fetch All Available Skills
      console.log('[useProfileData] Fetching all available skills.');
      const { data: allSkillsData, error: allSkillsError } = await supabase
        .from('skills')
        .select('id, name, category, description');

      if (allSkillsError) {
        console.error('[useProfileData] Error fetching all skills:', allSkillsError);
        setError(prev => prev ? prev + "; Failed to load all skills." : "Failed to load all skills.");
        setAllSkills([]);
      } else if (allSkillsData) {
        console.log("[useProfileData] All skills data fetched:", allSkillsData.length);
        setAllSkills(allSkillsData as Skill[]);
      }

      // Step 3: Fetch User's Selected Skills
      console.log('[useProfileData] Fetching selected skills for user:', currentUserParam.id);
      const { data: userSkillsData, error: userSkillsError } = await supabase
        .from('user_skills')
        .select('skill_id, skills (id, name, category, description)')
        .eq('user_id', currentUserParam.id);

      if (userSkillsError) {
        console.error('[useProfileData] Error fetching user skills:', userSkillsError);
        setError(prev => prev ? prev + "; Failed to load user skills." : "Failed to load user skills.");
        setSelectedSkills([]);
        setUserSkillIds(new Set());
      } else if (userSkillsData) {
        console.log("[useProfileData] User skills data fetched:", userSkillsData.length);
        const fetchedSelectedSkills = userSkillsData.map(us => us.skills).filter(Boolean) as Skill[];
        setSelectedSkills(fetchedSelectedSkills);
        setUserSkillIds(new Set(fetchedSelectedSkills.map(s => s.id)));
      }
      
      // Step 4: Fetch User's Teams
      console.log('[useProfileData] Fetching teams for user:', currentUserParam.id);
      const { data: userTeamsData, error: teamsError } = await supabase
          .from('user_team_memberships')
          .select(`
            user_id, 
            teams (
              id, 
              name, 
              slug, 
              icon_name, 
              color_scheme
            )
          `)
          .eq('user_id', currentUserParam.id);

      if (teamsError) {
          console.error('[useProfileData] Error fetching user teams:', teamsError);
          setErrorUserTeams('Failed to load teams: ' + teamsError.message);
          setUserTeams([]);
      } else if (userTeamsData) {
          console.log("[useProfileData] User teams data fetched:", userTeamsData.length);
          const teams = userTeamsData.map(utm => utm.teams).filter(Boolean) as Team[]; 
          setUserTeams(teams);
          setErrorUserTeams(null); // Clear previous team errors
      } else {
          setUserTeams([]); // No teams found
          setErrorUserTeams(null); // Clear previous team errors
      }

    } catch (e: any) {
      console.error("[useProfileData] Critical error in full loadProfileAndSkills:", e.message, e.stack);
      setError("An unexpected critical error occurred while loading profile data.");
      setProfile(null);
      setAllSkills([]);
      setSelectedSkills([]);
      setUserSkillIds(new Set());
      setUserTeams([]);
    } finally {
      setLoading(false);
      setLoadingSkills(false);
      setLoadingUserTeams(false);
      console.log('[useProfileData] Restored Full loadProfileAndSkills finished for user:', currentUserParam.id);
    }
  }, [
    supabase, 
    setProfile, setLoading, setError, 
    setNewUsername, setNewDisplayName, setNewFullName, setNewBio, setNewWebsiteUrl, 
    setNewTwitterUrl, setNewLinkedInUrl, setNewGitHubUrl, setNewInstagramUrl, 
    setNewDiscordUrl, setNewPhoneWhatsapp, setNewTikTokUrl, setNewTelegramUrl, 
    setNewFacebookUrl, setNewDollarHandle, setNewTokenName, setNewSupply, 
    setShowWelcomeCard,
    setAllSkills, setSelectedSkills, setUserSkillIds, setLoadingSkills, 
    setUserTeams, setLoadingUserTeams, setErrorUserTeams
  ]);

  const handleDismissWelcomeCard = useCallback(async () => {
    if (!user?.id) {
      console.warn('[useProfileData] handleDismissWelcomeCard called without user ID.');
      return;
    }
    setShowWelcomeCard(false); // Optimistically update UI
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ has_seen_welcome_card: true } as Partial<Profile>)
        .eq('id', user.id);

      if (updateError) {
        console.error('[useProfileData] Error updating has_seen_welcome_card:', updateError);
        // Optionally, revert setShowWelcomeCard(true) or show an error to the user
      } else {
        console.log('[useProfileData] has_seen_welcome_card updated successfully for user:', user.id);
      }
    } catch (e: any) {
      console.error('[useProfileData] Exception in handleDismissWelcomeCard:', e.message);
    }
  }, [supabase, user?.id]);

  const handleSkillToggle = useCallback(async (skillId: string, isCurrentlySelected: boolean) => {
    if (!user?.id) {
      setError('User not found. Cannot modify skills.');
      return;
    }
    setSavingSkills(true);
    setError(null);

    try {
      if (isCurrentlySelected) {
        const { error: deleteError } = await supabase
          .from('user_skills')
          .delete()
          .eq('user_id', user.id)
          .eq('skill_id', skillId);

        if (deleteError) {
          console.error('[useProfileData] Error removing skill:', deleteError);
          setError('Failed to remove skill: ' + deleteError.message);
        } else {
          console.log('[useProfileData] Skill removed successfully:', skillId);
          setSelectedSkills(prev => prev.filter(skill => skill.id !== skillId));
          setUserSkillIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(skillId);
            return newSet;
          });
        }
      } else {
        const { data: newSkillLink, error: insertError } = await supabase
          .from('user_skills')
          .insert({ user_id: user.id, skill_id: skillId })
          .select('skills(id, name, category, description)')
          .single();

        if (insertError) {
          console.error('[useProfileData] Error adding skill:', insertError);
          setError('Failed to add skill: ' + insertError.message);
        } else if (newSkillLink && newSkillLink.skills) {
          console.log('[useProfileData] Skill added successfully:', newSkillLink.skills);
          const addedSkill = newSkillLink.skills as Skill;
          setSelectedSkills(prev => [...prev, addedSkill]);
          setUserSkillIds(prev => new Set(prev).add(addedSkill.id));
        } else {
          setError('Failed to add skill or retrieve skill details.');
        }
      }
    } catch (err: any) {
      console.error('[useProfileData] Exception in handleSkillToggle:', err);
      setError('An unexpected error occurred while managing skills.');
    } finally {
      setSavingSkills(false);
    }
  }, [supabase, user?.id, setSelectedSkills, setUserSkillIds, setSavingSkills, setError]);

  const handleAddCustomSkill = useCallback(async (skillName: string) => {
    if (!user?.id) {
      setError('User not found. Cannot add custom skill.');
      return;
    }
    if (!skillName.trim()) {
      setError('Skill name cannot be empty.');
      return;
    }
    setSavingSkills(true);
    setError(null);

    try {
      const { data: newSkill, error: createSkillError } = await supabase
        .from('skills')
        .insert({ name: skillName.trim(), category: 'User-Defined' })
        .select()
        .single();

      if (createSkillError) {
        console.error('[useProfileData] Error creating new skill:', createSkillError);
        setError('Failed to create new skill: ' + createSkillError.message);
        setSavingSkills(false);
        return;
      }

      if (!newSkill) {
        setError('Failed to create new skill (no data returned).');
        setSavingSkills(false);
        return;
      }

      const { error: linkSkillError } = await supabase
        .from('user_skills')
        .insert({ user_id: user.id, skill_id: newSkill.id });

      if (linkSkillError) {
        console.error('[useProfileData] Error linking new skill to user:', linkSkillError);
        setError('Failed to link new skill: ' + linkSkillError.message);
      } else {
        console.log('[useProfileData] Custom skill added and linked successfully:', newSkill);
        setAllSkills(prev => [...prev, newSkill]);
        setSelectedSkills(prev => [...prev, newSkill]);
        setUserSkillIds(prev => new Set(prev).add(newSkill.id));
        setCustomSkillInput('');
      }
    } catch (err: any) {
      console.error('[useProfileData] Exception in handleAddCustomSkill:', err);
      setError('An unexpected error occurred while adding custom skill.');
    } finally {
      setSavingSkills(false);
    }
  }, [supabase, user?.id, setSavingSkills, setError, setAllSkills, setSelectedSkills, setUserSkillIds, setCustomSkillInput]);

  // Hook initialized

  return {
    user,
    profile,
    loading,
    error,
    loadProfileAndSkills, // Return the ultra-simplified version

    // Return skill states and setters
    allSkills,
    selectedSkills,
    userSkillIds,
    loadingSkills,
    savingSkills,
    setAllSkills,
    setSelectedSkills,
    setUserSkillIds,
    setLoadingSkills,
    setSavingSkills,

    // Return team states and setters
    userTeams,
    loadingUserTeams,
    errorUserTeams,
    setUserTeams,
    setLoadingUserTeams,
    setErrorUserTeams,

    // Return all states and setters that were uncommented
    newUsername,
    newDisplayName,
    newFullName,
    newBio,
    newWebsiteUrl,
    newTwitterUrl,
    newLinkedInUrl,
    newGitHubUrl,
    newInstagramUrl,
    newDiscordUrl,
    newPhoneWhatsapp,
    newTikTokUrl,
    newTelegramUrl,
    newFacebookUrl,
    newDollarHandle,
    newTokenName,
    newSupply,
    showWelcomeCard,
    isUploadingAvatar,
    avatarUploadError,
    customSkillInput,
    skillChoiceInAdder,
    successMessage,
    saving,
    setNewUsername,
    setNewDisplayName,
    setNewFullName,
    setNewBio,
    setNewWebsiteUrl,
    setNewTwitterUrl,
    setNewLinkedInUrl,
    setNewGitHubUrl,
    setNewInstagramUrl,
    setNewDiscordUrl,
    setNewPhoneWhatsapp,
    setNewTikTokUrl,
    setNewTelegramUrl,
    setNewFacebookUrl,
    setNewDollarHandle,
    setNewTokenName,
    setNewSupply,
    setShowWelcomeCard,
    setIsUploadingAvatar,
    setAvatarUploadError,
    setCustomSkillInput,
    setSkillChoiceInAdder,
    setSuccessMessage,
    setSaving,
    handleDismissWelcomeCard,
    handleSaveProfile,
    handleSkillToggle,
    handleAddCustomSkill,
    handleAutoSave,
  };
} 