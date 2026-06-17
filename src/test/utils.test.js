import { describe, it, expect, beforeEach } from "vitest";
import { ls } from "../utils/localStorage";
import { getRecommendations } from "../utils/recommendations";
import { ALL_COURSES } from "../data/courses";
import { ONBOARDING_QUESTIONS } from "../data/onboarding";

/* ============================================================
   ls — safe localStorage wrapper
   ============================================================ */

describe("ls (localStorage wrapper)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("ls.get", () => {
    it("returns the stored value for an existing key", () => {
      localStorage.setItem("foo", "bar");
      expect(ls.get("foo")).toBe("bar");
    });

    it("returns null when key does not exist and no fallback given", () => {
      expect(ls.get("missing")).toBeNull();
    });

    it("returns the provided fallback when key does not exist", () => {
      expect(ls.get("missing", "default")).toBe("default");
    });

    it("returns stored value even when a fallback is provided", () => {
      localStorage.setItem("k", "v");
      expect(ls.get("k", "fallback")).toBe("v");
    });

    it("handles empty string as a valid stored value", () => {
      localStorage.setItem("empty", "");
      expect(ls.get("empty", "fallback")).toBe("");
    });
  });

  describe("ls.set", () => {
    it("stores a value in localStorage", () => {
      ls.set("key", "value");
      expect(localStorage.getItem("key")).toBe("value");
    });

    it("overwrites an existing value", () => {
      ls.set("key", "first");
      ls.set("key", "second");
      expect(localStorage.getItem("key")).toBe("second");
    });
  });

  describe("ls.remove", () => {
    it("removes an existing key from localStorage", () => {
      localStorage.setItem("key", "value");
      ls.remove("key");
      expect(localStorage.getItem("key")).toBeNull();
    });

    it("does not throw when removing a non-existent key", () => {
      expect(() => ls.remove("nope")).not.toThrow();
    });
  });
});

/* ============================================================
   getRecommendations — course recommendation logic
   ============================================================ */

describe("getRecommendations", () => {
  it("recommends arduino for total beginners", () => {
    const result = getRecommendations({ experience: "beginner", goal: "explore", board: "none" });
    expect(result).toContain("arduino");
  });

  it("recommends arduino for 'some' experience", () => {
    const result = getRecommendations({ experience: "some", goal: "explore", board: "none" });
    expect(result).toContain("arduino");
  });

  it("recommends esp32 and motors for arduino-level experience", () => {
    const result = getRecommendations({ experience: "arduino", goal: "explore", board: "none" });
    expect(result).toContain("esp32");
    expect(result).toContain("motors");
  });

  it("recommends teensy for advanced users", () => {
    const result = getRecommendations({ experience: "advanced", goal: "explore", board: "none" });
    expect(result).toContain("teensy");
    expect(result).toContain("esp32");
    expect(result).toContain("motors");
  });

  it("recommends esp32 for IoT goal", () => {
    const result = getRecommendations({ experience: "beginner", goal: "iot", board: "none" });
    expect(result).toContain("esp32");
    expect(result).toContain("arduino");
  });

  it("recommends motors and arduino for robots goal", () => {
    const result = getRecommendations({ experience: "beginner", goal: "robots", board: "none" });
    expect(result).toContain("motors");
    expect(result).toContain("arduino");
  });

  it("recommends motors and arduino for drones goal", () => {
    const result = getRecommendations({ experience: "beginner", goal: "drones", board: "none" });
    expect(result).toContain("motors");
    expect(result).toContain("arduino");
  });

  it("recommends matching course when user already owns a board", () => {
    const result = getRecommendations({ experience: "beginner", goal: "explore", board: "esp32" });
    expect(result).toContain("esp32");
  });

  it("recommends teensy when user owns a teensy", () => {
    const result = getRecommendations({ experience: "beginner", goal: "explore", board: "teensy" });
    expect(result).toContain("teensy");
  });

  it("returns an array with no duplicates", () => {
    const result = getRecommendations({ experience: "beginner", goal: "robots", board: "arduino" });
    const unique = [...new Set(result)];
    expect(result).toEqual(unique);
  });

  it("always includes arduino when board is none", () => {
    const result = getRecommendations({ experience: "advanced", goal: "explore", board: "none" });
    expect(result).toContain("arduino");
  });

  it("handles empty answers gracefully", () => {
    const result = getRecommendations({});
    expect(Array.isArray(result)).toBe(true);
  });
});

/* ============================================================
   ALL_COURSES & ONBOARDING_QUESTIONS data integrity
   ============================================================ */

describe("ALL_COURSES", () => {
  it("contains 4 courses", () => {
    expect(ALL_COURSES).toHaveLength(4);
  });

  it("each course has required fields", () => {
    ALL_COURSES.forEach((c) => {
      expect(c).toHaveProperty("id");
      expect(c).toHaveProperty("title");
      expect(c).toHaveProperty("emoji");
      expect(c).toHaveProperty("bg");
      expect(c).toHaveProperty("accent");
      expect(c).toHaveProperty("tag");
      expect(c).toHaveProperty("desc");
    });
  });

  it("has unique course ids", () => {
    const ids = ALL_COURSES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("ONBOARDING_QUESTIONS", () => {
  it("contains 4 questions", () => {
    expect(ONBOARDING_QUESTIONS).toHaveLength(4);
  });

  it("each question has id, question text, and options", () => {
    ONBOARDING_QUESTIONS.forEach((q) => {
      expect(q).toHaveProperty("id");
      expect(q).toHaveProperty("question");
      expect(q.options.length).toBeGreaterThan(0);
    });
  });

  it("each option has a label and value", () => {
    ONBOARDING_QUESTIONS.forEach((q) => {
      q.options.forEach((opt) => {
        expect(opt).toHaveProperty("label");
        expect(opt).toHaveProperty("value");
      });
    });
  });
});
