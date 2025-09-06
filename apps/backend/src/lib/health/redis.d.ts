export declare function checkRedisHealth(): Promise<{
    status: "error" | "ok";
    message: string;
    timestamp: string;
    latency: number;
}>;
//# sourceMappingURL=redis.d.ts.map