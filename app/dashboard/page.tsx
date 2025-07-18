"use client"
import React,{useState} from "react";
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
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip"
import { Moon, Smile, Star } from "lucide-react";
import { ClockFading, FileText  } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { z } from 'zod';

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

const sortedEntries = [
  {
    id: "e1",
    date: "2024-07-15T08:00:00.000Z",
    sleepDuration: 7.2,
    mood: "happy",
    sleepNotes: "Slept well after a long day.",
    dayNotes: "Productive day at work.",
    dayRating: 8,
  },
  {
    id: "e2",
    date: "2024-07-14T08:00:00.000Z",
    sleepDuration: 6.5,
    mood: "neutral",
    sleepNotes: "",
    dayNotes: "Casual day, mostly relaxed.",
    dayRating: 7,
  },
  {
    id: "e3",
    date: "2024-07-13T08:00:00.000Z",
    sleepDuration: 5.8,
    mood: "sad",
    sleepNotes: "Trouble falling asleep.",
    dayNotes: "Felt a bit down.",
    dayRating: 5,
  },
  {
    id: "e4",
    date: "2024-07-12T08:00:00.000Z",
    sleepDuration: 7.5,
    mood: "happy",
    sleepNotes: "Early night, felt refreshed.",
    dayNotes: "Good vibes all around.",
    dayRating: 9,
  },
  {
    id: "e5",
    date: "2024-07-11T08:00:00.000Z",
    sleepDuration: 6.0,
    mood: "neutral",
    sleepNotes: "",
    dayNotes: "Standard day, nothing special.",
    dayRating: 6,
  },
  {
    id: "e6",
    date: "2024-07-10T08:00:00.000Z",
    sleepDuration: 6.9,
    mood: "stressed",
    sleepNotes: "Woke up multiple times.",
    dayNotes: "Busy with deadlines.",
    dayRating: 4,
  },
  {
    id: "e7",
    date: "2024-07-09T08:00:00.000Z",
    sleepDuration: 7.0,
    mood: "happy",
    sleepNotes: "Consistent sleep.",
    dayNotes: "Weekend trip was fun.",
    dayRating: 8,
  },
  {
    id: "e8",
    date: "2024-07-08T08:00:00.000Z",
    sleepDuration: 6.2,
    mood: "neutral",
    sleepNotes: "",
    dayNotes: "Catching up on chores.",
    dayRating: 6,
  },
];


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

  return (
    <div className="space-y-5 flex flex-col justify-center p-4">
      {/* header */}
      <div>
        <h1 className="font-header text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-lg font-sans sm:text-base md:text-lg lg:text-xl text-muted-foreground">
          An overview of your sleep and wellbeing.
        </p>
      </div>
      {/*Alert*/}
      <Alert className="flex flex-col space-y-3 p-4 max-w-sm border-2 border-border">
        <ClockFading />
        <div className="space-y-1">
          <AlertTitle className="font-medium text-lg">This Week's Insight</AlertTitle>
          <AlertDescription className="text-sm sm:text-sm md:text-base lg:text-lg">
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
            <Card key={metric.title} className={`${
                index === metrics.length - 1 && metrics.length % 2 !== 0
                  ? 'col-span-2 md:col-auto'
                  : ''
              } gap-2 border-2 border-border` }>
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
        <Card className="border-2 border-border">
        <CardHeader>
          <CardTitle className="text-3xl">Recent Entries</CardTitle>
          <CardDescription className="text-md font-sans sm:text-base md:text-lg lg:text-xl text-muted-foreground">
            Click on a row to view and edit an entry.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table >
            <TableHeader className="border-b-3 border-border">
              <TableRow className="font-header">
                <TableHead >Date</TableHead>
                <TableHead className="px-6 py-2">Sleep</TableHead>
                <TableHead className="px-6 py-2">Mood</TableHead>
                <TableHead className="px-6 py-2">Sleep Notes</TableHead>
                <TableHead className="px-6 py-2">Day Notes</TableHead>
                <TableHead className="text-right px-6 py-2">Day Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedEntries.slice(0, 7).map((entry) => (
                <TableRow
                  key={entry.id}
                  onClick={() => setEditingEntry(entry)}
                  className="cursor-pointer, border-b-2 border-border"

                >
                  <TableCell >
                    {new Date(entry.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="px-6 py-2">{entry.sleepDuration.toFixed(1)}h</TableCell>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </div>
    </div>

  );
}

export default Page;
