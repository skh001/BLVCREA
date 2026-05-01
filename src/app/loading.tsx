import ProductGridSkeleton from '@/components/ProductGridSkeleton';

export default function HomeLoading() {
  return (
    <>
      {/* Hero skeleton */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-petal via-cream to-rose-50 animate-pulse">
        <div className="text-center space-y-6 px-6 max-w-2xl">
          <div className="h-3 w-40 bg-rose-100 rounded-full mx-auto" />
          <div className="h-16 w-80 bg-rose-100 rounded-full mx-auto" />
          <div className="h-16 w-64 bg-rose-100 rounded-full mx-auto" />
          <div className="h-4 w-72 bg-rose-50 rounded-full mx-auto" />
          <div className="flex gap-4 justify-center mt-6">
            <div className="h-12 w-44 bg-rose-100 rounded-full" />
            <div className="h-12 w-44 bg-rose-50 rounded-full" />
          </div>
        </div>
      </section>

      {/* Products skeleton */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
        <div className="text-center mb-14 animate-pulse">
          <div className="h-3 bg-rose-100 rounded-full w-24 mx-auto mb-4" />
          <div className="h-10 bg-rose-100 rounded-full w-40 mx-auto" />
        </div>
        <ProductGridSkeleton count={6} />
      </section>
    </>
  );
}
