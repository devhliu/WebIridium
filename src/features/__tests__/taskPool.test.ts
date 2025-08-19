import { afterEach, it, expect, describe } from "vitest";
import { WorkerPool, TaskTermination } from "../taskPool";
import {
  createCountingWorker,
  resetCountingWorkerCount,
} from "@/testing-utils/countingWorker";
import {
  MockWorker,
  resetWorkerResponseDelay,
  setWorkerResponseDelay,
  resetWorkerFailMode,
  setWorkerFailMode,
} from "@/testing-utils/mockWorker";

describe("WorkerPool", () => {
  afterEach(() => {
    resetCountingWorkerCount();
    resetWorkerResponseDelay();
    resetWorkerFailMode();
  });

  it("should return result of queued task", async () => {
    const pool = new WorkerPool(createCountingWorker);
    const result = await pool.runTask("count", 0, null);
    expect(result).toBe(0);
  });

  it("should return result of sequence of queued task", async () => {
    const pool = new WorkerPool(createCountingWorker);
    const result = await pool.runTask("count", 0, null);
    expect(result).toBe(0);

    const result2 = await pool.runTask("count", 0, null);
    expect(result2).toBe(1);
  });

  it("should return result of multiple queued tasks", async () => {
    const pool = new WorkerPool(createCountingWorker);
    const results = Promise.all([
      pool.runTask("count", 0, null),
      pool.runTask("count", 0, null),
      pool.runTask("count", 0, null),
      pool.runTask("count", 0, null),
      pool.runTask("count", 0, null),
      pool.runTask("count", 0, null),
    ]);

    expect(await results).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it("should terminate tasks and worker", async () => {
    setWorkerResponseDelay(1);

    let worker: MockWorker;
    const pool = new WorkerPool(() => {
      worker = createCountingWorker() as unknown as MockWorker;
      return worker as unknown as Worker;
    });

    const abortController = new AbortController();
    const expectPromise = expect(
      pool.runTask("count", 0, null, abortController.signal),
    ).rejects.toThrowError(new TaskTermination());

    abortController.abort();

    await expectPromise;
    expect(worker!.terminated).toBeTruthy();
  });

  it("should not run terminated tasks", async () => {
    setWorkerResponseDelay(5);

    const pool = new WorkerPool(createCountingWorker, {
      maxWorkers: 1,
    });

    void pool.runTask("count", 0, null);

    // This one should not run
    const abortController = new AbortController();
    const expectPromise = expect(
      pool.runTask("count", 0, null, abortController.signal),
    ).rejects.toThrowError();
    abortController.abort();

    expect(await pool.runTask("count", 0, null)).toBe(1);
    await expectPromise;
  });

  it("should fail with worker termination when abort signal already aborted on task start", async () => {
    const pool = new WorkerPool(createCountingWorker);
    const abortController = new AbortController();
    abortController.abort();

    await expect(() =>
      pool.runTask("count", 0, null, abortController.signal),
    ).rejects.toThrowError(new TaskTermination());
  });

  it("should terminate all workers when only one signal is used", async () => {
    setWorkerResponseDelay(5);

    const abortController = new AbortController();
    const pool = new WorkerPool(createCountingWorker);
    const promises = [
      pool.runTask("count", 0, null, abortController.signal),
      pool.runTask("count", 0, null, abortController.signal),
      pool.runTask("count", 0, null, abortController.signal),
    ];

    abortController.abort();

    expect(await Promise.allSettled(promises)).toSatisfy(
      (results: PromiseSettledResult<unknown>[]) => {
        return results.every((r) => r.status === "rejected");
      },
    );
  });

  it(
    "should return result of 25 queued tasks with randomized delays",
    { timeout: 5000 },
    async () => {
      setWorkerResponseDelay(25, 500);
      const pool = new WorkerPool(createCountingWorker, { maxWorkers: 10 });
      const promises = Array.from({ length: 25 }).map((_) =>
        pool.runTask("count", 0, null),
      );
      const results = Promise.all(promises);
      const expected = Array.from({ length: 25 }).map((_, index) => index);

      expect(await results).toEqual(expected);
    },
  );

  it(
    "should return result of 48 queued tasks with randomized delays with every odd task terminated",
    { timeout: 1000 },
    async () => {
      setWorkerResponseDelay(5, 250);

      const pool = new WorkerPool(createCountingWorker, { maxWorkers: 10 });
      const promises: Promise<unknown>[] = [];
      for (let i = 0; i < 48; i++) {
        const abortController = i % 2 === 0 ? null : new AbortController();
        promises.push(pool.runTask("count", 0, null, abortController?.signal));
        abortController?.abort();
      }

      const r = await Promise.allSettled(promises);
      for (const [i, result] of r.entries()) {
        if (i % 2 === 0) {
          expect(result.status).toEqual("fulfilled");
        } else {
          expect(result.status).toBe("rejected");
        }
      }
    },
  );

  it("should reject when failing", async () => {
    setWorkerFailMode("always");
    const pool = new WorkerPool(createCountingWorker);
    await expect(pool.runTask("count", 0, null)).rejects.toThrow();
  });

  it("should reject when failing with multiple", async () => {
    const pool = new WorkerPool(createCountingWorker, { maxWorkers: 2 });
    setWorkerFailMode("always");
    const promises: Promise<unknown>[] = [
      pool.runTask("count", 0, null),
      pool.runTask("count", 0, null),
      pool.runTask("count", 0, null),
    ];

    const r = await Promise.allSettled(promises);
    for (const result of r) {
      expect(result.status).toBe("rejected");
    }
  });

  it("should only send internal state when required", async () => {
    const pool = new WorkerPool(createCountingWorker);

    let [state, didSendState] = (await pool.runTask("state", 0, 1)) as [
      number,
      boolean,
    ];
    expect(state).toBe(1);
    expect(didSendState).toBe(true);

    [state, didSendState] = (await pool.runTask("state", 0, 1)) as [
      number,
      boolean,
    ];
    expect(state).toBe(1);
    expect(didSendState).toBe(false);
  });
});
