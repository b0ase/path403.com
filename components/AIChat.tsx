'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaUser, FaSpinner, FaTimes } from 'react-icons/fa';
import Image from 'next/image';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface AIChatProps {
  context?: string;
  setIsOpen?: (isOpen: boolean) => void;
}

export default function AIChat({ context, setIsOpen }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "How can I help you?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Re-focus the input whenever the AI is done responding.
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  useEffect(() => {
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }, 0);
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    if (setIsOpen) {
      setIsOpen(true);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          context: context
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response,
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/50 backdrop-blur-md rounded-lg border border-white/20 shadow-2xl">
      <div 
        className={`flex-shrink-0 flex items-center justify-between p-4 border-b border-white/20 bg-gray-900/50 ${setIsOpen ? 'cursor-pointer hover:bg-white/10 transition-colors' : ''}`}
        onClick={() => setIsOpen && setIsOpen(false)}
      >
        <div className="flex items-center gap-3">
          <Image src="/b0ase_logo_ copy.png" alt="Boase Logo" width={32} height={32} />
        </div>
        {setIsOpen && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }} 
            className="text-gray-400 hover:text-white"
          >
            <FaTimes />
          </button>
        )}
      </div>

      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex justify-start`}
          >
            <div
              className={`flex flex-row items-start space-x-3 w-full`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.isUser
                    ? 'bg-blue-800 text-white'
                    : 'bg-gray-700 text-sky-400'
                }`}
              >
                {message.isUser ? <FaUser size={14} /> : <Image src="/b0ase_logo_ copy.png" alt="Boase Logo" width={28} height={28} />}
              </div>
              <div
                className={`px-4 py-2 rounded-lg ${
                  message.isUser
                    ? 'bg-blue-900/60 backdrop-blur-sm border border-blue-700/50 text-gray-200'
                    : 'bg-gray-800 text-gray-100 flex-1'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-700 text-sky-400">
                 <Image src="/b0ase_logo_ copy.png" alt="Boase Logo" width={28} height={28} />
              </div>
              <div className="px-4 py-2 rounded-lg bg-gray-800 text-gray-100">
                <div className="flex items-center space-x-2">
                  <FaSpinner className="animate-spin" size={14} />
                  <p className="text-sm">Thinking...</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 p-4 border-t border-gray-700">
        <div className="flex space-x-2">
           <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-600 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <FaSpinner className="animate-spin" size={16} />
            ) : (
              <FaPaperPlane size={16} />
            )}
          </button>
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about b0ase.com..."
            className="flex-1 px-4 py-2 bg-gray-800 border border-transparent rounded-lg text-white placeholder-gray-400 outline-none ring-2 ring-sky-500"
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
