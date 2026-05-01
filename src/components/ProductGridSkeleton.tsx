export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-rose-50 overflow-hidden animate-pulse">
      <div className="aspect-[4/5] bg-petal" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-rose-50 rounded-full w-3/4" />
        <div className="h-3 bg-rose-50 rounded-full w-1/3" />
        <div className="flex justify-between items-center pt-1">
          <div className="h-6 bg-rose-50 rounded-full w-1/4" />
          <div className="h-3 bg-rose-50 rounded-full w-1/5" />
        </div>
      </div>
      <div className="px-5 pb-5">
        <div className="h-10 bg-rose-50 rounded-full w-full" />
      </div>
    </div>
  );
}

export default function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
