import { Skeleton } from "@mui/material";

// Package Card Skeleton
export function PackageCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <Skeleton variant="rectangular" width="100%" height={200} />
      <div className="p-4 space-y-3">
        <Skeleton variant="text" width="80%" height={24} />
        <Skeleton variant="text" width="40%" height={20} />
        <Skeleton variant="text" width="60%" height={20} />
        <div className="flex justify-between items-center mt-4">
          <Skeleton variant="text" width="30%" height={28} />
          <Skeleton variant="rectangular" width={100} height={40} />
        </div>
      </div>
    </div>
  );
}

// Destination Card Skeleton
export function DestinationCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <Skeleton variant="rectangular" width="100%" height={220} />
      <div className="p-4 space-y-2">
        <Skeleton variant="text" width="70%" height={24} />
        <Skeleton variant="text" width="50%" height={18} />
        <Skeleton variant="text" width="90%" height={16} />
      </div>
    </div>
  );
}

// Hero Section Skeleton
export function HeroSkeleton() {
  return (
    <div className="relative w-full h-[500px] md:h-[600px]">
      <Skeleton 
        variant="rectangular" 
        width="100%" 
        height="100%" 
        className="absolute inset-0"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-4 w-full max-w-2xl px-4">
          <Skeleton variant="text" width="80%" height={60} className="mx-auto" />
          <Skeleton variant="text" width="60%" height={30} className="mx-auto" />
          <div className="flex gap-4 justify-center mt-6">
            <Skeleton variant="rectangular" width={150} height={50} />
            <Skeleton variant="rectangular" width={150} height={50} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Package Detail Skeleton
export function PackageDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <Skeleton variant="text" width="70%" height={40} />
        <Skeleton variant="text" width="40%" height={24} />
      </div>

      {/* Image Gallery */}
      <Skeleton variant="rectangular" width="100%" height={400} />

      {/* Tabs */}
      <div className="flex gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" width={120} height={40} />
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="text" width="100%" height={20} />
        ))}
      </div>

      {/* Price Card */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <Skeleton variant="text" width="40%" height={32} />
        <Skeleton variant="text" width="60%" height={24} className="mt-2" />
        <Skeleton variant="rectangular" width="100%" height={50} className="mt-4" />
      </div>
    </div>
  );
}

// List Skeleton
export function ListSkeleton({ items = 5 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
          <Skeleton variant="circular" width={60} height={60} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="40%" height={18} />
          </div>
          <Skeleton variant="rectangular" width={100} height={36} />
        </div>
      ))}
    </div>
  );
}

// Grid Skeleton
export function GridSkeleton({ items = 6, CardComponent = PackageCardSkeleton }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: items }).map((_, index) => (
        <CardComponent key={index} />
      ))}
    </div>
  );
}

// Testimonial Card Skeleton
export function TestimonialSkeleton() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton variant="circular" width={56} height={56} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="50%" height={20} />
          <Skeleton variant="text" width="30%" height={16} />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" width="100%" height={16} />
        <Skeleton variant="text" width="100%" height={16} />
        <Skeleton variant="text" width="80%" height={16} />
      </div>
    </div>
  );
}

