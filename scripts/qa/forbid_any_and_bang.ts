#!/usr/bin/env node
/**
 * QA Script: Forbid Any and Bang
 * Fails CI when it finds ": any" or "!" non-null assertions outside test helpers
 */

import globby from "globby";
import { readFile } from "node:fs/promises";

const GLOB = ["apps/**/*.{ts,tsx}", "packages/**/*.{ts,tsx}"]
const ALLOW = [/\.test\.ts$/, /tests\//, /^scripts\//, /^infra\//]
const ANY_RE = /:\s*any\b/
const BANG_RE = /!([\.\)\]\}])/  // a!., a!), a!], a!}

;(async () => {
  const files = await globby(GLOB, { gitignore: true })
  const offenders: { file: string; line: number; kind: "any" | "bang"; text: string }[] = []
  
  for (const file of files) {
    if (ALLOW.some(rx => rx.test(file))) continue
    
    const text = await readFile(file, "utf8")
    const lines = text.split(/\r?\n/)
    
    lines.forEach((ln: string, i: number) => {
      if (ANY_RE.test(ln)) offenders.push({ file, line: i + 1, kind: "any", text: ln.trim() })
      if (BANG_RE.test(ln)) offenders.push({ file, line: i + 1, kind: "bang", text: ln.trim() })
    })
  }
  
  if (offenders.length) {
    console.error("QA forbid check failed")
    offenders.slice(0, 50).forEach(o => {
      console.error(`[${o.kind}] ${o.file}:${o.line} ${o.text}`)
    })
    console.error(`Total offenders ${offenders.length}`)
    process.exit(1)
  } else {
    console.log("QA forbid check passed")
  }
})().catch(e => { console.error(e); process.exit(1) })
