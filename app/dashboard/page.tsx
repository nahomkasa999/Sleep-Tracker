"use client";
import React, { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Moon, Smile, Star } from "lucide-react";
import { ClockFading, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { toast } from "sonner";
import { EditEntryDialog } from "@/components/EditEntries/EditEntries";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSleepEntry,
  getWellbeing,
  deleteSingleSleepEntry,
  deleteSingleWellbeingEntry,
} from "@/components/FetchingData";

export const journalEntrySchema = z.object({
  id: z.string(),
  date: z.string(),
  sleepTime: z.string().optional(),
  wakeTime: z.string().optional(),
  sleepDuration: z.number(), // in hours
  mood: z.string(), // "happy", "stressed", "excited", "neutral", "sad"
  dayRating: z.number(), // 1-10 scale
  sleepNotes: z.string().optional(),
  dayNotes: z.string().optional(),
});

export type JournalEntry = z.infer<typeof journalEntrySchema>;

const metrics = [
  {
    title: "Avg. Sleep",
    value: `6.7h`,
    icon: Moon,
  },
  {
    title: "Avg. Mood",
    value: "Neutral",
    icon: Smile,
  },
  {
    title: "Avg. Day Rating",
    value: `4.9/10`,
    icon: Star,
  },
];

function Page() {
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Mutation for editing an entry
  const editEntryMutation = useMutation({
    mutationFn: async (data: any) => {
      const entryId = data.id;

      // Perform both API calls in parallel
      const [sleepResponse, wellbeingResponse] = await Promise.all([
        fetch(`/api/sleep/${entryId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bedtime: new Date(data.bedtime).toISOString(),
            wakeUpTime: new Date(data.wakeUpTime).toISOString(),
            qualityRating: data.qualityRating,
            comments: data.sleepComments,
            durationHours: data.durationHours,
          }),
        }),
        fetch(`/api/wellbeing/${entryId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entryDate: new Date(data.entryDate).toISOString(),
            dayRating: data.dayRating,
            mood: data.mood,
            comments: data.dayComments,
          }),
        }),
      ]);

      if (!sleepResponse.ok || !wellbeingResponse.ok) {
        // If either request fails, throw an error to trigger onError
        const errorData = !sleepResponse.ok
          ? await sleepResponse.json()
          : await wellbeingResponse.json();
        throw new Error(errorData?.message || "Failed to update entry");
      }

      return Promise.all([sleepResponse.json(), wellbeingResponse.json()]);
    },
    onSuccess: () => {
      toast.success("Entry updated successfully!");
      // Invalidate queries to trigger a refetch and update the table
      queryClient.invalidateQueries({ queryKey: ["sleepEntries"] });
      queryClient.invalidateQueries({ queryKey: ["wellbeingEntries"] });
      setEditDialogOpen(false); // Close the dialog
    },
    onError: (error: any) => {
      toast.error(`Failed to update entry: ${error.message}`);
    },
  });

  // Mutation for deleting an entry
  const deleteEntryMutation = useMutation({
    mutationFn: async (entryId: string) => {
      await Promise.all([
        deleteSingleSleepEntry(entryId),
        deleteSingleWellbeingEntry(entryId),
      ]);
      return entryId;
    },
    onSuccess: () => {
      toast.success("Entry deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["sleepEntries"] });
      queryClient.invalidateQueries({ queryKey: ["wellbeingEntries"] });
    },
    onError: (error: any) => {
      toast.error(
        `Failed to delete entry: ${error.message || "Unknown error"}`
      );
    },
  });

  // Fetch sleep entries
  const {
    data: sleepData,
    isLoading: sleepLoading,
    isError: sleepError,
  } = useQuery({
    queryKey: ["sleepEntries"],
    queryFn: getSleepEntry,
  });

  // Fetch wellbeing entries
  const {
    data: wellbeingData,
    isLoading: wellbeingLoading,
    isError: wellbeingError,
  } = useQuery({
    queryKey: ["wellbeingEntries"],
    queryFn: getWellbeing,
  });

  // Map sleep and wellbeing data to JournalEntry[]
  const sleepEntries = sleepData?.data || [];
  const wellbeingEntries = wellbeingData?.data || [];

  function findWellbeingForSleep(sleepEntry: any) {
    const sleepDate = new Date(sleepEntry.bedtime).toISOString().slice(0, 10);
    return wellbeingEntries.find((w: any) => {
      const wDate = new Date(w.entryDate).toISOString().slice(0, 10);
      return wDate === sleepDate;
    });
  }

  const entries: JournalEntry[] = sleepEntries.map((sleepEntry: any) => {
    const wellbeing = findWellbeingForSleep(sleepEntry);
    const bedtime = new Date(sleepEntry.bedtime);
    const wakeUpTime = new Date(sleepEntry.wakeUpTime);
    return {
      id: sleepEntry.id,
      date: bedtime.toISOString(),
      sleepTime: bedtime.toISOString().split("T")[1]?.slice(0, 5),
      wakeTime: wakeUpTime.toISOString().split("T")[1]?.slice(0, 5),
      sleepDuration: sleepEntry.durationHours ?? 0,
      mood: wellbeing?.mood?.toLowerCase() || "neutral",
      dayRating: wellbeing?.dayRating ?? 5,
      sleepNotes: sleepEntry.comments || "",
      dayNotes: wellbeing?.comments || "",
    };
  });

  function getQualityRating(entry: JournalEntry) {
    return typeof (entry as any).qualityRating === "number"
      ? (entry as any).qualityRating
      : 5;
  }

  function toEditEntryForm(entry: JournalEntry) {
    return {
      id: entry.id,
      entryDate: entry.date,
      bedtime: entry.sleepTime
        ? entry.date.split("T")[0] + "T" + entry.sleepTime
        : entry.date,
      wakeUpTime: entry.wakeTime
        ? entry.date.split("T")[0] + "T" + entry.wakeTime
        : entry.date,
      qualityRating: getQualityRating(entry),
      sleepComments: entry.sleepNotes ?? "",
      durationHours: entry.sleepDuration,
      dayRating: entry.dayRating,
      mood: entry.mood,
      dayComments: entry.dayNotes ?? "",
    };
  }

  async function handleDelete(entryId: string) {
    deleteEntryMutation.mutate(entryId);
  }

  return (
    <div className="space-y-5 flex flex-col justify-center p-4">
      {/* header */}
      <div>
        <h1 className="font-header text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-xs md:text-sm text-muted-foreground">
          An overview of your sleep and wellbeing.
        </p>
      </div>
      {/*Alert*/}
      <Alert className="flex flex-col space-y-3 p-4 w-full border-2 border-border">
        <ClockFading />
        <div className="space-y-1">
          <AlertTitle className="font-bold text-white text-sm md:text-base">
            This Week's Insight
          </AlertTitle>
          <AlertDescription className="text-xs md:text-sm text-foreground">
            The user has recently experienced variable sleep patterns with a
            tendency towards shorter sleep durations, and primarily negative
            moods. However, the most recent entry shows improved mood and day
            rating, coinciding with a longer sleep duration the night before.
          </AlertDescription>
        </div>
      </Alert>

      {/* the overview */}
      <div>
        <div className="grid gap-4 grid-cols-2 grid-rows  md:grid-cols-3">
          {metrics.map((metric, index) => (
            <Card
              key={metric.title}
              className={`${
                index === metrics.length - 1 && metrics.length % 2 !== 0
                  ? "col-span-2 md:col-auto"
                  : ""
              } gap-2 border-2 border-border`}
            >
              <CardHeader className="flex flex-row items-center justify-between gap-0">
                <CardTitle className="text-sm font-medium font-header">
                  {metric.title}
                </CardTitle>
                <metric.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* the recent table */}
      <div>
        {sleepLoading || wellbeingLoading ? (
          <div className="text-center py-8">Loading entries...</div>
        ) : sleepError || wellbeingError ? (
          <div className="text-center py-8 text-red-500">
            Error loading entries.
          </div>
        ) : (
          <Card className="border-2 border-border">
            <CardHeader>
              <CardTitle className="text-3xl">Recent Entries</CardTitle>
              <CardDescription className="text-xs md:text-sm text-muted-foreground">
                Click on a row to view and edit an entry.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader className="border-b-3 border-border">
                  <TableRow className="font-header">
                    <TableHead>Date</TableHead>
                    <TableHead className="px-6 py-2">Sleep</TableHead>
                    <TableHead className="px-6 py-2">Mood</TableHead>
                    <TableHead className="px-6 py-2">Sleep Notes</TableHead>
                    <TableHead className="px-6 py-2">Day Notes</TableHead>
                    <TableHead className="text-right px-6 py-2">
                      Day Rating
                    </TableHead>
                    <TableHead className="text-right px-6 py-2">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.slice(0, 7).map((entry) => (
                    <TableRow
                      key={entry.id}
                      onClick={() => {
                        setEditingEntry(entry);
                        setEditDialogOpen(true);
                      }}
                      className="cursor-pointer, border-b-2 border-border"
                    >
                      <TableCell>
                        {new Date(entry.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-6 py-2">
                        {entry.sleepDuration.toFixed(1)}h
                      </TableCell>
                      <TableCell className="px-6 py-2">
                        <Badge variant="secondary" className="capitalize">
                          {entry.mood}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-15 py-2">
                        {entry.sleepNotes ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <FileText className="h-5 w-5 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">{entry.sleepNotes}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="px-15 py-2">
                        {entry.dayNotes ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <FileText className="h-5 w-5 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">{entry.dayNotes}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center py-2">
                        {entry.dayRating}/10
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click from triggering
                            handleDelete(entry.id);
                          }}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
        {/* Edit Entry Dialog */}
        {editingEntry && (
          <EditEntryDialog
            entry={toEditEntryForm(editingEntry)}
            isOpen={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onSave={async (data) => { await editEntryMutation.mutateAsync(data); }}
          />
        )}
      </div>
    </div>
  );
}

export default Page;