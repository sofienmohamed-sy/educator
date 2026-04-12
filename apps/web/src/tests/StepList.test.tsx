import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import StepList, { type Solution } from "../components/StepList";

const sample: Solution = {
  restatement: "Solve 2x + 3 = 11",
  assumptions: [],
  steps: [
    {
      title: "Isolate the x term",
      expression: "2x = 8",
      explanation: "Subtract 3 from both sides to keep the equation balanced.",
    },
    {
      title: "Solve for x",
      expression: "x = 4",
      explanation: "Divide both sides by 2 (the coefficient of x).",
    },
  ],
  finalAnswer: "x = 4",
  verification: "2(4)+3 = 11 ✓",
};

describe("<StepList>", () => {
  it("renders all steps and their between-step explanations", () => {
    render(<StepList solution={sample} />);

    expect(screen.getByText(/Solve 2x \+ 3 = 11/)).toBeInTheDocument();
    expect(screen.getByText(/Step 1: Isolate the x term/)).toBeInTheDocument();
    expect(screen.getByText(/Step 2: Solve for x/)).toBeInTheDocument();
    expect(
      screen.getByText(/Subtract 3 from both sides/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Divide both sides by 2/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Final answer/)).toBeInTheDocument();
    expect(screen.getByText(/2\(4\)\+3 = 11 ✓/)).toBeInTheDocument();
  });
});
