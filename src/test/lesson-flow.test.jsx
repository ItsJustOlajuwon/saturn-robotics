import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LessonFlow } from "../App";

const lessons = [
  { id: 1, title: "Ardui-What?!" },
  { id: 2, title: "LEDs are EZ" },
  { id: 3, title: "Wired Up" },
];

describe("LessonFlow", () => {
  it("renders LessonArduino for lessonId 1", () => {
    render(
      <LessonFlow
        lessonId={1}
        lessons={lessons}
        finishLesson={vi.fn()}
        goPath={vi.fn()}
        goNext={vi.fn()}
      />
    );
    expect(screen.getByText("Ardui-What?!")).toBeInTheDocument();
  });

  it("renders LessonLED for lessonId 2", () => {
    render(
      <LessonFlow
        lessonId={2}
        lessons={lessons}
        finishLesson={vi.fn()}
        goPath={vi.fn()}
        goNext={vi.fn()}
      />
    );
    expect(screen.getByText("LEDs are EZ")).toBeInTheDocument();
  });

  it("renders LessonWires for lessonId 3", () => {
    render(
      <LessonFlow
        lessonId={3}
        lessons={lessons}
        finishLesson={vi.fn()}
        goPath={vi.fn()}
        goNext={vi.fn()}
      />
    );
    expect(screen.getByText("Wired Up")).toBeInTheDocument();
  });
});
