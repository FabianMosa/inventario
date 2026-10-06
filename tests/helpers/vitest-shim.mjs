import { describe, it, test, beforeEach, afterEach, before, after } from "node:test";
import assert from "node:assert/strict";

const expect = (actual) => {
  const matchers = {
    toBe: (expected) => assert.strictEqual(actual, expected),
    toEqual: (expected) => assert.deepStrictEqual(actual, expected),
    toBeTruthy: () => assert.ok(actual),
    toBeFalsy: () => assert.ok(!actual),
    toBeNull: () => assert.strictEqual(actual, null),
    toBeUndefined: () => assert.strictEqual(actual, undefined),
    toContain: (item) => assert.ok(actual ? actual.includes(item) : false),
    toHaveLength: (len) => assert.strictEqual(actual?.length, len),
    toBeGreaterThanOrEqual: (expected) => assert.ok(actual >= expected),
    toBeInstanceOf: (cls) => assert.ok(actual instanceof cls),
    toMatch: (pattern) => assert.match(String(actual), typeof pattern === "string" ? new RegExp(pattern) : pattern),
    toMatchObject: (subset) => {
      const check = (act, sub) => {
        Object.keys(sub).forEach((k) => {
          const exp = sub[k];
          const act_val = act[k];
          if (typeof exp === "function") {
            assert.ok(exp(act_val));
          } else if (typeof exp === "object" && exp !== null) {
            check(act_val, exp);
          } else {
            assert.strictEqual(act_val, exp);
          }
        });
      };
      check(actual, subset);
    },
    toThrow: (expected) => {
      assert.throws(() => (typeof actual === "function" ? actual() : null), expected);
    },
    toThrowError: (expected) => {
      assert.throws(() => (typeof actual === "function" ? actual() : null), expected);
    },
    not: {
      toBeNull: () => assert.notStrictEqual(actual, null),
      toBe: (expected) => assert.notStrictEqual(actual, expected),
      toEqual: (expected) => assert.notDeepStrictEqual(actual, expected),
    },
    rejects: {
      toThrow: async (expected) => {
        const fn = typeof actual === "function" ? actual : () => actual;
        await assert.rejects(fn, expected);
      },
      toThrowError: async (expected) => {
        const fn = typeof actual === "function" ? actual : () => actual;
        await assert.rejects(fn, expected);
      },
    },
    resolves: {
      toEqual: async (expected) => {
        const res = typeof actual === "function" ? await actual() : await actual;
        assert.deepStrictEqual(res, expected);
      },
    },
  };
  return matchers;
};

expect.any = (constructor) => (val) => {
  if (constructor === Number) return typeof val === "number";
  if (constructor === String) return typeof val === "string";
  if (constructor === Boolean) return typeof val === "boolean";
  return val instanceof constructor;
};

export { describe, it, test, beforeEach, afterEach, before as beforeAll, after as afterAll, expect };
