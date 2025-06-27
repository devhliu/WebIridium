import { it, expect, vi } from "vitest";
import { screen, render } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import Select from "../Select";

/**
 * Normal click with userEvent.click does not seem to work, I think because it's
 * not bubbling and the getByText selects the span, not the button.
 */
const bubbleClick = (element: HTMLElement) => {
  fireEvent(
    element,
    new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    }),
  );
};

it("should call onChange with the options value (not display name)", () => {
  const onChange = vi.fn();
  render(
    <Select
      name="hello"
      value="Test!"
      onChange={onChange}
      options={{ test: "Test!", test2: "Test2!", test3: "Test3!" }}
    />,
  );

  const select = screen.getByText("test");
  bubbleClick(select);

  const test3Option = screen.getByText("test3");
  bubbleClick(test3Option);

  expect(onChange).toBeCalledWith("Test3!");
});

it("should display groups", () => {
  render(
    <Select
      name="hello"
      value="test1"
      onChange={vi.fn()}
      groups={{
        group1: { test1: "test1" },
        group2: { test2: "test2", test3: "test3" },
      }}
    />,
  );

  const select = screen.getByText("test1");
  bubbleClick(select);

  expect(screen.getByText("group1")).toBeInTheDocument();
  expect(screen.getByText("group2")).toBeInTheDocument();
  expect(screen.getByText("test2")).toBeInTheDocument();
  expect(screen.getByText("test3")).toBeInTheDocument();
});
