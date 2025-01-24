export function SkeletonContent() {
  return (
    <div className="flex items-center space-x-4">
      <div className="h-12 w-12 rounded-full bg-gray-200" />
      <div className="space-y-2">
        <div className="h-4 w-[250px] bg-gray-200" />
        <div className="h-4 w-[200px] bg-gray-200" />
      </div>
    </div>
  );
}
