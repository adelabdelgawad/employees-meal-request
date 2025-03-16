import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

interface TimeSelectProps {
  /** The current time value in "HH:MM" format */
  time: string
  /** Callback to update the parent's time value */
  onTimeChange: (time: string) => void
  /** Optional label for the card description */
  label?: string
}

/**
 * A reusable time selection component that allows a user to choose an hour and a minute.
 * The parent's state is updated automatically when the user selects an hour or minute.
 *
 * @param {TimeSelectProps} props - The props for the component.
 * @returns {JSX.Element} The rendered time selection card.
 */
export default function TimeSelect({ time, onTimeChange, label = "Select the desired hour and minute." }: TimeSelectProps) {
  // Parse the initial time string (if provided)
  const initialHour = time ? time.split(':')[0] : ''
  const initialMinute = time ? time.split(':')[1] : ''
  const [selectedHour, setSelectedHour] = useState<string>(initialHour)
  const [selectedMinute, setSelectedMinute] = useState<string>(initialMinute)

  // Keep local state in sync with parent's prop in case it changes
  useEffect(() => {
    if (time) {
      const parts = time.split(':')
      setSelectedHour(parts[0])
      setSelectedMinute(parts[1])
    }
  }, [time])

  // Update parent's state whenever selectedHour or selectedMinute changes
  useEffect(() => {
    if (selectedHour && selectedMinute) {
      const newTime = `${selectedHour}:${selectedMinute}`
      onTimeChange(newTime)
    }
  }, [selectedHour, selectedMinute, onTimeChange])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">Time Modification</CardTitle>
        <CardDescription>{label}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hour">Hour</Label>
            <Select value={selectedHour} onValueChange={setSelectedHour}>
              <SelectTrigger id="hour" aria-label="Hour">
                <SelectValue placeholder="Hour" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => i).map((hour) => {
                  const hourString = hour < 10 ? `0${hour}` : `${hour}`
                  return (
                    <SelectItem key={hour} value={hourString}>
                      {hourString}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="minute">Minute</Label>
            <Select value={selectedMinute} onValueChange={setSelectedMinute}>
              <SelectTrigger id="minute" aria-label="Minute">
                <SelectValue placeholder="Minute" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 60 }, (_, i) => i).map((minute) => {
                  const minuteString = minute < 10 ? `0${minute}` : `${minute}`
                  return (
                    <SelectItem key={minute} value={minuteString}>
                      {minuteString}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
