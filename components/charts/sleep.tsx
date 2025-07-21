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
import { ChartsDataResponse, ChartsDataResponseSchema } from "@/app/lib/insight";
import { z } from "zod"; 


type SleepChartProps = {
  entries: z.infer<typeof ChartsDataResponseSchema>['sleepDurationChartData'];
};

const sleepChartConfig = {
  sleep: {
    label: 'Sleep (hours)',
    color: 'hsl(var(--chart-1))', 
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
             
            />
            <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                unit="h"
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="sleepDuration" fill="var(--color-primary)" radius={4} /> 
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default SleepChart