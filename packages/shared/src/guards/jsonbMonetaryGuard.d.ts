type Json = null | boolean | number | string | Json[] | {
    [k: string]: Json;
};
export interface GuardViolation {
    path: string;
    key: string;
    message: string;
}
export declare function assertNoMonetaryInMetadata(metadata: Json, basePath?: string): GuardViolation[];
export declare function throwIfMonetaryInMetadata(metadata: Json): void;
export {};
//# sourceMappingURL=jsonbMonetaryGuard.d.ts.map