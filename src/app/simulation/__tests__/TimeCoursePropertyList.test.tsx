import { it, expect } from "vitest";
import TimeCoursePropertyList from "../TimeCoursePropertyList";
import { type EditableTimeCourseParameters } from "@/globals/settings";
import { useState } from "react";
import { render, screen } from "@testing-library/react";
import { typeIntoNumberInput } from "@/testing-utils/inputUtils";

const DEFAULT_PARAMETERS = {
  startTime: 0,
  endTime: 5,
  numberOfPoints: 10,
};

const ListContainer = () => {
  const [parameters, setParameters] =
    useState<EditableTimeCourseParameters>(DEFAULT_PARAMETERS);

  return (
    <TimeCoursePropertyList
      parameters={parameters}
      onParameterChange={setParameters}
    />
  );
};

it("should update parameters", async () => {
  render(<ListContainer />);

  const startTimeInput = screen.getByLabelText("Start Time");
  await typeIntoNumberInput(startTimeInput, 1);
  expect(startTimeInput).toHaveValue(1);

  const endTimeInput = screen.getByLabelText("End Time");
  await typeIntoNumberInput(endTimeInput, 10);
  expect(endTimeInput).toHaveValue(10);

  const numberPointsInput = screen.getByLabelText("Number of Points");
  await typeIntoNumberInput(numberPointsInput, 1000);
  expect(numberPointsInput).toHaveValue(1000);
});

it("should not let you have a start time less than 0", async () => {
  render(<ListContainer />);

  const startTimeInput = screen.getByLabelText("Start Time");
  await typeIntoNumberInput(startTimeInput, -10);
  expect(startTimeInput).toHaveValue(DEFAULT_PARAMETERS.startTime);
});

it("should not let you have a end time less than 0", async () => {
  render(<ListContainer />);

  const endTimeInput = screen.getByLabelText("End Time");
  await typeIntoNumberInput(endTimeInput, -10);
  expect(endTimeInput).toHaveValue(DEFAULT_PARAMETERS.endTime);
});

it("should not let you have start time after end time", async () => {
  render(<ListContainer />);

  const startTimeInput = screen.getByLabelText("Start Time");
  await typeIntoNumberInput(startTimeInput, 100);
  expect(startTimeInput).toHaveValue(DEFAULT_PARAMETERS.startTime);

  await typeIntoNumberInput(startTimeInput, DEFAULT_PARAMETERS.endTime);
  expect(startTimeInput).toHaveValue(DEFAULT_PARAMETERS.startTime);
});

it("should not let you have end time before start time", async () => {
  render(<ListContainer />);

  const startTimeInput = screen.getByLabelText("Start Time");
  await typeIntoNumberInput(startTimeInput, 3);
  expect(startTimeInput).toHaveValue(3);

  const endTimeInput = screen.getByLabelText("End Time");
  await typeIntoNumberInput(endTimeInput, 3);
  expect(endTimeInput).toHaveValue(DEFAULT_PARAMETERS.endTime);

  await typeIntoNumberInput(endTimeInput, 1);
  expect(endTimeInput).toHaveValue(DEFAULT_PARAMETERS.endTime);
});

it("should not let you have number of points or end time too big", async () => {
  render(<ListContainer />);

  const endTimeInput = screen.getByLabelText("End Time");
  await typeIntoNumberInput(endTimeInput, 10000000000000);
  expect(endTimeInput).toHaveValue(DEFAULT_PARAMETERS.endTime);

  const numberPointsInput = screen.getByLabelText("Number of Points");
  await typeIntoNumberInput(numberPointsInput, 100000000000000);
  expect(numberPointsInput).toHaveValue(DEFAULT_PARAMETERS.numberOfPoints);
});

it("should not let you have non-integer number of points", async () => {
  render(<ListContainer />);

  const numberPointsInput = screen.getByLabelText("Number of Points");
  await typeIntoNumberInput(numberPointsInput, 10.5);
  expect(numberPointsInput).toHaveValue(DEFAULT_PARAMETERS.numberOfPoints);
});
