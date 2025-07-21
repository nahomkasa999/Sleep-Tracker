"use client"
import React from "react";
import { ClockFading, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSession } from "@/app/lib/auth-client";
import { useState } from "react";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { ChartsDataResponse  } from "@/app/lib/insight";
import { AnalyticsLoadingSkeleton } from "@/components/skeleton/AnalyticsLoadingSkeleton";
import CorrelationChart from "@/components/charts/correlation";
import MoodChart from "@/components/charts/mood";
import SleepChart from "@/components/charts/sleep";


function Page() {
  const queryClient = useQueryClient();
  const addEntryMutation = useMutation({
    mutationFn: async (newEntry: { date: string; sleepDuration: number }) => {
      const response = await fetch('/api/sleep', {
        method: 'POST',
        body: JSON.stringify(newEntry),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to add entry');
      return response.json();
    },
    onMutate: async (newEntry) => {
      await queryClient.cancelQueries({ queryKey: ['allChartsData'] });
      const previousData = queryClient.getQueryData(['allChartsData', period]);
      queryClient.setQueryData(['allChartsData', period], (old: ChartsDataResponse | undefined) => {
        if (!old) return old;
        return {
          ...old,
          sleepDurationChartData: [
            ...old.sleepDurationChartData,
            { date: newEntry.date, sleepDuration: newEntry.sleepDuration }
          ],
        };
      });
      return { previousData };
    },
    onError: (err, newEntry, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['allChartsData', period], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['allChartsData', period] });
    }
  });

  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('week');

  
  const { data: chartsData, isLoading, isError, error } = useQuery<ChartsDataResponse>({
    queryKey: ['allChartsData', period],
    queryFn: async () => {
      const params = new URLSearchParams({ period });
      const response = await fetch(`/api/insights/chartsdata?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch charts data');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, 
    refetchOnWindowFocus: false,
    
  });

  if (isError) {
    return (
      <div className="p-4 text-red-500 text-center">
        Error loading insights: {error?.message}
      </div>
    );
  }


  const {
    moodChartData = [],
    sleepDurationChartData = [],
    correlationChartData = [],
    aiCorrelationInsight = "Loading correlation insight...",
  } = chartsData || {};
  
  if(isLoading){
    return <AnalyticsLoadingSkeleton/>
  }

  return (
    <div className="space-y-5 flex flex-col justify-center p-4 relative min-h-screen"> {/* Added relative and min-h-screen */}
      {/* Removed the Add Sleep Entry (Optimistic Demo) button */}
      <div className="grid gap-0 grid-cols-1">
        <div className="col-span-6 flex items-center justify-between">
          <div>
            <h1 className="font-header text-4xl font-bold text-foreground ">
              Analytics
            </h1>
            <p className="text-xs font-sans sm:text-base md:text-lg lg:text-md text-muted-foreground">
              Visualizing your sleep patterns, mood trends, and correlations.
            </p>
          </div>
          {/* Period Switcher */}
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded border text-xs md:text-sm font-medium transition-colors ${period === 'week' ? 'bg-primary text-white border-primary' : 'bg-background text-foreground border-border hover:bg-accent'}`}
              onClick={() => setPeriod('week')}
            >
              Weekly
            </button>
            <button
              className={`px-4 py-2 rounded border text-xs md:text-sm font-medium transition-colors ${period === 'month' ? 'bg-primary text-white border-primary' : 'bg-background text-foreground border-border hover:bg-accent'}`}
              onClick={() => setPeriod('month')}
            >
              Monthly
            </button>
            <button
              className={`px-4 py-2 rounded border text-xs md:text-sm font-medium transition-colors ${period === 'all' ? 'bg-primary text-white border-primary' : 'bg-background text-foreground border-border hover:bg-accent'}`}
              onClick={() => setPeriod('all')}
            >
              All Time
            </button>
          </div>
        </div>
      </div>
      <Alert className="flex flex-col space-y-3 p-4 w-full border-2 border-border text-xs md:text-sm lg:text-base">
        <ClockFading />
        <div className="space-y-1">
          <AlertTitle className="font-bold text-foreground text-base md:text-lg">
            Correlation Insight
          </AlertTitle>
          <AlertDescription className="text-2xs md:text-sm lg:text-md text-foreground">
            {aiCorrelationInsight}
          </AlertDescription>
        </div>
      </Alert>
 
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <SleepChart entries={sleepDurationChartData} />
        
        <MoodChart entries={moodChartData} />
      </div>
      <div>
        <CorrelationChart entries={correlationChartData} />
      </div>
    </div>
  );
}


export default Page;
