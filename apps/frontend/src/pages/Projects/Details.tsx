/**
 * Project Detail Page
 * Displays detailed information about a specific project
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '../../features/projects/api';
import { Button } from '../../components/Button';
import { SkeletonCard } from '../../components/ui/Skeleton';

// Status chip component (reused from List page)
const StatusChip: React.FC<{ status: string }> = ({ status }) => {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    'on-hold': 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const statusLabels = {
    active: 'Project is currently active and in progress',
    completed: 'Project has been completed successfully',
    'on-hold': 'Project is temporarily paused or on hold',
    cancelled: 'Project has been cancelled or terminated',
  };

  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}
      role="status"
      aria-label={statusLabels[status as keyof typeof statusLabels] || `Project status: ${status}`}
      title={statusLabels[status as keyof typeof statusLabels] || `Project status: ${status}`}
    >
      <span className="sr-only">Status: </span>
      {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
    </span>
  );
};

// Loading skeleton component
const ProjectDetailSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <SkeletonCard className="h-8 w-64" />
        <SkeletonCard className="h-4 w-32" />
      </div>
      <SkeletonCard className="h-10 w-24" />
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <SkeletonCard className="h-6 w-32" />
        <SkeletonCard className="h-4 w-full" />
        <SkeletonCard className="h-4 w-3/4" />
      </div>
      <div className="space-y-4">
        <SkeletonCard className="h-6 w-32" />
        <SkeletonCard className="h-4 w-full" />
        <SkeletonCard className="h-4 w-1/2" />
      </div>
    </div>
  </div>
);

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: project, isLoading, error } = useProject(id!);

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h2>
        <p className="text-gray-600 mb-6">The project you're looking for doesn't exist or you don't have permission to view it.</p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigate('/projects')}>
            Back to Projects
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <ProjectDetailSkeleton />;
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h2>
        <p className="text-gray-600 mb-6">The project you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/projects')}>
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">{project.name}</h1>
          {project.code && (
            <p className="text-neutral-600 mt-1">Project Code: {project.code}</p>
          )}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/projects')} aria-label="Return to projects list">
            Back to Projects
          </Button>
          <Button className="bg-primary-600 text-white hover:bg-primary-700" aria-label="Edit this project">
            Edit Project
          </Button>
        </div>
      </header>

      {/* Project Details */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status and Overview */}
          <section className="bg-white rounded-lg border border-neutral-200 p-6" aria-labelledby="overview-heading">
            <div className="flex items-center justify-between mb-4">
              <h2 id="overview-heading" className="text-lg font-semibold text-neutral-900">Project Overview</h2>
              <StatusChip status={project.status} />
            </div>
            
            {project.description && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-neutral-700 mb-2">Description</h3>
                <p className="text-neutral-600 leading-relaxed">{project.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-neutral-700 mb-1">Start Date</h3>
                <p className="text-neutral-600">
                  {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-neutral-700 mb-1">End Date</h3>
                <p className="text-neutral-600">
                  {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}
                </p>
              </div>
            </div>
          </section>

          {/* Project Owner */}
          {project.owner && (
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Project Owner</h2>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-medium">
                    {project.owner.firstName.charAt(0)}{project.owner.lastName.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-neutral-900">
                    {project.owner.firstName} {project.owner.lastName}
                  </p>
                  <p className="text-sm text-neutral-600">{project.owner.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Service Categories */}
          {project.serviceCategories && project.serviceCategories.length > 0 && (
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Service Categories</h2>
              <div className="flex flex-wrap gap-2">
                {project.serviceCategories.map((category) => (
                  <span
                    key={category.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-neutral-100 text-neutral-800"
                  >
                    {category.name}
                    {category.code && (
                      <span className="ml-1 text-neutral-500">({category.code})</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Info */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Project Information</h2>
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium text-neutral-700">Created</h3>
                <p className="text-neutral-600">
                  {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-neutral-700">Last Updated</h3>
                <p className="text-neutral-600">
                  {new Date(project.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-neutral-700">Project ID</h3>
                <p className="text-neutral-600 font-mono text-xs">{project.id}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Project
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Time Entry
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generate Report
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
