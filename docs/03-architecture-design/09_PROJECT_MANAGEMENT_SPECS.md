# Pivotal Flow - Project Management System Specifications

## 📋 **Project Management Overview**

### **System Purpose**
The Project Management System provides comprehensive project lifecycle management, from initial planning through execution, monitoring, and closure. It enables teams to collaborate effectively, track progress, manage resources, and deliver projects on time and within budget.

### **Key Features**
- Project lifecycle management
- Task and milestone tracking
- Resource allocation and capacity planning
- Time tracking integration
- Project reporting and analytics
- Team collaboration tools
- Risk and issue management
- Budget tracking and cost management

---

## 🏗️ **System Architecture**

### **Core Components**

#### **1. Project Management Engine**
```typescript
interface IProjectManagementEngine {
  // Project lifecycle management
  createProject(projectData: ICreateProjectRequest): Promise<IProject>;
  updateProject(projectId: string, updates: IUpdateProjectRequest): Promise<IProject>;
  deleteProject(projectId: string): Promise<void>;
  archiveProject(projectId: string): Promise<void>;
  
  // Project status management
  startProject(projectId: string): Promise<IProject>;
  pauseProject(projectId: string, reason: string): Promise<IProject>;
  resumeProject(projectId: string): Promise<IProject>;
  completeProject(projectId: string): Promise<IProject>;
  
  // Project planning
  createProjectPlan(projectId: string, planData: IProjectPlanRequest): Promise<IProjectPlan>;
  updateProjectPlan(projectId: string, planData: IProjectPlanUpdate): Promise<IProjectPlan>;
  approveProjectPlan(projectId: string, approverId: string): Promise<IProjectPlan>;
  
  // Project conversion
  convertFromQuote(quoteId: string): Promise<IProject>;
  convertToInvoice(projectId: string): Promise<IInvoice>;
}
```

#### **2. Task Management Engine**
```typescript
interface ITaskManagementEngine {
  // Task lifecycle management
  createTask(taskData: ICreateTaskRequest): Promise<IProjectTask>;
  updateTask(taskId: string, updates: IUpdateTaskRequest): Promise<IProjectTask>;
  deleteTask(taskId: string): Promise<void>;
  
  // Task status management
  startTask(taskId: string): Promise<IProjectTask>;
  pauseTask(taskId: string, reason: string): Promise<IProjectTask>;
  resumeTask(taskId: string): Promise<IProjectTask>;
  completeTask(taskId: string): Promise<IProjectTask>;
  
  // Task assignment and collaboration
  assignTask(taskId: string, userId: string): Promise<void>;
  unassignTask(taskId: string): Promise<void>;
  addTaskComment(taskId: string, comment: ITaskComment): Promise<ITaskComment>;
  
  // Task dependencies and relationships
  addTaskDependency(taskId: string, dependencyTaskId: string): Promise<void>;
  removeTaskDependency(taskId: string, dependencyTaskId: string): Promise<void>;
  getTaskDependencies(taskId: string): Promise<IProjectTask[]>;
}
```

#### **3. Resource Management Engine**
```typescript
interface IResourceManagementEngine {
  // Resource allocation
  allocateResource(projectId: string, resourceData: IResourceAllocationRequest): Promise<IResourceAllocation>;
  updateResourceAllocation(allocationId: string, updates: IResourceAllocationUpdate): Promise<IResourceAllocation>;
  removeResourceAllocation(allocationId: string): Promise<void>;
  
  // Capacity planning
  getResourceCapacity(resourceId: string, dateRange: IDateRange): Promise<IResourceCapacity>;
  checkResourceAvailability(resourceId: string, dateRange: IDateRange): Promise<IResourceAvailability>;
  getResourceUtilization(resourceId: string, period: string): Promise<IResourceUtilization>;
  
  // Team management
  createTeam(teamData: ICreateTeamRequest): Promise<IProjectTeam>;
  addTeamMember(teamId: string, userId: string, role: string): Promise<void>;
  removeTeamMember(teamId: string, userId: string): Promise<void>;
  updateTeamMemberRole(teamId: string, userId: string, newRole: string): Promise<void>;
}
```

---

## 📊 **Data Models**

### **Project Entity**
```typescript
interface IProject {
  id: string;
  project_number: string;
  organization_id: string;
  customer_id: string;
  quote_id?: string;
  invoice_id?: string;
  
  // Basic information
  name: string;
  description?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  type: ProjectType;
  
  // Project details
  start_date: Date;
  end_date: Date;
  actual_start_date?: Date;
  actual_end_date?: Date;
  estimated_duration_days: number;
  actual_duration_days?: number;
  
  // Financial information
  budget: number;
  currency: string;
  actual_cost?: number;
  remaining_budget?: number;
  cost_variance?: number;
  
  // Project management
  project_manager_id: string;
  team_id?: string;
  parent_project_id?: string;
  
  // Additional information
  tags: string[];
  notes?: string;
  internal_notes?: string;
  
  // Metadata
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

enum ProjectStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ARCHIVED = 'archived'
}

enum ProjectPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

enum ProjectType {
  DEVELOPMENT = 'development',
  IMPLEMENTATION = 'implementation',
  CONSULTING = 'consulting',
  MAINTENANCE = 'maintenance',
  MIGRATION = 'migration',
  INTEGRATION = 'integration'
}
```

### **Project Task Entity**
```typescript
interface IProjectTask {
  id: string;
  project_id: string;
  parent_task_id?: string;
  
  // Task information
  name: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  
  // Task details
  estimated_hours: number;
  actual_hours?: number;
  estimated_start_date: Date;
  estimated_end_date: Date;
  actual_start_date?: Date;
  actual_end_date?: Date;
  
  // Assignment and tracking
  assigned_to?: string;
  assigned_by?: string;
  assigned_at?: Date;
  progress_percentage: number;
  
  // Dependencies and relationships
  dependencies: string[];
  predecessors: string[];
  successors: string[];
  
  // Additional information
  tags: string[];
  notes?: string;
  attachments: IAttachment[];
  
  // Metadata
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  TESTING = 'testing',
  DONE = 'done',
  BLOCKED = 'blocked',
  CANCELLED = 'cancelled'
}

enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

enum TaskType {
  FEATURE = 'feature',
  BUG_FIX = 'bug_fix',
  TASK = 'task',
  STORY = 'story',
  EPIC = 'epic',
  MILESTONE = 'milestone'
}
```

### **Resource Allocation Entity**
```typescript
interface IResourceAllocation {
  id: string;
  project_id: string;
  resource_id: string;
  
  // Allocation details
  role: string;
  allocation_percentage: number;
  start_date: Date;
  end_date: Date;
  
  // Time tracking
  estimated_hours: number;
  actual_hours?: number;
  remaining_hours?: number;
  
  // Cost tracking
  hourly_rate: number;
  estimated_cost: number;
  actual_cost?: number;
  
  // Status
  status: AllocationStatus;
  notes?: string;
  
  // Metadata
  created_at: Date;
  updated_at: Date;
}

enum AllocationStatus {
  PLANNED = 'planned',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}
```

---

## 🎯 **Project Planning & Scheduling**

### **Project Plan Creation**

#### **1. Work Breakdown Structure (WBS)**
```typescript
interface IWorkBreakdownStructure {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  
  // Structure
  elements: IWBSElement[];
  levels: number;
  
  // Metadata
  created_at: Date;
  updated_at: Date;
}

interface IWBSElement {
  id: string;
  code: string;
  name: string;
  description?: string;
  level: number;
  parent_id?: string;
  
  // Task information
  task_id?: string;
  estimated_hours: number;
  estimated_cost: number;
  
  // Progress tracking
  progress_percentage: number;
  actual_hours?: number;
  actual_cost?: number;
  
  // Relationships
  children: IWBSElement[];
  dependencies: string[];
}

class ProjectPlanningService {
  async createWorkBreakdownStructure(
    projectId: string,
    wbsData: ICreateWBSRequest
  ): Promise<IWorkBreakdownStructure> {
    try {
      // Validate project exists
      const project = await this.projectRepository.findById(projectId);
      if (!project) {
        throw new NotFoundError('Project not found');
      }

      // Create WBS elements
      const elements = await this.createWBSElements(wbsData.elements, projectId);

      // Calculate estimates
      const estimates = this.calculateWBSEstimates(elements);

      // Create WBS
      const wbs = this.wbsRepository.create({
        project_id: projectId,
        name: wbsData.name,
        description: wbsData.description,
        elements,
        levels: this.calculateWBSLevels(elements)
      });

      const savedWBS = await this.wbsRepository.save(wbs);

      // Update project with WBS estimates
      await this.projectRepository.update(projectId, {
        estimated_duration_days: estimates.durationDays,
        budget: estimates.totalCost
      });

      // Publish event
      await this.eventBus.publish(new WBSCreatedEvent(savedWBS.id, projectId));

      this.logger.log('Work breakdown structure created successfully', { wbsId: savedWBS.id, projectId });
      return savedWBS;
    } catch (error) {
      this.logger.error('Failed to create work breakdown structure', { error, projectId });
      throw error;
    }
  }

  private async createWBSElements(
    elementData: ICreateWBSElementRequest[],
    projectId: string
  ): Promise<IWBSElement[]> {
    const elements: IWBSElement[] = [];

    for (const data of elementData) {
      const element = this.wbsElementRepository.create({
        code: data.code,
        name: data.name,
        description: data.description,
        level: data.level,
        parent_id: data.parent_id,
        estimated_hours: data.estimated_hours || 0,
        estimated_cost: data.estimated_cost || 0,
        progress_percentage: 0,
        children: [],
        dependencies: data.dependencies || []
      });

      const savedElement = await this.wbsElementRepository.save(element);
      elements.push(savedElement);
    }

    return elements;
  }

  private calculateWBSEstimates(elements: IWBSElement[]): { durationDays: number; totalCost: number } {
    let totalHours = 0;
    let totalCost = 0;

    const calculateElementEstimates = (element: IWBSElement) => {
      totalHours += element.estimated_hours;
      totalCost += element.estimated_cost;

      element.children.forEach(calculateElementEstimates);
    };

    elements.forEach(calculateElementEstimates);

    // Assume 8 hours per day
    const durationDays = Math.ceil(totalHours / 8);

    return { durationDays, totalCost };
  }

  private calculateWBSLevels(elements: IWBSElement[]): number {
    let maxLevel = 0;

    const calculateElementLevel = (element: IWBSElement, currentLevel: number) => {
      maxLevel = Math.max(maxLevel, currentLevel);
      element.children.forEach(child => calculateElementLevel(child, currentLevel + 1));
    };

    elements.forEach(element => calculateElementLevel(element, element.level));
    return maxLevel;
  }
}
```

#### **2. Project Schedule Management**
```typescript
interface IProjectSchedule {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  
  // Schedule information
  start_date: Date;
  end_date: Date;
  baseline_start_date?: Date;
  baseline_end_date?: Date;
  
  // Schedule elements
  milestones: IMilestone[];
  tasks: IScheduledTask[];
  dependencies: IScheduleDependency[];
  
  // Schedule analysis
  critical_path: string[];
  total_float: number;
  project_duration: number;
  
  // Metadata
  created_at: Date;
  updated_at: Date;
}

interface IMilestone {
  id: string;
  name: string;
  description?: string;
  date: Date;
  type: MilestoneType;
  status: MilestoneStatus;
  completion_percentage: number;
}

interface IScheduledTask {
  id: string;
  task_id: string;
  early_start: Date;
  early_finish: Date;
  late_start: Date;
  late_finish: Date;
  total_float: number;
  free_float: number;
  is_critical: boolean;
}

class ProjectSchedulingService {
  async createProjectSchedule(
    projectId: string,
    scheduleData: ICreateScheduleRequest
  ): Promise<IProjectSchedule> {
    try {
      // Get project tasks
      const tasks = await this.taskRepository.findByProject(projectId);
      if (tasks.length === 0) {
        throw new Error('No tasks found for project');
      }

      // Calculate schedule
      const schedule = await this.calculateSchedule(tasks, scheduleData.start_date);

      // Create schedule
      const projectSchedule = this.scheduleRepository.create({
        project_id: projectId,
        name: scheduleData.name,
        description: scheduleData.description,
        start_date: schedule.start_date,
        end_date: schedule.end_date,
        milestones: schedule.milestones,
        tasks: schedule.scheduled_tasks,
        dependencies: schedule.dependencies,
        critical_path: schedule.critical_path,
        total_float: schedule.total_float,
        project_duration: schedule.project_duration
      });

      const savedSchedule = await this.scheduleRepository.save(projectSchedule);

      // Publish event
      await this.eventBus.publish(new ProjectScheduleCreatedEvent(savedSchedule.id, projectId));

      this.logger.log('Project schedule created successfully', { scheduleId: savedSchedule.id, projectId });
      return savedSchedule;
    } catch (error) {
      this.logger.error('Failed to create project schedule', { error, projectId });
      throw error;
    }
  }

  private async calculateSchedule(
    tasks: IProjectTask[],
    projectStartDate: Date
  ): Promise<IScheduleCalculation> {
    // Sort tasks by dependencies
    const sortedTasks = this.topologicalSort(tasks);

    // Calculate early start/finish dates
    const earlyDates = this.calculateEarlyDates(sortedTasks, projectStartDate);

    // Calculate late start/finish dates
    const lateDates = this.calculateLateDates(sortedTasks, earlyDates);

    // Calculate float
    const floatCalculations = this.calculateFloat(earlyDates, lateDates);

    // Identify critical path
    const criticalPath = this.identifyCriticalPath(sortedTasks, floatCalculations);

    // Create milestones
    const milestones = this.createMilestones(sortedTasks, earlyDates);

    return {
      start_date: projectStartDate,
      end_date: this.getLatestFinishDate(earlyDates),
      milestones,
      scheduled_tasks: this.createScheduledTasks(sortedTasks, earlyDates, lateDates, floatCalculations),
      dependencies: this.extractDependencies(tasks),
      critical_path: criticalPath,
      total_float: this.calculateTotalFloat(floatCalculations),
      project_duration: this.calculateProjectDuration(projectStartDate, this.getLatestFinishDate(earlyDates))
    };
  }

  private topologicalSort(tasks: IProjectTask[]): IProjectTask[] {
    const visited = new Set<string>();
    const sorted: IProjectTask[] = [];
    const visiting = new Set<string>();

    const visit = (task: IProjectTask) => {
      if (visiting.has(task.id)) {
        throw new Error('Circular dependency detected');
      }
      if (visited.has(task.id)) return;

      visiting.add(task.id);

      // Visit dependencies first
      task.dependencies.forEach(depId => {
        const depTask = tasks.find(t => t.id === depId);
        if (depTask) visit(depTask);
      });

      visiting.delete(task.id);
      visited.add(task.id);
      sorted.push(task);
    };

    tasks.forEach(task => visit(task));
    return sorted;
  }

  private calculateEarlyDates(tasks: IProjectTask[], projectStartDate: Date): Map<string, { start: Date; finish: Date }> {
    const earlyDates = new Map<string, { start: Date; finish: Date }>();

    tasks.forEach(task => {
      let earliestStart = projectStartDate;

      // Check dependencies
      task.dependencies.forEach(depId => {
        const depDates = earlyDates.get(depId);
        if (depDates) {
          const dependencyFinish = new Date(depDates.finish);
          dependencyFinish.setDate(dependencyFinish.getDate() + 1);
          earliestStart = new Date(Math.max(earliestStart.getTime(), dependencyFinish.getTime()));
        }
      });

      const estimatedDays = Math.ceil(task.estimated_hours / 8);
      const earliestFinish = new Date(earliestStart);
      earliestFinish.setDate(earliestFinish.getDate() + estimatedDays);

      earlyDates.set(task.id, {
        start: earliestStart,
        finish: earliestFinish
      });
    });

    return earlyDates;
  }

  private calculateLateDates(
    tasks: IProjectTask[],
    earlyDates: Map<string, { start: Date; finish: Date }>
  ): Map<string, { start: Date; finish: Date }> {
    const lateDates = new Map<string, { start: Date; finish: Date }>();
    const projectEndDate = this.getLatestFinishDate(earlyDates);

    // Process tasks in reverse order
    for (let i = tasks.length - 1; i >= 0; i--) {
      const task = tasks[i];
      const earlyDate = earlyDates.get(task.id)!;
      const estimatedDays = Math.ceil(task.estimated_hours / 8);

      let latestFinish = projectEndDate;

      // Check successors
      const successors = tasks.filter(t => t.dependencies.includes(task.id));
      if (successors.length > 0) {
        successors.forEach(successor => {
          const successorLateStart = lateDates.get(successor.id)?.start;
          if (successorLateStart) {
            const predecessorFinish = new Date(successorLateStart);
            predecessorFinish.setDate(predecessorFinish.getDate() - 1);
            latestFinish = new Date(Math.min(latestFinish.getTime(), predecessorFinish.getTime()));
          }
        });
      }

      const latestStart = new Date(latestFinish);
      latestStart.setDate(latestStart.getDate() - estimatedDays);

      lateDates.set(task.id, {
        start: latestStart,
        finish: latestFinish
      });
    });

    return lateDates;
  }

  private calculateFloat(
    earlyDates: Map<string, { start: Date; finish: Date }>,
    lateDates: Map<string, { start: Date; finish: Date }>
  ): Map<string, { total: number; free: number }> {
    const float = new Map<string, { total: number; free: number }>();

    earlyDates.forEach((early, taskId) => {
      const late = lateDates.get(taskId)!;
      
      const totalFloat = Math.floor((late.start.getTime() - early.start.getTime()) / (1000 * 60 * 60 * 24));
      const freeFloat = this.calculateFreeFloat(taskId, early, earlyDates);

      float.set(taskId, {
        total: totalFloat,
        free: freeFloat
      });
    });

    return float;
  }

  private identifyCriticalPath(
    tasks: IProjectTask[],
    floatCalculations: Map<string, { total: number; free: number }>
  ): string[] {
    return tasks
      .filter(task => floatCalculations.get(task.id)?.total === 0)
      .map(task => task.id);
  }
}
```

---

## 📈 **Project Monitoring & Control**

### **Progress Tracking**

#### **1. Project Progress Monitoring**
```typescript
interface IProjectProgress {
  project_id: string;
  date: Date;
  
  // Progress metrics
  overall_progress: number;
  tasks_completed: number;
  total_tasks: number;
  tasks_in_progress: number;
  tasks_blocked: number;
  
  // Time metrics
  planned_hours: number;
  actual_hours: number;
  remaining_hours: number;
  schedule_variance: number;
  
  // Cost metrics
  planned_cost: number;
  actual_cost: number;
  remaining_cost: number;
  cost_variance: number;
  
  // Quality metrics
  defects_found: number;
  defects_resolved: number;
  rework_hours: number;
  
  // Risk metrics
  active_risks: number;
  high_risk_items: number;
  risk_mitigation_progress: number;
}

class ProjectMonitoringService {
  async calculateProjectProgress(projectId: string): Promise<IProjectProgress> {
    try {
      // Get project data
      const project = await this.projectRepository.findById(projectId);
      const tasks = await this.taskRepository.findByProject(projectId);
      const timeEntries = await this.timeEntryRepository.findByProject(projectId);
      const risks = await this.riskRepository.findByProject(projectId);

      // Calculate progress metrics
      const progressMetrics = this.calculateProgressMetrics(tasks);
      const timeMetrics = this.calculateTimeMetrics(tasks, timeEntries, project);
      const costMetrics = this.calculateCostMetrics(tasks, timeEntries, project);
      const qualityMetrics = this.calculateQualityMetrics(tasks);
      const riskMetrics = this.calculateRiskMetrics(risks);

      const projectProgress: IProjectProgress = {
        project_id: projectId,
        date: new Date(),
        ...progressMetrics,
        ...timeMetrics,
        ...costMetrics,
        ...qualityMetrics,
        ...riskMetrics
      };

      // Save progress snapshot
      await this.progressRepository.save(projectProgress);

      // Check for alerts
      await this.checkProgressAlerts(projectProgress);

      // Publish event
      await this.eventBus.publish(new ProjectProgressUpdatedEvent(projectId, projectProgress));

      return projectProgress;
    } catch (error) {
      this.logger.error('Failed to calculate project progress', { error, projectId });
      throw error;
    }
  }

  private calculateProgressMetrics(tasks: IProjectTask[]): Partial<IProjectProgress> {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === TaskStatus.DONE).length;
    const inProgressTasks = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
    const blockedTasks = tasks.filter(t => t.status === TaskStatus.BLOCKED).length;

    const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
      overall_progress: overallProgress,
      tasks_completed: completedTasks,
      total_tasks: totalTasks,
      tasks_in_progress: inProgressTasks,
      tasks_blocked: blockedTasks
    };
  }

  private calculateTimeMetrics(
    tasks: IProjectTask[],
    timeEntries: ITimeEntry[],
    project: IProject
  ): Partial<IProjectProgress> {
    const plannedHours = tasks.reduce((sum, task) => sum + task.estimated_hours, 0);
    const actualHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0);
    const remainingHours = Math.max(0, plannedHours - actualHours);

    const scheduleVariance = this.calculateScheduleVariance(tasks, project);

    return {
      planned_hours: plannedHours,
      actual_hours: actualHours,
      remaining_hours: remainingHours,
      schedule_variance: scheduleVariance
    };
  }

  private calculateCostMetrics(
    tasks: IProjectTask[],
    timeEntries: ITimeEntry[],
    project: IProject
  ): Partial<IProjectProgress> {
    const plannedCost = project.budget;
    const actualCost = timeEntries.reduce((sum, entry) => sum + (entry.hours * entry.hourly_rate), 0);
    const remainingCost = Math.max(0, plannedCost - actualCost);
    const costVariance = actualCost - plannedCost;

    return {
      planned_cost: plannedCost,
      actual_cost: actualCost,
      remaining_cost: remainingCost,
      cost_variance: costVariance
    };
  }

  private async checkProgressAlerts(progress: IProjectProgress): Promise<void> {
    const alerts: IProjectAlert[] = [];

    // Schedule variance alert
    if (progress.schedule_variance > 2) { // More than 2 days behind
      alerts.push({
        type: 'SCHEDULE_VARIANCE',
        severity: 'WARNING',
        message: `Project is ${progress.schedule_variance} days behind schedule`,
        project_id: progress.project_id,
        data: { schedule_variance: progress.schedule_variance }
      });
    }

    // Cost variance alert
    if (progress.cost_variance > progress.planned_cost * 0.1) { // More than 10% over budget
      alerts.push({
        type: 'COST_VARIANCE',
        severity: 'WARNING',
        message: `Project is ${Math.round((progress.cost_variance / progress.planned_cost) * 100)}% over budget`,
        project_id: progress.project_id,
        data: { cost_variance: progress.cost_variance, planned_cost: progress.planned_cost }
      });
    }

    // Progress stagnation alert
    if (progress.tasks_blocked > progress.total_tasks * 0.2) { // More than 20% of tasks blocked
      alerts.push({
        type: 'PROGRESS_STAGNATION',
        severity: 'HIGH',
        message: `${progress.tasks_blocked} out of ${progress.total_tasks} tasks are blocked`,
        project_id: progress.project_id,
        data: { blocked_tasks: progress.tasks_blocked, total_tasks: progress.total_tasks }
      });
    }

    // Save alerts
    if (alerts.length > 0) {
      await this.alertRepository.save(alerts);
      
      // Send notifications
      await this.notificationService.sendProjectAlerts(progress.project_id, alerts);
    }
  }
}
```

---

## 🚀 **API Endpoints**

### **Project Management Endpoints**
```typescript
// GET /api/v1/projects
interface IGetProjectsEndpoint {
  query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: ProjectStatus;
    customer_id?: string;
    project_manager_id?: string;
    start_date?: string;
    end_date?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  };
  response: {
    data: IProject[];
    pagination: IPagination;
    meta: {
      total_count: number;
      total_budget: number;
      currency: string;
      organization_id: string;
    };
  };
}

// POST /api/v1/projects
interface ICreateProjectEndpoint {
  request: {
    name: string;
    description?: string;
    customer_id: string;
    quote_id?: string;
    start_date: string;
    end_date: string;
    budget: number;
    currency: string;
    project_manager_id: string;
    type: ProjectType;
    priority: ProjectPriority;
    tags?: string[];
  };
  response: {
    project: IProject;
    message: string;
  };
}

// GET /api/v1/projects/{id}
interface IGetProjectEndpoint {
  params: {
    id: string;
  };
  response: {
    project: IProjectDetail;
    tasks: IProjectTask[];
    team: IProjectTeam;
    progress: IProjectProgress;
    risks: IProjectRisk[];
    issues: IProjectIssue[];
  };
}

// PUT /api/v1/projects/{id}
interface IUpdateProjectEndpoint {
  params: {
    id: string;
  };
  request: {
    name?: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    budget?: number;
    status?: ProjectStatus;
    priority?: ProjectPriority;
    tags?: string[];
  };
  response: {
    project: IProject;
    message: string;
  };
}
```

### **Task Management Endpoints**
```typescript
// GET /api/v1/projects/{id}/tasks
interface IGetProjectTasksEndpoint {
  params: {
    id: string;
  };
  query: {
    status?: TaskStatus;
    assigned_to?: string;
    priority?: TaskPriority;
    type?: TaskType;
  };
  response: {
    tasks: IProjectTask[];
    meta: {
      total_count: number;
      completed_count: number;
      in_progress_count: number;
      blocked_count: number;
    };
  };
}

// POST /api/v1/projects/{id}/tasks
interface ICreateProjectTaskEndpoint {
  params: {
    id: string;
  };
  request: {
    name: string;
    description?: string;
    estimated_hours: number;
    estimated_start_date: string;
    estimated_end_date: string;
    priority: TaskPriority;
    type: TaskType;
    assigned_to?: string;
    parent_task_id?: string;
    dependencies?: string[];
  };
  response: {
    task: IProjectTask;
    message: string;
  };
}

// PUT /api/v1/projects/{id}/tasks/{taskId}
interface IUpdateProjectTaskEndpoint {
  params: {
    id: string;
    taskId: string;
  };
  request: {
    name?: string;
    description?: string;
    status?: TaskStatus;
    estimated_hours?: number;
    estimated_start_date?: string;
    estimated_end_date?: string;
    priority?: TaskPriority;
    assigned_to?: string;
    progress_percentage?: number;
  };
  response: {
    task: IProjectTask;
    message: string;
  };
}
```

---

## 📋 **Implementation Checklist**

### **Phase 1: Core Project Management**
- [ ] Project CRUD operations
- [ ] Basic project lifecycle management
- [ ] Project status tracking
- [ ] Database schema implementation

### **Phase 2: Task Management**
- [ ] Task CRUD operations
- [ ] Task assignment and tracking
- [ ] Task dependencies and relationships
- [ ] Task status management

### **Phase 3: Planning & Scheduling**
- [ ] Work breakdown structure (WBS)
- [ ] Project scheduling with critical path
- [ ] Resource allocation
- [ ] Milestone management

### **Phase 4: Monitoring & Control**
- [ ] Progress tracking and metrics
- [ ] Project dashboards
- [ ] Alert system
- [ ] Reporting and analytics

### **Phase 5: Advanced Features**
- [ ] Resource capacity planning
- [ ] Risk and issue management
- [ ] Budget tracking
- [ ] Team collaboration tools

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Next Review**: February 2025  
**Project Management Version**: 1.0.0
