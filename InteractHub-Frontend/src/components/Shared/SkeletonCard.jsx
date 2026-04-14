const SkeletonCard = () => (
  <div className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 bg-gray-200 rounded-full" />
      <div className="space-y-1 flex-1">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-3 bg-gray-200 rounded w-1/4" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-5/6" />
    </div>
    <div className="h-48 bg-gray-200 rounded-lg mt-3" />
  </div>
);
export default SkeletonCard;