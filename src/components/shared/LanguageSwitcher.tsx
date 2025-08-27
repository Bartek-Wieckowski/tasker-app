import { useLanguage } from "@/contexts/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function LanguageSwitcher() {
  const { currentLanguage, changeLanguage, availableLanguages, isLoading } =
    useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        ...
      </Button>
    );
  }

  const handleLanguageChange = (lang: "en" | "pl") => {
    changeLanguage(lang);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="border-0">
          {
            availableLanguages.find((lang) => lang.code === currentLanguage)
              ?.name
          }
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {availableLanguages.map((language) => (
          <button
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={cn(
              "w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer",
              currentLanguage === language.code &&
                "bg-gray-100 dark:bg-gray-800 font-medium"
            )}
          >
            {language.name}
          </button>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
