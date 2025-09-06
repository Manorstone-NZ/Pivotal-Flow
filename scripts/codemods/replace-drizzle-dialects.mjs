#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = process.cwd();

function listFiles(dir) {
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const d = stack.pop();
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      // Skip node_modules and build dirs
      if (e.name === "node_modules" || e.name === "dist" || e.name === ".next" || e.name === "build") continue;
      const p = path.join(d, e.name);
      if (e.isDirectory()) stack.push(p);
      else if (/\.(ts|tsx|mts|cts|js|jsx)$/.test(e.name)) out.push(p);
    }
  }
  return out;
}

function pkgHas(dep) {
  try {
    const p = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
    return Boolean((p.dependencies && p.dependencies[dep]) || (p.devDependencies && p.devDependencies[dep]));
  } catch {
    return false;
  }
}

const usePg = pkgHas("pg");
const usePostgresJs = pkgHas("postgres");

const target =
  usePg ? "drizzle-orm/node-postgres" :
  usePostgresJs ? "drizzle-orm/postgres-js" :
  null;

let changes = 0;
const files = listFiles(root);

for (const f of files) {
  let src = fs.readFileSync(f, "utf8");
  let orig = src;

  // Replace mysql and gel dialect subpaths to the chosen Postgres dialect
  if (target) {
    src = src.replaceAll(/from\s+["']drizzle-orm\/mysql2["']/g, `from "${target}"`);
    src = src.replaceAll(/from\s+["']drizzle-orm\/singlestore["']/g, `from "${target}"`);
    src = src.replaceAll(/from\s+["']drizzle-orm\/gel["']/g, `from "${target}"`);
  }

  // Remove direct mysql2 driver imports when present
  src = src.replaceAll(/from\s+["']mysql2\/promise["']/g, 'from "node:fs" /* TODO removed mysql2 promise import */');
  src = src.replaceAll(/from\s+["']mysql2["']/g, 'from "node:fs" /* TODO removed mysql2 import */');

  if (src !== orig) {
    fs.writeFileSync(f, src, "utf8");
    changes += 1;
  }
}

console.log(`Rewrote dialect imports in ${changes} files${target ? " to " + target : ""}`);
if (!target) {
  console.log("Note: No Postgres client detected. If errors persist, install either 'pg' or 'postgres' and re run.");
}
