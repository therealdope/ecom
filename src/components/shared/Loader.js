import React, { useMemo, useState } from 'react';
import Image from 'next/image';

export default function Loader() {
  const [imageError, setImageError] = useState(false);
  
  // List of available loader images
  const loaderImages = [
    '/loader.gif',
    '/loader1.gif',
    '/loader2.gif',
    '/loader3.gif',
  ];
  
  // Select a random image on component mount
  const randomImage = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * loaderImages.length);
    return loaderImages[randomIndex];
  }, []);
  
  // Fallback to the default loader if the random one fails to load
  const imageSrc = imageError ? '/loader.gif' : randomImage;
  
  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50">
      <div className="loader rounded-lg flex items-center justify-center">
        <Image 
          src={imageSrc} 
          width={0}
          height={0}
          sizes="(max-width: 640px) 80px, (max-width: 1024px) 120px, 140px"
          className="w-auto h-auto max-w-[120px] max-h-[120px] sm:max-w-[100px] sm:max-h-[100px] xs:max-w-[80px] xs:max-h-[80px]"
          alt="Loading..." 
          priority
          onError={() => setImageError(true)}
        />
      </div>
    </div>
  );
}