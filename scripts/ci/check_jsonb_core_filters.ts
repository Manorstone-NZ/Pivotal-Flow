/* Static scan for risky JSONB usage in SQL or Prisma raw strings */
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const FORBIDDEN_PATTERNS: RegExp[] = [
  /metadata\s*->>\s*"(subtotal|taxTotal|grandTotal|unitPrice|discount|status)"/i,
  /metadata\s*->\s*'(subtotal|taxTotal|grandTotal|unitPrice|discount|status)'/i,
  /jsonb_extract_path_text\s*\(\s*metadata\s*,\s*'(subtotal|taxTotal|grandTotal|unitPrice|discount|status)'\s*\)/i
];

const FILE_EXT = new Set([".ts", ".tsx", ".sql"]);

let failures: string[] = [];

function scanFile(fp: string) {
  const text = fs.readFileSync(fp, "utf8");
  for (const re of FORBIDDEN_PATTERNS) {
    if (re.test(text)) {
      failures.push(`${fp} matches ${re}`);
    }
  }
}

function walk(dir: string) {
  for (const name of fs.readdirSync(dir)) {
    if (name === "node_modules" || name === "dist" || name.startsWith(".")) continue;
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full);
    else if (FILE_EXT.has(path.extname(name))) scanFile(full);
  }
}

walk(ROOT);

if (failures.length) {
  console.error("Forbidden JSONB usage detected");
  failures.forEach(f => console.error(" - " + f));
  process.exit(1);
} else {
  console.log("JSONB core field check passed");
}
