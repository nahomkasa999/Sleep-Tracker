import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export function AnalyticsLoadingSkeleton() {
  return (
    <div className="space-y-5 flex flex-col justify-center p-4">
      {/* Header and Period Switcher Skeleton */}
      <div className="grid gap-0 grid-cols-1">
        <div className="col-span-6 flex items-center justify-between">
          <div>
            <h1 className="font-header text-4xl font-bold text-white ">
              Analytics
            </h1>
            <p className="text-lg font-sans sm:text-base md:text-lg lg:text-md text-muted-foreground">
              Visualizing your sleep patterns, mood trends, and correlations.
            </p>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-20 rounded-md" /> {/* Weekly button */}
            <Skeleton className="h-10 w-20 rounded-md" /> {/* Monthly button */}
            <Skeleton className="h-10 w-20 rounded-md" /> {/* All Time button */}
          </div>
        </div>
      </div>

      {/* Alert Skeleton */}
      <Card className="flex flex-col space-y-3 p-4 w-full border-2 border-border">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-3/4" /> {/* Alert Title */}
        </div>
        <Skeleton className="h-4 w-full" /> {/* Alert Description line 1 */}
        <Skeleton className="h-4 w-11/12" /> {/* Alert Description line 2 */}
      </Card>

      {/* Charts Skeletons (2 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sleep Duration Chart Skeleton */}
        <Card className="border-2 border-border">
          <CardHeader>
            <Skeleton className="h-8 w-48 mb-2" /> {/* Chart Title */}
            <Skeleton className="h-4 w-64" /> {/* Chart Description */}
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[250px] w-full" /> {/* Chart area */}
          </CardContent>
        </Card>

        {/* Mood Trend Chart Skeleton */}
        <Card className="border-2 border-border">
          <CardHeader>
            <Skeleton className="h-8 w-48 mb-2" /> {/* Chart Title */}
            <Skeleton className="h-4 w-64" /> {/* Chart Description */}
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[250px] w-full" /> {/* Chart area */}
          </CardContent>
        </Card>
      </div>

      {/* Correlation Chart Skeleton (full width) */}
      <div>
        <Card className="border-2 border-border">
          <CardHeader>
            <Skeleton className="h-8 w-64 mb-2" /> {/* Chart Title */}
            <Skeleton className="h-4 w-72" /> {/* Chart Description */}
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" /> {/* Chart area */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
