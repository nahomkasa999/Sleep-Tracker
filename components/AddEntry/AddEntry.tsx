"use client"
import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDateTimeLocal, formatDateOnly } from '@/components/EditEntries/EditEntries'; // Reusing helpers

const moodOptions = ['Happy', 'Stressed', 'Neutral', 'Sad', 'Excited', 'Tired'];

// Schema for creating a new entry (all required fields as per backend POST /sleep)
const createEntrySchema = z.object({
  bedtime: z.string().min(1, "Bedtime is required"),
  wakeUpTime: z.string().min(1, "Wake up time is required"),
  qualityRating: z.number().min(1).max(10, "Sleep quality must be between 1 and 10"),
  sleepcomments: z.string().nullable().optional(),
  durationHours: z.number().nullable().optional(), // Will be calculated
  entryDate: z.string().min(1, "Entry date is required"),
  dayRating: z.number().min(1).max(10, "Day rating must be between 1 and 10"),
  mood: z.enum(['Happy', 'Stressed', 'Neutral', 'Sad', 'Excited', 'Tired']).nullable().optional(),
  daycomments: z.string().nullable().optional(),
});

export type CreateEntryForm = z.infer<typeof createEntrySchema>;

type CreateEntryDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: CreateEntryForm) => Promise<void>;
};

export function CreateEntryDialog({ isOpen, onOpenChange, onSave }: CreateEntryDialogProps) {
  const { control, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<CreateEntryForm>({
    resolver: zodResolver(createEntrySchema),
    defaultValues: {
      entryDate: formatDateOnly(new Date()), // Default to today's date
      bedtime: formatDateTimeLocal(new Date()), // Default to current time
      wakeUpTime: formatDateTimeLocal(new Date()), // Default to current time
      qualityRating: 5,
      sleepcomments: '',
      durationHours: 0,
      dayRating: 5,
      mood: 'Neutral',
      daycomments: '',
    },
  });

  const watchedBedtime = watch('bedtime');
  const watchedWakeUpTime = watch('wakeUpTime');
  const watchedDayRating = watch('dayRating');
  const watchedQualityRating = watch('qualityRating');
  const watchedDuration = watch('durationHours');

  // Calculate duration on time change
  useEffect(() => {
    if (watchedBedtime && watchedWakeUpTime) {
      const bed = new Date(watchedBedtime);
      const wake = new Date(watchedWakeUpTime);
      let diffMs = wake.getTime() - bed.getTime();
      if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000; // Add 24 hours if wakeUpTime is on next day
      setValue('durationHours', parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2)));
    }
  }, [watchedBedtime, watchedWakeUpTime, setValue]);

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      reset({
        entryDate: formatDateOnly(new Date()),
        bedtime: formatDateTimeLocal(new Date()),
        wakeUpTime: formatDateTimeLocal(new Date()),
        qualityRating: 5,
        sleepcomments: 'Normal',
        durationHours: 6,
        dayRating: 5,
        mood: 'Neutral',
        daycomments: 'Normal',
      });
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: CreateEntryForm) => {
    // Ensure mood is always a valid value (never null)
    const moodValue = data.mood && data.mood !== 'Neutral' ? data.mood : 'Neutral';
    // Convert date strings back to ISO format for backend
    const payload = {
      ...data,
      bedtime: new Date(data.bedtime).toISOString(),
      wakeUpTime: new Date(data.wakeUpTime).toISOString(),
      entryDate: new Date(data.entryDate).toISOString(),
      sleepcomments: data.sleepcomments === '' ? undefined : data.sleepcomments,
      daycomments: data.daycomments === '' ? undefined : data.daycomments,
      mood: moodValue as CreateEntryForm['mood'],
    };
    await onSave(payload);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {/* Added max-h-screen and overflow-y-auto for responsiveness */}
      <DialogContent className="sm:max-w-[500px] md:max-w-[600px] max-h-screen overflow-y-auto border-2 border-border bg-background text-foreground rounded-lg shadow-xl p-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader className="mb-6">
            <DialogTitle className="text-3xl font-bold text-white">New Entry</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Add your daily sleep and well-being details.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="entryDate" className="text-white">Date</Label>
              <Controller
                name="entryDate"
                control={control}
                render={({ field }) => (
                  <Input
                    id="entryDate"
                    type="date"
                    {...field}
                    value={field.value}
                    className="bg-card text-foreground border-border rounded-md focus:ring-primary focus:border-primary"
                  />
                )}
              />
              {errors.entryDate && <p className="text-red-500 text-sm">{errors.entryDate.message}</p>}
            </div>

            {/* Bedtime & WakeUpTime */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bedtime" className="text-white">Went to Sleep</Label>
                <Controller
                  name="bedtime"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="bedtime"
                      type="datetime-local"
                      {...field}
                      value={field.value}
                      className="bg-card text-foreground border-border rounded-md focus:ring-primary focus:border-primary"
                    />
                  )}
                />
                {errors.bedtime && <p className="text-red-500 text-sm">{errors.bedtime.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="wakeUpTime" className="text-white">Woke Up</Label>
                <Controller
                  name="wakeUpTime"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="wakeUpTime"
                      type="datetime-local"
                      {...field}
                      value={field.value}
                      className="bg-card text-foreground border-border rounded-md focus:ring-primary focus:border-primary"
                    />
                  )}
                />
                {errors.wakeUpTime && <p className="text-red-500 text-sm">{errors.wakeUpTime.message}</p>}
              </div>
            </div>

            {/* Sleep Duration */}
            <div className="flex items-center justify-between text-sm text-muted-foreground bg-card p-3 rounded-md border border-border">
              <Label className="text-white">Calculated Sleep Duration:</Label>
              <span className="font-semibold text-primary">{watchedDuration ? watchedDuration.toFixed(2) : '--'} hours</span>
            </div>

            {/* Sleep Quality */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-white">Sleep Quality</Label>
                <span className="text-sm text-muted-foreground">{watchedQualityRating}/10</span>
              </div>
              <Controller
                name="qualityRating"
                control={control}
                render={({ field }) => (
                  <Slider
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                )}
              />
              {errors.qualityRating && <p className="text-red-500 text-sm">{errors.qualityRating.message}</p>}
            </div>

            {/* Sleep Comments */}
            <div className="space-y-2">
              <Label htmlFor="sleepcomments" className="text-white">Sleep Notes</Label>
              <Controller
                name="sleepcomments"
                control={control}
                render={({ field }) => (
                  <Textarea
                    id="sleepcomments"
                    {...field}
                    value={field.value ?? ""}
                    placeholder="How was your sleep?"
                    className="bg-card text-foreground border-border rounded-md focus:ring-primary focus:border-primary min-h-[80px]"
                  />
                )}
              />
            </div>

            {/* Mood */}
            <div className="space-y-2 w-full">
              <Label htmlFor="mood" className="text-white">Mood</Label>
              <Controller
                name="mood"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value ?? 'Neutral'}>
                    <SelectTrigger className="w-full bg-card text-foreground border-border rounded-md focus:ring-primary focus:border-primary">
                      <SelectValue placeholder="Select your mood" />
                    </SelectTrigger>
                    <SelectContent className='w-full bg-card text-foreground border-border rounded-md'>
                      {moodOptions.map((mood) => (
                        <SelectItem key={mood} value={mood} className="capitalize">
                          {mood}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Day Rating */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-white">Day Rating</Label>
                <span className="text-sm text-muted-foreground">{watchedDayRating}/10</span>
              </div>
              <Controller
                name="dayRating"
                control={control}
                render={({ field }) => (
                  <Slider
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                )}
              />
              {errors.dayRating && <p className="text-red-500 text-sm">{errors.dayRating.message}</p>}
            </div>

            {/* Day Comments */}
            <div className="space-y-2">
              <Label htmlFor="daycomments" className="text-white">Day Notes</Label>
              <Controller
                name="daycomments"
                control={control}
                render={({ field }) => (
                  <Textarea
                    id="daycomments"
                    {...field}
                    value={field.value ?? ""}
                    placeholder="Any thoughts or events to note?"
                    className="bg-card text-foreground border-border rounded-md focus:ring-primary focus:border-primary min-h-[80px]"
                  />
                )}
              />
            </div>
          </div>

          <DialogFooter className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-foreground hover:bg-accent">Cancel</Button>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
