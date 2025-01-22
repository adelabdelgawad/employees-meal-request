'use client';

import * as React from 'react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { useAlerts } from '@/components/alert/useAlerts';

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
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const pathname = usePathname();

  const { addAlert } = useAlerts();

  const handleDateSelect = (newDateRange: DateRange | undefined) => {
    setDate(newDateRange);
  };

  const handleSaveButtonClick = () => {
    const params = new URLSearchParams(searchParams?.toString() || '');

    // If no date range is selected, clear parameters and close the drawer
    if (!date?.from && !date?.to) {
      params.delete('start_date');
      params.delete('end_date');
      replace(`${pathname}?${params.toString()}`);
      setIsDrawerOpen(false);
      return;
    }

    // Ensure both start and end dates are present
    if (!date?.from) {
      addAlert('Please select a start date.', 'error');
      return;
    }

    if (!date?.to) {
      addAlert('Please select an end date.', 'error');
      return;
    }

    // Set the parameters if the range is valid
    params.set('start_date', date.from.toISOString());
    params.set('end_date', date.to.toISOString());
    replace(`${pathname}?${params.toString()}`);
    setIsDrawerOpen(false);
  };

  const handleCancelButtonClick = () => {
    setIsDrawerOpen(false);
  };

  // Helper functions for predefined ranges
  const selectThisMonth = () => {
    const now = new Date();
    setDate({
      from: startOfMonth(now),
      to: endOfMonth(now),
    });
  };

  const selectLastMonth = () => {
    const now = new Date();
    const lastMonth = subMonths(now, 1);
    setDate({
      from: startOfMonth(lastMonth),
      to: endOfMonth(lastMonth),
    });
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
          <Button variant="ghost" onClick={handleCancelButtonClick}>
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
                        from: subMonths(new Date(), 1),
                        to: subMonths(new Date(), 1),
                      })
                    }
                  >
                    Yesterday
                  </Button>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    className="w-full text-left"
                    onClick={selectThisMonth}
                  >
                    This Month
                  </Button>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    className="w-full text-left"
                    onClick={selectLastMonth}
                  >
                    Last Month
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
            <Button
              variant="outline"
              onClick={() => {
                handleCancelButtonClick();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                handleSaveButtonClick();
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
