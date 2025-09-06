export declare function checkMetricsHealth(): Promise<{
    status: "ok";
    message: string;
    latency: number;
    timestamp: string;
} | {
    status: "error";
    message: string;
    latency: number;
    timestamp: string;
}>;
//# sourceMappingURL=metrics.d.ts.map