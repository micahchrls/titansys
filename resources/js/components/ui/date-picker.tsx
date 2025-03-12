import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"

interface DatePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  label?: string
}

export function DatePicker({ date, setDate, label = "Pick a date" }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{label}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

interface DateRangePickerProps {
  from: Date | undefined
  to: Date | undefined
  setFrom: (date: Date | undefined) => void
  setTo: (date: Date | undefined) => void
}

export function DateRangePicker({ from, to, setFrom, setTo }: DateRangePickerProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="space-y-2">
        <Label htmlFor="from">Start Date</Label>
        <DatePicker 
          date={from} 
          setDate={setFrom} 
          label="Select start date" 
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="to">End Date</Label>
        <DatePicker 
          date={to} 
          setDate={setTo} 
          label="Select end date" 
        />
      </div>
    </div>
  )
}
