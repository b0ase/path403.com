'use client';

import React from 'react';
import Image from 'next/image';

export default function ProjectImage({ 
  service, 
  projectId,
  title, 
  className = 'w-full h-48' 
}) {
  // The expected path for project images
  const imagePath = `/images/services/${service}/${projectId}.png`;
  
  // Fallback image when the project image doesn't exist
  const fallbackImagePath = '/images/preview-placeholder.png';

  // Track if the main image failed to load
  const [imgSrc, setImgSrc] = React.useState(imagePath);
  const [errored, setErrored] = React.useState(false);

  return (
    <div className={`relative ${className} bg-gray-800 overflow-hidden`}>
      <Image
        src={imgSrc}
        alt={title || 'Project preview'}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover transition-opacity duration-300 opacity-100"
        onError={() => {
          if (!errored) {
            setImgSrc(fallbackImagePath);
            setErrored(true);
          }
        }}
        priority
      />
      
      {/* Overlay with project title - REMOVED */}
      {/* 
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-8 pb-2 px-4">
        <h4 className="text-white text-sm font-medium truncate">{title}</h4>
      </div>
      */}
    </div>
  );
} 