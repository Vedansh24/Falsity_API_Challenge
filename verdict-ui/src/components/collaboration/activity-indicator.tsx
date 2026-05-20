/**
 * Activity Indicator
 * Presence indicators for users
 */

'use client';

interface ActivityIndicatorProps {
  isActive: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export default function ActivityIndicator({ isActive, size = 'md', label }: ActivityIndicatorProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${sizeClasses[size]} rounded-full ${
          isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
        }`}
      />
      {label && <span className="text-xs text-gray-600">{label}</span>}
    </div>
  );
}
