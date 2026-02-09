'use client';

import React, { useState } from 'react';
import { FaTimes, FaExpand } from 'react-icons/fa';
import AIChat from './AIChat';
import Image from 'next/image';

interface AIAgentWidgetProps {
  context?: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function AIAgentWidget({ context, isOpen, onOpenChange }: AIAgentWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Chat Widget */}
      <div
          className={`fixed z-50 bg-gray-900 rounded-lg shadow-2xl border border-gray-700 flex flex-col transition-all duration-300 ${
            isExpanded
              ? 'bottom-4 right-4 left-4 top-4 md:bottom-6 md:right-6 md:left-auto md:top-auto md:w-96 md:h-[600px]'
              : 'bottom-6 right-6 w-80 h-96'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center">
              <Image src="/boase_icon.png" alt="Boase AI Agent Icon" width={20} height={20} className="mr-2" />
              <h3 className="text-white font-medium">Boase AI Agent</h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleExpand}
                className="text-gray-400 hover:text-white transition-colors p-1"
                aria-label={isExpanded ? "Minimize" : "Expand"}
              >
                <FaExpand size={14} />
              </button>
              <button
                onClick={() => onOpenChange(false)}
                className="text-gray-400 hover:text-white transition-colors p-1"
                aria-label="Close"
              >
                <FaTimes size={14} />
              </button>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 min-h-0">
            <AIChat context={context || "User is using the floating AI widget"} setIsOpen={onOpenChange} />
          </div>
        </div>
    </>
  );
}
