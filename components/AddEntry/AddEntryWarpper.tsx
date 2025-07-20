"use client"; // This component is a client component

import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { usePopupContext } from '@/context/PopUpContext';
import { CreateEntryDialog, CreateEntryForm } from '@/components/AddEntry/AddEntry'; // Assuming this path is correct for your dialog component

/**
 * GlobalCreateEntryDialog handles the state and logic for the CreateEntryDialog.
 * It is a client component so it can use React hooks (useState, useContext, useMutation).
 */
function CreateEntryDialogWrapper() {
  const { isOpen, setIsOpen } = usePopupContext();
  const queryClient = useQueryClient();

  // TanStack Query mutation for creating a new sleep entry
  const createEntryMutation = useMutation({
    mutationFn: async (data: CreateEntryForm) => {
      const response = await fetch('/api/sleep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create entry');
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success('Entry created successfully!');
      // Invalidate relevant queries to refetch data on dashboard/analytics
      queryClient.invalidateQueries({ queryKey: ["allSleepEntriesDashboard"] });
      queryClient.invalidateQueries({ queryKey: ["aiCorrelationInsightDashboard"] });
      queryClient.invalidateQueries({ queryKey: ["summaryDataDashboard"] });
      queryClient.invalidateQueries({ queryKey: ["allChartsData"] }); // For analytics page
      setIsOpen(false); // Close the dialog on success
    },
    onError: (error: any) => {
      toast.error(`Failed to create entry: ${error.message}`);
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
