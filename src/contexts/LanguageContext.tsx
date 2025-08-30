import { updateUserLanguage } from "@/api/apiUsers";
import { createContext, useContext, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "./AuthContext";

type Language = "en" | "pl";

type LanguageContextType = {
  currentLanguage: Language;
  changeLanguage: (lang: Language) => void;
  availableLanguages: { code: Language; name: string }[];
  isLoading: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

const availableLanguages = [
  { code: "en" as Language, name: "EN" },
  { code: "pl" as Language, name: "PL" },
];

const getValidLanguage = (lang: string | null): Language => {
  if (lang === "pl") return "pl";
  if (lang === "en") return "en";
  return "en";
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<Language>("en");
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const initializeLanguage = async () => {
      const savedLanguage = localStorage.getItem("tasker-language");
      const validLanguage = getValidLanguage(savedLanguage);

      setCurrentLanguage(validLanguage);
      await i18n.changeLanguage(validLanguage);

      localStorage.setItem("tasker-language", validLanguage);

      setIsLoading(false);
    };

    const timer = setTimeout(initializeLanguage, 50);

    return () => clearTimeout(timer);
  }, [i18n]);

  const changeLanguage = async (lang: Language) => {
    setCurrentLanguage(lang);
    await i18n.changeLanguage(lang);
    localStorage.setItem("tasker-language", lang);

    if (currentUser) {
      try {
        await updateUserLanguage(lang);
      } catch (error) {
        console.error("Failed to update language in database:", error);
      }
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        changeLanguage,
        availableLanguages,
        isLoading,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
