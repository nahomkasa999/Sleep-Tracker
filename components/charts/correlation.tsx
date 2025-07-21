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

export default CorrelationChart