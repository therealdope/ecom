'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowPathIcon, HomeIcon, InformationCircleIcon,SquaresPlusIcon} from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';

export default function SmartMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const dragRef = useRef(null);

  const handleRefresh = () => window.location.reload();
  const handleDashboard = () => router.push('/user/dashboard');
  const handleSupport = () => router.push('/user/support');

  return (
    <div className="hidden md:block fixed inset-0 z-50 pointer-events-none">
      <motion.div
        drag
        dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
        dragElastic={0.2}
        ref={dragRef}
        className="absolute -right-10 top-1/2 -translate-y-1/2 pointer-events-auto"
      >
        <div className="relative w-[200px] h-[200px]">
          {/* FAB Button when menu is closed */}
          {!open && (
            <button
              onClick={() => setOpen(true)}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                        bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white 
                        rounded-full p-3 shadow-2xl backdrop-blur-md ring-1 ring-white/10 
                        hover:scale-105 hover:shadow-indigo-300 transition-all duration-300"
            >
              {/* Icon */}
              <SquaresPlusIcon className="w-6 h-6" />
            </button>
          )}

          {/* Circular Menu when open */}
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="relative w-[200px] h-[200px]">
                  {/* Refresh */}
                  <motion.button
                    className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-white p-3 rounded-full shadow-md hover:bg-gray-100"
                    whileHover={{ scale: 1.1 }}
                    onClick={() => {
                      handleRefresh();
                      setOpen(false);
                    }}
                  >
                    <ArrowPathIcon className="w-6 h-6 text-indigo-600" />
                  </motion.button>

                  {/* Dashboard */}
                  <motion.button
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white p-3 rounded-full shadow-md hover:bg-gray-100"
                    whileHover={{ scale: 1.1 }}
                    onClick={() => {
                      handleDashboard();
                      setOpen(false);
                    }}
                  >
                    <HomeIcon className="w-6 h-6 text-indigo-600" />
                  </motion.button>

                  {/* Support */}
                  <motion.button
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-white p-3 rounded-full shadow-md hover:bg-gray-100"
                    whileHover={{ scale: 1.1 }}
                    onClick={() => {
                      handleSupport();
                      setOpen(false);
                    }}
                  >
                    <InformationCircleIcon className="w-6 h-6 text-indigo-600" />
                  </motion.button>

                  {/* Close Button */}
                  <motion.button
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                               bg-red-600 text-white px-3 py-2 rounded-full shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    onClick={() => setOpen(false)}
                  >
                    ✕
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
