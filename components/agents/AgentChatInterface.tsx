'use client';

import { useState, useEffect, useRef } from 'react';
import { FiSend, FiLoader } from 'react-icons/fi';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

interface AgentChatInterfaceProps {
  agentId: string;
  conversationId?: string | null;
  onConversationCreated?: (conversationId: string) => void;
}

export function AgentChatInterface({
  agentId,
  conversationId: initialConversationId,
  onConversationCreated,
}: AgentChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(
    initialConversationId || null
  );
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingMessageRef = useRef<string>('');

  // Load conversation history if conversationId exists
  useEffect(() => {
    if (conversationId) {
      loadMessages();
    }
  }, [conversationId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/agents/${agentId}/conversations/${conversationId}/messages`
      );

      if (!response.ok) {
        throw new Error('Failed to load messages');
      }

      const data = await response.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Failed to load conversation history');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || streaming) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);

    // Add user message to UI immediately
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      setStreaming(true);
      streamingMessageRef.current = '';

      // Add placeholder for streaming assistant message
      const tempAssistantMessage: Message = {
        id: `temp-assistant-${Date.now()}`,
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempAssistantMessage]);

      const response = await fetch(`/api/agents/${agentId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response stream');
      }

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'content' && data.text) {
                streamingMessageRef.current += data.text;
                // Update the streaming message
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage && lastMessage.role === 'assistant') {
                    lastMessage.content = streamingMessageRef.current;
                  }
                  return newMessages;
                });
              } else if (data.type === 'done') {
                // Set conversation ID if this was a new conversation
                if (data.conversationId && !conversationId) {
                  setConversationId(data.conversationId);
                  onConversationCreated?.(data.conversationId);
                }
              } else if (data.type === 'error') {
                setError(data.error || 'An error occurred');
              }
            } catch (parseError) {
              console.error('Error parsing SSE data:', parseError);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      // Remove the failed assistant message
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setStreaming(false);
      streamingMessageRef.current = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <FiLoader className="w-8 h-8 text-white animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-white/60 text-lg">
              Start a conversation with your agent
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={message.id || index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] md:max-w-[70%] rounded-lg px-6 py-4 ${
                  message.role === 'user'
                    ? 'bg-white text-black'
                    : 'bg-white/10 text-white border border-white/20'
                }`}
              >
                <div className="whitespace-pre-wrap break-words">
                  {message.content}
                </div>
                {message.role === 'assistant' &&
                  streaming &&
                  index === messages.length - 1 && (
                    <span className="inline-block w-2 h-5 ml-1 bg-white animate-pulse" />
                  )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 md:px-8 py-3 bg-red-500/20 border-t border-red-500/50">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-white/20 px-4 md:px-8 py-6">
        <div className="flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={streaming}
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-6 py-4 text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || streaming}
            className="bg-white text-black px-8 py-4 rounded-lg font-bold uppercase tracking-wider hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {streaming ? (
              <>
                <FiLoader className="w-5 h-5 animate-spin" />
                <span className="hidden md:inline">Thinking...</span>
              </>
            ) : (
              <>
                <FiSend className="w-5 h-5" />
                <span className="hidden md:inline">Send</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
