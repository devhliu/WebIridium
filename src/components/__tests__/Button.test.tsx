import { it, expect, vi } from "vitest";
import { screen, render } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import Button from "../Button";

it("should call onClick", async () => {
  const onClick = vi.fn();
  render(<Button onClick={onClick}>test</Button>);

  const button = screen.getByText("test");
  await userEvent.click(button);

  expect(onClick).toHaveBeenCalledOnce();
});

it("should be able to be disabled", async () => {
  const onClick = vi.fn();
  render(
    <Button onClick={onClick} disabled>
      test
    </Button>,
  );

  const button = screen.getByText("test");
  await userEvent.click(button);

  expect(button).toBeDisabled();
  expect(onClick).not.toHaveBeenCalled();
});
