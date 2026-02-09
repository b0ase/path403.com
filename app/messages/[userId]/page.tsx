'use client';

import React, { useEffect, useState, FormEvent, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import getSupabaseBrowserClient from '@/lib/supabase/client';
import { FaPaperPlane, FaSpinner, FaArrowLeft, FaSyncAlt, FaInfoCircle } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

export default function DirectMessagesPage() {
  const params = useParams();
  const router = useRouter();
  const targetUserId = params?.userId as string;
  const supabase = getSupabaseBrowserClient();

  // All hooks must be called at the top level
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [targetProfile, setTargetProfile] = useState<{ display_name: string | null; avatar_url?: string | null } | null>(null);
  const [messages, setMessages] = useState<{ id: string; sender_id: string; receiver_id: string; content: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [newContent, setNewContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Scroll utility
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Fetch messages callback
  const fetchMessages = useCallback(async () => {
    if (!currentUserId || !targetUserId) return;
    setLoading(true);
    const filter = `and(sender_id.eq.${currentUserId},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${currentUserId})`;
    // @ts-ignore: direct_messages table not in generated types
    const { data, error } = await (supabase as any)
      .from('direct_messages')
      .select('id, sender_id, receiver_id, content, created_at')
      .or(filter)
      .order('created_at', { ascending: true }) as { data: Array<{ id: string; sender_id: string; receiver_id: string; content: string; created_at: string }>; error: any };
    if (data) {
      setMessages(data);
    }
    setLoading(false);
  }, [supabase, currentUserId, targetUserId]);

  // Manual refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchMessages();
    } catch (err) {
      console.error('[DirectMessages] Refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  }, [fetchMessages]);

  // Fetch current user and target user's profile
  useEffect(() => {
    if (!targetUserId) {
      router.push('/login?message=Invalid user ID');
      return;
    }

    async function loadUsers() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login?message=Please log in to chat.');
        return;
      }
      setCurrentUserId(user.id);
      // fetch target profile
      const { data: prof, error } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', targetUserId)
        .single();
      if (prof) setTargetProfile(prof);
    }
    loadUsers();
  }, [supabase, router, targetUserId]);

  // Fetch direct messages
  useEffect(() => {
    if (currentUserId) fetchMessages();
  }, [currentUserId, fetchMessages]);

  // Real-time subscription (dynamic channel for this conversation)
  useEffect(() => {
    if (!currentUserId || !targetUserId) return; // Ensure both IDs are available
    
    // Create a canonical channel name by sorting user IDs
    const ids = [currentUserId, targetUserId].sort();
    const channelName = `direct-messages-${ids[0]}-${ids[1]}`;
    console.log(`[DirectMessages Realtime] Subscribing to channel: ${channelName}`);

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages' }, payload => {
        const newMessage = payload.new as { id: string; sender_id: string; receiver_id: string; content: string; created_at: string };
        // Ensure this message is part of the current conversation
        if (
          (newMessage.sender_id === currentUserId && newMessage.receiver_id === targetUserId) ||
          (newMessage.sender_id === targetUserId && newMessage.receiver_id === currentUserId)
        ) {
          console.log(`[DirectMessages Realtime] RX: Relevant message received. Current User: ${currentUserId}, Target User: ${targetUserId}, Sender: ${newMessage.sender_id}, Receiver: ${newMessage.receiver_id}`);
          console.log('[DirectMessages Realtime] RX: Payload:', newMessage);
          setMessages(prevMessages => {
            console.log('[DirectMessages Realtime] RX: Inside setMessages. Prev message count:', prevMessages.length);
            if (prevMessages.some(msg => msg.id === newMessage.id)) {
              console.log('[DirectMessages Realtime] RX: Duplicate message detected by ID, not adding:', newMessage.id);
              return prevMessages;
            }
            const updatedMessages = [...prevMessages, newMessage];
            console.log('[DirectMessages Realtime] RX: After adding. New message count:', updatedMessages.length);
            return updatedMessages;
          });
        } else {
          console.log(`[DirectMessages Realtime] RX: Irrelevant message filtered. Current User: ${currentUserId}, Target User: ${targetUserId}, Sender: ${newMessage.sender_id}, Receiver: ${newMessage.receiver_id}`);
        }
      })
      .subscribe((status, err) => {
        console.log(`[DirectMessages Realtime] Subscription status: ${status}`, err || '');
      });
    return () => {
      console.log('[DirectMessages Realtime] Cleaning up channel:', channelName);
      supabase.removeChannel(channel);
    };
  }, [supabase, currentUserId, targetUserId]);

  // Scroll on new messages
  useEffect(() => {
    if (!loading) scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  // Handle invalid userId case after all hooks
  if (!targetUserId) {
    return null;
  }

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!newContent.trim() || !currentUserId) return;
    setPosting(true);
    const tempId = `temp-${Date.now()}`;
    const optimistic = { id: tempId, sender_id: currentUserId, receiver_id: targetUserId, content: newContent, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, optimistic]);
    setNewContent('');
    try {
      // @ts-ignore: direct_messages table not in generated types
      const { data, error } = await (supabase as any)
        .from('direct_messages')
        .insert({ sender_id: currentUserId, receiver_id: targetUserId, content: newContent })
        .select('id, created_at')
        .single() as { data: { id: string; created_at: string } | null; error: any };
      if (error) {
        throw error;
      }
      // Update the optimistic message with the actual ID and timestamp from the database
      if (data) {
        setMessages(prev => prev.map(m => m.id === tempId ? { ...optimistic, id: data.id, created_at: data.created_at } : m));
      }

    } catch (err) {
      console.error('[DirectMessages] Send error:', err);
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setPosting(false);
      console.log('[DirectMessages] Message send attempt complete.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <FaSpinner className="animate-spin text-4xl text-sky-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center">
          <button onClick={() => router.back()} className="p-2 rounded hover:bg-gray-700"><FaArrowLeft /></button>
          <h1 className="text-xl font-semibold ml-4">Chat with {targetProfile?.display_name || 'User'}</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            title="Refresh messages"
            className="p-2 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {refreshing ? <FaSpinner className="animate-spin h-5 w-5" /> : <FaSyncAlt className="h-5 w-5" />}
          </button>
          <div className="bg-yellow-800/50 border border-yellow-700 text-yellow-300 px-2 py-1 text-xs rounded flex items-center space-x-1">
            <FaInfoCircle className="h-4 w-4" />
            <span>Please press refresh to see new messages from the other user.</span>
          </div>
        </div>
      </header>
      <main className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-lg max-w-[70%] ${msg.sender_id === currentUserId ? 'bg-sky-600 text-white' : 'bg-gray-700 text-white'}`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              <span className="block text-xs mt-1 text-gray-300">{formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>
      <footer className="p-3 border-t flex">
        <form onSubmit={handleSend} className="flex w-full">
          <input
            type="text"
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow p-2 bg-gray-800 text-white rounded-l-lg focus:outline-none"
            disabled={posting}
          />
          <button type="submit" disabled={posting} className="p-2 bg-sky-500 rounded-r-lg text-white">
            {posting ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
          </button>
        </form>
      </footer>
    </div>
  );
} 