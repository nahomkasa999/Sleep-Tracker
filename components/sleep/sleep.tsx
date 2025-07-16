"use client"
import React from 'react'
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSleepEntry } from "@/components/FetchingData";
import { SingleSleepRouteEntry } from "@/app/lib/sleep";
import CreateSleep from '../add-entry/CreateSleep';



function SleepPage() {
      const queryClient = useQueryClient();
    
      const {
        data: AllUsersSleepEntry,
        isLoading,
        isError,
      } = useQuery<{ message: string, data: SingleSleepRouteEntry[]}>({
        queryKey: ["AllUsersSleepEntries"],
        queryFn: getSleepEntry,
      });
    
      if (isLoading) {
        return <span>Loading...</span>;
      }
    
      if (isError) {
        return <span>Error fetching todos!</span>;
      }

      console.log(AllUsersSleepEntry)
  return (
        <ul>
        {AllUsersSleepEntry?.data?.length === 0  ? (
           "No user data found"
        ) : (
         <>
            {AllUsersSleepEntry?.data.map((Entries) => (
              <li key={Entries.id}>{`${Entries.comments}`}</li>
            ))}
          </>
        )}
        <CreateSleep/>
      </ul>
    
  )
}

export default SleepPage;