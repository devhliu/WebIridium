import { it, expect, vi } from "vitest";
import { screen, render } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import CancellableButton from "../CancellableButton";

it("should render its children and icon", () => {
  render(<CancellableButton icon={<span>hey</span>}>test</CancellableButton>);

  expect(screen.getByText("hey")).toBeInTheDocument();
  expect(screen.getByText("test")).toBeInTheDocument();
});

it("should call click when clicked", async () => {
  const onClick = vi.fn();
  render(
    <CancellableButton icon={<span>hey</span>} onClick={onClick}>
      test
    </CancellableButton>,
  );

  await userEvent.click(screen.getByRole("button"));
  expect(onClick).toBeCalled();
});

it("should not be clickable when loading", async () => {
  const onClick = vi.fn();
  render(
    <CancellableButton
      icon={<span>hey</span>}
      onClick={onClick}
      isLoading={true}
    >
      test
    </CancellableButton>,
  );

  await userEvent.click(screen.getByRole("button"));
  expect(onClick).not.toBeCalled();
});

it("should be cancellable", async () => {
  const onCancel = vi.fn();
  render(
    <CancellableButton
      icon={<span>hey</span>}
      onCancel={onCancel}
      isLoading={true}
      canCancel={true}
    >
      test
    </CancellableButton>,
  );

  const cancelButton = screen
    .getAllByRole("button")
    .find((b) => !(b as HTMLButtonElement).disabled) as
    | HTMLButtonElement
    | undefined;
  expect(cancelButton).toBeTruthy();
  await userEvent.click(cancelButton as HTMLButtonElement);
  expect(onCancel).toBeCalled();
});
