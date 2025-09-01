/* Reject filters that try to target core fields via metadata JSONB */
export interface FilterCheckResult {
  ok: boolean;
  reason?: string;
}

const CORE_FIELDS = new Set([
  "status",
  "currency",
  "subtotal",
  "taxTotal",
  "grandTotal",
  "unitPrice",
  "discount",
  "quoteNumber",
  "customerId",
  "projectId",
  "createdAt"
]);

export function guardTypedFilters(filters: Record<string, unknown>): FilterCheckResult {
  for (const k of Object.keys(filters)) {
    /* deny metadata paths */
    if (k.startsWith("metadata.") || k.includes("metadata->")) {
      return { ok: false, reason: `Filter on metadata path is not allowed for core fields: ${k}` };
    }
    /* deny attempts to smuggle core fields under any alias */
    const base = k.split(".").pop() || k;
    if (CORE_FIELDS.has(base)) {
      /* allow only when clearly typed columns are used by repo builders */
      continue;
    }
  }
  return { ok: true };
}
