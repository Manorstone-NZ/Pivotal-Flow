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
export function assertNoMonetaryInMetadata(metadata, basePath = "metadata") {
    const violations = [];
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
function walk(node, path, onKey) {
    if (node && typeof node === "object" && !Array.isArray(node)) {
        for (const [k, v] of Object.entries(node)) {
            onKey(path, k);
            walk(v, `${path}.${k}`, onKey);
        }
    }
    else if (Array.isArray(node)) {
        node.forEach((v, i) => walk(v, `${path}[${i}]`, onKey));
    }
}
/* Convenience helper for HTTP layers */
export function throwIfMonetaryInMetadata(metadata) {
    const v = assertNoMonetaryInMetadata(metadata);
    if (v.length > 0) {
        const details = v.map(x => x.message).join("; ");
        const err = new Error(details);
        err.statusCode = 400;
        err.code = "JSONB_MONETARY_FORBIDDEN";
        err.details = v;
        throw err;
    }
}
//# sourceMappingURL=jsonbMonetaryGuard.js.map