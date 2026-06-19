import React from 'react';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-md ${className}`}></div>
  );
}

// Komponenta pro celou stránku (např. detail stroje/zákazníka)
export function PageSkeleton() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 w-full animate-pulse">
      {/* Hlavička */}
      <div className="flex items-center space-x-4 mb-8">
        <Skeleton className="h-10 w-1/3" />
      </div>
      
      {/* Hlavní obsah */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-5 w-1/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="space-y-3 pt-4 border-t border-gray-50">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </div>
      
      {/* 2 sloupce */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );
}

// Komponenta pro tabulky a seznamy
export function TableSkeleton() {
  return (
    <div className="p-6 w-full animate-pulse">
      {/* Toolbar / Search */}
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-10 w-32" />
      </div>
      
      {/* Tabulka */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {/* Hlavička tabulky */}
        <div className="bg-gray-50 p-4 border-b border-gray-100 flex space-x-4">
          <Skeleton className="h-5 w-1/4" />
          <Skeleton className="h-5 w-1/4" />
          <Skeleton className="h-5 w-1/4" />
          <Skeleton className="h-5 w-1/4" />
        </div>
        {/* Řádky */}
        <div className="divide-y divide-gray-50">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 flex items-center space-x-4">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-8 w-8 ml-auto rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
