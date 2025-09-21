/**
 * Base repository class with common functionality
 */
export class BaseRepository {
    db;
    options;
    constructor(db, options) {
        this.db = db;
        this.options = options;
    }
    /**
     * Enforce tenant scoping on all queries
     */
    scopeToTenant(query) {
        if (query && typeof query === 'object' && 'where' in query) {
            return {
                ...query,
                where: {
                    ...query['where'],
                    tenantId: this.options.tenantId
                }
            };
        }
        return query;
    }
    /**
     * Enforce organization scoping on all queries (legacy support)
     * @deprecated Use scopeToTenant instead
     */
    scopeToOrganization(query) {
        if (query && typeof query === 'object' && 'where' in query) {
            return {
                ...query,
                where: {
                    ...query['where'],
                    organizationId: this.options.organizationId
                }
            };
        }
        return query;
    }
    /**
     * Build pagination result
     */
    buildPaginationResult(items, pagination, total) {
        const { page, pageSize } = pagination;
        const totalPages = Math.ceil(total / pageSize);
        return {
            items,
            pagination: {
                page,
                pageSize,
                total,
                totalPages,
                hasNext: page * pageSize < total,
                hasPrev: page > 1
            }
        };
    }
    /**
     * Create search filter
     */
    createSearchFilter(searchTerm, fields) {
        // This would be implemented based on the specific ORM being used
        // For now, return a simple object that can be extended
        return {
            searchTerm,
            fields
        };
    }
    /**
     * Validate sort field
     */
    validateSortField(field, allowedFields) {
        return allowedFields.includes(field);
    }
    /**
     * Handle database errors
     */
    handleDatabaseError(error) {
        // Use structured logging instead of console
        // Database error code mapping
        const errorMessages = {
            '23505': 'A record with this identifier already exists',
            '23503': 'Referenced record does not exist',
            '23514': 'Data validation failed'
        };
        // Check if error has a known code
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
            const message = errorMessages[error.code];
            if (message) {
                throw new Error(message);
            }
        }
        // Default error
        throw new Error('Database operation failed');
    }
}
//# sourceMappingURL=repo.base.js.map