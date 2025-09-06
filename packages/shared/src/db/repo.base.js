/**
 * Shared Repository Base
 * Common repository functionality for Drizzle ORM
 */
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
     * Handle database errors
     */
    handleDatabaseError(error) {
        console.error('Database error:', error);
        throw new Error('Database operation failed');
    }
}
//# sourceMappingURL=repo.base.js.map