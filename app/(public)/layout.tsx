'use client';

import { useState } from 'react';
import AIAgentWidget from '@/components/AIAgentWidget';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [isAIOpen, setIsAIOpen] = useState(false);
  
  return (
    <>
      <main>{children}</main>
      <AIAgentWidget 
        context="Public page" 
        isOpen={isAIOpen}
        onOpenChange={setIsAIOpen}
      />
    </>
  );
}