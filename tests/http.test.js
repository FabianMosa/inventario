import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { jsonError, rejectIfDemoReadonly } from "@/lib/http";

const ORIG_DEMO_READONLY = process.env.NEXT_PUBLIC_DEMO_READONLY;

describe("jsonError", () => {
  it("devuelve un NextResponse con status por defecto 400 y body { error }", async () => {
    const res = jsonError("algo falló");
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ error: "algo falló" });
  });

  it("respeta el status custom", async () => {
    const res = jsonError("no autorizado", 403);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body).toEqual({ error: "no autorizado" });
  });

  it("aplica content-type application/json", () => {
    const res = jsonError("x");
    expect(res.headers.get("content-type")).toMatch(/application\/json/);
  });

  it("permite distintos status comunes de la API (404, 409, 413, 500)", async () => {
    for (const code of [404, 409, 413, 500]) {
      const res = jsonError("msg", code);
      expect(res.status).toBe(code);
    }
  });
});

describe("rejectIfDemoReadonly", () => {
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

  it("devuelve null cuando la demo NO está en solo lectura", () => {
    expect(rejectIfDemoReadonly()).toBeNull();
  });

  it('devuelve 403 cuando NEXT_PUBLIC_DEMO_READONLY = "1"', async () => {
    process.env.NEXT_PUBLIC_DEMO_READONLY = "1";
    const res = rejectIfDemoReadonly();
    expect(res).not.toBeNull();
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toMatch(/solo lectura/i);
  });

  it('devuelve 403 también con "true" en distintas capitalizaciones', () => {
    for (const v of ["true", "TRUE", "True"]) {
      process.env.NEXT_PUBLIC_DEMO_READONLY = v;
      const res = rejectIfDemoReadonly();
      expect(res?.status).toBe(403);
    }
  });

  it("no bloquea con valores ambiguos (false, 0, vacío)", () => {
    for (const v of ["false", "0", "", "   "]) {
      process.env.NEXT_PUBLIC_DEMO_READONLY = v;
      expect(rejectIfDemoReadonly()).toBeNull();
    }
  });
});
