import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { isDemoReadonly } from "@/lib/demo";

/** Valor al cargar el runner (p. ej. desde `.env`) para restaurar tras cada caso */
const ORIG_DEMO_READONLY = process.env.NEXT_PUBLIC_DEMO_READONLY;

describe("isDemoReadonly", () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_DEMO_READONLY;
  });

  afterEach(() => {
    if (ORIG_DEMO_READONLY === undefined) {
      delete process.env.NEXT_PUBLIC_DEMO_READONLY;
    } else {
      process.env.NEXT_PUBLIC_DEMO_READONLY = ORIG_DEMO_READONLY;
    }
  });

  it("vacío o ausente → no solo lectura", () => {
    expect(isDemoReadonly()).toBe(false);
  });

  it('"1" activa solo lectura', () => {
    process.env.NEXT_PUBLIC_DEMO_READONLY = "1";
    expect(isDemoReadonly()).toBe(true);
  });

  it('"true" en cualquier capitalización activa solo lectura', () => {
    process.env.NEXT_PUBLIC_DEMO_READONLY = "true";
    expect(isDemoReadonly()).toBe(true);
    process.env.NEXT_PUBLIC_DEMO_READONLY = "TRUE";
    expect(isDemoReadonly()).toBe(true);
  });

  it("otros valores (p. ej. false) no activan solo lectura", () => {
    process.env.NEXT_PUBLIC_DEMO_READONLY = "false";
    expect(isDemoReadonly()).toBe(false);
  });
});
