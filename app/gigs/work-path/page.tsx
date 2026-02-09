"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import getSupabaseBrowserClient from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { FaSpinner, FaLock } from 'react-icons/fa';

export default function WorkPathPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('daily');

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await getSupabaseBrowserClient().auth.getUser();
      setUser(user);
      setLoading(false);
    };
    fetchUser();
  }, []);

  // Check if user is admin@b0ase.com
  const isAuthorizedUser = user?.email === 'admin@b0ase.com';

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-xl text-white">Loading work path...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <FaLock className="mx-auto text-6xl text-gray-500 mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Access Restricted</h1>
          <p className="text-gray-400 mb-6">You need to be logged in to view this content.</p>
          <Link href="/login" className="bg-sky-600 hover:bg-sky-500 text-white font-medium py-2 px-4 rounded-md transition-colors">
            Log In
          </Link>
        </div>
      </div>
    );
  }

  if (!isAuthorizedUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <FaLock className="mx-auto text-6xl text-gray-500 mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">This content is only available to the authorized user.</p>
          <Link href="/auth/gigs" className="bg-sky-600 hover:bg-sky-500 text-white font-medium py-2 px-4 rounded-md transition-colors">
            Go to Gigs Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Define the starting date
  const startDate = new Date('2025-05-08');

  const introductoryText = "These daily schedule templates are designed to be flexible frameworks. Replace the generic &apos;Project Focus&apos; or &apos;Task Block&apos; entries with your specific tasks from ongoing projects like b0ase.com feature development, Ninja Punk Girls milestones, client deliverables, or other personal and professional commitments. The goal is to adapt these structures to your real-time needs and priorities.";

  // Daily schedule options
  const scheduleOptions = [
    {
      id: 'client-focused',
      title: 'Client-Focused Day',
      description: 'Prioritize when active client work or urgent project deadlines demand most of your attention.',
      schedule: [
        { time: '7:00-8:30', activity: 'Morning Routine (Dog walk, exercise, shower, breakfast)', priority: 'high' },
        { time: '8:30-9:00', activity: 'Admin & Planning (Check messages, prioritize real tasks for the day)', priority: 'high' },
        { time: '9:00-12:00', activity: 'Project Focus 1: [Specify key task/project, e.g., NinjaPunkGirls Feature X]', priority: 'high' },
        { time: '12:00-13:00', activity: 'Lunch Break', priority: 'medium' },
        { time: '13:00-15:30', activity: 'Project Focus 2: [Specify key task/project, e.g., b0ase Auth Integration]', priority: 'high' },
        { time: '15:30-16:30', activity: 'Learning/Skill Task: [Specify from Learning Path or project need]', priority: 'medium' },
        { time: '16:30-17:00', activity: 'Project Admin: [Fiverr, client comms, project updates]', priority: 'medium' },
        { time: '17:00-17:30', activity: 'Day Wrap-up (Document progress, plan tomorrow&apos;s real tasks)', priority: 'medium' },
        { time: '17:30-18:30', activity: 'Evening Dog Walk & Personal Time', priority: 'medium' },
        { time: '18:30-19:30', activity: 'Dinner & Financial Review (15 min spending check)', priority: 'high' },
        { time: '19:30-21:00', activity: 'Evening Task Block (Optional: [Specify project task or planned learning])', priority: 'medium' },
        { time: '21:00-22:30', activity: 'Deliberate Wind-Down (Non-screen hobby, reading, planned social)', priority: 'high' }
      ]
    },
    {
      id: 'structured-focus-blocks',
      title: 'Structured Focus Blocks Day',
      description: 'An intensive day built around three core work blocks: B0ase.com development, Client Work, and Personal Projects. Designed for high output over 9-11 focused hours, 6 days a week. Integrate Learning Path activities directly into project tasks where applicable.',
      schedule: [
        { time: '7:00-8:30', activity: 'Morning Routine (Dog walk, exercise, shower, breakfast)', priority: 'high' },
        { time: '8:30-9:00', activity: 'Daily Kick-off & Admin (Plan specific tasks for each block, clear messages)', priority: 'high' },
        { time: '9:00-12:00', activity: 'Block 1: B0ase.com Platform Dev - [Specify task, incorporate Learning Path if relevant]', priority: 'high' },
        { time: '12:00-13:00', activity: 'Lunch Break', priority: 'medium' },
        { time: '13:00-18:00', activity: 'Block 2: Client Work (3-5h focus) - [Specify client tasks & meetings]', priority: 'high' },
        { time: '18:00-19:00', activity: 'Evening Dog Walk / Personal Time / Buffer', priority: 'medium' },
        { time: '19:00-20:00', activity: 'Dinner & Financial Review (Quick check)', priority: 'high' },
        { time: '20:00-23:00', activity: 'Block 3: Personal Projects - [Specify task, incorporate Learning Path if relevant]', priority: 'high' },
        { time: '23:00-23:30', activity: 'Day Wrap-up (Review progress, plan tomorrow\'s blocks)', priority: 'medium' },
        { time: '23:30-00:00', activity: 'Deliberate Wind-Down (Strictly no screens, prepare for sleep)', priority: 'high' }
      ]
    },
    {
      id: 'balanced',
      title: 'Balanced Project Day',
      description: 'Mix project work with dedicated learning and strategic activities.',
      schedule: [
        { time: '7:00-8:30', activity: 'Morning Routine (Dog walk, exercise, shower, breakfast)', priority: 'high' },
        { time: '8:30-9:00', activity: 'Admin & Planning (Check messages, prioritize real tasks for the day)', priority: 'high' },
        { time: '9:00-11:00', activity: 'Project Focus 1: [Specify task, e.g., Miss Void Website Update]', priority: 'high' },
        { time: '11:00-12:30', activity: 'Learning/Skill Task: [Specify from Learning Path or project need]', priority: 'high' },
        { time: '12:30-13:30', activity: 'Lunch Break', priority: 'medium' },
        { time: '13:30-15:00', activity: 'Project Focus 2: [Specify task, e.g., Ninja Punk Girls Content]', priority: 'high' },
        { time: '15:00-16:30', activity: 'Project Focus 3 or Learning: [Specify task or skill development]', priority: 'high' },
        { time: '16:30-17:00', activity: 'Project Admin: [Fiverr, client comms, project updates]', priority: 'medium' },
        { time: '17:00-17:30', activity: 'Day Wrap-up (Document progress, plan tomorrow&apos;s real tasks)', priority: 'medium' },
        { time: '17:30-18:30', activity: 'Evening Dog Walk & Personal Time', priority: 'medium' },
        { time: '18:30-19:30', activity: 'Dinner & Financial Review (15 min spending check)', priority: 'high' },
        { time: '19:30-21:00', activity: 'Evening Task Block (Optional: [Specify project task or planned learning])', priority: 'medium' },
        { time: '21:00-22:30', activity: 'Deliberate Wind-Down (Non-screen hobby, reading, planned social)', priority: 'high' }
      ]
    },
    {
      id: 'learning-focused',
      title: 'Learning & Deep Work Day',
      description: 'Prioritize skill development and focused work on a single complex project.',
      schedule: [
        { time: '7:00-8:30', activity: 'Morning Routine (Dog walk, exercise, shower, breakfast)', priority: 'high' },
        { time: '8:30-9:00', activity: 'Admin & Planning (Check messages, plan day&apos;s learning/project goal)', priority: 'medium' },
        { time: '9:00-10:00', activity: 'Project Focus (Urgent tasks only): [Specify if any]', priority: 'medium' },
        { time: '10:00-12:00', activity: 'Learning Task 1: [Core Learning Path focus or deep skill dive]', priority: 'high' },
        { time: '12:00-13:00', activity: 'Lunch Break', priority: 'medium' },
        { time: '13:00-15:00', activity: 'Deep Project Work: [e.g., b0ase Google Sheets Integration]', priority: 'high' },
        { time: '15:00-16:00', activity: 'Learning Task 2 or Portfolio: [Practical application or documentation]', priority: 'high' },
        { time: '16:00-17:00', activity: 'Strategic Project Dev: [e.g., Plan Ninja Punk Girls next phase]', priority: 'high' },
        { time: '17:00-17:30', activity: 'Day Wrap-up (Document progress, plan tomorrow)', priority: 'medium' },
        { time: '17:30-18:30', activity: 'Evening Dog Walk & Personal Time', priority: 'medium' },
        { time: '18:30-19:30', activity: 'Dinner & Financial Review (15 min spending check)', priority: 'high' },
        { time: '19:30-21:00', activity: 'Evening Learning/Project: [Specify task with clear endpoint]', priority: 'medium' },
        { time: '21:00-22:30', activity: 'Deliberate Wind-Down (Non-screen hobby, reading, planned social)', priority: 'high' }
      ]
    },
    {
      id: 'sprint-cycle-focus',
      title: '45/15 Sprint Cycle Day',
      description: 'Structures the day in 45-minute focused work sprints followed by 15-minute breaks. Allocates sprints across B0ase.com, Client Work, and Personal Projects.',
      schedule: [
        { time: '7:00-8:30', activity: 'Morning Routine (Dog walk, exercise, shower, breakfast)', priority: 'high' },
        { time: '8:30-9:00', activity: 'Daily Kick-off & Admin (Plan 45-min tasks for morning sprints)', priority: 'high' },
        // B0ase.com Block (9:00 - 12:00)
        { time: '9:00-9:45', activity: 'B0ase Sprint 1 - [Specify task, integrate Learning Path if relevant]', priority: 'high' },
        { time: '9:45-10:00', activity: 'Break / Prep', priority: 'medium' },
        { time: '10:00-10:45', activity: 'B0ase Sprint 2 - [Specify task, integrate Learning Path if relevant]', priority: 'high' },
        { time: '10:45-11:00', activity: 'Break / Prep', priority: 'medium' },
        { time: '11:00-11:45', activity: 'B0ase Sprint 3 - [Specify task, integrate Learning Path if relevant]', priority: 'high' },
        { time: '11:45-12:00', activity: 'Break / Prep for Lunch', priority: 'medium' },
        // Lunch (12:00 - 13:00)
        { time: '12:00-12:45', activity: 'Lunch', priority: 'medium' },
        { time: '12:45-13:00', activity: 'Break / Prep for Client Sprints', priority: 'medium' },
        // Client Work Block (13:00 - 18:00, up to 5 sprints)
        { time: '13:00-13:45', activity: 'Client Sprint 1 - [Specify client task]', priority: 'high' },
        { time: '13:45-14:00', activity: 'Break / Prep', priority: 'medium' },
        { time: '14:00-14:45', activity: 'Client Sprint 2 - [Specify client task]', priority: 'high' },
        { time: '14:45-15:00', activity: 'Break / Prep', priority: 'medium' },
        { time: '15:00-15:45', activity: 'Client Sprint 3 - [Specify client task]', priority: 'high' },
        { time: '15:45-16:00', activity: 'Break / Prep', priority: 'medium' },
        { time: '16:00-16:45', activity: 'Client Sprint 4 (Optional) - [Specify client task]', priority: 'high' },
        { time: '16:45-17:00', activity: 'Break / Prep', priority: 'medium' },
        { time: '17:00-17:45', activity: 'Client Sprint 5 (Optional) - [Specify client task]', priority: 'high' },
        { time: '17:45-18:00', activity: 'Break / Prep for Evening', priority: 'medium' },
        // Evening Dog Walk / Personal Time (18:00 - 19:00)
        { time: '18:00-18:45', activity: 'Evening Dog Walk / Personal Time', priority: 'medium' },
        { time: '18:45-19:00', activity: 'Buffer / Prep for Dinner', priority: 'medium' },
        // Dinner (19:00 - 20:00)
        { time: '19:00-19:45', activity: 'Dinner & Financial Review (quick check)', priority: 'high' },
        { time: '19:45-20:00', activity: 'Break / Prep for Personal Project Sprints', priority: 'medium' },
        // Personal Projects Block (20:00 - 23:00)
        { time: '20:00-20:45', activity: 'Personal Project Sprint 1 - [Specify task, integrate Learning Path if relevant]', priority: 'high' },
        { time: '20:45-21:00', activity: 'Break / Prep', priority: 'medium' },
        { time: '21:00-21:45', activity: 'Personal Project Sprint 2 - [Specify task, integrate Learning Path if relevant]', priority: 'high' },
        { time: '21:45-22:00', activity: 'Break / Prep', priority: 'medium' },
        { time: '22:00-22:45', activity: 'Personal Project Sprint 3 - [Specify task, integrate Learning Path if relevant]', priority: 'high' },
        { time: '22:45-23:00', activity: 'Break / Prep for Wrap-up', priority: 'medium' },
        // End of Day
        { time: '23:00-23:30', activity: 'Day Wrap-up (Review sprints, plan carry-over)', priority: 'medium' },
        { time: '23:30-00:00', activity: 'Deliberate Wind-Down (Strictly no screens)', priority: 'high' }
      ]
    },
    {
      id: 'night-owl',
      title: 'Night Owl Project Schedule',
      description: 'For focused late work on specific projects, with healthy boundaries.',
      schedule: [
        { time: '7:00-8:30', activity: 'Morning Routine (Dog walk, exercise, shower, breakfast)', priority: 'high' },
        { time: '8:30-11:00', activity: 'Project Work Block 1 or Learning: [Specify task]', priority: 'medium' },
        { time: '11:00-12:00', activity: 'Admin Tasks & Planning for evening session', priority: 'medium' },
        { time: '12:00-13:00', activity: 'Lunch Break', priority: 'medium' },
        { time: '13:00-15:00', activity: 'Low-Focus Tasks: [Emails, minor updates, research]', priority: 'low' },
        { time: '15:00-16:30', activity: 'Break/Personal Time/Exercise/Dog Walk', priority: 'medium' },
        { time: '16:30-18:00', activity: 'Dinner & Relaxation (With Financial Check-In)', priority: 'high' },
        { time: '18:00-19:00', activity: 'Buffer & Prep for Evening Focus: [Set up environment, review task]', priority: 'high' },
        { time: '19:00-21:30', activity: 'Primary Evening Project Focus 1: [High-focus task, e.g., Coding b0ase feature]', priority: 'high' },
        { time: '21:30-22:00', activity: 'Deliberate Break (Move, hydrate, no screens)', priority: 'high' },
        { time: '22:00-23:30', activity: 'Primary Evening Project Focus 2: [Set clear endpoint, e.g., Finish Ninja Punk Girls module]', priority: 'high' },
        { time: '23:30-00:00', activity: 'Intentional Wind-Down (No screens, prepare for sleep)', priority: 'high' }
      ]
    }
  ];
  
  // Decision framework
  const decisionFramework = [
    {
      question: 'Should I take on this new client work?',
      factors: [
        'Does it align with your priority skill development areas?',
        'Will it create a useful portfolio piece?',
        'Does the timeline allow you to balance with learning goals?',
        'Is the pay rate appropriate for your current skill level?',
        'Will it lead to potential repeat business or referrals?'
      ],
      recommendation: 'Accept work that scores highly on at least 3 of these factors. For work that scores on 2 or fewer, consider negotiating better terms or declining.'
    },
    {
      question: 'What should I prioritize learning today?',
      factors: [
        'Which upcoming client work requires specific skills?',
        'What skills have the highest demand in your active gigs?',
        'Which skill would unlock new gig opportunities?',
        'What aligns with your current position in the Learning Path?',
        'What can you realistically make progress on in the available time?'
      ],
      recommendation: 'Prioritize skills that support imminent client work, then those with high market demand, then those that build on your current progress.'
    },
    {
      question: 'How should I balance client revisions with new work?',
      factors: [
        'Are the revisions urgent (blocking client progress)?',
        'Will the revisions improve your portfolio quality?',
        'Is the revision scope reasonable vs. the original agreement?',
        'Could the revisions be batched with other work for efficiency?',
        'Will addressing revisions now lead to better client satisfaction?'
      ],
      recommendation: 'Handle urgent revisions immediately. Batch non-urgent revisions into specific time blocks. Renegotiate scope if revisions exceed original agreement.'
    },
    {
      question: 'Should I continue working past my scheduled endpoint?',
      factors: [
        'Is there a genuine deadline that cannot be met otherwise?',
        'Am I in a state of productive flow that would be valuable to continue?',
        'Have I set a specific end goal for this extended session?',
        'Will working late negatively impact tomorrow&apos;s productivity?',
        'Am I working late to avoid facing evening boredom?'
      ],
      recommendation: 'Only extend work if the first three factors are true AND the fourth is false. If the fifth factor is true, stick firmly to your scheduled endpoint and transition to a planned evening activity.'
    }
  ];
  
  // Weekly rhythm
  const weeklyRhythm = [
    {
      day: 'Monday',
      focus: 'Planning & Admin',
      activities: [
        'Review week&apos;s client commitments',
        'Update Learning Path progress',
        'Schedule blocks for client work and learning',
        'Identify top 3 priorities for the week',
        'Update gigs based on previous week&apos;s learnings'
      ]
    },
    {
      day: 'Tuesday-Thursday',
      focus: 'Execution & Learning',
      activities: [
        'Focused client work blocks',
        'Dedicated learning time as per schedule',
        'Admin tasks during energy lulls',
        'Client communication in designated windows',
        'Document work/learning for portfolio'
      ]
    },
    {
      day: 'Friday',
      focus: 'Wrap-up & Reflection',
      activities: [
        'Complete outstanding client deliverables',
        'Assess Learning Path progress',
        'Document new skills/projects for portfolio',
        'Update gig offerings if needed',
        'Plan initial priorities for next week'
      ]
    },
    {
      day: 'Weekend',
      focus: 'Recovery & Selective Work',
      activities: [
        'Rest and recover (primary focus)',
        'Optional: Passion projects that build skills',
        'Optional: Catch up on learning if behind',
        'Client work only if urgent/deadline-driven',
        'Light planning for the week ahead'
      ]
    }
  ];
  
  // Evening routine strategies
  const eveningStrategies = [
    {
      id: 'habit-replacement',
      title: 'Habit Replacement Protocol',
      description: 'For addressing destructive evening habits through planned alternatives.',
      steps: [
        {
          title: 'Identify Trigger Times',
          description: 'Recognize that 9pm is your vulnerable period when boredom can lead to destructive habits.'
        },
        {
          title: 'Pre-Planned Alternatives',
          description: 'Before each day begins, decide on a specific evening activity to engage in during vulnerable hours. Write it down in your schedule as an appointment with yourself.'
        },
        {
          title: 'Environment Setup',
          description: 'Prepare your environment to make positive activities easier and negative ones harder. Example: Set out hobby materials before dinner, remove temptations from easy access.'
        },
        {
          title: 'Social Accountability',
          description: 'When possible, schedule evening calls/activities with others during vulnerable times. Social commitments increase follow-through.'
        },
        {
          title: 'Implementation Intention',
          description: 'Create an "If-Then" plan: "If I feel bored at 9pm, then I will immediately start my pre-planned activity for 30 minutes."'
        }
      ]
    },
    {
      id: 'financial-discipline',
      title: 'Financial Discipline System',
      description: 'For managing finances while building your freelance business.',
      steps: [
        {
          title: 'Daily Financial Check-In',
          description: 'Spend 15 minutes each evening reviewing the day&apos;s spending and income. Log every transaction in a simple tracker (spreadsheet or app).'
        },
        {
          title: 'Freelance Income Allocation',
          description: 'Follow the 40/30/30 rule for all freelance income: 40% for taxes and business expenses, 30% for essential living costs, 30% for debt repayment/savings.'
        },
        {
          title: 'Two-Step Purchase Protocol',
          description: 'For non-essential purchases: Add item to a "Consideration List" with date. Wait 48 hours. Review list during financial check-in to decide if still needed.'
        },
        {
          title: 'Client Rate Calculator',
          description: 'Calculate minimum hourly rate based on financial needs: (Monthly Expenses × 1.5) ÷ Available Work Hours = Minimum Rate. Use this as your baseline.'
        },
        {
          title: 'Weekly Financial Planning',
          description: 'Each Sunday, plan the week&apos;s expenses and expected income. Pre-allocate funds for essential needs before discretionary spending.'
        }
      ]
    },
    {
      id: 'productive-late-nights',
      title: 'Productive Late Night Protocol',
      description: 'For when you choose to work late, while maintaining boundaries.',
      steps: [
        {
          title: 'Deliberate Decision Point',
          description: 'At 9pm, make an explicit decision: work session or wind-down. Never drift aimlessly between work and distraction.'
        },
        {
          title: 'Defined Endpoint',
          description: 'If choosing to work, set a specific goal and time limit. Example: "I will complete this component design by 11:30pm, then stop."'
        },
        {
          title: 'Session Setup',
          description: 'Prepare environment: Clean workspace, water nearby, appropriate lighting, all needed materials accessible, distractions removed.'
        },
        {
          title: 'Focus Enhancement',
          description: 'Use a timer for focused work periods (25-50 minutes) with short breaks (5-10 minutes). During breaks, stretch and move away from the screen.'
        },
        {
          title: 'Non-Negotiable Shutdown',
          description: 'Once you reach your predetermined endpoint, initiate a 30-minute shutdown ritual: document progress, set tomorrow&apos;s starting point, transitioning to wind-down.'
        }
      ]
    }
  ];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/gigs" className="text-blue-400 hover:text-blue-300 flex items-center gap-2">
          <span>←</span> Back to Gigs Hub
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">Gigs - Work Path</h1>
      
      <div className="mb-8">
        <p className="text-gray-400 mb-6">
          The Work Path is your practical guide to balancing immediate client work with ongoing skill development. 
          Unlike the Learning Path (which is sequential), the Work Path is situational and helps you make daily decisions 
          about where to focus your time and energy.
        </p>
        
        {/* Tab navigation */}
        <div className="flex flex-wrap border-b border-gray-700 mb-6">
          <button 
            onClick={() => setActiveTab('daily')}
            className={`py-2 px-4 font-medium text-sm ${activeTab === 'daily' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
          >
            Daily Schedules
          </button>
          <button 
            onClick={() => setActiveTab('decisions')}
            className={`py-2 px-4 font-medium text-sm ${activeTab === 'decisions' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
          >
            Decision Framework
          </button>
          <button 
            onClick={() => setActiveTab('weekly')}
            className={`py-2 px-4 font-medium text-sm ${activeTab === 'weekly' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
          >
            Weekly Rhythm
          </button>
          <button 
            onClick={() => setActiveTab('evening')}
            className={`py-2 px-4 font-medium text-sm ${activeTab === 'evening' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
          >
            Evening Strategies
          </button>
          <button 
            onClick={() => setActiveTab('principles')}
            className={`py-2 px-4 font-medium text-sm ${activeTab === 'principles' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
          >
            Guiding Principles
          </button>
        </div>
        
        {/* Daily Schedules Tab */}
        {activeTab === 'daily' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Daily Schedule Templates</h3>
            <p className="text-gray-400 mb-4">
              {introductoryText}
            </p>
            
            <div className="space-y-6">
              {scheduleOptions.map(option => (
                <div key={option.id} className="p-4 border border-gray-700 rounded-lg bg-gray-850">
                  <h4 className="text-lg font-medium mb-2 text-blue-400">{option.title}</h4>
                  <p className="text-gray-400 text-sm mb-4">{option.description}</p>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Time</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Activity</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Priority</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {option.schedule.map((slot, index) => (
                          <tr key={index} className="hover:bg-gray-800">
                            <td className="px-4 py-2 text-xs text-gray-300">{slot.time}</td>
                            <td className="px-4 py-2 text-xs text-gray-300">{slot.activity}</td>
                            <td className="px-4 py-2 text-xs">
                              <span className={`inline-block rounded-full px-2 text-xs ${
                                slot.priority === 'high' ? 'bg-red-900/30 text-red-400' :
                                slot.priority === 'medium' ? 'bg-yellow-900/30 text-yellow-400' :
                                'bg-green-900/30 text-green-400'
                              }`}>
                                {slot.priority}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Decision Framework Tab */}
        {activeTab === 'decisions' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Decision Framework</h3>
            <p className="text-gray-400 mb-4">
              Use these frameworks to make informed decisions about client work, learning priorities, and time allocation.
            </p>
            
            <div className="space-y-6">
              {decisionFramework.map((framework, index) => (
                <div key={index} className="p-4 border border-gray-700 rounded-lg bg-gray-850">
                  <h4 className="text-lg font-medium mb-3 text-cyan-400">{framework.question}</h4>
                  
                  <h5 className="text-sm font-medium mb-2 text-gray-300">Consider these factors:</h5>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-400 mb-4">
                    {framework.factors.map((factor, idx) => (
                      <li key={idx}>{factor}</li>
                    ))}
                  </ul>
                  
                  <div className="bg-gray-800/50 p-3 rounded border-l-2 border-cyan-500 mt-3">
                    <h5 className="text-sm font-medium mb-1 text-gray-300">Recommendation:</h5>
                    <p className="text-sm text-gray-400">{framework.recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Weekly Rhythm Tab */}
        {activeTab === 'weekly' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Weekly Rhythm</h3>
            <p className="text-gray-400 mb-4">
              Establish a consistent weekly pattern to balance productivity, learning, and client management.
            </p>
            
            <div className="space-y-4">
              {weeklyRhythm.map((day, index) => (
                <div key={index} className="p-4 border border-gray-700 rounded-lg bg-gray-850">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
                    <h4 className="text-lg font-medium text-green-400">{day.day}</h4>
                    <span className="text-sm text-gray-400 font-medium">Focus: {day.focus}</span>
                  </div>
                  
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
                    {day.activities.map((activity, idx) => (
                      <li key={idx}>{activity}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Evening Strategies Tab */}
        {activeTab === 'evening' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Evening Strategies</h3>
            <p className="text-gray-400 mb-4">
              Specific protocols to manage late-night work, avoid destructive habits, and maintain financial discipline.
            </p>
            
            <div className="space-y-6">
              {eveningStrategies.map((strategy) => (
                <div key={strategy.id} className="p-4 border border-gray-700 rounded-lg bg-gray-850">
                  <h4 className="text-lg font-medium mb-2 text-red-400">{strategy.title}</h4>
                  <p className="text-gray-400 text-sm mb-4">{strategy.description}</p>
                  
                  <div className="space-y-3">
                    {strategy.steps.map((step, idx) => (
                      <div key={idx} className="p-3 bg-gray-900 rounded">
                        <h5 className="text-sm font-medium mb-1 text-gray-300">{step.title}</h5>
                        <p className="text-xs text-gray-400">{step.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              <div className="p-4 border border-gray-700 rounded-lg bg-gray-850 border-yellow-500/30">
                <h4 className="text-lg font-medium mb-3 text-yellow-400">9PM Decision Point</h4>
                <p className="text-gray-400 text-sm mb-4">
                  Create a hard rule that at 9PM each night, you make an intentional decision about the rest of your evening.
                  Never allow yourself to drift aimlessly after this time. Set an alarm if necessary.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-900 rounded">
                    <h5 className="text-sm font-medium mb-1 text-green-400">Option A: Productive Work</h5>
                    <p className="text-xs text-gray-400">
                      If choosing to work, set a specific task goal and hard stopping time. 
                      Follow the Productive Late Night Protocol. Be clear about what you&apos;ll accomplish.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-gray-900 rounded">
                    <h5 className="text-sm font-medium mb-1 text-blue-400">Option B: Intentional Leisure</h5>
                    <p className="text-xs text-gray-400">
                      If choosing not to work, engage in a pre-planned leisure activity from your Habit Replacement list.
                      Make it something positive and engaging, not just passive screen time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Guiding Principles Tab */}
        {activeTab === 'principles' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Guiding Principles</h3>
            <p className="text-gray-400 mb-4">
              These principles will help you navigate the balance between earning and learning effectively.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-700 rounded-lg bg-gray-850">
                <h4 className="text-lg font-medium mb-2 text-purple-400">1. Portfolio-Driven Selection</h4>
                <p className="text-sm text-gray-400">
                  Prioritize client work that builds your portfolio in alignment with your target gig offerings. 
                  Each client project should ideally serve double-duty as a learning opportunity and a portfolio piece.
                </p>
              </div>
              
              <div className="p-4 border border-gray-700 rounded-lg bg-gray-850">
                <h4 className="text-lg font-medium mb-2 text-purple-400">2. Time Blocking Architecture</h4>
                <p className="text-sm text-gray-400">
                  Structure your day with clear time blocks for client work, learning, and admin. 
                  Protect your learning blocks as vigilantly as you protect client deadlines.
                </p>
              </div>
              
              <div className="p-4 border border-gray-700 rounded-lg bg-gray-850">
                <h4 className="text-lg font-medium mb-2 text-purple-400">3. Aligned Learning</h4>
                <p className="text-sm text-gray-400">
                  When possible, align your Learning Path focus with current client needs. 
                  If you&apos;re working on a Shopify project, prioritize Shopify learning during that period.
                </p>
              </div>
              
              <div className="p-4 border border-gray-700 rounded-lg bg-gray-850">
                <h4 className="text-lg font-medium mb-2 text-purple-400">4. Scope Management</h4>
                <p className="text-sm text-gray-400">
                  Be disciplined about scope on client projects. Set clear boundaries on revisions 
                  and extras to protect your learning time from being consumed by scope creep.
                </p>
              </div>
              
              <div className="p-4 border border-gray-700 rounded-lg bg-gray-850">
                <h4 className="text-lg font-medium mb-2 text-purple-400">5. Default to Learning</h4>
                <p className="text-sm text-gray-400">
                  When in doubt, prioritize learning. Client work will come and go, but your skill 
                  development compounds over time and increases your earning potential.
                </p>
              </div>
              
              <div className="p-4 border border-gray-700 rounded-lg bg-gray-850">
                <h4 className="text-lg font-medium mb-2 text-purple-400">6. Documentation Habit</h4>
                <p className="text-sm text-gray-400">
                  Document everything you learn and create, even small achievements. 
                  This builds your portfolio incrementally and provides material for gig examples.
                </p>
              </div>
              
              <div className="p-4 border border-gray-700 rounded-lg bg-gray-850">
                <h4 className="text-lg font-medium mb-2 text-purple-400">7. Financial Discipline</h4>
                <p className="text-sm text-gray-400">
                  Treat your finances with the same discipline as your work schedule. Daily tracking, 
                  intentional spending decisions, and proper allocation of client income are essential 
                  foundations for freelance success.
                </p>
              </div>
              
              <div className="p-4 border border-gray-700 rounded-lg bg-gray-850">
                <h4 className="text-lg font-medium mb-2 text-purple-400">8. Habit Intentionality</h4>
                <p className="text-sm text-gray-400">
                  Recognize that unstructured time, especially in the evening, creates vulnerability to 
                  negative habits. Combat this through deliberate planning and pre-commitment to 
                  specific positive activities.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 border border-gray-700 rounded-lg bg-gray-850 mt-8">
        <h3 className="text-xl font-semibold mb-3 text-orange-400">Getting Started Now</h3>
        <div className="text-sm text-gray-400 space-y-4">
          <p>
            <strong className="text-gray-300">Today:</strong> Select the most appropriate daily schedule based on your current workload. 
            Block out tomorrow following this template. Identify your vulnerable evening times and plan a specific activity for that period.
          </p>
          <p>
            <strong className="text-gray-300">This week:</strong> Create a simple financial tracking system (spreadsheet or app). 
            Set up a daily 15-minute financial check-in after dinner. Identify 3-5 positive evening activities that can replace destructive habits.
          </p>
          <p>
            <strong className="text-gray-300">This month:</strong> Establish the 9PM decision point ritual every night. Test different evening 
            schedules to find what works best for your productivity and wellbeing. Review your financial situation weekly to guide pricing and client acceptance decisions.
          </p>
          <p className="italic mt-4 text-gray-500">
            Remember: The goal isn&apos;t to eliminate late-night work entirely, but to make it intentional rather than reactive. 
            Choose when to work late based on productivity and goals, not as an escape from boredom or unstructured time.
          </p>
        </div>
      </div>
      
      <div className="mt-12 p-6 border rounded-lg bg-gray-50 dark:bg-gray-700">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Future Enhancements: Towards a More Dynamic Tool</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-2">
          We recognize the need for this Work Path to be even more interactive and tailored to your real-time needs. Future ideas include:
        </p>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
          <li>A fully editable daily schedule modal allowing for more granular time slots and on-the-fly task adjustments.</li>
          <li>The ability to create and save custom schedule templates.</li>
          <li>Potential integration with task management tools or calendars.</li>
          <li>Consideration for environmental factors (like weather or air pressure) to suggest adaptive schedule modifications.</li>
        </ul>
        <p className="text-gray-700 dark:text-gray-300 mt-3">
          These are longer-term goals. For now, the focus is on using the current flexible templates effectively by manually inputting your real tasks.
        </p>
      </div>
    </div>
  );
} 