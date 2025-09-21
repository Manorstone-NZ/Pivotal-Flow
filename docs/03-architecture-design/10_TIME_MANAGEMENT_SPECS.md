# Pivotal Flow - Time Management System Specifications

## ⏰ **Time Management Overview**

### **System Purpose**
The Time Management System provides comprehensive time tracking, approval workflows, and analytics for project-based work. It enables accurate time recording, automated approval processes, and detailed reporting for project cost analysis and resource utilization.

### **Key Features**
- Time entry creation and management
- Multi-level approval workflows
- Integration with projects and tasks
- Billable time calculation
- Time reporting and analytics
- Mobile time tracking
- Offline time recording
- Automated time validation

---

## 🏗️ **System Architecture**

### **Core Components**

#### **1. Time Entry Management Engine**
```typescript
interface ITimeEntryManagementEngine {
  // Time entry lifecycle management
  createTimeEntry(timeData: ICreateTimeEntryRequest): Promise<ITimeEntry>;
  updateTimeEntry(timeEntryId: string, updates: IUpdateTimeEntryRequest): Promise<ITimeEntry>;
  deleteTimeEntry(timeEntryId: string): Promise<void>;
  duplicateTimeEntry(timeEntryId: string): Promise<ITimeEntry>;
  
  // Time entry status management
  submitForApproval(timeEntryId: string): Promise<IWorkflowResult>;
  approveTimeEntry(timeEntryId: string, approverId: string): Promise<IWorkflowResult>;
  rejectTimeEntry(timeEntryId: string, approverId: string, reason: string): Promise<IWorkflowResult>;
  returnForRevision(timeEntryId: string, approverId: string, reason: string): Promise<IWorkflowResult>;
  
  // Time entry validation
  validateTimeEntry(timeEntry: ITimeEntry): Promise<IValidationResult>;
  checkTimeConflicts(timeEntry: ITimeEntry): Promise<ITimeConflict[]>;
  validateBillableTime(timeEntry: ITimeEntry): Promise<IBillableValidation>;
}
```

#### **2. Time Approval Engine**
```typescript
interface ITimeApprovalEngine {
  // Approval workflow management
  createApprovalWorkflow(workflowConfig: ITimeApprovalWorkflowConfig): Promise<ITimeApprovalWorkflow>;
  startApprovalWorkflow(timeEntryId: string, workflowId: string): Promise<ITimeApprovalWorkflowInstance>;
  processApproval(workflowInstanceId: string, approverId: string, decision: 'approve' | 'reject' | 'return'): Promise<IWorkflowResult>;
  
  // Approval routing
  getNextApprover(workflowInstanceId: string): Promise<IUser>;
  escalateApproval(workflowInstanceId: string, reason: string): Promise<void>;
  autoApprove(timeEntryId: string): Promise<IWorkflowResult>;
  
  // Approval configuration
  getApprovalWorkflowConfig(organizationId: string): Promise<ITimeApprovalWorkflowConfig>;
  updateApprovalWorkflowConfig(organizationId: string, config: ITimeApprovalWorkflowConfig): Promise<ITimeApprovalWorkflowConfig>;
}
```

#### **3. Time Calculation Engine**
```typescript
interface ITimeCalculationEngine {
  // Time calculations
  calculateBillableHours(timeEntryId: string): Promise<IBillableTimeCalculation>;
  calculateOvertimeHours(userId: string, dateRange: IDateRange): Promise<IOvertimeCalculation>;
  calculateUtilizationRate(userId: string, period: string): Promise<IUtilizationCalculation>;
  
  // Rate calculations
  getApplicableHourlyRate(userId: string, projectId: string, date: Date): Promise<number>;
  calculateTimeEntryCost(timeEntry: ITimeEntry): Promise<ITimeEntryCost>;
  applyTimeModifiers(timeEntry: ITimeEntry, modifiers: ITimeModifier[]): Promise<ITimeEntry>;
  
  // Time validation
  validateTimeEntryDuration(timeEntry: ITimeEntry): Promise<IValidationResult>;
  checkWorkingHours(timeEntry: ITimeEntry): Promise<IWorkingHoursValidation>;
  validateBreakTime(timeEntry: ITimeEntry): Promise<IBreakTimeValidation>;
}
```

---

## 📊 **Data Models**

### **Time Entry Entity**
```typescript
interface ITimeEntry {
  id: string;
  organization_id: string;
  user_id: string;
  project_id: string;
  task_id?: string;
  
  // Time information
  date: Date;
  start_time: Date;
  end_time: Date;
  duration_hours: number;
  break_minutes: number;
  net_hours: number;
  
  // Work details
  description: string;
  activity_type: ActivityType;
  billable: boolean;
  billable_hours: number;
  hourly_rate: number;
  total_cost: number;
  
  // Status and workflow
  status: TimeEntryStatus;
  submitted_at?: Date;
  approved_at?: Date;
  approved_by?: string;
  rejected_at?: Date;
  rejected_by?: string;
  rejection_reason?: string;
  
  // Additional information
  tags: string[];
  notes?: string;
  internal_notes?: string;
  attachments: IAttachment[];
  
  // Metadata
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

enum TimeEntryStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  RETURNED_FOR_REVISION = 'returned_for_revision',
  ARCHIVED = 'archived'
}

enum ActivityType {
  DEVELOPMENT = 'development',
  TESTING = 'testing',
  DESIGN = 'design',
  MEETING = 'meeting',
  RESEARCH = 'research',
  DOCUMENTATION = 'documentation',
  TRAINING = 'training',
  ADMINISTRATION = 'administration',
  TRAVEL = 'travel',
  OTHER = 'other'
}
```

### **Time Approval Workflow Entity**
```typescript
interface ITimeApprovalWorkflow {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  
  // Workflow configuration
  steps: ITimeApprovalStep[];
  auto_approval_threshold?: number;
  escalation_rules?: ITimeApprovalEscalationRule[];
  
  // Configuration
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface ITimeApprovalStep {
  id: string;
  name: string;
  description?: string;
  order: number;
  
  // Approval configuration
  approver_type: TimeApproverType;
  approver_id?: string;
  role_id?: string;
  department_id?: string;
  
  // Business rules
  min_approval_amount?: number;
  max_approval_amount?: number;
  required: boolean;
  can_delegate: boolean;
  
  // Notifications
  notify_on_pending: boolean;
  notify_on_complete: boolean;
  escalation_hours: number;
}

enum TimeApproverType {
  SPECIFIC_USER = 'specific_user',
  ROLE_BASED = 'role_based',
  PROJECT_MANAGER = 'project_manager',
  DEPARTMENT_HEAD = 'department_head',
  ORGANIZATION_ADMIN = 'organization_admin',
  AUTO_APPROVE = 'auto_approve'
}
```

### **Time Entry Conflict Entity**
```typescript
interface ITimeEntryConflict {
  id: string;
  time_entry_id: string;
  conflicting_entry_id: string;
  
  // Conflict details
  conflict_type: TimeConflictType;
  overlap_minutes: number;
  conflict_start: Date;
  conflict_end: Date;
  
  // Resolution
  resolved: boolean;
  resolution_notes?: string;
  resolved_by?: string;
  resolved_at?: Date;
  
  // Metadata
  created_at: Date;
  updated_at: Date;
}

enum TimeConflictType {
  OVERLAP = 'overlap',
  GAP = 'gap',
  BREAK_VIOLATION = 'break_violation',
  WORKING_HOURS_VIOLATION = 'working_hours_violation',
  DUPLICATE = 'duplicate'
}
```

---

## ⏱️ **Time Entry Management**

### **Time Entry Creation & Validation**

#### **1. Time Entry Creation Service**
```typescript
class TimeEntryService {
  async createTimeEntry(timeData: ICreateTimeEntryRequest): Promise<ITimeEntry> {
    try {
      // Validate input data
      const validationResult = await this.validateTimeEntryData(timeData);
      if (!validationResult.isValid) {
        throw new ValidationError('Time entry validation failed', validationResult.errors);
      }

      // Check for time conflicts
      const conflicts = await this.checkTimeConflicts(timeData);
      if (conflicts.length > 0) {
        throw new TimeConflictError('Time entry conflicts detected', conflicts);
      }

      // Calculate derived fields
      const calculatedData = this.calculateTimeEntryFields(timeData);

      // Create time entry
      const timeEntry = this.timeEntryRepository.create({
        ...timeData,
        ...calculatedData,
        status: TimeEntryStatus.DRAFT
      });

      const savedTimeEntry = await this.timeEntryRepository.save(timeEntry);

      // Publish event
      await this.eventBus.publish(new TimeEntryCreatedEvent(savedTimeEntry.id, timeData.user_id));

      this.logger.log('Time entry created successfully', { 
        timeEntryId: savedTimeEntry.id,
        userId: timeData.user_id,
        projectId: timeData.project_id 
      });

      return savedTimeEntry;
    } catch (error) {
      this.logger.error('Failed to create time entry', { error, timeData });
      throw error;
    }
  }

  private async validateTimeEntryData(timeData: ICreateTimeEntryRequest): Promise<IValidationResult> {
    const errors: string[] = [];

    // Required field validation
    if (!timeData.user_id) errors.push('User ID is required');
    if (!timeData.project_id) errors.push('Project ID is required');
    if (!timeData.date) errors.push('Date is required');
    if (!timeData.start_time) errors.push('Start time is required');
    if (!timeData.end_time) errors.push('End time is required');
    if (!timeData.description) errors.push('Description is required');

    // Time validation
    if (timeData.start_time >= timeData.end_time) {
      errors.push('Start time must be before end time');
    }

    // Duration validation
    const durationHours = this.calculateDurationHours(timeData.start_time, timeData.end_time);
    if (durationHours > 24) {
      errors.push('Time entry cannot exceed 24 hours');
    }

    // Date validation
    const entryDate = new Date(timeData.date);
    const today = new Date();
    if (entryDate > today) {
      errors.push('Cannot create time entry for future dates');
    }

    // Project validation
    const project = await this.projectRepository.findById(timeData.project_id);
    if (!project) {
      errors.push('Invalid project ID');
    }

    // User validation
    const user = await this.userRepository.findById(timeData.user_id);
    if (!user) {
      errors.push('Invalid user ID');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private async checkTimeConflicts(timeData: ICreateTimeEntryRequest): Promise<ITimeEntryConflict[]> {
    const conflicts: ITimeEntryConflict[] = [];

    // Get existing time entries for the user on the same date
    const existingEntries = await this.timeEntryRepository.findByUserAndDate(
      timeData.user_id,
      timeData.date
    );

    // Check for overlaps
    existingEntries.forEach(existing => {
      const overlap = this.calculateTimeOverlap(
        timeData.start_time,
        timeData.end_time,
        existing.start_time,
        existing.end_time
      );

      if (overlap > 0) {
        conflicts.push({
          id: generateUUID(),
          time_entry_id: timeData.id || 'new',
          conflicting_entry_id: existing.id,
          conflict_type: TimeConflictType.OVERLAP,
          overlap_minutes: overlap,
          conflict_start: new Date(Math.max(timeData.start_time.getTime(), existing.start_time.getTime())),
          conflict_end: new Date(Math.min(timeData.end_time.getTime(), existing.end_time.getTime())),
          resolved: false,
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    });

    // Check for gaps (optional validation)
    if (timeData.validate_gaps) {
      const gaps = this.findTimeGaps(existingEntries, timeData.start_time, timeData.end_time);
      gaps.forEach(gap => {
        if (gap.duration_minutes > timeData.max_gap_minutes) {
          conflicts.push({
            id: generateUUID(),
            time_entry_id: timeData.id || 'new',
            conflicting_entry_id: 'gap',
            conflict_type: TimeConflictType.GAP,
            overlap_minutes: gap.duration_minutes,
            conflict_start: gap.start_time,
            conflict_end: gap.end_time,
            resolved: false,
            created_at: new Date(),
            updated_at: new Date()
          });
        }
      });
    }

    return conflicts;
  }

  private calculateTimeEntryFields(timeData: ICreateTimeEntryRequest): Partial<ITimeEntry> {
    const startTime = new Date(timeData.start_time);
    const endTime = new Date(timeData.end_time);
    
    // Calculate duration
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    
    // Calculate break time (if specified)
    const breakMinutes = timeData.break_minutes || 0;
    const breakHours = breakMinutes / 60;
    
    // Calculate net hours
    const netHours = Math.max(0, durationHours - breakHours);
    
    // Get hourly rate
    const hourlyRate = this.getHourlyRate(timeData.user_id, timeData.project_id, timeData.date);
    
    // Calculate costs
    const billableHours = timeData.billable ? netHours : 0;
    const totalCost = billableHours * hourlyRate;

    return {
      duration_hours: durationHours,
      break_minutes: breakMinutes,
      net_hours: netHours,
      billable_hours: billableHours,
      hourly_rate: hourlyRate,
      total_cost: totalCost
    };
  }

  private calculateDurationHours(startTime: Date, endTime: Date): number {
    const durationMs = endTime.getTime() - startTime.getTime();
    return durationMs / (1000 * 60 * 60);
  }

  private calculateTimeOverlap(
    start1: Date,
    end1: Date,
    start2: Date,
    end2: Date
  ): number {
    const overlapStart = new Date(Math.max(start1.getTime(), start2.getTime()));
    const overlapEnd = new Date(Math.min(end1.getTime(), end2.getTime()));
    
    if (overlapStart >= overlapEnd) return 0;
    
    const overlapMs = overlapEnd.getTime() - overlapStart.getTime();
    return overlapMs / (1000 * 60); // Return minutes
  }

  private async getHourlyRate(userId: string, projectId: string, date: Date): Promise<number> {
    // Try to get project-specific rate
    const projectRate = await this.projectRateRepository.findByProjectAndUser(projectId, userId, date);
    if (projectRate) {
      return projectRate.hourly_rate;
    }

    // Try to get user default rate
    const userRate = await this.userRateRepository.findByUserAndDate(userId, date);
    if (userRate) {
      return userRate.hourly_rate;
    }

    // Return organization default rate
    const orgRate = await this.organizationRateRepository.findByOrganizationAndDate(
      await this.getOrganizationId(userId),
      date
    );
    
    return orgRate?.hourly_rate || 0;
  }
}
```

#### **2. Time Entry Approval Workflow**
```typescript
class TimeApprovalService {
  async submitTimeEntryForApproval(timeEntryId: string): Promise<IWorkflowResult> {
    try {
      // Get time entry
      const timeEntry = await this.timeEntryRepository.findById(timeEntryId);
      if (!timeEntry) {
        throw new NotFoundError('Time entry not found');
      }

      // Check if time entry can be submitted
      if (timeEntry.status !== TimeEntryStatus.DRAFT) {
        throw new InvalidStatusError('Time entry must be in draft status to submit');
      }

      // Get approval workflow
      const workflow = await this.getApprovalWorkflow(timeEntry.organization_id);
      if (!workflow) {
        throw new Error('No approval workflow configured');
      }

      // Start approval workflow
      const workflowInstance = await this.startApprovalWorkflow(timeEntryId, workflow.id);

      // Update time entry status
      await this.timeEntryRepository.update(timeEntryId, {
        status: TimeEntryStatus.PENDING_APPROVAL,
        submitted_at: new Date()
      });

      // Publish event
      await this.eventBus.publish(new TimeEntrySubmittedEvent(timeEntryId, timeEntry.user_id));

      this.logger.log('Time entry submitted for approval', { 
        timeEntryId,
        workflowInstanceId: workflowInstance.id 
      });

      return {
        status: 'submitted',
        workflow_instance_id: workflowInstance.id,
        message: 'Time entry submitted for approval'
      };
    } catch (error) {
      this.logger.error('Failed to submit time entry for approval', { error, timeEntryId });
      throw error;
    }
  }

  async processTimeEntryApproval(
    timeEntryId: string,
    approverId: string,
    decision: 'approve' | 'reject' | 'return',
    comments?: string
  ): Promise<IWorkflowResult> {
    try {
      // Get time entry
      const timeEntry = await this.timeEntryRepository.findById(timeEntryId);
      if (!timeEntry) {
        throw new NotFoundError('Time entry not found');
      }

      // Validate approver permissions
      const canApprove = await this.validateApproverPermissions(approverId, timeEntry);
      if (!canApprove) {
        throw new ForbiddenError('Not authorized to approve this time entry');
      }

      // Process decision
      switch (decision) {
        case 'approve':
          return await this.approveTimeEntry(timeEntryId, approverId, comments);
        case 'reject':
          return await this.rejectTimeEntry(timeEntryId, approverId, comments);
        case 'return':
          return await this.returnTimeEntryForRevision(timeEntryId, approverId, comments);
        default:
          throw new Error('Invalid decision');
      }
    } catch (error) {
      this.logger.error('Failed to process time entry approval', { error, timeEntryId, decision });
      throw error;
    }
  }

  private async approveTimeEntry(
    timeEntryId: string,
    approverId: string,
    comments?: string
  ): Promise<IWorkflowResult> {
    // Update time entry status
    await this.timeEntryRepository.update(timeEntryId, {
      status: TimeEntryStatus.APPROVED,
      approved_at: new Date(),
      approved_by: approverId
    });

    // Complete workflow
    await this.completeApprovalWorkflow(timeEntryId, 'approved');

    // Publish event
    await this.eventBus.publish(new TimeEntryApprovedEvent(timeEntryId, approverId));

    // Update project time tracking
    await this.updateProjectTimeTracking(timeEntryId);

    this.logger.log('Time entry approved', { timeEntryId, approverId });

    return {
      status: 'approved',
      message: 'Time entry approved successfully'
    };
  }

  private async rejectTimeEntry(
    timeEntryId: string,
    approverId: string,
    comments?: string
  ): Promise<IWorkflowResult> {
    // Update time entry status
    await this.timeEntryRepository.update(timeEntryId, {
      status: TimeEntryStatus.REJECTED,
      rejected_at: new Date(),
      rejected_by: approverId,
      rejection_reason: comments
    });

    // Complete workflow
    await this.completeApprovalWorkflow(timeEntryId, 'rejected');

    // Publish event
    await this.eventBus.publish(new TimeEntryRejectedEvent(timeEntryId, approverId, comments));

    // Notify user
    await this.notificationService.notifyTimeEntryRejected(timeEntryId, comments);

    this.logger.log('Time entry rejected', { timeEntryId, approverId, comments });

    return {
      status: 'rejected',
      message: 'Time entry rejected',
      details: comments
    };
  }

  private async returnTimeEntryForRevision(
    timeEntryId: string,
    approverId: string,
    comments?: string
  ): Promise<IWorkflowResult> {
    // Update time entry status
    await this.timeEntryRepository.update(timeEntryId, {
      status: TimeEntryStatus.RETURNED_FOR_REVISION,
      rejected_at: new Date(),
      rejected_by: approverId,
      rejection_reason: comments
    });

    // Complete workflow
    await this.completeApprovalWorkflow(timeEntryId, 'returned');

    // Publish event
    await this.eventBus.publish(new TimeEntryReturnedEvent(timeEntryId, approverId, comments));

    // Notify user
    await this.notificationService.notifyTimeEntryReturned(timeEntryId, comments);

    this.logger.log('Time entry returned for revision', { timeEntryId, approverId, comments });

    return {
      status: 'returned',
      message: 'Time entry returned for revision',
      details: comments
    };
  }

  private async validateApproverPermissions(approverId: string, timeEntry: ITimeEntry): Promise<boolean> {
    // Check if approver is the user's manager
    const user = await this.userRepository.findById(timeEntry.user_id);
    if (user?.manager_id === approverId) {
      return true;
    }

    // Check if approver is the project manager
    const project = await this.projectRepository.findById(timeEntry.project_id);
    if (project?.project_manager_id === approverId) {
      return true;
    }

    // Check if approver has approval role
    const approver = await this.userRepository.findById(approverId);
    if (approver) {
      const hasApprovalRole = await this.roleService.hasPermission(
        approverId,
        'time_entries',
        'approve'
      );
      if (hasApprovalRole) {
        return true;
      }
    }

    return false;
  }

  private async updateProjectTimeTracking(timeEntryId: string): Promise<void> {
    const timeEntry = await this.timeEntryRepository.findById(timeEntryId);
    if (!timeEntry) return;

    // Update project actual hours
    await this.projectRepository.incrementActualHours(
      timeEntry.project_id,
      timeEntry.net_hours
    );

    // Update project actual cost
    await this.projectRepository.incrementActualCost(
      timeEntry.project_id,
      timeEntry.total_cost
    );

    // Update user time tracking
    await this.userRepository.incrementTotalHours(
      timeEntry.user_id,
      timeEntry.net_hours
    );
  }
}
```

---

## 📊 **Time Analytics & Reporting**

### **Time Analytics Service**

#### **1. Time Analytics Calculations**
```typescript
class TimeAnalyticsService {
  async generateTimeAnalytics(
    organizationId: string,
    dateRange: IDateRange,
    filters?: ITimeAnalyticsFilters
  ): Promise<ITimeAnalytics> {
    try {
      // Build query with filters
      const query = this.buildAnalyticsQuery(organizationId, dateRange, filters);
      
      // Execute queries for different metrics
      const [
        timeMetrics,
        costMetrics,
        utilizationMetrics,
        approvalMetrics
      ] = await Promise.all([
        this.getTimeMetrics(query),
        this.getCostMetrics(query),
        this.getUtilizationMetrics(query),
        this.getApprovalMetrics(query)
      ]);

      // Calculate derived metrics
      const billableUtilization = timeMetrics.total_hours > 0 
        ? (timeMetrics.billable_hours / timeMetrics.total_hours) * 100 
        : 0;

      const averageApprovalTime = approvalMetrics.total_approved > 0 
        ? approvalMetrics.total_approval_time / approvalMetrics.total_approved 
        : 0;

      return {
        organization_id: organizationId,
        period: `${format(dateRange.start, 'yyyy-MM-dd')} to ${format(dateRange.end, 'yyyy-MM-dd')}`,
        ...timeMetrics,
        ...costMetrics,
        ...utilizationMetrics,
        ...approvalMetrics,
        billable_utilization: billableUtilization,
        average_approval_time: averageApprovalTime
      };
    } catch (error) {
      this.logger.error('Failed to generate time analytics', { error, organizationId, dateRange });
      throw error;
    }
  }

  private async getTimeMetrics(query: any): Promise<Partial<ITimeAnalytics>> {
    const result = await this.timeEntryRepository
      .createQueryBuilder('time_entry')
      .select([
        'SUM(time_entry.net_hours) as total_hours',
        'SUM(time_entry.billable_hours) as billable_hours',
        'SUM(time_entry.break_minutes) as total_break_minutes',
        'COUNT(*) as total_entries',
        'COUNT(DISTINCT time_entry.user_id) as unique_users',
        'COUNT(DISTINCT time_entry.project_id) as unique_projects'
      ])
      .where(query)
      .getRawOne();

    return {
      total_hours: parseFloat(result.total_hours) || 0,
      billable_hours: parseFloat(result.billable_hours) || 0,
      total_break_minutes: parseInt(result.total_break_minutes) || 0,
      total_entries: parseInt(result.total_entries) || 0,
      unique_users: parseInt(result.unique_users) || 0,
      unique_projects: parseInt(result.unique_projects) || 0
    };
  }

  private async getCostMetrics(query: any): Promise<Partial<ITimeAnalytics>> {
    const result = await this.timeEntryRepository
      .createQueryBuilder('time_entry')
      .select([
        'SUM(time_entry.total_cost) as total_cost',
        'AVG(time_entry.hourly_rate) as average_hourly_rate',
        'SUM(time_entry.billable_hours * time_entry.hourly_rate) as billable_cost'
      ])
      .where(query)
      .getRawOne();

    return {
      total_cost: parseFloat(result.total_cost) || 0,
      average_hourly_rate: parseFloat(result.average_hourly_rate) || 0,
      billable_cost: parseFloat(result.billable_cost) || 0
    };
  }

  private async getUtilizationMetrics(query: any): Promise<Partial<ITimeAnalytics>> {
    // Get working days in date range
    const workingDays = this.calculateWorkingDays(query.dateRange.start, query.dateRange.end);
    const totalWorkingHours = workingDays * 8; // Assume 8 hours per day

    // Get total hours from time entries
    const totalHours = await this.timeEntryRepository
      .createQueryBuilder('time_entry')
      .select('SUM(time_entry.net_hours)', 'total_hours')
      .where(query)
      .getRawOne();

    const actualHours = parseFloat(totalHours.total_hours) || 0;
    const utilizationRate = totalWorkingHours > 0 ? (actualHours / totalWorkingHours) * 100 : 0;

    return {
      working_days: workingDays,
      total_working_hours: totalWorkingHours,
      actual_hours: actualHours,
      utilization_rate: utilizationRate
    };
  }

  private async getApprovalMetrics(query: any): Promise<Partial<ITimeAnalytics>> {
    const result = await this.timeEntryRepository
      .createQueryBuilder('time_entry')
      .select([
        'COUNT(CASE WHEN time_entry.status = :approved THEN 1 END) as total_approved',
        'COUNT(CASE WHEN time_entry.status = :rejected THEN 1 END) as total_rejected',
        'COUNT(CASE WHEN time_entry.status = :pending THEN 1 END) as total_pending',
        'AVG(EXTRACT(EPOCH FROM (time_entry.approved_at - time_entry.submitted_at))/3600) as avg_approval_hours'
      ])
      .setParameters({
        approved: TimeEntryStatus.APPROVED,
        rejected: TimeEntryStatus.REJECTED,
        pending: TimeEntryStatus.PENDING_APPROVAL
      })
      .where(query)
      .getRawOne();

    return {
      total_approved: parseInt(result.total_approved) || 0,
      total_rejected: parseInt(result.total_rejected) || 0,
      total_pending: parseInt(result.total_pending) || 0,
      average_approval_time: parseFloat(result.avg_approval_hours) || 0
    };
  }

  private calculateWorkingDays(startDate: Date, endDate: Date): number {
    let workingDays = 0;
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return workingDays;
  }
}
```

---

## 🚀 **API Endpoints**

### **Time Entry Management Endpoints**
```typescript
// GET /api/v1/time-entries
interface IGetTimeEntriesEndpoint {
  query: {
    page?: number;
    limit?: number;
    user_id?: string;
    project_id?: string;
    task_id?: string;
    status?: TimeEntryStatus;
    date_from?: string;
    date_to?: string;
    billable?: boolean;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  };
  response: {
    data: ITimeEntry[];
    pagination: IPagination;
    meta: {
      total_count: number;
      total_hours: number;
      total_cost: number;
      billable_hours: number;
      organization_id: string;
    };
  };
}

// POST /api/v1/time-entries
interface ICreateTimeEntryEndpoint {
  request: {
    user_id: string;
    project_id: string;
    task_id?: string;
    date: string;
    start_time: string;
    end_time: string;
    break_minutes?: number;
    description: string;
    activity_type: ActivityType;
    billable: boolean;
    tags?: string[];
    notes?: string;
  };
  response: {
    time_entry: ITimeEntry;
    message: string;
  };
}

// GET /api/v1/time-entries/{id}
interface IGetTimeEntryEndpoint {
  params: {
    id: string;
  };
  response: {
    time_entry: ITimeEntryDetail;
    project: IProject;
    task?: IProjectTask;
    user: IPublicUser;
    approval_history: IApprovalHistory[];
  };
}

// PUT /api/v1/time-entries/{id}
interface IUpdateTimeEntryEndpoint {
  params: {
    id: string;
  };
  request: {
    start_time?: string;
    end_time?: string;
    break_minutes?: number;
    description?: string;
    activity_type?: ActivityType;
    billable?: boolean;
    tags?: string[];
    notes?: string;
  };
  response: {
    time_entry: ITimeEntry;
    message: string;
  };
}
```

### **Time Approval Endpoints**
```typescript
// POST /api/v1/time-entries/{id}/submit
interface ISubmitTimeEntryEndpoint {
  params: {
    id: string;
  };
  response: {
    workflow_instance: ITimeApprovalWorkflowInstance;
    message: string;
  };
}

// POST /api/v1/time-entries/{id}/approve
interface IApproveTimeEntryEndpoint {
  params: {
    id: string;
  };
  request: {
    comments?: string;
  };
  response: {
    workflow_result: IWorkflowResult;
    message: string;
  };
}

// POST /api/v1/time-entries/{id}/reject
interface IRejectTimeEntryEndpoint {
  params: {
    id: string;
  };
  request: {
    reason: string;
    comments?: string;
  };
  response: {
    workflow_result: IWorkflowResult;
    message: string;
  };
}

// POST /api/v1/time-entries/{id}/return
interface IReturnTimeEntryEndpoint {
  params: {
    id: string;
  };
  request: {
    reason: string;
    comments?: string;
  };
  response: {
    workflow_result: IWorkflowResult;
    message: string;
  };
}
```

---

## 📋 **Implementation Checklist**

### **Phase 1: Core Time Entry Management**
- [ ] Time entry CRUD operations
- [ ] Basic time validation
- [ ] Time conflict detection
- [ ] Database schema implementation

### **Phase 2: Approval Workflow**
- [ ] Approval workflow configuration
- [ ] Multi-step approval process
- [ ] Approval routing and escalation
- [ ] Approval notifications

### **Phase 3: Time Calculations**
- [ ] Billable time calculations
- [ ] Hourly rate management
- [ ] Overtime calculations
- [ ] Utilization tracking

### **Phase 4: Analytics & Reporting**
- [ ] Time analytics service
- [ ] Performance dashboards
- [ ] Custom reports
- [ ] Data export

### **Phase 5: Advanced Features**
- [ ] Mobile time tracking
- [ ] Offline time recording
- [ ] Time entry templates
- [ ] Bulk time operations

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Next Review**: February 2025  
**Time Management Version**: 1.0.0
