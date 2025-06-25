'use client';

import { createContext, useState, useContext, useCallback } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback(({ title, description }) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, description }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-[9999] space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            className="group bg-indigo-600 text-white rounded-xl shadow-lg border border-indigo-700 w-86 p-5 cursor-pointer transition-all duration-200 hover:bg-indigo-700"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="text-sm font-semibold">{toast.title}</h4>
                <p className="text-sm mt-1 text-indigo-100">{toast.description}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeToast(toast.id);
                }}
                className="text-indigo-200 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XMarkIcon className="w-4 h-4 -mr-3 -mt-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
