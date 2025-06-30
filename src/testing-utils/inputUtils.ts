import userEvent from "@testing-library/user-event";

export const typeIntoNumberInput = async (
  input: HTMLElement,
  number: number,
) => {
  await userEvent.clear(input);
  await userEvent.type(input, number.toString());
  input.blur();
};
