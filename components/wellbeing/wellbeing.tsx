"use client"
import React from 'react'
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSleepEntry } from "@/components/FetchingData";
import { SingleSleepRouteEntry } from "@/app/lib/sleep";


function SleepPage() {
      const queryClient = useQueryClient();
    
      const {
        data: AllUsersSleepEntry,
        isLoading,
        isError,
      } = useQuery<SingleSleepRouteEntry[]>({
        queryKey: ["AllUsersSleepEntries"],
        queryFn: getSleepEntry,
      });
    
      if (isLoading) {
        return <span>Loading...</span>;
      }
    
      if (isError) {
        return <span>Error fetching todos!</span>;
      }
  return (
        <ul>
        {AllUsersSleepEntry?.length !== 0  ? (
           "No user data found"
        ) : (
         <>
            {AllUsersSleepEntry?.map((Entries) => (
              <li key={Entries.id}>{Entries.durationHours!}</li>
            ))}
          </>
        )}
      </ul>
    
  )
}

export default SleepPage;