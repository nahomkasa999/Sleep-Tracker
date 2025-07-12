"use client"

import React from 'react'
import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"


type typeOfDB = {
  sleepingtime: number[][]; 
  wakingtime: number[][];   
  sleepDuration: number[][]; 
  feedback: number[];      
  comments: string[];      
}

function Page() {
  const [sleepingtime, setSleepTime] = useState('')
  const [wakingtime, setWakeTime] = useState('')
  const [temporaryDatabase, setTemporaryDatabase] = useState<typeOfDB>({
    sleepingtime: [
      [22, 30],
      [23, 0],
      [22, 45],
      [23, 15],
      [22, 0]
    ],
    wakingtime: [
      [6, 45],
      [7, 0],
      [6, 30],
      [7, 15],
      [6, 0]
    ],
    sleepDuration: [
      [8, 15],
      [8, 0],
      [7, 45],
      [8, 0],
      [8, 0]
    ],
    feedback: [8, 7, 9, 6, 8],
    comments: [
      "Felt refreshed today.",
      "A bit restless in the middle of the night.",
      "Excellent sleep, woke up naturally.",
      "Hard to fall asleep, felt groggy.",
      "Solid sleep, good energy."
    ]
  });

  const handleButtonClick = () => {
    if (!sleepingtime || !wakingtime) {
      alert('Please enter both sleep and wake times.')
      return
    }

    const sleepTimeParts = sleepingtime.split(':').map(Number)
    const wakeTimeParts = wakingtime.split(':').map(Number)

    const sleepDate = new Date()
    sleepDate.setHours(sleepTimeParts[0], sleepTimeParts[1], 0)

    const wakeDate = new Date()
    wakeDate.setHours(wakeTimeParts[0], wakeTimeParts[1], 0)

    if (wakeDate < sleepDate) {
      wakeDate.setDate(wakeDate.getDate() + 1)
    }

    const sleepTimeInHours = (wakeDate.getTime() - sleepDate.getTime()) / (1000 * 60 * 60)
    const Hour = Math.floor(sleepTimeInHours)
    const Minutes = Math.floor((sleepTimeInHours - Hour) * 60)

    let sleepDurationMessage: string;
    if (Hour > 0 && Minutes === 0) {
      sleepDurationMessage = `${Hour} hours`;
    } else {
      sleepDurationMessage = `${Hour} hours and ${Minutes} minutes`;
    }
    alert(`You slept for ${sleepDurationMessage}.`);

    // Update state with new values
    setTemporaryDatabase(prev => ({
      ...prev,
      sleepingtime: [...prev.sleepingtime, sleepTimeParts],
      wakingtime: [...prev.wakingtime, wakeTimeParts],
      sleepDuration: [...prev.sleepDuration, [Hour, Minutes]]
    }));

    getSleepingFeedback();
  }

  const getSleepingFeedback = () => {
    let persons_feedback_input = prompt("Please provide your feedback on your sleep quality (1-10):");
    let persons_feedback: number;

    if (persons_feedback_input === null || isNaN(Number(persons_feedback_input)) || Number(persons_feedback_input) < 1 || Number(persons_feedback_input) > 10) {
      alert("Invalid or missing feedback. Please provide a rating between 1 and 10.");
      return;
    }
    persons_feedback = Number(persons_feedback_input);

    const confirmComment = confirm("Do you want to provide any additional comments: yes or no");
    let additionalComment: string | null = null;
    if (confirmComment) {
      additionalComment = prompt("Please provide your additional comments:");
      alert(`Thank you for your feedback! You rated your sleep quality as ${persons_feedback} and provided the comment: ${additionalComment || "No additional comment provided"}`);
    } else {
      additionalComment = "No additional comment provided";
      alert(`Thank you for your feedback! You rated your sleep quality as ${persons_feedback}`);
    }

    // Update state with new feedback and comment
    setTemporaryDatabase(prev => ({
      ...prev,
      feedback: [...prev.feedback, persons_feedback],
      comments: [...prev.comments, additionalComment || "No additional comment provided"]
    }));
    console.log("Temporary Database:", temporaryDatabase);
  }

  // Helper to convert [hour, min] to total minutes
  const toMinutes = (arr: number[]) => arr[0] * 60 + arr[1];

  // Prepare chart data (in hours, decimal)
  const chartData = temporaryDatabase.sleepDuration.map((dur, i) => ({
    day: `Day ${i + 1}`,
    sleepDuration: dur[0] + dur[1] / 60, // hours as decimal
    feedback: temporaryDatabase.feedback[i],
  }));

  // Chart config for shadcn/ui chart
  const chartConfig = {
    sleepDuration: {
      label: "Sleep Duration (hours)",
      color: "var(--chart-1)",
    },
    feedback: {
      label: "Feedback",
      color: "var(--chart-2)",
    },
  };

  // Pearson correlation calculation
  function pearsonCorrelation(x: number[], y: number[]) {
    const n = x.length;
    const avgX = x.reduce((a, b) => a + b, 0) / n;
    const avgY = y.reduce((a, b) => a + b, 0) / n;
    let num = 0, denomX = 0, denomY = 0;
    for (let i = 0; i < n; i++) {
      num += (x[i] - avgX) * (y[i] - avgY);
      denomX += (x[i] - avgX) ** 2;
      denomY += (y[i] - avgY) ** 2;
    }
    return num / Math.sqrt(denomX * denomY);
  }

  const durations = chartData.map(d => d.sleepDuration);
  const feedbacks = chartData.map(d => d.feedback);
  const correlation = durations.length > 1 ? pearsonCorrelation(durations, feedbacks) : 0;

  return (
    <div className="p-4 max-w-xl mx-auto">
      <label>
        Sleep Time:
        <input
          type="time"
          value={sleepingtime}
          onChange={(e) => setSleepTime(e.target.value)}
          className="ml-2 border rounded px-2 py-1"
        />
      </label>
      <br />
      <label>
        Wake Time:
        <input
          type="time"
          value={wakingtime}
          onChange={(e) => setWakeTime(e.target.value)}
          className="ml-2 border rounded px-2 py-1"
        />
      </label>
      <br />
      <button onClick={handleButtonClick} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded">
        Calculate Sleep Duration & Get Feedback
      </button>

      <div className="mt-8">
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart data={chartData} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="day" tickLine={false} tickMargin={10} axisLine={false} />
            <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="sleepDuration" fill="var(--chart-1)" radius={4} />
            <Bar dataKey="feedback" fill="var(--chart-2)" radius={4} />
          </BarChart>
        </ChartContainer>
        <div className="mt-4">
          <strong>Correlation (Sleep Duration vs Feedback):</strong> {correlation.toFixed(2)}
        </div>
      </div>
    </div>
  )
}

export default Page