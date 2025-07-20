import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-5 flex flex-col justify-center p-4">
      {/* Header Skeleton */}
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Alert Skeleton */}
      <Card className="flex flex-col space-y-3 p-4 w-full border-2 border-border">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-3/4" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
      </Card>

      {/* Metrics Skeletons */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="gap-2 border-2 border-border">
            <CardHeader className="flex flex-row items-center justify-between gap-0">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Entries Table Skeleton */}
      <Card className="border-2 border-border">
        <CardHeader>
          <Skeleton className="h-8 w-56 mb-2" />
          <Skeleton className="h-4 w-4/5" />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="border-b-3 border-border">
              <TableRow className="font-header">
                {["Date", "Sleep", "Mood", "Sleep Notes", "Day Notes", "Day Rating", "Actions"].map((header) => (
                  <TableHead key={header}>
                    <Skeleton className="h-4 w-full" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <TableRow key={i} className="border-b-2 border-border">
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-16" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default DashboardLoadingSkeleton