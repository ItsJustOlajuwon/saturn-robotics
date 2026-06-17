import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  LandingScreen,
  SignupScreen,
  LoginScreen,
  OnboardingScreen,
  RecommendationsScreen,
  CourseAddCard,
  DashboardScreen,
  Completion,
} from "../App";
import { ALL_COURSES } from "../data/courses";
import { ONBOARDING_QUESTIONS } from "../data/onboarding";

/* ============================================================
   LandingScreen
   ============================================================ */

describe("LandingScreen", () => {
  it("renders the SATURN brand name", () => {
    render(<LandingScreen onSignup={vi.fn()} onLogin={vi.fn()} />);
    expect(screen.getByText("SATURN")).toBeInTheDocument();
  });

  it("renders the headline", () => {
    render(<LandingScreen onSignup={vi.fn()} onLogin={vi.fn()} />);
    expect(screen.getByText(/Learn robotics/i)).toBeInTheDocument();
  });

  it("calls onSignup when Get Started button is clicked", () => {
    const onSignup = vi.fn();
    render(<LandingScreen onSignup={onSignup} onLogin={vi.fn()} />);
    const btn = screen.getByText(/Get Started/i);
    fireEvent.click(btn);
    expect(onSignup).toHaveBeenCalledTimes(1);
  });

  it("calls onLogin when Log In button is clicked", () => {
    const onLogin = vi.fn();
    render(<LandingScreen onSignup={vi.fn()} onLogin={onLogin} />);
    const btn = screen.getByText(/Log [Ii]n/i);
    fireEvent.click(btn);
    expect(onLogin).toHaveBeenCalledTimes(1);
  });
});

/* ============================================================
   SignupScreen
   ============================================================ */

describe("SignupScreen", () => {
  it("renders the sign-up heading", () => {
    render(<SignupScreen onSubmit={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByText(/Create your account/i)).toBeInTheDocument();
  });

  it("shows an error if name is empty on submit", async () => {
    render(<SignupScreen onSubmit={vi.fn()} onBack={vi.fn()} />);
    fireEvent.click(screen.getByText(/Create account/i));
    expect(screen.getByText(/What should we call you/i)).toBeInTheDocument();
  });

  it("shows an error if email is invalid on submit", async () => {
    const user = userEvent.setup();
    render(<SignupScreen onSubmit={vi.fn()} onBack={vi.fn()} />);
    const nameInput = screen.getByPlaceholderText(/Alex/i);
    await user.type(nameInput, "Test User");
    fireEvent.click(screen.getByText(/Create account/i));
    expect(screen.getByText(/Enter a valid email/i)).toBeInTheDocument();
  });

  it("calls onSubmit with name and email when form is valid", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<SignupScreen onSubmit={onSubmit} onBack={vi.fn()} />);
    await user.type(screen.getByPlaceholderText(/Alex/i), "Test User");
    await user.type(screen.getByPlaceholderText(/you@example/i), "test@example.com");
    fireEvent.click(screen.getByText(/Create account/i));
    expect(onSubmit).toHaveBeenCalledWith({ name: "Test User", email: "test@example.com" });
  });

  it("calls onBack when back button is clicked", () => {
    const onBack = vi.fn();
    render(<SignupScreen onSubmit={vi.fn()} onBack={onBack} />);
    fireEvent.click(screen.getByText("← Back"));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("clears error when user starts typing", async () => {
    const user = userEvent.setup();
    render(<SignupScreen onSubmit={vi.fn()} onBack={vi.fn()} />);
    fireEvent.click(screen.getByText(/Create account/i));
    expect(screen.getByText(/What should we call you/i)).toBeInTheDocument();
    await user.type(screen.getByPlaceholderText(/Alex/i), "A");
    expect(screen.queryByText(/What should we call you/i)).not.toBeInTheDocument();
  });
});

/* ============================================================
   LoginScreen
   ============================================================ */

describe("LoginScreen", () => {
  it("renders the welcome back heading", () => {
    render(<LoginScreen onSubmit={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
  });

  it("calls onSubmit with user data when Log in button is clicked", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<LoginScreen onSubmit={onSubmit} onBack={vi.fn()} />);
    await user.type(screen.getByPlaceholderText(/your@email/i), "john@example.com");
    fireEvent.click(screen.getByText(/Log in →/i));
    expect(onSubmit).toHaveBeenCalledWith({ name: "john", email: "john@example.com" });
  });

  it("does not call onSubmit when email is empty", () => {
    const onSubmit = vi.fn();
    render(<LoginScreen onSubmit={onSubmit} onBack={vi.fn()} />);
    fireEvent.click(screen.getByText(/Log in →/i));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("calls onBack when back button is clicked", () => {
    const onBack = vi.fn();
    render(<LoginScreen onSubmit={vi.fn()} onBack={onBack} />);
    fireEvent.click(screen.getByText("← Back"));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});

/* ============================================================
   OnboardingScreen
   ============================================================ */

describe("OnboardingScreen", () => {
  it("renders the current question", () => {
    render(
      <OnboardingScreen
        questions={ONBOARDING_QUESTIONS}
        step={0}
        onAnswer={vi.fn()}
        userName="Alex"
      />
    );
    expect(screen.getByText(ONBOARDING_QUESTIONS[0].question)).toBeInTheDocument();
  });

  it("displays all options for the current question", () => {
    render(
      <OnboardingScreen
        questions={ONBOARDING_QUESTIONS}
        step={0}
        onAnswer={vi.fn()}
        userName="Alex"
      />
    );
    ONBOARDING_QUESTIONS[0].options.forEach((opt) => {
      expect(screen.getByText(opt.label)).toBeInTheDocument();
    });
  });

  it("shows the progress indicator", () => {
    render(
      <OnboardingScreen
        questions={ONBOARDING_QUESTIONS}
        step={1}
        onAnswer={vi.fn()}
        userName="Alex"
      />
    );
    expect(screen.getByText(/Question 2 of 4/i)).toBeInTheDocument();
  });

  it("greets user on the first step", () => {
    render(
      <OnboardingScreen
        questions={ONBOARDING_QUESTIONS}
        step={0}
        onAnswer={vi.fn()}
        userName="Alex"
      />
    );
    expect(screen.getByText(/Hey Alex/i)).toBeInTheDocument();
  });

  it("calls onAnswer with question id and selected value", () => {
    const onAnswer = vi.fn();
    render(
      <OnboardingScreen
        questions={ONBOARDING_QUESTIONS}
        step={0}
        onAnswer={onAnswer}
        userName="Alex"
      />
    );
    fireEvent.click(screen.getByText(ONBOARDING_QUESTIONS[0].options[1].label));
    expect(onAnswer).toHaveBeenCalledWith("experience", "some");
  });
});

/* ============================================================
   CourseAddCard
   ============================================================ */

describe("CourseAddCard", () => {
  const course = ALL_COURSES[0]; // arduino

  it("renders the course title and description", () => {
    render(
      <CourseAddCard course={course} added={false} onAdd={vi.fn()} onRemove={vi.fn()} />
    );
    expect(screen.getByText(course.title)).toBeInTheDocument();
    expect(screen.getByText(course.desc)).toBeInTheDocument();
  });

  it("shows + button when not added", () => {
    render(
      <CourseAddCard course={course} added={false} onAdd={vi.fn()} onRemove={vi.fn()} />
    );
    expect(screen.getByText("+")).toBeInTheDocument();
  });

  it("shows checkmark when added", () => {
    render(
      <CourseAddCard course={course} added={true} onAdd={vi.fn()} onRemove={vi.fn()} />
    );
    expect(screen.getByText("✓")).toBeInTheDocument();
  });

  it("calls onAdd when clicking + button", () => {
    const onAdd = vi.fn();
    render(
      <CourseAddCard course={course} added={false} onAdd={onAdd} onRemove={vi.fn()} />
    );
    fireEvent.click(screen.getByText("+"));
    expect(onAdd).toHaveBeenCalledWith(course.id);
  });

  it("calls onRemove when clicking checkmark button", () => {
    const onRemove = vi.fn();
    render(
      <CourseAddCard course={course} added={true} onAdd={vi.fn()} onRemove={onRemove} />
    );
    fireEvent.click(screen.getByText("✓"));
    expect(onRemove).toHaveBeenCalledWith(course.id);
  });

  it("shows 'Recommended' badge when recommended prop is set", () => {
    render(
      <CourseAddCard course={course} added={false} onAdd={vi.fn()} onRemove={vi.fn()} recommended />
    );
    expect(screen.getByText("Recommended")).toBeInTheDocument();
  });

  it("does not show 'Recommended' badge when recommended prop is absent", () => {
    render(
      <CourseAddCard course={course} added={false} onAdd={vi.fn()} onRemove={vi.fn()} />
    );
    expect(screen.queryByText("Recommended")).not.toBeInTheDocument();
  });
});

/* ============================================================
   RecommendationsScreen
   ============================================================ */

describe("RecommendationsScreen", () => {
  it("renders the heading", () => {
    render(
      <RecommendationsScreen
        recommendations={["arduino"]}
        allCourses={ALL_COURSES}
        addedCourses={[]}
        onAdd={vi.fn()}
        onRemove={vi.fn()}
        onDone={vi.fn()}
      />
    );
    expect(screen.getByText(/Here's your path/i)).toBeInTheDocument();
  });

  it("renders recommended courses", () => {
    render(
      <RecommendationsScreen
        recommendations={["arduino", "esp32"]}
        allCourses={ALL_COURSES}
        addedCourses={[]}
        onAdd={vi.fn()}
        onRemove={vi.fn()}
        onDone={vi.fn()}
      />
    );
    expect(screen.getByText("Arduino Basics")).toBeInTheDocument();
    expect(screen.getByText("ESP32")).toBeInTheDocument();
  });

  it("disables 'done' button when no courses are added", () => {
    render(
      <RecommendationsScreen
        recommendations={["arduino"]}
        allCourses={ALL_COURSES}
        addedCourses={[]}
        onAdd={vi.fn()}
        onRemove={vi.fn()}
        onDone={vi.fn()}
      />
    );
    expect(screen.getByText(/Add at least one course/i)).toBeDisabled();
  });

  it("enables done button and shows course count when courses are added", () => {
    render(
      <RecommendationsScreen
        recommendations={["arduino"]}
        allCourses={ALL_COURSES}
        addedCourses={["arduino"]}
        onAdd={vi.fn()}
        onRemove={vi.fn()}
        onDone={vi.fn()}
      />
    );
    expect(screen.getByText(/Start learning with 1 course →/i)).not.toBeDisabled();
  });

  it("calls onDone when done button is clicked", () => {
    const onDone = vi.fn();
    render(
      <RecommendationsScreen
        recommendations={["arduino"]}
        allCourses={ALL_COURSES}
        addedCourses={["arduino"]}
        onAdd={vi.fn()}
        onRemove={vi.fn()}
        onDone={onDone}
      />
    );
    fireEvent.click(screen.getByText(/Start learning/i));
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});

/* ============================================================
   DashboardScreen
   ============================================================ */

describe("DashboardScreen", () => {
  const defaultProps = {
    user: { name: "Alex Test", email: "alex@test.com" },
    addedCourses: ["arduino"],
    allCourses: ALL_COURSES,
    onOpenCourse: vi.fn(),
    onAddCourse: vi.fn(),
    onRemoveCourse: vi.fn(),
    onLogout: vi.fn(),
  };

  it("renders the user greeting", () => {
    render(<DashboardScreen {...defaultProps} />);
    expect(screen.getByText(/Hey Alex/i)).toBeInTheDocument();
  });

  it("renders the user initial avatar", () => {
    render(<DashboardScreen {...defaultProps} />);
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("renders MY COURSES label when courses exist", () => {
    render(<DashboardScreen {...defaultProps} />);
    expect(screen.getByText("MY COURSES")).toBeInTheDocument();
  });

  it("shows empty state when no courses", () => {
    render(<DashboardScreen {...defaultProps} addedCourses={[]} />);
    expect(screen.getByText(/No courses yet/i)).toBeInTheDocument();
  });

  it("calls onOpenCourse when a course tile is clicked", () => {
    const onOpenCourse = vi.fn();
    render(<DashboardScreen {...defaultProps} onOpenCourse={onOpenCourse} />);
    fireEvent.click(screen.getByText("Arduino Basics"));
    expect(onOpenCourse).toHaveBeenCalledWith("arduino");
  });

  it("calls onLogout when Log out is clicked", () => {
    const onLogout = vi.fn();
    render(<DashboardScreen {...defaultProps} onLogout={onLogout} />);
    fireEvent.click(screen.getByText(/Log out/i));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it("shows pick up where you left off text when courses exist", () => {
    render(<DashboardScreen {...defaultProps} />);
    expect(screen.getByText(/Pick up where you left off/i)).toBeInTheDocument();
  });

  it("shows add course prompt when no courses", () => {
    render(<DashboardScreen {...defaultProps} addedCourses={[]} />);
    expect(screen.getByText(/Add a course below to get started/i)).toBeInTheDocument();
  });
});

/* ============================================================
   Completion
   ============================================================ */

describe("Completion", () => {
  it("renders the completion message", () => {
    render(<Completion goPath={vi.fn()} goNext={vi.fn()} hasNext={false} />);
    expect(screen.getByText("YOU DID IT!")).toBeInTheDocument();
    expect(screen.getByText("Lesson complete")).toBeInTheDocument();
  });

  it("shows Next Lesson button when hasNext is true", () => {
    render(<Completion goPath={vi.fn()} goNext={vi.fn()} hasNext={true} />);
    expect(screen.getByText(/Next Lesson/i)).toBeInTheDocument();
  });

  it("hides Next Lesson button when hasNext is false", () => {
    render(<Completion goPath={vi.fn()} goNext={vi.fn()} hasNext={false} />);
    expect(screen.queryByText(/Next Lesson/i)).not.toBeInTheDocument();
  });

  it("always shows Back to Course button", () => {
    render(<Completion goPath={vi.fn()} goNext={vi.fn()} hasNext={false} />);
    expect(screen.getByText("Back to Course")).toBeInTheDocument();
  });

  it("calls goNext when Next Lesson is clicked", () => {
    const goNext = vi.fn();
    render(<Completion goPath={vi.fn()} goNext={goNext} hasNext={true} />);
    fireEvent.click(screen.getByText(/Next Lesson/i));
    expect(goNext).toHaveBeenCalledTimes(1);
  });

  it("calls goPath when Back to Course is clicked", () => {
    const goPath = vi.fn();
    render(<Completion goPath={goPath} goNext={vi.fn()} hasNext={false} />);
    fireEvent.click(screen.getByText("Back to Course"));
    expect(goPath).toHaveBeenCalledTimes(1);
  });
});
