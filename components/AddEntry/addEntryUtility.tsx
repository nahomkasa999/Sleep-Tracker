"use client";

import React, { useEffect, useContext, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { usePopupContext } from "@/context/PopUpContext"; // Assuming this is your correct context hook

// --- Schema Definitions (from your current code) ---
enum Mood {
  Happy = "Happy",
  Stressed = "Stressed",
  Neutral = "Neutral",
  Sad = "Sad",
  Excited = "Excited",
  Tired = "Tired",
}

const TakingEntry = z.object({
  // --- Sleep Data ---
  bedtime: z.string().datetime().optional(), // Expects full ISO datetime string
  wakeUpTime: z.string().datetime().optional(), // Expects full ISO datetime string
  qualityRating: z.number().int().min(1).max(10).optional(),
  comments: z.string().nullable().optional(), // Sleep comments
  durationHours: z.number().optional(), // This will be calculated and set by JS

  // --- Wellbeing Data ---
  entryDate: z.string().datetime(), // Expects full ISO datetime string
  dayRating: z.number().int().min(1).max(10),
  mood: z.nativeEnum(Mood).nullable().optional(),
  dayComments: z.string().nullable().optional(), // Day comments
});

type TakingEntrytype = z.infer<typeof TakingEntry>;

// --- Helper to get current date/time in YYYY-MM-DDTHH:MM format ---
// This format is suitable for HTML <input type="datetime-local">
// and can be directly used as a z.string().datetime() value.
function getLocalDateTimeString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Helper to get current date in YYYY-MM-DD format (for date input)
function getLocalDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to get current time in HH:MM format (for time input if you decide to use them separately)
function getLocalTimeString() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}


// --- Main Component ---
function AddEntry() {
  const { isOpen, setIsOpen } = usePopupContext(); 
  const router = useRouter(); 
  const getTodayDate = () => {
    const now = new Date();
    return now.toISOString().slice(0, 10); 
  };
  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  };
  const getTimePlusHours = (hours: number) => {
    const now = new Date();
    now.setHours(now.getHours() + hours);
    return now.toTimeString().slice(0, 5); // HH:MM
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TakingEntrytype>({
    resolver: zodResolver(TakingEntry),
    defaultValues: {
      entryDate: getTodayDate(),
      bedtime: getCurrentTime(),
      wakeUpTime: getTimePlusHours(8),
      dayRating: 5,
      qualityRating: 5,
      mood: Mood.Neutral,
    },
  });

  
  const watchedBedtime = watch('bedtime');
  const watchedWakeUpTime = watch('wakeUpTime');
  const watchedDayRating = watch('dayRating'); 
  const watchedSleepDuration = watch('durationHours'); 
  const [displayDuration, setDisplayDuration] = useState('8 hour and 0 min');

  useEffect(() => {
    if (watchedBedtime && watchedWakeUpTime) {
      const [bedHour, bedMin] = watchedBedtime.split(':').map(Number);
      const [wakeHour, wakeMin] = watchedWakeUpTime.split(':').map(Number);

      let bed = new Date();
      bed.setHours(bedHour, bedMin, 0, 0);
      let wake = new Date();
      wake.setHours(wakeHour, wakeMin, 0, 0);

      if (wake <= bed) {
        wake.setDate(wake.getDate() + 1);
      }

      const diffMs = wake.getTime() - bed.getTime();
      const totalMinutes = Math.round(diffMs / (1000 * 60));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      setValue('durationHours', totalMinutes / 60); // keep for backend
      setDisplayDuration(`${hours} hour${hours !== 1 ? 's' : ''} and ${minutes} min${minutes !== 1 ? 's' : ''}`);
    } else {
      setValue('durationHours', 8);
      setDisplayDuration('8 hour and 0 min');
    }
  }, [watchedBedtime, watchedWakeUpTime, setValue]);

  const onSubmit: SubmitHandler<TakingEntrytype> = async (data) => {
    try {
     
      const sleepDataToSubmit = {
        bedtime: data.bedtime,
        wakeUpTime: data.wakeUpTime,
        qualityRating: data.qualityRating,
        comments: data.comments, 
        durationHours: data.durationHours,
      };

      const filteredSleepData = Object.fromEntries(
        Object.entries(sleepDataToSubmit).filter(([, value]) => value !== undefined && value !== null && value !== '')
      );

    
      const wellbeingDataToSubmit = {   
        entryDate: data.entryDate,
        dayRating: data.dayRating,
        mood: data.mood,
        comments: data.dayComments,
      };

      const filteredWellbeingData = Object.fromEntries(
        Object.entries(wellbeingDataToSubmit).filter(([, value]) => value !== undefined && value !== null && value !== '')
      );

   
      if (filteredSleepData.bedtime && filteredSleepData.wakeUpTime && filteredSleepData.qualityRating) {
        
        const sleepResponse = await fetch("/api/sleep", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(filteredSleepData),
        });

        if (!sleepResponse.ok) {
          const errorData = await sleepResponse.json();
          throw new Error(errorData.message || "Failed to create sleep entry.");
        }
        
      } else {
        throw new Error("Skipping sleep entry creation. Bedtime, Wake Up Time, and Sleep Quality are required for sleep entry.");
      }

   
      
      const wellbeingResponse = await fetch("/api/wellbeing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filteredWellbeingData),
      });

      if (!wellbeingResponse.ok) {
        const errorData = await wellbeingResponse.json();
        throw new Error(errorData.message || "Failed to create wellbeing entry.");
      }
    

      setIsOpen(false);
      reset();
      router.refresh(); // Refresh data on dashboard if needed

    } catch (error: any) {
      console.error("Error creating entry:", error.message);
      errors.root = { message: error.message || "An unexpected error occurred." };
    }
  };

  const moodOptions = Object.values(Mood);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] border-2 border-border">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>New Entry</DialogTitle>
            <DialogDescription>
              Log your sleep, mood, and how your day went.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="entryDate">Date</Label>
              <Controller
                name="entryDate"
                control={control}
                render={({ field }) => (
                  <Input
                    id="entryDate"
                    type="date"
                    {...field}
                    value={field.value?.slice(0, 10) ?? ""}
                  />
                )}
              />
              {errors.entryDate && (
                <p className="text-sm text-destructive">{errors.entryDate.message}</p>
              )}
            </div>
            {/* Bedtime & WakeUpTime */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bedtime">Went to Sleep</Label>
                <Controller
                  name="bedtime"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="bedtime"
                      type="time"
                      {...field}
                      value={field.value ?? ""}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wakeUpTime">Woke Up</Label>
                <Controller
                  name="wakeUpTime"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="wakeUpTime"
                      type="time"
                      {...field}
                      value={field.value ?? ""}
                    />
                  )}
                />
              </div>
            </div>
            {/* Sleep Duration */}
            <div className="text-sm text-muted-foreground">
              Calculated Sleep Duration: {displayDuration}
            </div>
            {/* Mood */}
            <div className="space-y-2">
              <Label>Mood</Label>
              <Controller
                name="mood"
                control={control}
                render={({ field }) => (
                  <div className="w-full">
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? Mood.Neutral}
                    >
                      <SelectTrigger className="w-full border-2 border-border">
                        <SelectValue placeholder="Select your mood" />
                      </SelectTrigger>
                      <SelectContent className="border-2 border-border">
                        {moodOptions.map((mood) => (
                          <SelectItem key={mood} value={mood} className="capitalize">
                            {mood.toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />
              {errors.mood && (
                <p className="text-sm text-destructive">{errors.mood.message}</p>
              )}
            </div>
            {/* Day Rating */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Day Rating</Label>
                <span className="text-sm text-muted-foreground">{watchedDayRating}/10</span>
              </div>
              <Controller
                name="dayRating"
                control={control}
                render={({ field }) => (
                  <Slider
                    value={[field.value ?? 5]}
                    onValueChange={(value) => field.onChange(value[0])}
                    min={1}
                    max={10}
                    step={1}
                  />
                )}
              />
            </div>
            {/* Sleep Comments */}
            <div className="space-y-2">
              <Label>Sleep Notes</Label>
              <Controller
                name="comments"
                control={control}
                render={({ field }) => (
                  <Textarea {...field} value={field.value ?? ""} placeholder="How was your sleep? Any dreams or disturbances?" />
                )}
              />
            </div>
            {/* Day Comments */}
            <div className="space-y-2">
              <Label>Day Notes</Label>
              <Controller
                name="dayComments"
                control={control}
                render={({ field }) => (
                  <Textarea {...field} value={field.value ?? ""} placeholder="Any thoughts, feelings, or events from the day to note?" />
                )}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Entry</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddEntry