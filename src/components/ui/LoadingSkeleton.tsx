interface LoadingSkeletonProps {
  tileSize?: 'small' | 'medium' | 'large';
  className?: string;
}

export function LoadingSkeleton({ tileSize = 'medium', className = '' }: LoadingSkeletonProps) {
  const getHeight = () => {
    switch (tileSize) {
      case 'small': return 'h-32';
      case 'large': return 'h-64';
      default: return 'h-48';
    }
  };

  return (
    <div className={`animate-pulse ${getHeight()} ${className}`}>
      <div className="h-full bg-gray-200 rounded-lg flex flex-col">
        {/* Header skeleton */}
        <div className="h-12 bg-gray-300 rounded-t-lg"></div>
        
        {/* Content skeleton */}
        <div className="flex-1 p-4 space-y-3">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          <div className="h-4 bg-gray-300 rounded w-2/3"></div>
          {tileSize === 'large' && (
            <>
              <div className="h-4 bg-gray-300 rounded w-1/3"></div>
              <div className="h-4 bg-gray-300 rounded w-4/5"></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 
