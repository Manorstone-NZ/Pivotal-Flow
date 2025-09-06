#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

function findTsconfigs(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name === ".git" || e.name === "dist" || e.name === "build" || e.name === ".next") continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...findTsconfigs(p));
    else if (e.isFile() && e.name === "tsconfig.json") out.push(p);
  }
  return out;
}

const files = findTsconfigs(process.cwd());
let patched = 0;

for (const f of files) {
  const json = JSON.parse(fs.readFileSync(f, "utf8"));
  json.compilerOptions = json.compilerOptions || {};

  // Ignore library type errors from external deps
  json.compilerOptions.skipLibCheck = true;

  // Ensure iteration helpers for Map and similar downlevel targets
  if (json.compilerOptions.target && /ES2015|ES2016|ES2017/i.test(json.compilerOptions.target)) {
    json.compilerOptions.downlevelIteration = true;
  } else {
    // Safe to enable anyway
    json.compilerOptions.downlevelIteration = true;
  }

  // Make ESM resolution predictable for subpath exports
  if (!json.compilerOptions.module) json.compilerOptions.module = "NodeNext";
  if (!json.compilerOptions.moduleResolution) json.compilerOptions.moduleResolution = "NodeNext";
  json.compilerOptions.resolveJsonModule = true;
  json.compilerOptions.allowSyntheticDefaultImports = true;
  json.compilerOptions.esModuleInterop = true;

  // Ensure modern lib includes iterable
  const lib = new Set(json.compilerOptions.lib || []);
  lib.add("ES2020");
  lib.add("ES2022");
  json.compilerOptions.lib = Array.from(lib);

  fs.writeFileSync(f, JSON.stringify(json, null, 2) + "\n", "utf8");
  patched++;
  console.log(`Patched ${f}`);
}

console.log(`Patched tsconfig files: ${patched}`);
