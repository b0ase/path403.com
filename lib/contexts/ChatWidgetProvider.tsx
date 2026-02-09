'use client';

import React from 'react';
import { ChatProvider } from './ChatContext';
import AIAgentWidget from '@/components/AIAgentWidget';

export default function ChatWidgetProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChatProvider>
      {children}
      <AIAgentWidget />
    </ChatProvider>
  );
}
