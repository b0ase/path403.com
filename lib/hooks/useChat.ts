'use client';

import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  role: 'user' | 'agent';
  content: string;
}

interface UseChatOptions {
  initialMessages?: Message[];
  api?: string;
  body?: Record<string, any>;
}

export const useChat = (options?: UseChatOptions) => {
  const [messages, setMessages] = useState<Message[]>(options?.initialMessages || []);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Get or create a session ID for anonymous users
    let storedId = localStorage.getItem('b0ase_chat_session_id');
    if (!storedId) {
      storedId = uuidv4();
      localStorage.setItem('b0ase_chat_session_id', storedId);
    }
    setSessionId(storedId);

    // TODO: Fetch initial messages from DB based on session ID
  }, []);
  
  useEffect(() => {
    // Scroll to bottom when new messages are added
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || !sessionId) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    
    setIsLoading(true);
    setInput('');

    try {
      const requestBody = {
        message: input,
        sessionId,
        ...options?.body,
      };

      const response = await fetch(options?.api || '/api/ai-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || 'An API error occurred');
      }

      const agentMessage: Message = { role: 'agent', content: data.response };
      setMessages(prev => [...prev, agentMessage]);

    } catch (error: any) {
      const errorMessage: Message = { role: 'agent', content: `Error: ${error.message}` };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    input,
    isLoading,
    handleInputChange,
    handleSubmit,
    bottomRef,
  };
}; 