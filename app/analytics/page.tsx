"use client"
import React from "react";
import { ClockFading, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TrendingUp } from "lucide-react"
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

export const description = "A bar chart"

const chartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig
const entries = [
  { sleepDuration: 5, dayRating: 3 },
  { sleepDuration: 6, dayRating: 5 },
  { sleepDuration: 6.5, dayRating: 6 },
  { sleepDuration: 7, dayRating: 8 },
  { sleepDuration: 7.5, dayRating: 9 },
  { sleepDuration: 8, dayRating: 8.5 },
  { sleepDuration: 8.5, dayRating: 7 },
  { sleepDuration: 9, dayRating: 6 },
  { sleepDuration: 5.5, dayRating: 4 },
  { sleepDuration: 6.8, dayRating: 7.5 },
  { sleepDuration: 7.2, dayRating: 9.5 },
  { sleepDuration: 7.8, dayRating: 8 },
  { sleepDuration: 9.2, dayRating: 5 },
  { sleepDuration: 4.5, dayRating: 2 },
  { sleepDuration: 8.2, dayRating: 7.8 },
  { sleepDuration: 6.2, dayRating: 6.5 },
  { sleepDuration: 7.1, dayRating: 8.8 },
  { sleepDuration: 5.8, dayRating: 4.5 },
  { sleepDuration: 8.8, dayRating: 6.8 },
  { sleepDuration: 7.4, dayRating: 9.2 },
];
function Page() {
  // Add state for period selection
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('week');

  // Example data for each period (replace with real data fetching as needed)
  const chartDataWeek = chartData;
  const chartDataMonth = chartData.map((d) => ({ ...d, desktop: d.desktop + 50 }));
  const chartDataAll = chartData.map((d) => ({ ...d, desktop: d.desktop + 100 }));

  const entriesWeek = entries;
  const entriesMonth = entries.map((e) => ({ ...e, sleepDuration: e.sleepDuration + 0.5 }));
  const entriesAll = entries.map((e) => ({ ...e, sleepDuration: e.sleepDuration + 1 }));

  let chartDataToShow = chartDataWeek;
  let entriesToShow = entriesWeek;
  let insightText = "There appears to be a positive correlation between sleep duration and day rating, as longer sleep durations generally coincide with higher day ratings. However, the limited dataset shows inconsistencies, suggesting other factors besides sleep duration significantly influence the day's rating.";

  if (period === 'month') {
    chartDataToShow = chartDataMonth;
    entriesToShow = entriesMonth;
    insightText = "Over the past month, the correlation between sleep duration and day rating is more pronounced, with longer sleep generally leading to better days. Still, some outliers exist, indicating other factors at play.";
  } else if (period === 'all') {
    chartDataToShow = chartDataAll;
    entriesToShow = entriesAll;
    insightText = "Looking at all your data, the overall trend shows that more sleep is often associated with higher day ratings, but the relationship is not perfect. Life's complexity means many factors affect your day.";
  }

  return (
    <div className="space-y-5 flex flex-col justify-center p-4">
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
          <AlertTitle className="font-bold text-white text-base md:text-lg">
            Correlation Insight
          </AlertTitle>
          <AlertDescription className="text-xs md:text-sm lg:text-md text-foreground">
            {insightText}
          </AlertDescription>
        </div>
      </Alert>
      {/* Responsive grid for charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sleep Duration */}
        <div>
          <Card className="border-2 border-border">
            <CardHeader>
              <CardTitle className=" text-3xl text-white">Sleep Duration</CardTitle>
              <CardDescription>Your sleep duration for the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <BarChart accessibilityLayer data={chartDataToShow}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar dataKey="desktop" fill="var(--color-desktop)" radius={8} />
                </BarChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm" />
          </Card>
        </div>
        {/* Mood Trend */}
        <div>
          <Card className="border-2 border-border">
            <CardHeader>
              <CardTitle className=" text-3xl text-white">Mood Trend</CardTitle>
              <CardDescription>Your mood rating for the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <LineChart
                  accessibilityLayer
                  data={chartDataToShow}
                  margin={{
                    left: 12,
                    right: 12,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Line
                    dataKey="desktop"
                    type="natural"
                    stroke="var(--color-desktop)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm" />
          </Card>
        </div>
      </div>
      <div>
        <Card className="border-2 border-border">
          <CardHeader>
            <CardTitle>Sleep & Day Rating Correlation</CardTitle>
            <CardDescription>
              Does more sleep lead to a better day?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
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
                <Scatter name="Entries" data={entriesToShow} fill="var(--chart-1)" />
              </ScatterChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


export default Page;
