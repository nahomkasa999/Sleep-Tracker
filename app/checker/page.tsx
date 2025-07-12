"use client"
import React from 'react'
import { useEffect } from 'react'

function Page() {

const fetchData = async () => {
  try {
    const response = await fetch('/api/hello')
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const data = await response.json()
    console.log(data)
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error)
  }
}

useEffect(() => {
  fetchData()
}, [])

  return (
    <div>page</div>
  )
}

export default Page