'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Background animation effect
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const particles = [];
    
    // Set canvas size to match window
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Particle class for comet effect
    class Particle {
      constructor() {
        this.reset();
      }
      
      reset() {
        // Start from left edge with random y position
        this.x = 0;
        this.y = Math.random() * canvas.height * 0.7; // Mostly in the upper part
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 3 + 1;
        this.speedY = Math.random() * 0.5 - 0.25; // Slight vertical movement
        this.opacity = 1;
        this.color = `rgba(180, 160, 255, ${this.opacity})`; // Light purple
        this.tailLength = Math.floor(Math.random() * 20) + 10;
        this.history = [];
      }
      
      update() {
        // Store current position for tail
        this.history.push({x: this.x, y: this.y});
        if (this.history.length > this.tailLength) {
          this.history.shift();
        }
        
        // Move particle
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Fade out as it moves toward the middle
        const maxDistance = canvas.width * 0.6;
        if (this.x > maxDistance * 0.3) {
          this.opacity = 1 - ((this.x - maxDistance * 0.3) / (maxDistance * 0.7));
        }
        
        this.color = `rgba(180, 160, 255, ${this.opacity})`;
        
        // Reset when it's gone or faded out
        if (this.x > canvas.width || this.opacity <= 0.05) {
          this.reset();
        }
      }
      
      draw() {
        ctx.fillStyle = this.color;
        
        // Draw tail
        for (let i = 0; i < this.history.length; i++) {
          const point = this.history[i];
          const tailOpacity = (i / this.history.length) * this.opacity;
          const tailSize = (i / this.history.length) * this.size;
          
          ctx.beginPath();
          ctx.fillStyle = `rgba(180, 160, 255, ${tailOpacity})`;
          ctx.arc(point.x, point.y, tailSize, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Draw head
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Create particles
    for (let i = 0; i < 12; i++) {
      particles.push(new Particle());
      // Stagger initial positions
      particles[i].x = Math.random() * canvas.width * 0.3;
    }
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-white to-gray-100 px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 relative overflow-hidden">
      {/* Canvas for background animation */}
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
      />
      
      {/* Header with Logo and Social Links */}
      <div className="max-w-6xl w-full mb-18 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Social Media Links with Arrow */}
          <div className="flex flex-col items-center md:items-start relative">
            <div className="flex space-x-4">
              <a 
                href="https://linkedin.com/in/shwetkheni" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 text-gray-600 hover:text-indigo-600 transition-colors duration-300 text-xl"
                aria-label="LinkedIn Profile"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a 
                href="https://github.com/therealdope" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 text-gray-600 hover:text-indigo-600 transition-colors duration-300 text-xl"
                aria-label="GitHub Profile"
              >
                <svg className="w-10 h-10 -mt-1" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
            
            {/* Hand-drawn arrow with text - hidden on small screens */}
            <div className="hidden md:block absolute transform -rotate-[-20deg] -right-23 top-11">
              <div className="relative">
                <Image 
                  src="/drawnarrow.png" 
                  alt="Arrow pointing to developer links" 
                  width={100} 
                  height={60} 
                  className="transform rotate-[15deg]"
                />
                <span className="absolute text-lg top-20 left-0 text-indigo-600 font-bold transform -rotate-[-20deg] whitespace-nowrap" style={{fontFamily: "'Comic Sans MS', cursive, sans-serif"}}>
                  Developer
                </span>
              </div>
            </div>
          </div>
          
          {/* Logo */}
          <div className="flex justify-center">
            <Image 
              src="/logo.png" 
              alt="E-commerce Logo" 
              width={200} 
              height={200} 
              className="w-auto h-auto"
              priority
            />
          </div>
          
          {/* Get Started Button */}
          <div>
            <Link 
              href="/auth/signin" 
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300"
            >
              <svg className="-ml-1 mr-2 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Get Started
            </Link>
          </div>
        </div>
      </div>
      
      <div className="max-w-5xl w-full space-y-16 relative z-10">
        {/* Headline */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Your Ultimate</span>
            <span className="block text-indigo-600">E-commerce Platform</span>
          </h1>
          
          {/* Description */}
          <p className="mt-6 text-xl text-gray-500 sm:max-w-xl sm:mx-auto">
            Connecting buyers and sellers in a seamless marketplace experience. 
            Shop with confidence or start selling your products today!
          </p>
        </div>
        
        {/* Features */}
        <div className="mt-16">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
            {/* For Shoppers */}
            <div className="p-8 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex flex-col items-center">
                <div className="p-4 bg-indigo-100 rounded-full mb-6">
                  <svg className="w-10 h-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">Shoppers</h3>
                <p className="text-base text-gray-500 text-center">Discover unique products from verified vendors with secure payment options.</p>
              </div>
            </div>
            
            {/* For Vendors */}
            <div className="p-8 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex flex-col items-center">
                <div className="p-4 bg-indigo-100 rounded-full mb-6">
                  <svg className="w-10 h-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">Vendors</h3>
                <p className="text-base text-gray-500 text-center">Showcase your products to a wide audience with powerful selling tools.</p>
              </div>
            </div>
            
            {/* Secure Platform */}
            <div className="p-8 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex flex-col items-center">
                <div className="p-4 bg-indigo-100 rounded-full mb-6">
                  <svg className="w-10 h-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">Secure</h3>
                <p className="text-base text-gray-500 text-center">End-to-end encryption and verified accounts ensure safe transactions.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main CTA Button */}
        <div className="mt-16 text-center">
          <Link 
            href="/auth/signin" 
            className="inline-flex items-center px-10 py-4 border border-transparent text-lg font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-300 shadow-lg hover:shadow-xl"
          >
            <svg className="-ml-1 mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Get Started
          </Link>
        </div>
      </div>
      
      {/* Footer with Social Links */}
      <div className="mt-24 w-full max-w-5xl relative z-10">
        <div className="border-t border-gray-200 pt-6 flex justify-center space-x-8">
          <a 
            href="https://linkedin.com/in/shwetkheni" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-indigo-500 transition-colors duration-300"
          >
            <span className="sr-only">LinkedIn</span>
            <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
          <a 
            href="https://github.com/therealdope" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-indigo-500 transition-colors duration-300"
          >
            <span className="sr-only">GitHub</span>
            <svg className="h-10 w-10 -mt-1" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
        <p className="mt-4 text-center text-sm text-gray-500 pb-6">
          &copy; {new Date().getFullYear()} ecom. All rights reserved.
        </p>
      </div>
    </div>
  );
}
