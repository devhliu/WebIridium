import { useState } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import NumericProperty from "../property-list/NumericProperty";
import userEvent from "@testing-library/user-event";
import BooleanProperty from "../property-list/BooleanProperty";
import StringProperty from "../property-list/StringProperty";

describe("NumericProperty", () => {
  it("should not accept numbers", async () => {
    const onChange = vi.fn();
    render(<NumericProperty name="test" value={5} onChange={onChange} />);

    const input = screen.getByLabelText("test");
    await userEvent.clear(input);
    await userEvent.keyboard("12345");
    input.blur();
    expect(onChange).toBeCalledWith(12345);
  });

  it("should not accept non-numbers", async () => {
    const onChange = vi.fn();
    render(<NumericProperty name="test" value={5} onChange={onChange} />);

    const input = screen.getByLabelText("test");
    await userEvent.clear(input);
    await userEvent.keyboard("abcdefg");
    input.blur();
    expect(onChange).not.toBeCalled();
  });

  it("should work with a validator", async () => {
    const onChange = vi.fn();
    render(
      <NumericProperty
        name="test"
        value={5}
        onChange={onChange}
        validator={(newValue) => newValue === 100}
      />,
    );

    const input = screen.getByLabelText("test");
    await userEvent.clear(input);
    await userEvent.keyboard("999");
    input.blur();
    expect(onChange).not.toBeCalled();

    await userEvent.clear(input);
    await userEvent.keyboard("100");
    input.blur();
    expect(onChange).toBeCalledWith(100);
  });
});

describe("BooleanProperty", () => {
  it("should be toggleable", async () => {
    const onChange = vi.fn();
    render(<BooleanProperty name="test" value={false} onChange={onChange} />);

    const checkbox = screen.getByRole("checkbox");
    await userEvent.click(checkbox);
    expect(onChange).toBeCalledWith(true);
  });
});

describe("StringProperty", () => {
  const StringPropertyContainer = ({
    onChange,
  }: {
    onChange: (value: string) => void;
  }) => {
    const [value, setValue] = useState("hello");
    return (
      <StringProperty
        name="test"
        value={value}
        onChange={(newValue) => {
          setValue(newValue);
          onChange(newValue);
        }}
      />
    );
  };

  it("should be editable", async () => {
    const onChange = vi.fn();
    render(<StringPropertyContainer onChange={onChange} />);

    const input = screen.getByLabelText("test");
    await userEvent.clear(input);
    await userEvent.keyboard("hello world");
    input.blur();
    expect(onChange).toHaveBeenCalledWith("hello world");
  });
});
