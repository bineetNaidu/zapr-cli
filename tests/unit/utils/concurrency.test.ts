import { describe, expect, it } from 'vitest';
import { concurrentMap } from '../../../src/utils/concurrency.js';

describe('concurrentMap', () => {
  it('executes mapper functions and respects concurrency limits', async () => {
    const items = [10, 20, 30, 40, 50];
    let activeWorkers = 0;
    let maxActiveWorkers = 0;

    const results = await concurrentMap(items, 2, async (item) => {
      activeWorkers++;
      maxActiveWorkers = Math.max(maxActiveWorkers, activeWorkers);
      await new Promise((res) => setTimeout(res, 10));
      activeWorkers--;
      return item * 2;
    });

    expect(results).toEqual([20, 40, 60, 80, 100]);
    expect(maxActiveWorkers).toBeLessThanOrEqual(2);
  });
});
