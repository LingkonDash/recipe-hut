export function RecipeCardSkeleton() {
  return (
    <div className="group flex flex-col bg-surface border border-border rounded-xl overflow-hidden shadow-sm animate-pulse">
      <div className="h-48 w-full bg-background"></div>
      
      <div className="flex flex-col flex-grow p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="h-3 w-16 bg-background rounded"></div>
          <div className="h-3 w-20 bg-background rounded"></div>
        </div>
        
        <div className="h-6 w-3/4 bg-background rounded mb-3"></div>
        
        <div className="space-y-2 mb-4 flex-grow">
          <div className="h-4 w-full bg-background rounded"></div>
          <div className="h-4 w-5/6 bg-background rounded"></div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 w-16 bg-background rounded"></div>
          <div className="h-4 w-16 bg-background rounded"></div>
        </div>
        
        <div className="h-9 w-full bg-background rounded-lg"></div>
      </div>
    </div>
  );
}
