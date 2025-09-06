#!/usr/bin/env node
"use strict";
/**
 * QA Script: Forbid Any and Bang
 * Fails CI when it finds ": any" or "!" non-null assertions outside test helpers
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const globby_1 = __importDefault(require("globby"));
const promises_1 = require("node:fs/promises");
const GLOB = ["apps/**/*.{ts,tsx}", "packages/**/*.{ts,tsx}"];
const ALLOW = [/\.test\.ts$/, /tests\//, /^scripts\//, /^infra\//];
const ANY_RE = /:\s*any\b/;
const BANG_RE = /!([\.\)\]\}])/ // a!., a!), a!], a!}
;
(async () => {
    const files = await (0, globby_1.default)(GLOB, { gitignore: true });
    const offenders = [];
    for (const file of files) {
        if (ALLOW.some(rx => rx.test(file)))
            continue;
        const text = await (0, promises_1.readFile)(file, "utf8");
        const lines = text.split(/\r?\n/);
        lines.forEach((ln, i) => {
            if (ANY_RE.test(ln))
                offenders.push({ file, line: i + 1, kind: "any", text: ln.trim() });
            if (BANG_RE.test(ln))
                offenders.push({ file, line: i + 1, kind: "bang", text: ln.trim() });
        });
    }
    if (offenders.length) {
        console.error("QA forbid check failed");
        offenders.slice(0, 50).forEach(o => {
            console.error(`[${o.kind}] ${o.file}:${o.line} ${o.text}`);
        });
        console.error(`Total offenders ${offenders.length}`);
        process.exit(1);
    }
    else {
        console.log("QA forbid check passed");
    }
})().catch(e => { console.error(e); process.exit(1); });
//# sourceMappingURL=forbid_any_and_bang.js.map