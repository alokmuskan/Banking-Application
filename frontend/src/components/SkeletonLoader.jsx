import React from 'react';

export const SkeletonBox = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-100 rounded-lg ${className}`} />
);

export const SkeletonCard = () => (
  <div className="bg-white rounded-xl border border-slate-100 p-5 space-y-3">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <SkeletonBox className="h-3 w-20" />
        <SkeletonBox className="h-7 w-32" />
      </div>
      <SkeletonBox className="h-10 w-10 rounded-xl" />
    </div>
    <SkeletonBox className="h-3 w-24" />
  </div>
);

export const SkeletonRow = () => (
  <tr className="border-b border-slate-100">
    {[1,2,3,4,5].map(i => (
      <td key={i} className="px-4 py-3">
        <SkeletonBox className="h-4 w-full" />
      </td>
    ))}
  </tr>
);

const SkeletonLoader = ({ count = 3, type = 'card' }) => {
  if (type === 'row') {
    return Array.from({ length: count }).map((_, i) => <SkeletonRow key={i} />);
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
};

export default SkeletonLoader;
