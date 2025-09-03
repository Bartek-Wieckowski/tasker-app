import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  dateCustomFormatting,
  convertTimestampToDate,
  formatDateString,
  multiFormatDateString,
  localeMap,
  getInvitationStatus,
  formatExpirationMessage,
} from "@/lib/helpers";

// Mock i18n
vi.mock("@/lib/i18n", () => ({
  default: {
    t: (key: string, options?: { count?: number }) => {
      const translations: Record<string, string | ((count: number) => string)> =
        {
          "dateFormat.justNow": "Just now",
          "dateFormat.minuteAgo": "1 minute ago",
          "dateFormat.minutesAgo": (count: number) => `${count} minutes ago`,
          "dateFormat.hourAgo": "1 hour ago",
          "dateFormat.hoursAgo": (count: number) => `${count} hours ago`,
          "dateFormat.dayAgo": "1 day ago",
          "dateFormat.daysAgo": (count: number) => `${count} days ago`,
        };

      const translation = translations[key];
      if (typeof translation === "function" && options?.count !== undefined) {
        return translation(options.count);
      }
      return translation || key;
    },
  },
}));

describe("dateCustomFormatting", () => {
  it("should format date to YYYY-MM-DD format", () => {
    const date = new Date(2024, 0, 15);
    const result = dateCustomFormatting(date);
    expect(result).toBe("2024-01-15");
  });

  it("should pad single digits with zero", () => {
    const date = new Date(2024, 2, 5);
    const result = dateCustomFormatting(date);
    expect(result).toBe("2024-03-05");
  });
});

describe("convertTimestampToDate", () => {
  it("should convert timestamp string to Date object", () => {
    const timestamp = "2024-01-15T10:30:45.123Z";
    const result = convertTimestampToDate(timestamp);

    expect(result).toBeInstanceOf(Date);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(15);
  });

  it("should set milliseconds to 0", () => {
    const timestamp = "2024-01-15T10:30:45.999Z";
    const result = convertTimestampToDate(timestamp);

    expect(result.getMilliseconds()).toBe(0);
  });
});

describe("formatDateString", () => {
  it("should format date string correctly", () => {
    const dateString = "2024-01-15T10:30:00";
    const result = formatDateString(dateString);

    expect(result).toContain("2024");
    expect(result).toContain("at");
    expect(result).toMatch(/\d{1,2}:\d{2}/);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(10);
  });

  it("should handle Date object input", () => {
    const date = new Date(2024, 0, 15, 14, 30);
    const result = formatDateString(date);

    expect(result).toContain("2024");
    expect(result).toContain("at");
    expect(result).toMatch(/\d{1,2}:\d{2}/);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(10);
  });

  it("should maintain consistent format structure", () => {
    const date = new Date(2024, 0, 15, 14, 30);
    const result = formatDateString(date);

    const parts = result.split(" at ");
    expect(parts).toHaveLength(2);
    expect(parts[0]).toContain("2024");
    expect(parts[1]).toMatch(/\d{1,2}:\d{2}/);
  });
});

describe("multiFormatDateString", () => {
  let mockDate: Date;

  beforeEach(() => {
    mockDate = new Date("2024-01-15T12:00:00Z");
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return "Just now" for current time', () => {
    const result = multiFormatDateString(mockDate);
    expect(result).toBe("Just now");
  });

  it("should return minutes ago for recent times", () => {
    const fiveMinutesAgo = new Date(mockDate.getTime() - 5 * 60 * 1000);
    const result = multiFormatDateString(fiveMinutesAgo);
    expect(result).toBe("5 minutes ago");
  });

  it("should return hours ago for times within 24 hours", () => {
    const twoHoursAgo = new Date(mockDate.getTime() - 2 * 60 * 60 * 1000);
    const result = multiFormatDateString(twoHoursAgo);
    expect(result).toBe("2 hours ago");
  });

  it('should return "1 day ago" for exactly one day', () => {
    const oneDayAgo = new Date(mockDate.getTime() - 24 * 60 * 60 * 1000);
    const result = multiFormatDateString(oneDayAgo);
    expect(result).toBe("1 day ago");
  });

  it('should return "X days ago" for multiple days less than 30', () => {
    const threeDaysAgo = new Date(mockDate.getTime() - 3 * 24 * 60 * 60 * 1000);
    const result = multiFormatDateString(threeDaysAgo);
    expect(result).toBe("3 days ago");
  });

  it("should use current date as default when no parameter provided", () => {
    const result = multiFormatDateString();
    expect(result).toBe("Just now");
  });
});

describe("localeMap", () => {
  it("should contain English and Polish locales", () => {
    expect(localeMap).toHaveProperty("en");
    expect(localeMap).toHaveProperty("pl");
    expect(localeMap.en).toBeDefined();
    expect(localeMap.pl).toBeDefined();
  });
});

describe("getInvitationStatus", () => {
  let mockDate: Date;

  beforeEach(() => {
    mockDate = new Date("2024-01-15T12:00:00Z");
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return "pending" when status is null', () => {
    const result = getInvitationStatus(null, null);
    expect(result).toBe("pending");
  });

  it('should return "accepted" when status is accepted', () => {
    const result = getInvitationStatus("accepted", "2024-01-20T12:00:00Z");
    expect(result).toBe("accepted");
  });

  it('should return "declined" when status is declined', () => {
    const result = getInvitationStatus("declined", "2024-01-20T12:00:00Z");
    expect(result).toBe("declined");
  });

  it('should return "pending" when status is pending and not expired', () => {
    const futureDate = "2024-01-20T12:00:00Z";
    const result = getInvitationStatus("pending", futureDate);
    expect(result).toBe("pending");
  });

  it('should return "expired" when status is pending and past expiration date', () => {
    const pastDate = "2024-01-10T12:00:00Z";
    const result = getInvitationStatus("pending", pastDate);
    expect(result).toBe("expired");
  });

  it('should return "pending" when status is pending but no expiration date', () => {
    const result = getInvitationStatus("pending", null);
    expect(result).toBe("pending");
  });
});

describe("formatExpirationMessage", () => {
  it("should return null when expiresAt is null", () => {
    const result = formatExpirationMessage(null, "en", "pending");
    expect(result).toBeNull();
  });

  it("should return null when status is accepted", () => {
    const result = formatExpirationMessage(
      "2024-01-20T12:00:00Z",
      "en",
      "accepted"
    );
    expect(result).toBeNull();
  });

  it("should return null when status is declined", () => {
    const result = formatExpirationMessage(
      "2024-01-20T12:00:00Z",
      "en",
      "declined"
    );
    expect(result).toBeNull();
  });

  it("should return English expiration message for pending status", () => {
    const expiresAt = "2024-01-20T14:30:00Z";
    const result = formatExpirationMessage(expiresAt, "en", "pending");

    expect(result).toMatch(/^Expires: .+ at .+$/);
    expect(result).toContain("Jan");
    expect(result).toContain("2024");
    expect(result).toContain("at");
  });

  it("should return Polish expiration message for pending status", () => {
    const expiresAt = "2024-01-20T14:30:00Z";
    const result = formatExpirationMessage(expiresAt, "pl", "pending");

    expect(result).toMatch(/^Wygasa: .+ o .+$/);
    expect(result).toContain("o");
  });

  it("should return English expired message for expired status", () => {
    const expiresAt = "2024-01-20T14:30:00Z";
    const result = formatExpirationMessage(expiresAt, "en", "expired");

    expect(result).toMatch(/^Expired: .+ at .+$/);
    expect(result).toContain("Jan");
    expect(result).toContain("2024");
    expect(result).toContain("at");
  });

  it("should return Polish expired message for expired status", () => {
    const expiresAt = "2024-01-20T14:30:00Z";
    const result = formatExpirationMessage(expiresAt, "pl", "expired");

    expect(result).toMatch(/^Wygasło: .+ o .+$/);
    expect(result).toContain("o");
  });
});
