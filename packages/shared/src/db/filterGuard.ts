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
  "total_amount",
  "tax_amount",
  "discount_amount",
  "unitPrice",
  "discount",
  "quoteNumber",
  "quote_number",
  "customerId",
  "customer_id",
  "projectId",
  "project_id",
  "createdAt",
  "created_at",
  "updatedAt",
  "updated_at",
  "validFrom",
  "valid_from",
  "validUntil",
  "valid_until",
  "createdBy",
  "created_by",
  "approvedBy",
  "approved_by",
  "approvedAt",
  "approved_at",
  "sentAt",
  "sent_at",
  "acceptedAt",
  "accepted_at",
  "expiresAt",
  "expires_at",
  "exchangeRate",
  "exchange_rate",
  "taxRate",
  "tax_rate",
  "discountType",
  "discount_type",
  "discountValue",
  "discount_value"
]);

export function guardTypedFilters(filters: Record<string, unknown>): FilterCheckResult {
  for (const k of Object.keys(filters)) {
    /* check if this is a metadata path */
    if (k.startsWith("metadata.") || k.includes("metadata->")) {
      /* extract the field name from the metadata path */
      let fieldName: string;
      if (k.includes("metadata->")) {
        fieldName = k.split("metadata->")[1];
      } else {
        fieldName = k.split(".").pop() || k;
      }
      /* only reject if the field is a core field */
      if (CORE_FIELDS.has(fieldName)) {
        return { ok: false, reason: `Filter on metadata path is not allowed for core fields: ${k}` };
      }
      /* allow non-core fields in metadata */
      continue;
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
