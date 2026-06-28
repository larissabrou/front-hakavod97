import React from 'react';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-neutral-800 focus:ring-neutral-500',
    secondary: 'bg-white text-neutral-800 border border-neutral-300 hover:bg-neutral-50 focus:ring-neutral-500',
    accent: 'bg-accent text-white hover:bg-red-700 focus:ring-red-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'text-neutral-600 hover:bg-neutral-100 focus:ring-neutral-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-sm',
    md: 'px-5 py-2.5 text-base rounded-md',
    lg: 'px-8 py-3 text-lg rounded-md',
    full: 'w-full py-3 text-base rounded-md',
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
