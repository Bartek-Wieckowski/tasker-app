import { enUS, pl } from "date-fns/locale";
import i18n from "./i18n";

export function dateCustomFormatting(date: Date): string {
  const padStart = (value: number): string => value.toString().padStart(2, "0");
  return `${date.getFullYear()}-${padStart(date.getMonth() + 1)}-${padStart(
    date.getDate()
  )}`;
}

export function convertTimestampToDate(timestamp: string): Date {
  const date = new Date(timestamp);
  date.setMilliseconds(0);
  return date;
}

export function formatDateString(dateString: string | Date) {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString("en-US", options);

  const time = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${formattedDate} at ${time}`;
}

export const multiFormatDateString = (
  dateString: string | Date = new Date()
): string => {
  const date: Date = new Date(dateString);
  const now: Date = new Date();

  const diff: number = now.getTime() - date.getTime();
  const diffInSeconds: number = Math.abs(diff) / 1000;
  const diffInMinutes: number = diffInSeconds / 60;
  const diffInHours: number = diffInMinutes / 60;
  const diffInDays: number = diffInHours / 24;

  const days = Math.floor(diffInDays);
  const hours = Math.floor(diffInHours);
  const minutes = Math.floor(diffInMinutes);

  switch (true) {
    case days >= 30:
      return formatDateString(date);
    case days === 1:
      return i18n.t("dateFormat.dayAgo");
    case days > 1 && days < 30:
      return i18n.t("dateFormat.daysAgo", { count: days });
    case hours === 1:
      return i18n.t("dateFormat.hourAgo");
    case hours >= 2:
      return i18n.t("dateFormat.hoursAgo", { count: hours });
    case minutes === 1:
      return i18n.t("dateFormat.minuteAgo");
    case minutes >= 2:
      return i18n.t("dateFormat.minutesAgo", { count: minutes });
    default:
      return i18n.t("dateFormat.justNow");
  }
};

export const localeMap = {
  en: enUS,
  pl: pl,
};

export function getInvitationStatus(
  status: string | null,
  expiresAt: string | null | undefined
): "pending" | "accepted" | "declined" | "expired" {
  // Default to pending if status is null
  const actualStatus = status || "pending";

  if (actualStatus === "accepted" || actualStatus === "declined") {
    return actualStatus as "accepted" | "declined";
  }

  if (actualStatus === "pending" && expiresAt) {
    const now = new Date();
    const expirationDate = new Date(expiresAt);
    return now >= expirationDate ? "expired" : "pending";
  }

  return "pending";
}

export function formatExpirationMessage(
  expiresAt: string | null | undefined,
  language: "en" | "pl",
  status: "pending" | "accepted" | "declined" | "expired"
): string | null {
  if (!expiresAt || status === "accepted" || status === "declined") {
    return null;
  }

  const date = new Date(expiresAt);
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  const locale = language === "pl" ? "pl-PL" : "en-US";
  const formattedDate = date.toLocaleDateString(locale, dateOptions);
  const formattedTime = date.toLocaleTimeString(locale, timeOptions);

  if (status === "expired") {
    return language === "pl"
      ? `Wygasło: ${formattedDate} o ${formattedTime}`
      : `Expired: ${formattedDate} at ${formattedTime}`;
  }

  return language === "pl"
    ? `Wygasa: ${formattedDate} o ${formattedTime}`
    : `Expires: ${formattedDate} at ${formattedTime}`;
}
