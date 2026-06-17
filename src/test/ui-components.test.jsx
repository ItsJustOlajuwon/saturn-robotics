import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

/* ============================================================
   Button component
   ============================================================ */

describe("Button", () => {
  it("renders children text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button")).toHaveTextContent("Click me");
  });

  it("applies default styling classes", () => {
    render(<Button>Styled</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("px-4");
    expect(btn.className).toContain("py-2");
    expect(btn.className).toContain("rounded-xl");
    expect(btn.className).toContain("bg-black");
    expect(btn.className).toContain("text-white");
  });

  it("appends custom className", () => {
    render(<Button className="mt-4">Custom</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("mt-4");
    expect(btn.className).toContain("bg-black");
  });

  it("forwards click handler", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Press</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("forwards extra props like disabled", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("forwards aria attributes", () => {
    render(<Button aria-label="save">Save</Button>);
    expect(screen.getByLabelText("save")).toBeInTheDocument();
  });
});

/* ============================================================
   Card component
   ============================================================ */

describe("Card", () => {
  it("renders children", () => {
    render(<Card><p>Hello</p></Card>);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("applies default styling classes", () => {
    const { container } = render(<Card>Content</Card>);
    const el = container.firstChild;
    expect(el.className).toContain("rounded-2xl");
    expect(el.className).toContain("border");
    expect(el.className).toContain("shadow-sm");
    expect(el.className).toContain("p-6");
    expect(el.className).toContain("bg-white");
  });

  it("appends custom className", () => {
    const { container } = render(<Card className="w-full">Custom</Card>);
    const el = container.firstChild;
    expect(el.className).toContain("w-full");
    expect(el.className).toContain("rounded-2xl");
  });
});

/* ============================================================
   CardContent component
   ============================================================ */

describe("CardContent", () => {
  it("renders children", () => {
    render(<CardContent><span>Inner</span></CardContent>);
    expect(screen.getByText("Inner")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<CardContent className="p-4">Styled</CardContent>);
    expect(container.firstChild.className).toContain("p-4");
  });

  it("renders with empty className by default", () => {
    const { container } = render(<CardContent>Default</CardContent>);
    expect(container.firstChild.className).toBe("");
  });
});
