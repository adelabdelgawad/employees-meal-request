"use client"

import { Clock, CalendarClock, UtensilsCrossed } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface MealRequestOptionsProps {
  meals: Meal[]
  selectedMealIds: number[]
  requestStatus: string
  scheduledDate: Date | undefined
  notes: string
  onMealToggle: (mealId: number) => void
  onRequestStatusChange: (type: string) => void
  onScheduledDateChange: (date: Date | undefined) => void
  onNotesChange: (notes: string) => void
  onSubmit: () => Promise<void>
  isSubmitting: boolean
  isSubmitDisabled: boolean
}

export function MealRequestOptions({
  meals,
  selectedMealIds,
  requestStatus,
  scheduledDate,
  notes,
  onMealToggle,
  onRequestStatusChange,
  onScheduledDateChange,
  onNotesChange,
  onSubmit,
  isSubmitting,
  isSubmitDisabled,
}: MealRequestOptionsProps) {
  return (
    <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-4">
      {/* Request Time Options */}
      <div className="w-full md:w-1/3">
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Request Time
          </h3>
          <RadioGroup value={requestStatus} onValueChange={onRequestStatusChange} className="space-y-2 flex space-x-10">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="now" id="now" />
              <Label htmlFor="now">Request Now</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="scheduled" id="scheduled" />
              <Label htmlFor="scheduled">Schedule Request</Label>
            </div>
          </RadioGroup>
        </div>

        {requestStatus === "scheduled" && (
          <div className="mt-4">
            <Label htmlFor="date" className="block mb-2">
              Select Date & Time
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !scheduledDate && "text-muted-foreground",
                  )}
                >
                  <CalendarClock className="mr-2 h-4 w-4" />
                  {scheduledDate ? format(scheduledDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={scheduledDate}
                  onSelect={onScheduledDateChange}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="w-full md:w-1/3">
        <h3 className="text-lg font-medium mb-2">Notes</h3>
        <Textarea
          placeholder="Add any special instructions or notes for this meal request..."
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
        />
      </div>

      {/* Meal Type and Submit */}
      <div className="w-full md:w-1/3">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2 flex items-center">
            <UtensilsCrossed className="h-5 w-5 mr-2" />
            Meal Types
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {meals.map((meal) => (
              <div key={meal.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`meal-${meal.id}`}
                  checked={selectedMealIds.includes(meal.id)}
                  onCheckedChange={() => onMealToggle(meal.id)}
                />
                <Label htmlFor={`meal-${meal.id}`}>{meal.name}</Label>
              </div>
            ))}
          </div>
        </div>

        <Button className="w-full mt-6" size="lg" onClick={onSubmit} disabled={isSubmitDisabled}>
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </Button>
      </div>
    </div>
  )
}

