export default function CheckoutLoading() {
  return (
    <div className="pt-20 min-h-screen bg-gray-50 animate-pulse">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-6">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <div className="h-4 w-20 bg-gray-200 rounded" />
          <div className="h-8 w-64 bg-gray-200 rounded-lg" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
          {/* Order Details (Left 3 cols) */}
          <div className="md:col-span-3 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="h-5 w-32 bg-gray-200 rounded" />
            <div className="flex gap-4 items-center p-3 bg-gray-50 rounded-2xl">
              <div className="w-16 h-16 bg-gray-200 rounded-xl" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-3/4 bg-gray-200 rounded" />
                <div className="h-3 w-1/2 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <div className="flex justify-between">
                <div className="h-4 w-20 bg-gray-200 rounded" />
                <div className="h-4 w-16 bg-gray-200 rounded" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-4 w-16 bg-gray-200 rounded" />
              </div>
            </div>
          </div>

          {/* Payment Card (Right 2 cols) */}
          <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
            <div className="h-5 w-36 bg-gray-200 rounded" />
            <div className="h-10 w-full bg-gray-200 rounded-xl" />
            <div className="h-12 w-full bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
