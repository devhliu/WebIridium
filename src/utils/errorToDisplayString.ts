/**
 * Converts an arbitrary error into a string to be read by users.
 */
const errorToDisplayString = (err: unknown): string => {
  if (err instanceof Error) {
    return err.message;
  } else if (err instanceof DOMException) {
    return err.message;
  } else if (typeof err === "string") {
    return err;
  } else {
    return "an unknown error occurred";
  }
};

export default errorToDisplayString;
