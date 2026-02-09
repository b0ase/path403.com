import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaExternalLinkAlt } from 'react-icons/fa';

export interface Project {
  id: number;
  title: string;
  description: string;
  cardImageUrls?: string[];
  liveUrl?: string;
  tokenName?: string;
  slug: string;
}

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <div className="relative bg-gradient-to-br from-gray-900 to-black border border-gray-700 text-white shadow-lg flex flex-col overflow-hidden h-40 rounded-lg group hover:border-gray-500 hover:shadow-xl hover:from-gray-800 transition-all duration-300">
      {project.cardImageUrls?.[0] ? (
        <Image
          src={project.cardImageUrls[0]}
          alt={`Screenshot of ${project.title} project showing the main interface and key features`}
          fill
          className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-all duration-300"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <span className="text-3xl font-bold text-gray-600">
            {project.title.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase()}
          </span>
        </div>
      )}

      <div className="relative z-10 flex flex-col justify-between h-full p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <div>
          <h3 className="text-md font-bold text-white leading-tight mb-1">{project.title}</h3>
          {project.liveUrl && (
            <div className="flex items-center text-xs text-blue-400 group-hover:text-blue-300 transition-colors">
              <FaExternalLinkAlt className="mr-1" />
              <span>{project.liveUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-end">
          <p className="text-xs text-gray-300 line-clamp-2 flex-1 mr-4">{project.description}</p>
          {project.tokenName && (
            <Link href={`/portfolio/${project.slug}`} legacyBehavior>
              <a className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded hover:bg-blue-500 transition-colors whitespace-nowrap">
                {project.tokenName}
              </a>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard; 