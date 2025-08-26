import { useEffect, useState } from "react";
import { format } from "date-fns";

import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { dateCustomFormatting, localeMap } from "@/lib/helpers";
import { useAuth } from "@/contexts/AuthContext";
import { useGlobalSearch } from "@/contexts/GlobalSearchContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "react-i18next";

export default function DatePicker() {
  const { selectedDate, setSelectedDate } = useAuth();
  const [date, setDate] = useState<Date>(() => {
    return selectedDate ? new Date(selectedDate) : new Date();
  });
  const [isOpen, setIsOpen] = useState(false);
  const { setIsGlobalSearch, setSearchValueGlobal, setGlobalSearchResult } =
    useGlobalSearch();
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation();

  useEffect(() => {
    if (date) {
      setSelectedDate(dateCustomFormatting(date));
    }
  }, [date, setSelectedDate]);

  const handleDateSelect = (selectedDate: Date) => {
    setDate(selectedDate);
    setIsGlobalSearch(false);
    setSearchValueGlobal("");
    setGlobalSearchResult([]);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          data-testid="date-picker-button"
          variant={"outline"}
          className={cn(
            "w-full justify-center text-left font-normal mt-2 md:mt-0",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          {date ? (
            format(date, "PPP", {
              locale: localeMap[currentLanguage],
            })
          ) : (
            <span>{t("datePicker.pickDate")}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onDayClick={handleDateSelect}
          initialFocus
          locale={localeMap[currentLanguage]}
        />
      </PopoverContent>
    </Popover>
  );
}
