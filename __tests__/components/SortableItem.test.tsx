import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SortableItem from "../../src/components/shared/SortableItem";

describe("SortableItem", () => {
  it("renders provided renderItem content", () => {
    render(
      <SortableItem
        id="1"
        data={{ name: "Test" }}
        renderItem={({ data }) => <div>{data.name}</div>}
      />
    );

    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  it("renders drag handle with icon", () => {
    render(
      <SortableItem id="2" data="dummy" renderItem={() => <div>Item</div>} />
    );

    expect(
      screen.getByTitle(/Przeciągnij aby zmienić kolejność/i)
    ).toBeInTheDocument();
  });

  it("applies updating styles when isUpdating is true", () => {
    const { container } = render(
      <SortableItem
        id="3"
        data="dummy"
        isUpdating
        renderItem={() => <div>Item</div>}
      />
    );

    expect(container.firstChild).toHaveClass("opacity-60");
    expect(container.firstChild).toHaveClass("pointer-events-none");
  });
});
