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


import { ChartsDataResponse, ChartsDataResponseSchema } from "@/app/lib/insight";
import { z } from "zod"; 
import { AnalyticsLoadingSkeleton } from "@/components/skeleton/AnalyticsLoadingSkeleton";





enum Mood {
  Happy = "Happy",
  Stressed = "Stressed",
  Neutral = "Neutral",
  Sad = "Sad",
  Excited = "Excited",
  Tired = "Tired",
}


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
    color: 'hsl(var(--chart-1))', 
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

export default MoodChart