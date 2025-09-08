import type { AuditLogger } from '../../lib/audit-logger.drizzle.js';
import type { ProjectFilters, CreateProject, UpdateProject, Project, ProjectsListResponse, ProjectDetailResponse } from './typeboxSchemas.js';
export interface ProjectContext {
    organizationId: string;
    userId: string;
}
export declare class ProjectService {
    private context;
    private auditLogger?;
    private db;
    constructor(context: ProjectContext, auditLogger?: AuditLogger | undefined);
    listProjects(filters?: ProjectFilters): Promise<ProjectsListResponse>;
    getProjectById(id: string): Promise<ProjectDetailResponse | null>;
    createProject(data: CreateProject): Promise<Project>;
    updateProject(id: string, data: UpdateProject): Promise<Project | null>;
    deleteProject(id: string): Promise<boolean>;
}
//# sourceMappingURL=service.d.ts.map