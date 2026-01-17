import { expect, it } from "vitest";
import errorToDisplayString from "../errorToDisplayString";

it("should display error message", () => {
  expect(errorToDisplayString(new Error("test"))).toEqual("test");
  expect(errorToDisplayString(new DOMException("test"))).toEqual("test");
});

it("should display strings as is", () => {
  expect(errorToDisplayString("hey")).toEqual("hey");
});

it("should display unknown error for other data types", () => {
  expect(errorToDisplayString({ test: true })).toContain("unknown");
  expect(errorToDisplayString(5)).toContain("unknown");
  expect(errorToDisplayString(false)).toContain("unknown");
});
