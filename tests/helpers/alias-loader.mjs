import { pathToFileURL } from "node:url";
import path from "node:path";
import fs from "node:fs";

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "vitest") {
    const shim_path = path.resolve(process.cwd(), "tests/helpers/vitest-shim.mjs");
    return nextResolve(pathToFileURL(shim_path).href, context);
  }
  if (specifier === "next/server") {
    const next_server_path = path.resolve(process.cwd(), "node_modules/next/server.js");
    if (fs.existsSync(next_server_path)) {
      return nextResolve(pathToFileURL(next_server_path).href, context);
    }
  }
  if (specifier.startsWith("@/")) {
    const relative_path = specifier.slice(2);
    let absolute_path = path.resolve(process.cwd(), relative_path);

    if (!fs.existsSync(absolute_path)) {
      if (fs.existsSync(`${absolute_path}.js`)) {
        absolute_path = `${absolute_path}.js`;
      } else if (fs.existsSync(`${absolute_path}.jsx`)) {
        absolute_path = `${absolute_path}.jsx`;
      } else if (fs.existsSync(path.join(absolute_path, "index.js"))) {
        absolute_path = path.join(absolute_path, "index.js");
      }
    }
    return nextResolve(pathToFileURL(absolute_path).href, context);
  }
  return nextResolve(specifier, context);
}
