const escape = (value: string): string =>
  '"' + value.replaceAll('"', '""') + '"';

export const escapeCsvCell = (value: string): string => {
  if (value.includes('"') || value.includes(",") || value.includes("\n")) {
    return escape(value);
  } else {
    return value;
  }
};
