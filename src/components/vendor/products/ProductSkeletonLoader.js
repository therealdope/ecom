import React from 'react';

export default function ProductSkeletonLoader() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg"></div>
          <div className="flex flex-col flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="mt-2 h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="h-4 bg-gray-200 rounded w-12 ml-auto"></div>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </td>
      <td className="px-6 py-4 text-center">
        <div className="flex justify-center space-x-2">
          <div className="h-8 w-8 bg-gray-200 rounded"></div>
          <div className="h-8 w-8 bg-gray-200 rounded"></div>
        </div>
      </td>
    </tr>
  );
}