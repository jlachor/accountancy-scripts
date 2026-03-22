import { format } from "date-fns"
import { pl } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value?: Date
  onChange: (date: Date | undefined) => void
  placeholder?: string
}

export function DatePicker({ value, onChange, placeholder = "Wybierz datę" }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "inline-flex items-center justify-start gap-2 h-8 w-35 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          !value && "text-muted-foreground"
        )}
      >
        <CalendarIcon className="h-4 w-4" />
        {value ? format(value, "yyyy-MM-dd") : <span>{placeholder}</span>}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          weekStartsOn={1}
          locale={pl}
        />
      </PopoverContent>
    </Popover>
  )
}
