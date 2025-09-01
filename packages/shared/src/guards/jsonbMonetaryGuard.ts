/* Guard to prevent monetary or status fields in metadata JSONB payloads */
type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

const FORBIDDEN_KEYS = new Set([
  "subtotal",
  "taxTotal",
  "grandTotal",
  "unitPrice",
  "discount",
  "currency",
  "status",
  "totals",
  "amount",
  "price"
]);

export interface GuardViolation {
  path: string;
  key: string;
  message: string;
}

export function assertNoMonetaryInMetadata(metadata: Json, basePath = "metadata"): GuardViolation[] {
  const violations: GuardViolation[] = [];
  walk(metadata, basePath, (path, key) => {
    if (FORBIDDEN_KEYS.has(key)) {
      violations.push({
        path: `${path}.${key}`,
        key,
        message: `Forbidden monetary or status field in metadata at ${path}.${key}`
      });
    }
  });
  return violations;
}

function walk(node: Json, path: string, onKey: (path: string, key: string) => void) {
  if (node && typeof node === "object" && !Array.isArray(node)) {
    for (const [k, v] of Object.entries(node)) {
      onKey(path, k);
      walk(v as Json, `${path}.${k}`, onKey);
    }
  } else if (Array.isArray(node)) {
    node.forEach((v, i) => walk(v as Json, `${path}[${i}]`, onKey));
  }
}

/* Convenience helper for HTTP layers */
export function throwIfMonetaryInMetadata(metadata: Json): void {
  const v = assertNoMonetaryInMetadata(metadata);
  if (v.length > 0) {
    const details = v.map(x => x.message).join("; ");
    const err: any = new Error(details);
    err.statusCode = 400;
    err.code = "JSONB_MONETARY_FORBIDDEN";
    err.details = v;
    throw err;
  }
}
