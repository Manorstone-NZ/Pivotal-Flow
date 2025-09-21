# Runbooks - Pivotal Flow Platform

This directory contains comprehensive runbooks for incident response and operational procedures in the Pivotal Flow platform.

## Overview

Runbooks provide step-by-step procedures for responding to incidents, troubleshooting issues, and performing routine maintenance tasks. Each runbook is designed to be used by on-call engineers and operations teams.

## Available Runbooks

### RB-01: Backend Service Down
**File**: [rb-01-backend-down.md](rb-01-backend-down.md)  
**Severity**: Critical  
**Scope**: Complete backend service outages, health check failures, restart procedures

**Key Procedures**:
- Service status verification
- Infrastructure health checks
- Dependency validation
- Service restart procedures
- Post-recovery monitoring

### RB-02: Database Issues
**File**: [rb-02-db-issues.md](rb-02-db-issues.md)  
**Severity**: High  
**Scope**: Database performance problems, slow queries, connection issues

**Key Procedures**:
- Database connectivity checks
- Connection pool analysis
- Slow query identification
- Performance optimization
- Index and statistics management

### RB-03: Cache Issues
**File**: [rb-03-cache-issues.md](rb-03-cache-issues.md)  
**Severity**: Medium-High  
**Scope**: Redis cache problems, memory issues, performance degradation

**Key Procedures**:
- Redis status verification
- Memory usage analysis
- Eviction rate monitoring
- Cache optimization
- Performance tuning

## How to Use Runbooks

### 1. Incident Response
1. **Identify the Alert**: Check which alert has fired
2. **Locate the Runbook**: Find the corresponding runbook using the alert mapping
3. **Follow the Steps**: Execute the investigation and recovery procedures
4. **Document Actions**: Update incident tickets with actions taken
5. **Verify Resolution**: Ensure the issue is fully resolved

### 2. Alert Mapping
Each alert in the monitoring system maps to a specific runbook:

| Alert Name | Runbook | Severity |
|------------|---------|----------|
| `BackendServiceDown` | RB-01 | Critical |
| `HighErrorRate` | RB-01 | Warning |
| `SlowRequests` | RB-01 | Warning |
| `DatabaseSlowQueries` | RB-02 | Warning |
| `DatabaseHighConnections` | RB-02 | Warning |
| `DatabaseConnectionFailure` | RB-02 | Critical |
| `RedisHighEvictions` | RB-03 | Warning |
| `RedisConnectionFailure` | RB-03 | Critical |
| `CacheLowHitRate` | RB-03 | Warning |
| `RedisHighMemoryUsage` | RB-03 | Warning |

### 3. Runbook Structure
Each runbook follows a consistent structure:

- **Overview**: Brief description of the issue type
- **Prerequisites**: Required access and knowledge
- **Initial Response**: Immediate actions to take
- **Investigation Steps**: Systematic troubleshooting procedures
- **Common Issues**: Known problems with solutions
- **Recovery Procedures**: Step-by-step recovery steps
- **Escalation**: When and how to escalate
- **Post-Incident**: Documentation and prevention

## Prerequisites

### Required Access
- Production environment access
- Monitoring dashboards (Grafana, Prometheus)
- Application logs and metrics
- Database administration tools
- Docker container management

### Required Knowledge
- Basic Linux command line operations
- Docker and Docker Compose
- PostgreSQL administration
- Redis cache management
- Node.js application troubleshooting
- Network and infrastructure concepts

## Maintenance

### Regular Updates
- **Monthly**: Review and update based on recent incidents
- **Quarterly**: Comprehensive review and improvement
- **After Incidents**: Incorporate lessons learned

### Update Process
1. Identify areas for improvement
2. Update procedures based on new learnings
3. Validate changes with the team
4. Update related documentation
5. Notify team of changes

## Related Documentation

- [SLO Definitions](../slo/api.yml) - Service level objectives and targets
- [Monitoring Setup](../../infra/docker/README.md) - Infrastructure and monitoring configuration
- [Alert Rules](../../infra/docker/prometheus/alerts.yml) - Prometheus alert definitions
- [Performance Testing](../../scripts/perf/README.md) - Performance testing and validation

## Emergency Contacts

### Escalation Path
1. **On-Call Engineer**: Primary responder
2. **Team Lead**: Escalation after 30 minutes
3. **DevOps Lead**: Escalation after 1 hour
4. **Infrastructure Team**: Escalation for infrastructure issues

### Contact Information
- **Team Lead**: [Contact Information]
- **DevOps Lead**: [Contact Information]
- **Infrastructure**: [Contact Information]
- **Emergency**: [Emergency Contact]

## Quick Reference

### Common Commands
```bash
# Check service status
docker compose ps

# View logs
docker compose logs <service>

# Health check
curl -f http://localhost:3000/health

# Database connection
docker compose exec postgres psql -U postgres -d pivotal_flow

# Redis status
docker compose exec redis redis-cli ping
```

### Key Metrics
- **Service Health**: `up{job="pivotal-backend"}`
- **Error Rate**: `rate(http_requests_total{status=~"5.."}[5m])`
- **Response Time**: `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))`
- **Cache Hit Rate**: `pivotal_cache_hit_rate{cache_type="redis"}`

---

**Last Updated**: 2024-12-01  
**Maintainer**: DevOps Team  
**Review Schedule**: Monthly
