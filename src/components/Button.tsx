import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'outline';
}

export function Button({ children, variant = 'primary', className = '', ...props }: ButtonProps) {
  const baseStyle = "w-full py-3.5 rounded-lg font-semibold transition-colors duration-200 flex justify-center items-center text-sm";
  
  const variants = {
    primary: "bg-[#0f2c59] text-white hover:bg-[#0a1e3f] shadow-md",
    outline: "border-2 border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
}