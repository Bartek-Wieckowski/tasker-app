import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { dateCustomFormatting } from '@/lib/helpers';
import { useAuth } from '@/contexts/AuthContext';
import { useGlobalSearch } from '@/contexts/GlobalSearchContext';

export function DatePicker() {
  const [date, setDate] = useState<Date>(new Date());
  const { setSelectedDate } = useAuth();
  const { setIsGlobalSearch, setSearchValueGlobal, setGlobalSearchResult } = useGlobalSearch();

  useEffect(() => {
    if (date) {
      setSelectedDate(dateCustomFormatting(date));
    }
  }, [date, setSelectedDate]);

  const handleDateSelect = (selectedDate: Date) => {
    setDate(selectedDate);
    setIsGlobalSearch(false);
    setSearchValueGlobal('');
    setGlobalSearchResult([]);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={'outline'} className={cn('w-[150px] justify-center text-left font-normal', !date && 'text-muted-foreground')}>
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          {date ? format(date, 'PPP') : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={date} onDayClick={handleDateSelect} initialFocus />
      </PopoverContent>
    </Popover>
  );
}
