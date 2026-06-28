import React from 'react';

export const Input = React.forwardRef(({
  label,
  type = 'text',
  name,
  error,
  className = '',
  placeholder = '',
  required = false,
  ...props
}, ref) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-neutral-700">
          {label} {required && <span className="text-accent">*</span>}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        name={name}
        id={name}
        placeholder={placeholder}
        required={required}
        className={`w-full px-4 py-2.5 border rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-neutral-800 transition-all ${
          error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-neutral-300'
        }`}
        {...props}
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
