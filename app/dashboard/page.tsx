"use client";
import React, { useState } from "react";
import { auth } from "@/app/lib/auth";
import { useSession } from "@/app/lib/auth-client";
import { redirect } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
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

import { EditEntryDialog, formatDateTimeLocal, formatDateOnly } from "@/components/EditEntries/EditEntries";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";


import { SleepEntryReceivingSchemaDBType, SleepInsightsResponse } from "@/app/lib/insight";
import { CorrelationResponse } from "@/app/lib/utllity";
import DashboardLoadingSkeleton from "@/components/skeleton/DashboardLoadingSkeleton";


 


export type JournalEntry = SleepEntryReceivingSchemaDBType[number];


export type EditEntryFormType = {
  id: string;
  entryDate: string; 
  bedtime: string; 
  wakeUpTime: string; 
  qualityRating: number;
  sleepComments?: string | null; 
  durationHours?: number | null;
  dayRating: number;
  mood?: 'Happy' | 'Stressed' | 'Neutral' | 'Sad' | 'Excited' | 'Tired' | null;
  dayComments?: string | null; 
};



function Page() {
  
  const { data: session, isPending } = useSession();
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const queryClient = useQueryClient();


  const { data: aiCorrelationInsight, isLoading: isAICorrelationLoading, isError: isAICorrelationError } = useQuery<{ insight: string }>({
    queryKey: ['aiCorrelationInsightDashboard'],
    queryFn: async () => {
      const response = await fetch(`/api/insights/AI/correlation?period=all`); // Fetch weekly insight for dashboard
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch AI correlation insight');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Fetch Summary Data
  const { data: summaryData, isLoading: isSummaryLoading, isError: isSummaryError } = useQuery<SleepInsightsResponse>({
    queryKey: ['summaryDataDashboard'],
    queryFn: async () => {
      const response = await fetch(`/api/insights/summary?period=all`); // Fetch weekly summary
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch summary data');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Fetch All Sleep Entries for the table
  const { data: allSleepEntries, isLoading: isEntriesLoading, isError: isEntriesError } = useQuery<SleepEntryReceivingSchemaDBType>({
    queryKey: ['allSleepEntriesDashboard'],
    queryFn: async () => {
      const response = await fetch(`/api/sleep`); // Fetch all sleep entries
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch sleep entries');
      }
      return (await response.json()).data; // Assuming data is nested under 'data'
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  
  const editEntryMutation = useMutation({
    
    mutationFn: async (data: Partial<EditEntryFormType> & { id: string }) => {
      const entryId = data.id;
      
      const { id, ...payload } = data;

     
      if (payload.bedtime) payload.bedtime = new Date(payload.bedtime).toISOString();
      if (payload.wakeUpTime) payload.wakeUpTime = new Date(payload.wakeUpTime).toISOString();
      if (payload.entryDate) payload.entryDate = new Date(payload.entryDate).toISOString();

      const response = await fetch(`/api/sleep/${entryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload), // Send only the changed fields
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.message || "Failed to update entry");
      }

      return response.json();
    },
    onMutate: async (updatedEntry) => {
      await queryClient.cancelQueries({ queryKey: ["allSleepEntriesDashboard"] });
      const previousData = queryClient.getQueryData(["allSleepEntriesDashboard"]);
      queryClient.setQueryData(["allSleepEntriesDashboard"], (old: any[] = []) => {
        return old.map((entry) =>
          entry.id === updatedEntry.id ? { ...entry, ...updatedEntry } : entry
        );
      });
      return { previousData };
    },
    onError: (error, updatedEntry, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["allSleepEntriesDashboard"], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["allSleepEntriesDashboard"] });
    },
    onSuccess: () => {
      toast.success("Entry updated successfully!");
      
      queryClient.invalidateQueries({ queryKey: ["aiCorrelationInsightDashboard"] });
      queryClient.invalidateQueries({ queryKey: ["summaryDataDashboard"] });
      setEditDialogOpen(false); 
    },
  });

  
  const deleteEntryMutation = useMutation({
    mutationFn: async (entryId: string) => {
      const response = await fetch(`/api/sleep/${entryId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.message || "Failed to delete entry");
      }
      return response.json();
    },
    onMutate: async (entryId) => {
      await queryClient.cancelQueries({ queryKey: ["allSleepEntriesDashboard"] });
      const previousData = queryClient.getQueryData(["allSleepEntriesDashboard"]);
      queryClient.setQueryData(["allSleepEntriesDashboard"], (old: any[] = []) => {
        return old.filter((entry) => entry.id !== entryId);
      });
      return { previousData };
    },
    onError: (error, entryId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["allSleepEntriesDashboard"], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["allSleepEntriesDashboard"] });
    },
    onSuccess: () => {
      toast.success("Entry deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["aiCorrelationInsightDashboard"] });
      queryClient.invalidateQueries({ queryKey: ["summaryDataDashboard"] });
    },
  });

  
  
  
  function toEditEntryForm(entry: JournalEntry): EditEntryFormType {
    return {
      id: entry.id,
      entryDate: formatDateOnly(entry.entryDate), 
      bedtime: formatDateTimeLocal(entry.bedtime),
      wakeUpTime: formatDateTimeLocal(entry.wakeUpTime),
      qualityRating: entry.qualityRating,
      sleepComments: entry.sleepcomments ?? null,
      durationHours: entry.durationHours ?? null,
      dayRating: entry.dayRating,
      mood: entry.mood ?? null,
      dayComments: entry.daycomments ?? null,
    };
  }

  async function handleDelete(entryId: string) {
    deleteEntryMutation.mutate(entryId);
  }

  const entries: JournalEntry[] = allSleepEntries || [];

  const isLoading = isAICorrelationLoading || isSummaryLoading || isEntriesLoading;
  const isError = isAICorrelationError || isSummaryError || isEntriesError;

  if (isLoading) {
    return (
      <DashboardLoadingSkeleton/>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-red-500 text-center">
        Error loading dashboard:
        {isAICorrelationError && <p>{aiCorrelationInsight?.insight || "AI Correlation Error"}</p>}
        {isSummaryError && <p>{summaryData?.message || "Summary Data Error"}</p>}
        {isEntriesError && <p>{true || "Sleep Entries Error"}</p>}
      </div>
    );
  }

  // Prepare metrics data
  const avgSleep = summaryData?.summary?.averageSleepDurationHours !== null && summaryData?.summary?.averageSleepDurationHours !== undefined
    ? `${summaryData.summary.averageSleepDurationHours.toFixed(1)}h`
    : 'N/A';

  const avgDayRating = summaryData?.summary?.averageDayRating !== null && summaryData?.summary?.averageDayRating !== undefined
    ? `${summaryData.summary.averageDayRating.toFixed(1)}/10`
    : 'N/A';

  
  const calculateMostFrequentMood = (entries: JournalEntry[]): string => {
    if (!entries || entries.length === 0) {
      return "N/A";
    }

    const moodCounts = entries.reduce((acc, entry) => {
      if (entry.mood) {
        acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    if (Object.keys(moodCounts).length === 0) {
      return "N/A";
    }

    const mostFrequentMood = Object.keys(moodCounts).reduce((a, b) =>
      moodCounts[a] > moodCounts[b] ? a : b
    );

    return mostFrequentMood;
  };

  const avgMood = calculateMostFrequentMood(entries);

  const dashboardMetrics = [
    {
      title: "Avg. Sleep",
      value: avgSleep,
      icon: Moon,
    },
    {
      title: "Avg. Mood",
      value: avgMood,
      icon: Smile,
    },
    {
      title: "Avg. Day Rating",
      value: avgDayRating,
      icon: Star,
    },
  ];


  return (
    <div className="space-y-5 flex flex-col justify-center p-4">
      {/* header */}
      <div>
        <h1 className="font-header text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-xs md:text-sm text-muted-foreground">
          An overview of your sleep and wellbeing.
        </p>
      </div>
      {/*Alert for AI Correlation Insight*/}
      <Alert className="flex flex-col space-y-3 p-4 w-full border-2 border-border">
        <ClockFading />
        <div className="space-y-1">
          <AlertTitle className="font-bold text-foreground text-sm md:text-base">
            This Week's Insight
          </AlertTitle>
          <AlertDescription className="text-2xs md:text-sm text-foreground">
            {aiCorrelationInsight?.insight || "Loading AI insight..."}
          </AlertDescription>
        </div>
      </Alert>

      {/* the overview metrics */}
      <div>
        <div className="grid gap-4 grid-cols-2 grid-rows  md:grid-cols-3">
          {dashboardMetrics.map((metric, index) => (
            <Card
              key={metric.title}
              className={`${
                index === dashboardMetrics.length - 1 && dashboardMetrics.length % 2 !== 0
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
        {isEntriesLoading ? (
          <div className="text-center py-8">Loading entries...</div>
        ) : isEntriesError ? (
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
                        {new Date(entry.entryDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-6 py-2">
                        {entry.durationHours !== null && entry.durationHours !== undefined
                          ? entry.durationHours.toFixed(1)
                          : parseFloat(((entry.wakeUpTime.getTime() - entry.bedtime.getTime()) / (1000 * 60 * 60)).toFixed(1))
                        }h
                      </TableCell>
                      <TableCell className="px-6 py-2">
                        <Badge variant="secondary" className="capitalize">
                          {entry.mood?.toLowerCase() || "neutral"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-15 py-2">
                        {entry.sleepcomments ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <FileText className="h-5 w-5 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">{entry.sleepcomments}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="px-15 py-2">
                        {entry.daycomments ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <FileText className="h-5 w-5 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">{entry.daycomments}</p>
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
            onSave={async (data) => {
              await editEntryMutation.mutateAsync(data as Partial<EditEntryFormType> & { id: string });
            }}
          />
        )}
      </div>
    </div>
  );
}

export default Page;
