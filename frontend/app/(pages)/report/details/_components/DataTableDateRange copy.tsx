'use client';

import * as React from 'react';
import { format, startOfWeek, endOfWeek, subDays } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Drawer } from '@/components/ui/drawer'; // Import the Drawer component (assuming it exists)

// Define types for the date range
interface DateRange {
  from?: Date;
  to?: Date;
}

interface DateRangePickerProps {
  placeholder?: string;
}

export default function DateRangePicker({
  placeholder = 'Pick a date',
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>();
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  const handleDateSelect = (newDateRange: DateRange | undefined) => {
    setDate(newDateRange);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <div>
      {/* Trigger Button */}
      <Button size="lg" variant="outline" onClick={() => setIsDrawerOpen(true)}>
        <CalendarIcon className="mx-2 w-5 h-5 opacity-60" />
        {date?.from ? (
          date.to ? (
            <>
              {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
            </>
          ) : (
            format(date.from, 'LLL dd, y')
          )
        ) : (
          <span>{placeholder}</span>
        )}
      </Button>

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full bg-white shadow-lg transform ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        } transition-transform duration-500 ease-in-out w-100 z-50`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Select Date Range</h3>
          <Button variant="ghost" onClick={handleCloseDrawer}>
            Close
          </Button>
        </div>
        <div className="p-4">
          <div className="flex space-x-4">
            <div>
              <ul className="space-y-2">
                <li>
                  <Button
                    variant="ghost"
                    className="w-full text-left"
                    onClick={() =>
                      handleDateSelect({
                        from: new Date(),
                        to: new Date(),
                      })
                    }
                  >
                    Today
                  </Button>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    className="w-full text-left"
                    onClick={() =>
                      handleDateSelect({
                        from: subDays(new Date(), 1),
                        to: subDays(new Date(), 1),
                      })
                    }
                  >
                    Yesterday
                  </Button>
                </li>
              </ul>
            </div>
            <div>
              <Calendar
                initialFocus
                mode="range"
                selected={date}
                onSelect={handleDateSelect}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={handleCloseDrawer}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                console.log('Selected Date Range:', date);
                handleCloseDrawer();
              }}
            >
              OK
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
