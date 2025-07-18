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
  return (
    <div className="space-y-5 flex flex-col justify-center p-4">
      <div className="grid gap-0 grid-cols-1">
        <div className="col-span-6">
          <h1 className="font-header text-3xl font-bold text-white ">
            Analytics
          </h1>
          <p className="text-lg font-sans sm:text-base md:text-lg lg:text-xl text-muted-foreground">
            Visualizing your sleep patterns, mood trends, and correlations.
          </p>
        </div>
        {/* <div className="rounded-md flex items-center justify-center h-13 bg-secondary text-center col-span-4 p-0 space-x-3 mt-10">
                <p className="bg-background px-3 py-3 rounded">week</p>
                <p>month</p>
                <p>all</p>
            
        </div> */}
      </div>
      <Alert className="flex flex-col space-y-3 p-4 max-w-sm border-2 border-border">
        <ClockFading />
        <div className="space-y-1">
          <AlertTitle className="font-bold text-white text-lg">
            Correlation Insight
          </AlertTitle>
          <AlertDescription className="text-sm text-foreground sm:text-sm md:text-base lg:text-lg">
            There appears to be a positive correlation between sleep duration and day rating, as longer sleep durations generally coincide with higher day ratings. However, the limited dataset shows inconsistencies, suggesting other factors besides sleep duration significantly influence the day's rating.
          </AlertDescription>
        </div>
      </Alert>

      {/*charts*/}
      {/* sleep Duration */}
      <div className="chart">
    <Card className="border-2 border-border">
      <CardHeader>
        <CardTitle className=" text-3xl text-white">Sleep Duration</CardTitle>
        <CardDescription>Your sleep duration for the last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
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
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  
      </div>
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
            data={chartData}
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
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium text-green-400">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
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
            <Scatter name="Entries" data={entries} fill="var(--chart-1)" />
          </ScatterChart>
        </ChartContainer>
      </CardContent>
    </Card>
    </div>
    </div>
  );
}


export default Page;
