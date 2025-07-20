import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export function AnalyticsLoadingSkeleton() {
  return (
    <div className="space-y-5 flex flex-col justify-center p-4">
      {/* Header and Period Switcher Skeleton */}
      <div className="grid gap-0 grid-cols-1">
        <div className="col-span-6 flex items-center justify-between">
          <div>
            {/* Replaced h1 and p with Skeleton components */}
            <Skeleton className="h-10 w-48 mb-2 bg-muted" /> {/* Title Skeleton */}
            <Skeleton className="h-6 w-72 bg-muted" /> {/* Description Skeleton */}
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-20 rounded-md bg-muted" /> {/* Weekly button */}
            <Skeleton className="h-10 w-20 rounded-md bg-muted" /> {/* Monthly button */}
            <Skeleton className="h-10 w-20 rounded-md bg-muted" /> {/* All Time button */}
          </div>
        </div>
      </div>

      {/* Alert Skeleton */}
      <Card className="flex flex-col space-y-3 p-4 w-full border-2 border-border">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-6 w-6 rounded-full bg-muted" />
          <Skeleton className="h-6 w-3/4 bg-muted" /> {/* Alert Title */}
        </div>
        <Skeleton className="h-4 w-full bg-muted" /> {/* Alert Description line 1 */}
        <Skeleton className="h-4 w-11/12 bg-muted" /> {/* Alert Description line 2 */}
      </Card>

      {/* Charts Skeletons (2 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sleep Duration Chart Skeleton */}
        <Card className="border-2 border-border">
          <CardHeader>
            <Skeleton className="h-8 w-48 mb-2 bg-muted" /> {/* Chart Title */}
            <Skeleton className="h-4 w-64 bg-muted" /> {/* Chart Description */}
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[250px] w-full bg-muted" /> {/* Chart area */}
          </CardContent>
        </Card>

        {/* Mood Trend Chart Skeleton */}
        <Card className="border-2 border-border">
          <CardHeader>
            <Skeleton className="h-8 w-48 mb-2 bg-muted" /> {/* Chart Title, corrected class */}
            <Skeleton className="h-4 w-64 bg-muted" /> {/* Chart Description */}
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[250px] w-full bg-muted" /> {/* Chart area */}
          </CardContent>
        </Card>
      </div>

      {/* Correlation Chart Skeleton (full width) */}
      <div>
        <Card className="border-2 border-border">
          <CardHeader>
            <Skeleton className="h-8 w-64 mb-2 bg-muted" /> {/* Chart Title */}
            <Skeleton className="h-4 w-72 bg-muted" /> {/* Chart Description */}
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full bg-muted" /> {/* Chart area */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
