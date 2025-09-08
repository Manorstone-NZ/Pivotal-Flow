/**
 * ProjectCard Component
 * Displays project information in a card format with modern design
 */

import React from 'react';
import { cn } from '../../lib/utils';
import { StatusChip } from './StatusChip';
import type { Project } from '../../features/projects/types';

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
  className?: string;
  showDates?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onClick,
  className,
  showDates = true
}) => {
  const handleClick = () => {
    onClick?.();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-neutral-200 p-6 hover:border-neutral-300 hover:shadow-md transition-all duration-200',
        onClick && 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : 'article'}
      aria-label={onClick ? `View project ${project.name}` : undefined}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-neutral-900 truncate">
            {project.name}
          </h3>
          {project.code && (
            <p className="text-sm text-neutral-500 mt-1">
              {project.code}
            </p>
          )}
        </div>
        <StatusChip status={project.status} size="sm" />
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-neutral-600 text-sm leading-relaxed mb-4 line-clamp-2">
          {project.description}
        </p>
      )}

      {/* Metadata */}
      <div className="space-y-2">
        {showDates && (
          <div className="flex items-center justify-between text-sm text-neutral-500">
            <div className="flex items-center space-x-4">
              {project.startDate && (
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Start: {new Date(project.startDate).toLocaleDateString()}</span>
                </div>
              )}
              {project.endDate && (
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>End: {new Date(project.endDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Created date */}
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
          {onClick && (
            <span className="flex items-center text-primary-600">
              View details
              <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
