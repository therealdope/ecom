import React from 'react';

export default function ProductMainPageSkeletonLoader() {
  return (
    <div className="p-6 w-full max-w-7xl">
      {/* Header Section Skeleton */}
      <div className="flex justify-between items-center mb-6">
        <div className="animate-pulse h-8 w-32 bg-gray-200 rounded-md"></div>
        <div className="animate-pulse h-10 w-32 bg-gray-200 rounded-md"></div>
      </div>

      {/* Controls Section Skeleton */}
      <div className="flex justify-end items-center mb-6 gap-4">
        <div className="animate-pulse h-10 w-48 bg-gray-200 rounded-lg"></div>
        <div className="animate-pulse h-10 w-32 bg-gray-200 rounded-lg"></div>
      </div>

      {/* Table Skeleton */}
      <div className="w-full overflow-x-auto rounded-lg shadow-sm bg-white">
        <div className="min-w-full divide-y divide-gray-200">
          {/* Table Header Skeleton */}
          <div className="bg-gray-100 py-4">
            <div className="grid grid-cols-7 gap-4 px-6">
              {[...Array(7)].map((_, index) => (
                <div key={index} className="animate-pulse h-4 bg-gray-200 rounded w-full"></div>
              ))}
            </div>
          </div>

          {/* Table Body Skeleton */}
          <div className="bg-white divide-y divide-gray-200">
            {[...Array(4)].map((_, rowIndex) => (
              <div key={rowIndex} className="px-6 py-4">
                <div className="grid grid-cols-7 gap-4 items-center">
                  {/* Name Column with Image */}
                  <div className="flex items-start space-x-4">
                    <div className="animate-pulse flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="animate-pulse h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  {/* Other Columns */}
                  {[...Array(6)].map((_, colIndex) => (
                    <div key={colIndex} className="animate-pulse h-4 bg-gray-200 rounded w-full"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pagination Skeleton */}
      <div className="mt-6 flex justify-between items-center">
        <div className="animate-pulse h-8 w-24 bg-gray-200 rounded"></div>
        <div className="animate-pulse h-8 w-32 bg-gray-200 rounded"></div>
        <div className="animate-pulse h-8 w-24 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}