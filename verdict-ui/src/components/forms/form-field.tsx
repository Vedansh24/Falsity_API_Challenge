import React from 'react';

export default function FormField({
  label,
  children,
  hint,
  error
}: {
  label?: string;
  children: React.ReactNode;
  hint?: string;
  error?: string;
}){
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <div>{children}</div>
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
