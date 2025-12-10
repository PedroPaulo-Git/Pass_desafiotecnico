import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 10, columns = 6 }: TableSkeletonProps) {
  return (
    <div className="w-full">
      {/* Table Header Skeleton */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-border">
        <Skeleton className="h-4 w-4 rounded" /> {/* Checkbox */}
        <Skeleton className="h-4 w-12" /> {/* ID */}
        <Skeleton className="h-4 w-16" /> {/* Titulo */}
        <div className="flex-1" />
        <Skeleton className="h-4 w-20" /> {/* Modo */}
        <Skeleton className="h-4 w-16" /> {/* Status */}
        <Skeleton className="h-4 w-24" /> {/* Criado em */}
        <Skeleton className="h-4 w-28" /> {/* Ultima Alteracao */}
      </div>

      {/* Table Rows Skeleton */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-b-0"
        >
          <Skeleton className="h-4 w-4 rounded" /> {/* Checkbox */}
          <Skeleton className="h-4 w-10 rounded-full" /> {/* ID badge */}
          <Skeleton className="h-4 w-48 md:w-96" /> {/* Titulo - longer */}
          <div className="flex-1" />
          <Skeleton className="h-4 w-24 md:w-32" /> {/* Modo */}
          <Skeleton className="h-4 w-20 md:w-24" /> {/* Status */}
          <Skeleton className="h-4 w-24 md:w-28" /> {/* Criado em */}
          <Skeleton className="h-4 w-28 md:w-36" /> {/* Ultima Alteracao */}
        </div>
      ))}

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border mt-2">
        <Skeleton className="h-8 w-24 rounded-md" /> {/* Items per page */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" /> {/* Page info */}
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
    </div>
  );
}
