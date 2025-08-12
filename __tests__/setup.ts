import { AllTheProviders } from "./../src/AllTheProviders";
import "@testing-library/jest-dom/vitest";
import "@testing-library/jest-dom";
import { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { afterEach, beforeAll, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

const mockSupabase = {
  auth: {
    signUp: vi.fn(),
    getUser: vi.fn(),
    signOut: vi.fn(),
    signInWithPassword: vi.fn(),
    signInWithOAuth: vi.fn(),
    updateUser: vi.fn(),
  },
  functions: {
    invoke: vi.fn(),
  },
  from: vi.fn(() => ({
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
      })),
    })),
  })),
  storage: {
    from: vi.fn(() => ({
      list: vi.fn(() => ({
        data: [],
        error: null,
      })),
      getPublicUrl: vi.fn(() => ({
        data: { publicUrl: null },
      })),
    })),
  },
};

vi.mock("@/lib/supabaseClient", () => ({
  supabase: mockSupabase,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: vi.fn() },
  }),
}));

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";
export { customRender as render, mockSupabase };
