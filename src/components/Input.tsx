import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
}

export function Input({ icon, className = '', ...props }: InputProps) {
  return (
    <div className="relative flex items-center mb-4">
      {icon && (
        <span className="absolute left-4 text-gray-400">
          {icon}
        </span>
      )}
      
      <input
        className={`w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block p-3.5 ${
          icon ? 'pl-12' : 'pl-4'
        } outline-none transition-all ${className}`}
        {...props}
      />
    </div>
  );
}