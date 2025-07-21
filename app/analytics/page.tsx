"use client"
import React from "react";
import { ClockFading, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TrendingUp } from "lucide-react"
import { useSession } from "@/app/lib/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Scatter, ScatterChart, Bar, BarChart, CartesianGrid, XAxis, Line, LineChart, YAxis,ZAxis } from 'recharts';
import { useState } from "react";
import { useQuery, QueryClient, useQueryClient } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

// Import the new ChartsDataResponse type
import { ChartsDataResponse, ChartsDataResponseSchema } from "@/app/lib/insight"; // Adjust path as needed
import { z } from "zod"; // Import z for z.infer
import { AnalyticsLoadingSkeleton } from "@/components/skeleton/AnalyticsLoadingSkeleton";
import { redirect } from "next/navigation";

// Define Mood enum if not already globally available or imported
enum Mood {
  Happy = "Happy",
  Stressed = "Stressed",
  Neutral = "Neutral",
  Sad = "Sad",
  Excited = "Excited",
  Tired = "Tired",
}

// MoodChart Component
type MoodChartProps = {
  entries: z.infer<typeof ChartsDataResponseSchema>['moodChartData'];
};

const moodToValue = {
    'Happy': 5,
    'Excited': 4,
    'Neutral': 3,
    'Tired': 2,
    'Stressed': 2,
    'Sad': 1,
}

const moodChartConfig = {
  mood: {
    label: 'Mood',
    color: 'hsl(var(--chart-1))', // Aligned with primary button color
  },
} satisfies ChartConfig;

const MoodChart = ({ entries }: MoodChartProps) => {
  return (
    <Card className="border-2 border-border">
      <CardHeader>
        <CardTitle className="text-3xl text-foreground">Mood Trend</CardTitle>
        <CardDescription>Your mood rating for the last 7 days.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={moodChartConfig} className="h-[250px] w-full">
          <LineChart data={entries}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              
            />
            <YAxis
                domain={[1,5]}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => Object.keys(moodToValue).find(key => moodToValue[key as keyof typeof moodToValue] === value) || ''}
            />
            <ChartTooltip content={<ChartTooltipContent formatter={(value, name, props) => [`${props.payload.mood} (${value})`, 'Mood']} />} />
            <Line
              dataKey="moodValue"
              type="monotone"
              stroke="var(--color-primary)" 
              strokeWidth={2}
              dot={true}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

// SleepChart Component
type SleepChartProps = {
  entries: z.infer<typeof ChartsDataResponseSchema>['sleepDurationChartData'];
};

const sleepChartConfig = {
  sleep: {
    label: 'Sleep (hours)',
    color: 'hsl(var(--chart-1))', // Aligned with primary button color
  },
} satisfies ChartConfig;

const SleepChart = ({ entries }: SleepChartProps) => {
  return (
    <Card className="border-2 border-border">
      <CardHeader>
        <CardTitle className="text-3xl text-foreground">Sleep Duration</CardTitle>
        <CardDescription>Your sleep durations.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={sleepChartConfig} className="h-[250px] w-full">
          <BarChart data={entries}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              // Removed tickFormatter as backend provides formatted date
            />
            <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                unit="h"
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="sleepDuration" fill="var(--color-primary)" radius={4} /> {/* Changed to match primary button color */}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

// CorrelationChart Component
type CorrelationChartProps = {
  entries: z.infer<typeof ChartsDataResponseSchema>['correlationChartData'];
};

const correlationChartConfig = {
  correlation: {
    label: 'Correlation',
    color: 'hsl(var(--chart-1))', // Aligned with primary button color
  },
} satisfies ChartConfig;


const CorrelationChart = ({ entries }: CorrelationChartProps) => {


  return (
    <Card className="border-2 border-border">
      <CardHeader>
        <CardTitle className="text-3xl text-foreground">Sleep & Day Rating Correlation</CardTitle>
        <CardDescription>
          Does more sleep lead to a better day?
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={correlationChartConfig} className="h-[300px] w-full">
          <ScatterChart
             margin={{
              top: 20,
              right: 20,
              bottom: 20,
              left: 20,
            }}
          >
            <CartesianGrid />
            <XAxis
                type="number"
                dataKey="sleepDuration"
                name="Sleep"
                unit="h"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
            />
            <YAxis
                type="number"
                dataKey="dayRating"
                name="Day Rating"
                unit="/10"
                domain={[1,10]}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
            />
            <ZAxis type="number" range={[100]} />
            <ChartTooltip cursor={{ strokeDasharray: '3 3' }} content={<ChartTooltipContent />} />
            <Scatter name="Entries" data={entries} fill="var(--color-primary)" /> {/* Changed to match primary button color */}
          </ScatterChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};


function Page() {
  const { data: session, isPending } = useSession();
  const queryClient = useQueryClient();

  // Example optimistic mutation for adding a sleep entry
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

  // Use React Query cache for instant navigation and offline support
  // Only fetch once unless data is stale (5 min), cache stays for 30 min
  // No refetch on window focus
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

  // Destructure data for easier access, providing empty arrays as fallbacks
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
