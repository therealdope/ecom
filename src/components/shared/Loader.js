import React, { useState, useEffect } from 'react';

export default function Loader() {
  const [videoError, setVideoError] = useState(false);
  const [videoSrc, setVideoSrc] = useState(null);

  // List of loader videos
  const loaderVideos = [
    '/loader/1.mp4',
    '/loader/2.mp4',
    '/loader/3.mp4',
    '/loader/4.mp4',
    '/loader/5.mp4',
  ];

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * loaderVideos.length);
    setVideoSrc(loaderVideos[randomIndex]);
  }, []);

  const finalVideoSrc = videoError ? '/loader/3.mp4' : videoSrc;

  return (
    <div className="absolute top-0 left-0 w-full h-full bg-white flex items-center justify-center z-50">
      <div className="relative">
        <video
          autoPlay
          loop
          muted
          src={finalVideoSrc}
          className="max-w-[350px] max-h-[350px]"
          onError={() => setVideoError(true)}
        />
      </div>
    </div>
  );
}
