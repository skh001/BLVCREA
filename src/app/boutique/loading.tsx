import ProductGridSkeleton from '@/components/ProductGridSkeleton';

export default function BoutiqueLoading() {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-14 animate-pulse">
          <div className="h-3 bg-rose-100 rounded-full w-32 mx-auto mb-4" />
          <div className="h-10 bg-rose-100 rounded-full w-48 mx-auto mb-4" />
          <div className="h-px bg-rose-100 w-32 mx-auto" />
        </div>
        <div className="flex justify-center gap-3 mb-12">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-9 w-24 bg-rose-50 rounded-full animate-pulse" />
          ))}
        </div>
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  );
}
