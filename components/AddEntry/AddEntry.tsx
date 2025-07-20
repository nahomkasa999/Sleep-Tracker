"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler, Controller } from "react-hook-form"; // Added Controller
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Added Input
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Added Textarea
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Added Select components
import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  TypeOfDataFromFrontEnd,
  SingleSleepRouteEntry,
  CreateSleepEntryInput,
} from "@/app/lib/wellbeing"; // Assuming these types are correctly defined in your files

import { useSession } from "@/app/lib/auth-client";

// Define Mood enum if not already globally available or imported
enum Mood {
  Happy = "Happy",
  Stressed = "Stressed",
  Neutral = "Neutral",
  Sad = "Sad",
  Excited = "Excited",
  Tired = "Tired",
}

// Zod schema for form validation
const formSchema = z.object({
  bedtime: z.string().min(1, 'Bedtime is required'),
  wakeUpTime: z.string().min(1, 'Wake up time is required'),
  qualityRating: z.coerce.number().min(1, 'Quality rating must be at least 1').max(10, 'Quality rating cannot exceed 10'),
  sleepComments: z.string().optional(),
  entryDate: z.string().min(1, 'Entry date is required'),
  dayRating: z.coerce.number().min(1, 'Day rating must be at least 1').max(10, 'Day rating cannot exceed 10'),
  mood: z.nativeEnum(Mood, {
    errorMap: () => ({ message: 'Please select a valid mood' }),
  }),
  dayComments: z.string().optional(),
});

type FormInputs = z.infer<typeof formSchema>;

function AddEntry() {
  const queryClient = useQueryClient();
  const { data: session, isPending } = useSession();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control, // Added control for Controller
  } = useForm<FormInputs>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // Set default values for date/time fields to current for convenience
      // Format for datetime-local: YYYY-MM-DDTHH:MM
      bedtime: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString().substring(0, 16),
      wakeUpTime: new Date().toISOString().substring(0, 16),
      // Format for date: YYYY-MM-DD
      entryDate: new Date().toISOString().substring(0, 10),
      qualityRating: 7,
      dayRating: 7,
      mood: Mood.Neutral,
      sleepComments: '',
      dayComments: '',
    },
  });

  // Mutation for creating a Sleep Entry
  const createSleepMutation = useMutation<
    SingleSleepRouteEntry,
    Error,
    CreateSleepEntryInput
  >({
    mutationFn: async (newSleepEntryData: CreateSleepEntryInput) => {
      console.log('Sending sleep data:', newSleepEntryData);
      const response = await fetch('/api/sleep', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSleepEntryData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create sleep entry');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sleepEntries'] });
      queryClient.invalidateQueries({ queryKey: ['insights'] });
      console.log('Successfully created sleep entry!');
    },
    onError: (error) => {
      console.error('Error creating sleep entry:', error.message);
    },
  });

  // Mutation for creating a Wellbeing Entry
  const createWellbeingMutation = useMutation<
    TypeOfDataFromFrontEnd, // Assuming this is the correct response type for wellbeing POST
    Error,
    TypeOfDataFromFrontEnd
  >({
    mutationFn: async (newWellbeingEntryData: TypeOfDataFromFrontEnd) => {
      console.log('Sending wellbeing data:', newWellbeingEntryData);
      const response = await fetch('/api/wellbeing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newWellbeingEntryData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create wellbeing entry');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wellbeingEntries'] });
      queryClient.invalidateQueries({ queryKey: ['insights'] });
      console.log('Successfully created wellbeing entry!');
    },
    onError: (error) => {
      console.error('Error creating wellbeing entry:', error.message);
    },
  });

  // Handler for form submission
  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    if (isPending || !session?.user.id) {
      console.error('Session not ready or user ID not available.');
      return;
    }

    const userId = session.user.id;

    // Prepare data for sleep entry mutation
    const sleepEntryData: CreateSleepEntryInput = {
      userId: userId,
      bedtime: new Date(data.bedtime).toISOString(),
      wakeUpTime: new Date(data.wakeUpTime).toISOString(),
      qualityRating: data.qualityRating,
      comments: data.sleepComments || '',
    };

    // Prepare data for wellbeing entry mutation
    const wellbeingEntryData: TypeOfDataFromFrontEnd = {
      entryDate: new Date(data.entryDate).toISOString(),
      dayRating: data.dayRating,
      mood: data.mood,
      comments: data.dayComments || '',
    };

    try {
      await Promise.all([
        createSleepMutation.mutateAsync(sleepEntryData),
        createWellbeingMutation.mutateAsync(wellbeingEntryData),
      ]);
      console.log('Successfully created both sleep and wellbeing entries!');
      reset(); // Reset form fields after successful submission
    } catch (error) {
      console.error('Error creating combined entries:', error);
      // Errors from individual mutations are already handled by their onError callbacks
    }
  };

  const isSubmitting = createSleepMutation.isPending || createWellbeingMutation.isPending || isPending;

  return (
    <div className="p-6 max-w-lg mx-auto bg-gray-100 rounded-lg shadow-md font-sans">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Add Daily Entries</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Sleep Entry Fields */}
        <fieldset className="border border-gray-300 p-4 rounded-md shadow-sm bg-white">
          <legend className="text-lg font-semibold text-gray-700 px-2">Sleep Details</legend>
          <div>
            <Label htmlFor="bedtime" className="block text-sm font-medium text-gray-700 mb-1">Bedtime</Label>
            <Input
              id="bedtime"
              type="datetime-local"
              {...register('bedtime')}
              className="mt-1 block w-full" // Tailwind classes for shadcn Input
            />
            {errors.bedtime && <p className="mt-1 text-sm text-red-600">{errors.bedtime.message}</p>}
          </div>
          <div>
            <Label htmlFor="wakeUpTime" className="block text-sm font-medium text-gray-700 mb-1">Wake Up Time</Label>
            <Input
              id="wakeUpTime"
              type="datetime-local"
              {...register('wakeUpTime')}
              className="mt-1 block w-full"
            />
            {errors.wakeUpTime && <p className="mt-1 text-sm text-red-600">{errors.wakeUpTime.message}</p>}
          </div>
          <div>
            <Label htmlFor="qualityRating" className="block text-sm font-medium text-gray-700 mb-1">Sleep Quality Rating (1-10)</Label>
            <Input
              id="qualityRating"
              type="number"
              {...register('qualityRating')}
              className="mt-1 block w-full"
            />
            {errors.qualityRating && <p className="mt-1 text-sm text-red-600">{errors.qualityRating.message}</p>}
          </div>
          <div>
            <Label htmlFor="sleepComments" className="block text-sm font-medium text-gray-700 mb-1">Sleep Comments</Label>
            <Textarea
              id="sleepComments"
              {...register('sleepComments')}
              rows={3}
              className="mt-1 block w-full"
            ></Textarea>
            {errors.sleepComments && <p className="mt-1 text-sm text-red-600">{errors.sleepComments.message}</p>}
          </div>
        </fieldset>

        {/* Wellbeing Entry Fields */}
        <fieldset className="border border-gray-300 p-4 rounded-md shadow-sm bg-white">
          <legend className="text-lg font-semibold text-gray-700 px-2">Wellbeing Details</legend>
          <div>
            <Label htmlFor="entryDate" className="block text-sm font-medium text-gray-700 mb-1">Entry Date</Label>
            <Input
              id="entryDate"
              type="date"
              {...register('entryDate')}
              className="mt-1 block w-full"
            />
            {errors.entryDate && <p className="mt-1 text-sm text-red-600">{errors.entryDate.message}</p>}
          </div>
          <div>
            <Label htmlFor="dayRating" className="block text-sm font-medium text-gray-700 mb-1">Day Rating (1-10)</Label>
            <Input
              id="dayRating"
              type="number"
              {...register('dayRating')}
              className="mt-1 block w-full"
            />
            {errors.dayRating && <p className="mt-1 text-sm text-red-600">{errors.dayRating.message}</p>}
          </div>
          <div>
            <Label htmlFor="mood" className="block text-sm font-medium text-gray-700 mb-1">Mood</Label>
            <Controller
              name="mood"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Mood" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(Mood).map((moodOption) => (
                      <SelectItem key={moodOption} value={moodOption}>
                        {moodOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.mood && <p className="mt-1 text-sm text-red-600">{errors.mood.message}</p>}
          </div>
          <div>
            <Label htmlFor="dayComments" className="block text-sm font-medium text-gray-700 mb-1">Day Comments</Label>
            <Textarea
              id="dayComments"
              {...register('dayComments')}
              rows={3}
              className="mt-1 block w-full"
            ></Textarea>
            {errors.dayComments && <p className="mt-1 text-sm text-red-600">{errors.dayComments.message}</p>}
          </div>
        </fieldset>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding Entries...' : 'Add Both Entries'}
        </Button>

        {/* Error Messages */}
        {(createSleepMutation.isError || createWellbeingMutation.isError) && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {createSleepMutation.isError && <div>Error adding sleep: {createSleepMutation.error?.message}</div>}
            {createWellbeingMutation.isError && <div>Error adding wellbeing: {createWellbeingMutation.error?.message}</div>}
          </div>
        )}
      </form>
    </div>
  );
}

export default AddEntry;
