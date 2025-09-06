/**
 * bcrypt compatibility shim using argon2
 * Provides the same API as bcrypt but uses argon2 for better security
 */
export declare function hash(data: string, _saltRounds?: number): Promise<string>;
export declare function compare(data: string, encrypted: string): Promise<boolean>;
declare const _default: {
    hash: typeof hash;
    compare: typeof compare;
};
export default _default;
//# sourceMappingURL=bcrypt-compat.d.ts.map