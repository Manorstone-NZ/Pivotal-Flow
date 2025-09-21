# Background Jobs

## Overview

The Background Jobs system provides a simple job runner pattern for exports and long-running tasks with status endpoints for frontend polling. Jobs are stored in the database with typed columns and optional JSONB payloads for non-monetary data.

## Architecture

### Job States
- **queued**: Job is waiting to be processed
- **running**: Job is currently being processed
- **succeeded**: Job completed successfully
- **failed**: Job failed with an error
- **cancelled**: Job was cancelled by user
- **retrying**: Job is being retried after failure

### Job Types
- **export_report**: Export reports in various formats
- **data_processing**: Process large datasets
- **notification**: Send notifications
- **cleanup**: Clean up old data
- **sync**: Synchronize data with external systems

### Job Priorities
- **LOW (0)**: Background tasks
- **NORMAL (5)**: Standard jobs
- **HIGH (10)**: Important jobs
- **URGENT (15)**: Critical jobs

## Database Schema

### Jobs Table
```sql
CREATE TABLE jobs (
    id text PRIMARY KEY,
    organization_id text NOT NULL REFERENCES organizations(id),
    user_id text NOT NULL REFERENCES users(id),
    job_type varchar(50) NOT NULL,
    status varchar(20) NOT NULL DEFAULT 'queued',
    priority integer NOT NULL DEFAULT 0,
    retry_count integer NOT NULL DEFAULT 0,
    max_retries integer NOT NULL DEFAULT 3,
    payload jsonb NOT NULL DEFAULT '{}',
    result jsonb,
    error_message text,
    progress integer NOT NULL DEFAULT 0,
    total_steps integer,
    current_step integer NOT NULL DEFAULT 0,
    started_at timestamp(3),
    completed_at timestamp(3),
    scheduled_at timestamp(3),
    created_at timestamp(3) NOT NULL DEFAULT now(),
    updated_at timestamp(3) NOT NULL DEFAULT now()
);
```

### Key Features
- **Typed columns**: All core data is stored in typed columns
- **JSONB payload**: Non-monetary data stored in JSONB
- **No monetary values**: JSONB payloads never contain monetary data
- **Progress tracking**: Real-time progress updates
- **Retry logic**: Automatic retry with exponential backoff
- **Audit trail**: Full audit logging of job operations

## API Endpoints

### Create Job
```http
POST /v1/jobs
Content-Type: application/json

{
  "jobType": "export_report",
  "payload": {
    "reportType": "quotes",
    "format": "csv",
    "filters": {
      "dateFrom": "2024-01-01",
      "dateTo": "2024-12-31"
    }
  },
  "priority": 5,
  "maxRetries": 3
}
```

### Get Job Status
```http
GET /v1/jobs/{jobId}/status
```

### List Jobs
```http
GET /v1/jobs?page=1&pageSize=25&status=running&jobType=export_report
```

### Cancel Job
```http
POST /v1/jobs/{jobId}/cancel
```

### Retry Job
```http
POST /v1/jobs/{jobId}/retry
```

## Job Processing Sequence

### 1. Job Creation
1. Validate permissions (`jobs.create_jobs`)
2. Validate job type and payload
3. Create job record in database
4. Log audit event
5. Start processing (if not scheduled)

### 2. Job Processing
1. Update status to `running`
2. Get job processor for job type
3. Create job context with progress callbacks
4. Execute processor logic
5. Update progress and steps
6. Handle success/failure

### 3. Job Completion
1. Update status to `succeeded` or `failed`
2. Store result or error message
3. Record metrics
4. Log audit event

### 4. Job Retry (if failed)
1. Check retry count against max retries
2. Reset job state
3. Increment retry count
4. Restart processing

## Retry Policy

### Default Configuration
- **Max Retries**: 3
- **Retry Delay**: 5 seconds
- **Backoff Multiplier**: 2x

### Retry Sequence
1. **First retry**: 5 seconds delay
2. **Second retry**: 10 seconds delay
3. **Third retry**: 20 seconds delay

### Retry Conditions
- Job status is `failed`
- Retry count < max retries
- Job is not cancelled

## Frontend Integration

### Polling Pattern
```javascript
// Start job
const response = await fetch('/v1/jobs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(jobRequest)
});
const { jobId } = await response.json();

// Poll for status
const pollStatus = async () => {
  const statusResponse = await fetch(`/v1/jobs/${jobId}/status`);
  const status = await statusResponse.json();
  
  if (status.job.status === 'succeeded') {
    // Handle success
    console.log('Download URL:', status.job.result.downloadUrl);
  } else if (status.job.status === 'failed') {
    // Handle failure
    console.error('Job failed:', status.job.errorMessage);
  } else {
    // Continue polling
    setTimeout(pollStatus, 2000);
  }
};

pollStatus();
```

### React Hook Example
```javascript
import { useState, useEffect } from 'react';

const useJobStatus = (jobId) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!jobId) return;

    const pollStatus = async () => {
      try {
        const response = await fetch(`/v1/jobs/${jobId}/status`);
        const data = await response.json();
        setStatus(data);
        
        if (data.job.status === 'succeeded' || data.job.status === 'failed') {
          setLoading(false);
        } else {
          setTimeout(pollStatus, 2000);
        }
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    pollStatus();
  }, [jobId]);

  return { status, loading, error };
};
```

## Job Processors

### Export Job Processor
- **Job Type**: `export_report`
- **Payload Validation**: Ensures required fields and valid formats
- **Processing Steps**:
  1. Validate parameters (20%)
  2. Query data (40%)
  3. Process results (60%)
  4. Format output (80%)
  5. Generate file (95%)
  6. Finalize (100%)

### Custom Processors
```typescript
export class CustomJobProcessor implements JobProcessor {
  jobType = 'custom_job';

  async process(context: JobContext): Promise<void> {
    const { payload, updateProgress, updateResult, fail } = context;

    try {
      // Update progress
      await updateProgress(25, 1);
      
      // Process job logic
      const result = await this.processData(payload);
      
      // Update progress
      await updateProgress(75, 2);
      
      // Store result
      await updateResult(result);
      
    } catch (error) {
      await fail(error.message);
    }
  }

  validatePayload(payload: Record<string, any>): boolean {
    // Validate payload
    return true;
  }
}
```

## Monitoring and Metrics

### Job Metrics
- **Job Created**: Count of jobs created by type
- **Job Started**: Count of jobs started processing
- **Job Completed**: Count of jobs completed successfully
- **Job Failed**: Count of jobs that failed
- **Job Retried**: Count of jobs retried

### Performance Monitoring
- **Processing Time**: Duration of job processing
- **Queue Length**: Number of queued jobs
- **Error Rates**: Failure rates by job type
- **Retry Rates**: Retry frequency by job type

## Security Considerations

### Permission Requirements
- **Create Jobs**: `jobs.create_jobs`
- **View Jobs**: `jobs.view_jobs`
- **Cancel Jobs**: `jobs.cancel_jobs`
- **Retry Jobs**: `jobs.retry_jobs`

### Data Isolation
- Jobs are scoped to organization
- Users can only access their own jobs
- Cross-organization access is prevented

### Payload Validation
- All job payloads are validated
- No monetary values in JSONB
- Type checking for required fields

## Best Practices

### Job Design
1. **Keep jobs atomic**: Each job should do one thing well
2. **Use typed columns**: Store core data in typed columns
3. **Validate payloads**: Always validate job payloads
4. **Handle errors gracefully**: Provide meaningful error messages
5. **Update progress frequently**: Keep users informed of progress

### Frontend Integration
1. **Implement polling**: Poll job status for long-running jobs
2. **Show progress**: Display progress bars and step information
3. **Handle errors**: Show error messages and retry options
4. **Provide feedback**: Give users clear feedback on job status

### Monitoring
1. **Track metrics**: Monitor job success/failure rates
2. **Set alerts**: Alert on high failure rates
3. **Log everything**: Log all job operations for debugging
4. **Monitor performance**: Track job processing times

## Troubleshooting

### Common Issues
1. **Job stuck in running**: Check for unhandled exceptions
2. **High retry rates**: Investigate underlying issues
3. **Slow processing**: Check database performance
4. **Permission errors**: Verify user permissions

### Debugging
1. **Check job logs**: Review job error messages
2. **Monitor metrics**: Check job success/failure rates
3. **Review audit logs**: Check job operation history
4. **Test payloads**: Validate job payload structure
