# Runbook: Database Issues

**Service**: PostgreSQL Database  
**Severity**: High  
**Alerts**: `DatabaseSlowQueries`, `DatabaseHighConnections`, `DatabaseConnectionFailure`  
**Runbook ID**: RB-02

## Overview

This runbook provides procedures for responding to database performance issues and connection problems in the Pivotal Flow platform.

## Prerequisites

- Access to the production database
- Access to monitoring dashboards
- Knowledge of PostgreSQL administration
- Access to application logs

## Initial Response

### 1. Acknowledge the Alert
- [ ] Acknowledge the alert in your monitoring system
- [ ] Assess the severity and impact
- [ ] Create an incident ticket

### 2. Assess Impact
- [ ] Check if this affects all users or specific functionality
- [ ] Determine if it's a performance degradation or complete failure
- [ ] Identify affected business processes

## Investigation Steps

### 3. Check Database Status
```bash
# Check if PostgreSQL is running
docker compose ps postgres

# Check database connectivity
docker compose exec postgres pg_isready -U postgres

# Check if database is accepting connections
docker compose exec postgres psql -U postgres -c "SELECT version();"
```

### 4. Check Connection Pool
```bash
# Check active connections
docker compose exec postgres psql -U postgres -d pivotal_flow -c "
SELECT 
    count(*) as active_connections,
    state,
    application_name
FROM pg_stat_activity 
WHERE state IS NOT NULL 
GROUP BY state, application_name
ORDER BY count(*) DESC;
"

# Check connection limits
docker compose exec postgres psql -U postgres -c "
SELECT 
    setting as max_connections,
    (SELECT count(*) FROM pg_stat_activity) as current_connections,
    setting::int - (SELECT count(*) FROM pg_stat_activity) as available_connections
FROM pg_settings 
WHERE name = 'max_connections';
"
```

### 5. Check for Slow Queries
```bash
# Find currently running queries
docker compose exec postgres psql -U postgres -d pivotal_flow -c "
SELECT 
    pid,
    now() - pg_stat_activity.query_start AS duration,
    query,
    state
FROM pg_stat_activity 
WHERE (now() - pg_stat_activity.query_start) > interval '5 seconds'
ORDER BY duration DESC;
"

# Check for blocked queries
docker compose exec postgres psql -U postgres -d pivotal_flow -c "
SELECT 
    blocked_locks.pid AS blocked_pid,
    blocked_activity.usename AS blocked_user,
    blocking_locks.pid AS blocking_pid,
    blocking_activity.usename AS blocking_user,
    blocked_activity.query AS blocked_statement,
    blocking_activity.query AS current_statement_in_blocking_process
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks ON (
    blocking_locks.locktype = blocked_locks.locktype
    AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
    AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
    AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
    AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
    AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
    AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
    AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
    AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
    AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
    AND blocking_locks.pid != blocked_locks.pid
)
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;
"
```

## Common Issues and Solutions

### Issue: High Connection Count
**Symptoms**: 
- `DatabaseHighConnections` alert
- Slow response times
- Connection timeouts

**Investigation**:
```bash
# Check connection sources
docker compose exec postgres psql -U postgres -d pivotal_flow -c "
SELECT 
    client_addr,
    application_name,
    count(*) as connections
FROM pg_stat_activity 
GROUP BY client_addr, application_name 
ORDER BY count(*) DESC;
"

# Check for connection leaks
docker compose exec postgres psql -U postgres -d pivotal_flow -c "
SELECT 
    pid,
    now() - backend_start as connection_age,
    state,
    query
FROM pg_stat_activity 
WHERE state = 'idle'
ORDER BY backend_start;
"
```

**Solutions**:
1. **Kill idle connections**:
```bash
# Kill connections idle for more than 1 hour
docker compose exec postgres psql -U postgres -d pivotal_flow -c "
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'idle' 
AND now() - backend_start > interval '1 hour';
"
```

2. **Check application connection pooling**:
```bash
# Review Prisma connection settings
docker compose exec backend cat .env | grep DATABASE
```

### Issue: Slow Queries
**Symptoms**:
- `DatabaseSlowQueries` alert
- High response times
- CPU usage spikes

**Investigation**:
```bash
# Check query statistics
docker compose exec postgres psql -U postgres -d pivotal_flow -c "
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE schemaname = 'public'
ORDER BY n_distinct DESC;
"

# Check for missing indexes
docker compose exec postgres psql -U postgres -d pivotal_flow -c "
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
"
```

**Solutions**:
1. **Create missing indexes** (based on query analysis):
```sql
-- Example: Create index for user lookups
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);

-- Example: Create composite index for organization settings
CREATE INDEX CONCURRENTLY idx_org_settings_org_id_key 
ON organization_settings(organization_id, key);
```

2. **Analyze table statistics**:
```bash
docker compose exec postgres psql -U postgres -d pivotal_flow -c "
ANALYZE users;
ANALYZE organization_settings;
ANALYZE roles;
"
```

### Issue: Database Connection Failure
**Symptoms**:
- `DatabaseConnectionFailure` alert
- Application errors
- Health check failures

**Investigation**:
```bash
# Check PostgreSQL logs
docker compose logs postgres

# Check disk space
docker compose exec postgres df -h

# Check memory usage
docker compose exec postgres free -h

# Check PostgreSQL configuration
docker compose exec postgres psql -U postgres -c "
SHOW max_connections;
SHOW shared_buffers;
SHOW effective_cache_size;
"
```

**Solutions**:
1. **Restart PostgreSQL**:
```bash
docker compose restart postgres
```

2. **Check for disk space issues**:
```bash
# Clean up old logs
docker compose exec postgres find /var/log/postgresql -name "*.log" -mtime +7 -delete

# Check WAL directory
docker compose exec postgres du -sh /var/lib/postgresql/data/pg_wal
```

## Recovery Procedures

### 6. Immediate Actions
```bash
# Kill long-running queries (if necessary)
docker compose exec postgres psql -U postgres -d pivotal_flow -c "
SELECT pg_cancel_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'active' 
AND now() - query_start > interval '5 minutes';
"

# Reset connection pool
docker compose restart backend
```

### 7. Performance Optimization
```bash
# Update table statistics
docker compose exec postgres psql -U postgres -d pivotal_flow -c "
VACUUM ANALYZE;
"

# Check for table bloat
docker compose exec postgres psql -U postgres -d pivotal_flow -c "
SELECT 
    schemaname,
    tablename,
    n_tup_ins,
    n_tup_upd,
    n_tup_del,
    n_live_tup,
    n_dead_tup
FROM pg_stat_user_tables 
ORDER BY n_dead_tup DESC;
"
```

### 8. Verify Recovery
- [ ] Connection count returns to normal
- [ ] Query response times improve
- [ ] No more slow query alerts
- [ ] Application functionality restored

## Monitoring and Prevention

### 9. Set Up Monitoring
```bash
# Enable PostgreSQL logging
docker compose exec postgres psql -U postgres -c "
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 1000;
SELECT pg_reload_conf();
"
```

### 10. Regular Maintenance
```bash
# Daily vacuum (can be automated)
docker compose exec postgres psql -U postgres -d pivotal_flow -c "VACUUM;"

# Weekly analyze
docker compose exec postgres psql -U postgres -d pivotal_flow -c "ANALYZE;"

# Monthly reindex (if needed)
docker compose exec postgres psql -U postgres -d pivotal_flow -c "REINDEX DATABASE pivotal_flow;"
```

## Escalation

### 11. When to Escalate
Escalate if:
- Database remains unresponsive after restart
- Data corruption is suspected
- Performance issues persist after optimization
- Root cause is unclear after 1 hour

### 12. Escalation Contacts
- **Database Administrator**: [Contact Information]
- **DevOps Lead**: [Contact Information]
- **Infrastructure Team**: [Contact Information]

## Post-Incident

### 13. Documentation
- [ ] Document root cause
- [ ] Update monitoring thresholds
- [ ] Review and update indexes
- [ ] Schedule performance review

### 14. Prevention
- [ ] Implement query monitoring
- [ ] Set up automated maintenance
- [ ] Review connection pooling
- [ ] Update alerting rules

## Related Documentation

- [Database Schema](../06_DATABASE_SCHEMA.md)
- [Infrastructure Plan](../04_INFRASTRUCTURE_PLAN.md)
- [Performance Monitoring](../infra/docker/README.md)
- [Backup and Recovery](../scripts/backup/README.md)

## Quick Reference

| Issue | Check Command | Solution |
|-------|---------------|----------|
| High Connections | `SELECT count(*) FROM pg_stat_activity;` | Kill idle connections |
| Slow Queries | `SELECT * FROM pg_stat_activity WHERE state = 'active';` | Create indexes, analyze |
| Connection Failure | `pg_isready -U postgres` | Restart PostgreSQL |

---

**Last Updated**: 2024-12-01  
**Maintainer**: Database Team  
**Review Schedule**: Quarterly
