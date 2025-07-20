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

const moodOptions = ['Happy', 'Stressed', 'Neutral', 'Sad', 'Excited', 'Tired'];

const editEntrySchema = z.object({
  id: z.string(),
  entryDate: z.string(), // ISO string
  bedtime: z.string(), // ISO string
  wakeUpTime: z.string(), // ISO string
  qualityRating: z.number().min(1).max(10),
  sleepComments: z.string().nullable().optional(),
  durationHours: z.number().optional(),
  dayRating: z.number().min(1).max(10),
  mood: z.string().nullable().optional(),
  dayComments: z.string().nullable().optional(),
});

type EditEntryForm = z.infer<typeof editEntrySchema>;

type EditEntryDialogProps = {
  entry: EditEntryForm;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: EditEntryForm) => Promise<void>;
};

export function EditEntryDialog({ entry, isOpen, onOpenChange, onSave }: EditEntryDialogProps) {
  const { control, handleSubmit, watch, setValue } = useForm<EditEntryForm>({
    resolver: zodResolver(editEntrySchema),
    defaultValues: {
      ...entry,
      sleepComments: entry.sleepComments ?? '',
      dayComments: entry.dayComments ?? '',
    },
  });

  const watchedBedtime = watch('bedtime');
  const watchedWakeUpTime = watch('wakeUpTime');
  const watchedDayRating = watch('dayRating');
  const watchedDuration = watch('durationHours');

  // Calculate duration on time change
  useEffect(() => {
    if (watchedBedtime && watchedWakeUpTime) {
      const bed = new Date(watchedBedtime);
      const wake = new Date(watchedWakeUpTime);
      let diff = (wake.getTime() - bed.getTime()) / (1000 * 60 * 60);
      if (diff < 0) diff += 24;
      setValue('durationHours', parseFloat(diff.toFixed(2)));
    }
  }, [watchedBedtime, watchedWakeUpTime, setValue]);

  const onSubmit = async (data: EditEntryForm) => {
    await onSave(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] border-2 border-border">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Edit Entry</DialogTitle>
            <DialogDescription>
              Make changes to your entry for {new Date(entry.entryDate).toLocaleDateString()}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="entryDate">Date</Label>
              <Controller
                name="entryDate"
                control={control}
                render={({ field }) => (
                  <Input id="entryDate" type="date" {...field} value={field.value?.slice(0, 10) ?? ''} />
                )}
              />
            </div>
            {/* Bedtime & WakeUpTime */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bedtime">Went to Sleep</Label>
                <Controller
                  name="bedtime"
                  control={control}
                  render={({ field }) => (
                    <Input id="bedtime" type="datetime-local" {...field} />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wakeUpTime">Woke Up</Label>
                <Controller
                  name="wakeUpTime"
                  control={control}
                  render={({ field }) => (
                    <Input id="wakeUpTime" type="datetime-local" {...field} />
                  )}
                />
              </div>
            </div>
            {/* Sleep Duration */}
            <div className="text-sm text-muted-foreground">
              Calculated Sleep Duration: {watchedDuration ? watchedDuration.toFixed(2) : '--'} hours
            </div>
            {/* Sleep Quality */}
            <div className="space-y-2">
              <Label>Sleep Quality</Label>
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
                  />
                )}
              />
            </div>
            {/* Sleep Comments */}
            <div className="space-y-2">
              <Label>Sleep Notes</Label>
              <Controller
                name="sleepComments"
                control={control}
                render={({ field }) => (
                  <Textarea {...field} value={field.value ?? ""} placeholder="How was your sleep?" />
                )}
              />
            </div>
            {/* Mood */}
            <div className="space-y-2 w-full">
              <Label>Mood</Label>
              <Controller
                name="mood"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value ?? ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your mood" />
                    </SelectTrigger>
                    <SelectContent className='w-full'>
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
              <div className="flex justify-between">
                <Label>Day Rating</Label>
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
                  />
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
                  <Textarea {...field} value={field.value ?? ""} placeholder="Any thoughts or events to note?" />
                )}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
