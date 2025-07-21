"use client"; // This component is a client component

import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { usePopupContext } from '@/context/PopUpContext';
import { CreateEntryDialog, CreateEntryForm } from '@/components/AddEntry/AddEntry'; // Assuming this path is correct for your dialog component

function CreateEntryDialogWrapper() {
  const { isOpen, setIsOpen } = usePopupContext();
  const queryClient = useQueryClient();

  const createEntryMutation = useMutation({
    mutationFn: async (data: CreateEntryForm) => {
      
      const response = await fetch('/api/sleep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
      
        console.error("Backend error response for /api/sleep:", errorData);
        throw new Error(errorData.message || errorData.error || 'Failed to create entry: Unknown backend error');
      }
      return response.json();
    },
    onMutate: async (newEntry) => {
      
      await queryClient.cancelQueries({ queryKey: ["allChartsData"] });
      const period = 'week'; 
      const previousData = queryClient.getQueryData(["allChartsData", period]);

     
      queryClient.setQueryData(["allChartsData", period], (old: any) => {
        if (!old) {
          return {
            sleepDurationChartData: [{ date: newEntry.entryDate, sleepDuration: newEntry.durationHours }],
            moodChartData: [],
            correlationChartData: [],
            aiCorrelationInsight: '',
          };
        }
        return {
          ...old,
          sleepDurationChartData: [
            ...(old.sleepDurationChartData || []), // Ensure it's an array
            { date: newEntry.entryDate, sleepDuration: newEntry.durationHours }
          ],
        };
      });
      return { previousData };
    },
    onError: (error: any, variables, context) => {
      console.error("React Query Mutation Error:", error);
      toast.error(`Failed to create entry: ${error.message || 'An unknown error occurred.'}`);
     
      if (context?.previousData) {
        const period = 'week';
        queryClient.setQueryData(["allChartsData", period], context.previousData);
      }
    },
    onSettled: (data, error, variables, context) => {
    
      const period = 'week';
      queryClient.invalidateQueries({ queryKey: ["allChartsData", period] });
      queryClient.invalidateQueries({ queryKey: ["allSleepEntriesDashboard"] });
      queryClient.invalidateQueries({ queryKey: ["aiCorrelationInsightDashboard"] });
      queryClient.invalidateQueries({ queryKey: ["summaryDataDashboard"] });
    },
    onSuccess: () => {
      toast.success('Entry created successfully!');
      setIsOpen(false); 
    },
  });

  return (
    <CreateEntryDialog
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      onSave={async (data) => {
        await createEntryMutation.mutateAsync(data);
      }}
    />
  );
}

export default CreateEntryDialogWrapper;
