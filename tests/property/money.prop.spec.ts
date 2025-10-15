import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

// Простой пример property-based теста
describe('prop: math properties', () => {
  it('addition is commutative', () => {
    fc.assert(
      fc.property(fc.integer({ min: -1e6, max: 1e6 }), fc.integer({ min: -1e6, max: 1e6 }), (a, b) => {
        expect(a + b).toBe(b + a);
      })
    );
  });
});




