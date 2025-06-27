import { createMockWorkerMessageHandler, MockWorker } from "./mockWorker";

let internalCount = 0;

export const resetCountingWorkerCount = () => {
  internalCount = 0;
};

/**
 * Counting workers count up, globally, starting at 0.
 */
export const createCountingWorker = (): Worker => {
  const worker = new MockWorker();
  let internalState: number;
  worker.port.addEventListener(
    "message",
    createMockWorkerMessageHandler(worker, (action) => {
      if (action.internalState) {
        internalState = action.internalState as number;
      }

      switch (action.type) {
        case "count":
          return internalCount++;
        case "state":
          return [internalState, action.internalState !== undefined];
      }
    }),
  );
  return worker as unknown as Worker;
};
