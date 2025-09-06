/**
 * Export job processor
 * Integrates with existing export logic for background processing
 */
import type { JobProcessor, JobContext } from '../types.js';
/**
 * Export job processor for background report generation
 */
export declare class ExportJobProcessor implements JobProcessor {
    jobType: "export_report";
    /**
     * Process export job
     */
    process(context: JobContext): Promise<void>;
    /**
     * Validate export job payload
     */
    validatePayload(payload: Record<string, any>): boolean;
    /**
     * Simulate processing time
     */
    private simulateProcessing;
}
//# sourceMappingURL=export-job.processor.d.ts.map