import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Loader() {
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState('/loader.gif'); // Default for SSR
  
  // List of available loader images
  const loaderImages = [
    '/loader.gif',
    '/loader1.gif',
    '/loader2.png',
    '/loader3.png',
    '/loader4.png',
  ];
  
  // Select a random image only on client-side after hydration
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * loaderImages.length);
    setImageSrc(loaderImages[randomIndex]);
  }, []);
  
  // Fallback if image fails to load
  const finalImageSrc = imageError ? '/loader.gif' : imageSrc;
  
  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50">
      <div className="flex items-center justify-center">
        <div className="relative">
          <Image 
            src={finalImageSrc} 
            width={0}
            height={0}
            sizes="(max-width: 640px) 150px, (max-width: 1024px) 250px, 300px"
            className="w-auto h-auto max-w-[300px] max-h-[300px] md:max-w-[250px] md:max-h-[250px] sm:max-w-[150px] sm:max-h-[150px]"
            alt="Loading..." 
            unoptimized
            priority
            onError={() => setImageError(true)}
          />
        </div>
      </div>
    </div>
  );
}