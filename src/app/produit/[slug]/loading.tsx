export default function ProductLoading() {
  return (
    <div className="pt-28 pb-24 animate-pulse">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <div className="h-4 w-36 bg-rose-100 rounded-full mb-10" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <div className="aspect-[4/5] rounded-3xl bg-petal" />
          <div className="space-y-6 lg:pt-8">
            <div className="h-3 w-24 bg-rose-100 rounded-full" />
            <div className="h-10 w-3/4 bg-rose-100 rounded-full" />
            <div className="h-10 w-1/3 bg-rose-100 rounded-full" />
            <div className="h-px bg-rose-100" />
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-2xl bg-petal" />
              ))}
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-rose-50 rounded-full" />
              <div className="h-3 bg-rose-50 rounded-full w-4/5" />
              <div className="h-3 bg-rose-50 rounded-full w-3/5" />
            </div>
            <div className="h-14 rounded-full bg-blush-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
