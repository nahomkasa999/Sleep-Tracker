"use client"
import { useState, useEffect, useCallback } from 'react';
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

// Mood options should match your backend enum
const moodOptions = ['Happy', 'Stressed', 'Neutral', 'Sad', 'Excited', 'Tired'];

// Helper to format ISO string to YYYY-MM-DDTHH:MM for datetime-local input
export const formatDateTimeLocal = (isoString: string | Date | null | undefined): string => {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return ''; // Handle invalid dates

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Helper to format ISO string to YYYY-MM-DD for date input
export const formatDateOnly = (isoString: string | Date | null | undefined): string => {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return ''; // Handle invalid dates
  return date.toISOString().slice(0, 10);
};


// Define the schema for the form data
const editEntrySchema = z.object({
  id: z.string(),
  entryDate: z.string().min(1, "Entry date is required"),
  bedtime: z.string().min(1, "Bedtime is required"),
  wakeUpTime: z.string().min(1, "Wake up time is required"),
  qualityRating: z.number().min(1).max(10, "Quality rating must be between 1 and 10"),
  sleepComments: z.string().nullable().optional(), // Matches backend 'sleepcomments'
  durationHours: z.number().nullable().optional(),
  dayRating: z.number().min(1).max(10, "Day rating must be between 1 and 10"),
  mood: z.enum(['Happy', 'Stressed', 'Neutral', 'Sad', 'Excited', 'Tired']).nullable().optional(),
  dayComments: z.string().nullable().optional(), // Matches backend 'daycomments'
});

export type EditEntryForm = z.infer<typeof editEntrySchema>;

type EditEntryDialogProps = {
  entry: EditEntryForm; // The original entry data passed from the parent
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: Partial<EditEntryForm>) => Promise<void>; // onSave now expects Partial<EditEntryForm>
};

export function EditEntryDialog({ entry, isOpen, onOpenChange, onSave }: EditEntryDialogProps) {
  // Store original entry data for comparison
  const originalEntry = { ...entry };

  const { control, handleSubmit, watch, setValue, reset, formState: { isSubmitting, errors } } = useForm<EditEntryForm>({
    resolver: zodResolver(editEntrySchema),
    defaultValues: {
      ...entry,
      entryDate: formatDateOnly(entry.entryDate), // Format for date input
      bedtime: formatDateTimeLocal(entry.bedtime), // Format for datetime-local
      wakeUpTime: formatDateTimeLocal(entry.wakeUpTime), // Format for datetime-local
      sleepComments: entry.sleepComments ?? '', // Ensure empty string for controlled input
      dayComments: entry.dayComments ?? '', // Ensure empty string for controlled input
      mood: entry.mood ?? 'Neutral', // Default mood if null/undefined
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

  // Reset form when dialog opens or entry changes
  useEffect(() => {
    if (isOpen) {
      reset({
        ...entry,
        entryDate: formatDateOnly(entry.entryDate),
        bedtime: formatDateTimeLocal(entry.bedtime),
        wakeUpTime: formatDateTimeLocal(entry.wakeUpTime),
        sleepComments: entry.sleepComments ?? '',
        dayComments: entry.dayComments ?? '',
        mood: entry.mood ?? 'Neutral',
      });
    }
  }, [isOpen, entry, reset]);


  const onSubmit = async (data: EditEntryForm) => {
    const changedFields: Partial<EditEntryForm> = { id: data.id }; // Always include ID

    // Compare each field to original and add to changedFields if different
    // Special handling for dates as they are converted for input fields
    if (formatDateOnly(originalEntry.entryDate) !== data.entryDate) {
      changedFields.entryDate = new Date(data.entryDate).toISOString();
    }
    if (formatDateTimeLocal(originalEntry.bedtime) !== data.bedtime) {
      changedFields.bedtime = new Date(data.bedtime).toISOString();
    }
    if (formatDateTimeLocal(originalEntry.wakeUpTime) !== data.wakeUpTime) {
      changedFields.wakeUpTime = new Date(data.wakeUpTime).toISOString();
    }

    // Compare other fields directly
    if (originalEntry.qualityRating !== data.qualityRating) {
      changedFields.qualityRating = data.qualityRating;
    }
    // Handle comments: empty string from form should map to null for backend if original was null/undefined
    if ((originalEntry.sleepComments ?? '') !== (data.sleepComments ?? '')) {
      changedFields.sleepComments = data.sleepComments === '' ? null : data.sleepComments;
    }
    if ((originalEntry.dayComments ?? '') !== (data.dayComments ?? '')) {
      changedFields.dayComments = data.dayComments === '' ? null : data.dayComments;
    }

    // DurationHours is calculated, so it should always be sent if bedtime/wakeUpTime changed or if it was manually edited
    // The backend will handle its calculation logic based on bedtime/wakeUpTime if durationHours is not provided
    // For partial update, we only send if it was explicitly changed or if its source (bedtime/wakeUpTime) changed
    if (originalEntry.durationHours !== data.durationHours && data.durationHours !== undefined) {
      changedFields.durationHours = data.durationHours;
    }
    
    if (originalEntry.dayRating !== data.dayRating) {
      changedFields.dayRating = data.dayRating;
    }
    if ((originalEntry.mood ?? 'Neutral') !== (data.mood ?? 'Neutral')) { // Compare with default 'Neutral'
      changedFields.mood = data.mood === 'Neutral' ? null : data.mood; // Send null if set to Neutral, otherwise the mood
    }

    // Remove the 'id' field from the partial update object as it's part of the URL
    const { id, ...payload } = changedFields;
    
    if (Object.keys(payload).length > 0) { // Only send if there are actual changes
      await onSave({ id, ...payload }); // Pass id separately to onSave
    } else {
      onOpenChange(false); // No changes, just close
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {/* Added max-h-screen and overflow-y-auto for responsiveness */}
      <DialogContent className="sm:max-w-[500px] md:max-w-[600px] max-h-screen overflow-y-auto border-2 border-border bg-background text-foreground rounded-lg shadow-xl p-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader className="mb-6">
            <DialogTitle className="text-3xl font-bold text-white">Edit Entry</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Adjust your sleep and well-being details for {new Date(entry.entryDate).toLocaleDateString()}.
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
                    value={field.value} // Value is already formatted by defaultValues/reset
                    className="bg-card text-foreground border-border rounded-md focus:ring-primary focus:border-primary"
                  />
                )}
              />
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
                      value={field.value} // Value is already formatted
                      className="bg-card text-foreground border-border rounded-md focus:ring-primary focus:border-primary"
                    />
                  )}
                />
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
                      value={field.value} // Value is already formatted
                      className="bg-card text-foreground border-border rounded-md focus:ring-primary focus:border-primary"
                    />
                  )}
                />
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
            </div>

            {/* Sleep Comments */}
            <div className="space-y-2">
              <Label htmlFor="sleepComments" className="text-white">Sleep Notes</Label>
              <Controller
                name="sleepComments"
                control={control}
                render={({ field }) => (
                  <Textarea
                    id="sleepComments"
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
                  <Select onValueChange={field.onChange} value={field.value ?? ''}>
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
            </div>

            {/* Day Comments */}
            <div className="space-y-2">
              <Label htmlFor="dayComments" className="text-white">Day Notes</Label>
              <Controller
                name="dayComments"
                control={control}
                render={({ field }) => (
                  <Textarea
                    id="dayComments"
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
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
