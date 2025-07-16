import React from 'react'
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateSleepEntry } from '../FetchingData'
import {  CreateSleepEntryInput } from '@/app/lib/sleep'
import { useSession } from "@/app/lib/auth-client";

function CreateSleep() {
    const queryClient = useQueryClient()
    const { data: session, isPending } = useSession();

    const addSleepEntry = useMutation({
        mutationFn: CreateSleepEntry, //I called the function to create the entry its how the react query works,
        onSuccess: (responseData: {message: string}) => {
            console.log("content have been created", responseData.message)
            queryClient.invalidateQueries({queryKey: ["AllUsersSleepEntries"]})
        },
         onError: (error) => {
            console.error("Error creating sleep entry:", error);
            },

    })


  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // In a real app, you'd get these values from form inputs
    const newEntryData: CreateSleepEntryInput = {
      userId: `${session?.user.id}`,
      bedtime: new Date().toISOString(),
      wakeUpTime: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
      qualityRating: 7,
      comments: "Had a decent night's sleep.",

    };

    addSleepEntry.mutate(newEntryData);
  };


  return (
     <form onSubmit={handleSubmit}>
    
      <button type="submit" disabled={addSleepEntry.isPending}>
        {addSleepEntry.isPending ? "Saving..." : "Add Sleep Entry"}
      </button>
      {addSleepEntry.isError && (
        <p style={{ color: 'red' }}>Error: {addSleepEntry.error?.message}</p>
      )}
      {addSleepEntry.isSuccess && (
        <p style={{ color: 'green' }}>Sleep entry added!</p>
      )}
    </form>
    
  )
}

export default CreateSleep