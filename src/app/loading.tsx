import { Skeleton } from '@/components/ui/skeleton';

export default function LoadingGlobal() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col p-4 md:p-8 space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-28 rounded-full" />
            <span className="text-muted-foreground/30">•</span>
            <Skeleton className="h-4 w-20 rounded-full" />
          </div>
          <Skeleton className="h-8 w-64 md:w-80 rounded-xl" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="size-10 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, indice) => (
          <div
            key={indice}
            className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="size-8 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-32 rounded-md" />
            <div className="flex items-center gap-2 pt-1">
              <Skeleton className="h-3 w-16 rounded-full" />
              <Skeleton className="h-3 w-28 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-card border border-border shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/60">
            <div className="space-y-1">
              <Skeleton className="h-5 w-44 rounded-md" />
              <Skeleton className="h-3.5 w-60 rounded-md" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-48 rounded-xl" />
              <Skeleton className="h-9 w-24 rounded-xl" />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-4 gap-4 pb-2 border-b border-border">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="h-4 w-16 rounded-md ml-auto" />
            </div>

            {Array.from({ length: 5 }).map((_, indice_fila) => (
              <div
                key={indice_fila}
                className="grid grid-cols-4 gap-4 items-center py-2.5 border-b border-border/40 last:border-none"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="size-8 rounded-full shrink-0" />
                  <Skeleton className="h-4 w-24 rounded-md" />
                </div>
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-8 w-16 rounded-lg ml-auto" />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <Skeleton className="h-3.5 w-36 rounded-md" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-20 rounded-lg" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-5">
          <div className="space-y-1">
            <Skeleton className="h-5 w-36 rounded-md" />
            <Skeleton className="h-3.5 w-48 rounded-md" />
          </div>

          <div className="flex flex-col items-center justify-center p-6 space-y-3 rounded-xl bg-muted/30 border border-border">
            <Skeleton className="size-28 rounded-full" />
            <Skeleton className="h-5 w-32 rounded-md" />
            <Skeleton className="h-3 w-40 rounded-md" />
          </div>

          <div className="space-y-3">
            <Skeleton className="h-4 w-28 rounded-md" />
            {Array.from({ length: 3 }).map((_, indice_item) => (
              <div
                key={indice_item}
                className="flex items-center gap-3 p-2.5 rounded-xl border border-border/50 bg-background"
              >
                <Skeleton className="size-9 rounded-lg shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3.5 w-32 rounded-md" />
                  <Skeleton className="h-3 w-20 rounded-md" />
                </div>
                <Skeleton className="h-4 w-12 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4 flex items-center justify-center text-xs text-muted-foreground gap-2">
        <span className="size-2 rounded-full bg-teal-500 animate-ping inline-block" />
        <span>Sincronizando información con el ecosistema BUMAND...</span>
      </div>
    </div>
  );
}
