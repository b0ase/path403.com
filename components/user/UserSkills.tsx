'use client';

import React from 'react';
import Link from 'next/link';
import { FaLightbulb, FaRocket, FaBriefcase } from 'react-icons/fa';

// Type Definitions
export interface Skill {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
}

// Simplified Profile representation for conditional rendering logic within UserSkills
export interface PageProfileForSkills {
  // Add any specific profile fields if UserSkills needs them beyond existence check
  // For now, its existence (null vs. not-null) is the primary use.
  [key: string]: any; 
}

export interface UserSkillsProps {
  loadingSkills: boolean;
  pageError: string | null;
  pageProfile: PageProfileForSkills | null; 
  selectedSkills: Skill[];
  userSkillIds: Set<string>;
  allSkills: Skill[];
  savingSkills: boolean;
  customSkillInput: string;
  skillChoiceInAdder: string;
  onSkillToggle: (skillId: string, isCurrentlySelected: boolean) => Promise<void>;
  onAddCustomSkill: (skillName: string) => Promise<void>;
  onCustomSkillInputChange: (value: string) => void;
  onSkillChoiceInAdderChange: (value: string) => void;
  // Add skillSuccessMessage prop if UserSkills should handle its own success messages
}

// Skill Badge Styling Function (copied from ProfilePage)
const getSkillBadgeStyle = (category: string | null): string => {
  const baseStyle = "px-3 py-1.5 text-xs font-semibold rounded-full shadow-md inline-flex items-center justify-center min-w-[80px] text-center";
  switch (category?.toLowerCase().trim()) {
    case 'frontend development': return `${baseStyle} bg-green-600 text-green-100 border border-green-500`;
    case 'backend development': return `${baseStyle} bg-blue-600 text-blue-100 border border-blue-500`;
    case 'programming': return `${baseStyle} bg-indigo-600 text-indigo-100 border border-indigo-500`;
    case 'design': return `${baseStyle} bg-pink-600 text-pink-100 border border-pink-500`;
    case 'management': return `${baseStyle} bg-purple-600 text-purple-100 border border-purple-500`;
    case 'databases': return `${baseStyle} bg-yellow-500 text-yellow-900 border border-yellow-400`;
    case 'devops': return `${baseStyle} bg-red-600 text-red-100 border border-red-500`;
    case 'cloud computing': return `${baseStyle} bg-cyan-600 text-cyan-100 border border-cyan-500`;
    case 'marketing': return `${baseStyle} bg-orange-600 text-orange-100 border border-orange-500`;
    case 'user-defined': return `${baseStyle} bg-teal-600 text-teal-100 border border-teal-500`;
    default: return `${baseStyle} bg-gray-600 text-gray-100 border border-gray-500`;
  }
};

const UserSkills: React.FC<UserSkillsProps> = ({
  loadingSkills,
  pageError,
  pageProfile,
  selectedSkills,
  userSkillIds,
  allSkills,
  savingSkills,
  customSkillInput,
  skillChoiceInAdder,
  onSkillToggle,
  onAddCustomSkill,
  onCustomSkillInputChange,
  onSkillChoiceInAdderChange,
}) => {
  return (
    <section className="pb-6 lg:w-1/2">
      <div className="flex justify-between items-center mb-4">
        <Link href="/skills" legacyBehavior>
          <a className="text-xl font-semibold text-sky-400 hover:text-sky-300 transition-colors duration-150 flex items-center">
            <FaLightbulb className="mr-3 text-2xl text-yellow-400" /> My Skills
          </a>
        </Link>
      </div>
      
      {loadingSkills ? (
        <div className="flex items-center justify-center p-6 rounded-md bg-gray-700">
          <FaRocket className="h-8 w-8 animate-spin text-green-400 mr-3" />
          <p className="text-lg text-gray-300">Loading your skills...</p>
        </div>
      ) : pageError && !pageProfile ? (
        <p className="text-red-400 bg-red-900/30 p-3 rounded-md">{pageError}</p>
      ) : (
        <div className="p-4 bg-gray-750 rounded-lg border border-gray-600">
          {selectedSkills.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {selectedSkills.map(skill => (
                <span 
                  key={skill.id} 
                  className={`${getSkillBadgeStyle(skill.category)} transition-all duration-150 ease-in-out transform hover:scale-105`}
                  title={skill.description || skill.name}
                >
                  {skill.name}
                  <button
                    onClick={() => onSkillToggle(skill.id, true)}
                    disabled={savingSkills}
                    className="ml-2 p-0.5 rounded-full text-xs leading-none hover:bg-black/20 focus:outline-none disabled:opacity-50 transition-colors"
                    aria-label={`Remove ${skill.name} skill`}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
          {(!loadingSkills && selectedSkills.length === 0) && (
            <div className="text-center py-6 px-4 border-2 border-dashed border-gray-600 rounded-lg bg-gray-750 mb-6">
              <FaBriefcase className="mx-auto text-5xl text-gray-500 mb-4" />
              <p className="text-gray-400 text-lg mb-2">No skills added yet.</p>
            </div>
          )}

          <h3 className="text-xl font-semibold mt-0 mb-4 text-gray-200">Add New Skills</h3>
          {loadingSkills && allSkills.length === 0 ? (
            <div className="flex items-center justify-center p-4 rounded-md bg-gray-700">
              <FaRocket className="h-6 w-6 animate-spin text-blue-400 mr-2" />
              <p className="text-md text-gray-300">Loading available skills...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <input
                type="text"
                value={customSkillInput}
                onChange={(e) => onCustomSkillInputChange(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter' && customSkillInput.trim()) {
                    e.preventDefault();
                    await onAddCustomSkill(customSkillInput.trim());
                  }
                }}
                placeholder="+ Type custom skill & Enter"
                className="px-3 py-1.5 text-xs font-semibold rounded-full shadow-md bg-gray-700 text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors min-w-[180px] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={savingSkills}
                title="Add a skill not in the list"
              />
              {allSkills.filter(skill => !userSkillIds.has(skill.id) && skill.category !== 'User-defined').length > 0 && (
                <div className="inline-block relative animate-fadeInQuickly">
                  <select 
                    value={skillChoiceInAdder}
                    onChange={async (e) => {
                      const selectedValue = e.target.value;
                      if (selectedValue) {
                        onSkillChoiceInAdderChange(selectedValue); 
                        await onSkillToggle(selectedValue, false); 
                        onSkillChoiceInAdderChange(''); 
                      }
                    }}
                    disabled={savingSkills}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full shadow-md appearance-none min-w-[150px] focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                                ${skillChoiceInAdder === '' ? 'bg-gray-700 text-gray-400 hover:bg-gray-600' : 'bg-gray-800 text-gray-300'} `}
                  >
                    <option value="" disabled={skillChoiceInAdder !== ''} className="text-gray-500">+ Add from list</option>
                    {Object.entries(
                      allSkills
                        .filter(skill => !userSkillIds.has(skill.id) && skill.category !== 'User-defined')
                        .reduce((acc, skill) => {
                          const category = skill.category || 'Other';
                          if (!acc[category]) acc[category] = [];
                          acc[category].push(skill);
                          return acc;
                        }, {} as Record<string, Skill[]>)
                    ).map(([category, skillsInCategory]) => (
                      <optgroup label={category} key={category} className="bg-gray-750 text-sky-300 font-semibold">
                        {skillsInCategory.map(skill => (
                          <option key={skill.id} value={skill.id} className="bg-gray-800 text-gray-200">
                            {skill.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
          {userSkillIds.size > 0 && 
           !loadingSkills && 
           allSkills.filter(skill => !userSkillIds.has(skill.id) && skill.category !== 'User-defined').length === 0 &&
           allSkills.some(skill => skill.category !== 'User-defined') &&
          (
            <p className="text-xs text-amber-400 italic ml-2">All predefined skills added! Add more custom ones using the input field.</p>
          )}
        </div>
      )}
    </section>
  );
};

export default UserSkills; 