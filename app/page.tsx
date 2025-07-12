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

    if (wakeDate <= sleepDate) {
      wakeDate.setDate(wakeDate.getDate() + 1)
    }

    const duration = (wakeDate.getTime() - sleepDate.getTime()) / (1000 * 60 * 60)
    
    alert(`You slept for ${duration} hours.`)
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
          Calculate Sleep Duration
        </button>
    </div>
  )
}

export default page
// adding comment if it notice any change