#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const targetFiles = [
  "packages/shared/src/security/password.ts",
  "apps/backend/src/security/password.ts"
].filter(f => fs.existsSync(f));

let touched = 0;
for (const f of targetFiles) {
  let s = fs.readFileSync(f, "utf8");
  const before = s;
  // default import -> namespace import
  s = s.replace(/import\s+argon2\s+from\s+["']argon2["'];?/g, 'import * as argon2 from "argon2";');

  // Common helper signatures if needed
  s = s.replace(/argon2\.verify\(/g, "argon2.verify(").replace(/argon2\.hash\(/g, "argon2.hash(");

  if (s !== before) {
    fs.writeFileSync(f, s, "utf8");
    touched++;
    console.log(`Updated argon2 import in ${f}`);
  }
}
console.log(`Argon2 files updated: ${touched}`);
