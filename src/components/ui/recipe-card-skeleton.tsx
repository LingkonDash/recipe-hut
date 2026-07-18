export function RecipeCardSkeleton() {
  return (
    <div className="group flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm animate-pulse">
      <div className="h-48 w-full bg-zinc-200 dark:bg-zinc-800"></div>
      
      <div className="flex flex-col flex-grow p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        </div>
        
        <div className="h-6 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded mb-3"></div>
        
        <div className="space-y-2 mb-4 flex-grow">
          <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          <div className="h-4 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        </div>
        
        <div className="h-9 w-full bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
      </div>
    </div>
  );
}
