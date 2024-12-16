import { AllTheProviders } from './../src/AllTheProviders';
import '@testing-library/jest-dom/vitest';
import "@testing-library/jest-dom";
import { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { afterEach, beforeAll } from "vitest";
import { cleanup } from "@testing-library/react";

// runs a cleanup after each test case (e.g. clearing jsdom)
beforeAll(() => {
    global.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });
afterEach(() => {
    cleanup();
});

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) => render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };