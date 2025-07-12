"use client"
import React from 'react'
import { useState } from 'react'

function page() {
  const [sleepingtime, setSleepTime] = useState('')
  const [wakingtime, setWakeTime] = useState('')

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
      wakeDate.setDate(wakeDate.getDate() + 1) // Adjust for next day if wake time is earlier than sleep time
    }
    const sleepTimeInHours = (wakeDate.getTime() - sleepDate.getTime()) / (1000 * 60 * 60) // Convert milliseconds to hours
    const Hour = Math.floor(sleepTimeInHours)
    const Minutes = Math.floor((sleepTimeInHours - Hour) * 60)
    if (Hour > 0 && Minutes == 0) {
      const sleepDuration = `${Hour} hours`
      alert(`You slept for ${sleepDuration} hours.`)
    } else {
      const sleepDuration = `${Hour} hours and ${Minutes} minutes`
      alert(`You slept for ${sleepDuration}.`)
    }
    getSleepingFeedback()
  }

   const getSleepingFeedback = () => {
      const persons_feedback = prompt("Please provide your feedback on your sleep quality 1-10:")
      const comment = confirm("so you want provide any additional comments: yes or no")
      if (comment) {
        const additionalComment = prompt("Please provide your additional comments:")
        alert(`Thank you for your feedback! You rated your sleep quality as ${persons_feedback} and provided the comment: ${additionalComment}`)
      } else {
        alert(`Thank you for your feedback! You rated your sleep quality as ${persons_feedback}`)
      }
   }
  return (
    <div>
        <label>
          Sleep Time:
          <input
            type="time"
            value={sleepingtime}
            onChange={(e) => setSleepTime(e.target.value)}
          />
        </label>
        <br />
        <label>
          Wake Time:
          <input
            type="time"
            value={wakingtime}
            onChange={(e) => setWakeTime(e.target.value)}
          />
        </label>
        <br />
        <button onClick={handleButtonClick}>
         Sleep Duration
        </button>
    </div>
  )
}

export default page
// adding comment if it notice any change