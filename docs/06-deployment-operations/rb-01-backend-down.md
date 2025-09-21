# Runbook: Backend Service Down

**Service**: Pivotal Flow Backend  
**Severity**: Critical  
**Alert**: `BackendServiceDown`  
**Runbook ID**: RB-01

## Overview

This runbook provides step-by-step procedures for responding to backend service outages in the Pivotal Flow platform.

## Prerequisites

- Access to the production environment
- Access to monitoring dashboards (Grafana, Prometheus)
- Access to application logs
- Knowledge of the deployment architecture

## Initial Response

### 1. Acknowledge the Alert
- [ ] Acknowledge the alert in your monitoring system
- [ ] Notify the on-call team lead
- [ ] Create an incident ticket

### 2. Assess Impact
- [ ] Check if this is a complete outage or partial degradation
- [ ] Identify affected users/customers
- [ ] Determine business impact level

## Investigation Steps

### 3. Check Service Status
```bash
# Check if the service is responding
curl -f http://localhost:3000/health

# Check if the process is running
ps aux | grep "tsx watch src/index.ts"

# Check if the port is listening
netstat -tlnp | grep :3000
```

### 4. Review Recent Changes
- [ ] Check recent deployments
- [ ] Review configuration changes
- [ ] Check for infrastructure changes
- [ ] Review recent code merges

### 5. Check Infrastructure
```bash
# Check Docker containers
docker compose ps

# Check container logs
docker compose logs backend

# Check resource usage
docker stats
```

### 6. Check Dependencies
```bash
# Check database connectivity
docker compose exec backend npx prisma db execute --stdin <<< "SELECT 1"

# Check Redis connectivity
docker compose exec backend npx tsx -e "
import { getRedisClient } from '@pivotal-flow/shared/redis';
const client = getRedisClient();
client.ping().then(() => console.log('Redis OK')).catch(console.error);
"

# Check environment variables
docker compose exec backend env | grep -E "(DATABASE_URL|REDIS_URL|NODE_ENV)"
```

## Log Analysis

### 7. Review Application Logs
```bash
# Check recent application logs
docker compose logs --tail=100 backend

# Check for error patterns
docker compose logs backend | grep -i error

# Check for memory/CPU issues
docker compose logs backend | grep -E "(memory|heap|cpu|event loop)"
```

### 8. Check System Logs
```bash
# Check system resource usage
docker stats --no-stream

# Check disk space
df -h

# Check memory usage
free -h
```

## Common Issues and Solutions

### Issue: Out of Memory
**Symptoms**: Process crashes, "JavaScript heap out of memory" errors
**Solution**:
```bash
# Increase memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Restart service
docker compose restart backend
```

### Issue: Database Connection Pool Exhausted
**Symptoms**: "Connection pool exhausted" errors, slow responses
**Solution**:
```bash
# Check connection count
docker compose exec postgres psql -U postgres -d pivotal_flow -c "SELECT count(*) FROM pg_stat_activity;"

# Restart service to reset connections
docker compose restart backend
```

### Issue: Redis Connection Failure
**Symptoms**: Cache errors, slow performance
**Solution**:
```bash
# Check Redis status
docker compose exec redis redis-cli ping

# Restart Redis if needed
docker compose restart redis
```

## Recovery Procedures

### 9. Restart Service
```bash
# Graceful restart
docker compose restart backend

# Wait for health check
sleep 30
curl -f http://localhost:3000/health

# If still failing, force restart
docker compose stop backend
docker compose start backend
```

### 10. Verify Recovery
- [ ] Health check endpoint responds
- [ ] Service metrics are being collected
- [ ] Error rate returns to normal
- [ ] Response times are acceptable

### 11. Monitor Post-Recovery
- [ ] Watch error rates for 15 minutes
- [ ] Monitor response times
- [ ] Check for any recurring issues
- [ ] Verify all functionality works

## Escalation

### 12. When to Escalate
Escalate to the team lead if:
- Service remains down after restart
- Multiple services are affected
- Business impact is high
- Root cause is unclear after 30 minutes

### 13. Escalation Contacts
- **Team Lead**: [Contact Information]
- **DevOps**: [Contact Information]
- **Infrastructure**: [Contact Information]

## Post-Incident

### 14. Documentation
- [ ] Update incident ticket with resolution
- [ ] Document root cause
- [ ] Update this runbook if needed
- [ ] Schedule post-mortem if required

### 15. Prevention
- [ ] Implement monitoring improvements
- [ ] Add automated recovery procedures
- [ ] Review deployment processes
- [ ] Update alerting thresholds

## Related Documentation

- [Infrastructure Overview](../04_INFRASTRUCTURE_PLAN.md)
- [Monitoring Setup](../infra/docker/README.md)
- [Database Schema](../06_DATABASE_SCHEMA.md)
- [API Design](../07_API_DESIGN.md)

## Quick Reference

| Action | Command | Expected Result |
|--------|---------|-----------------|
| Health Check | `curl -f http://localhost:3000/health` | 200 OK |
| Service Status | `docker compose ps backend` | Up |
| Logs | `docker compose logs --tail=50 backend` | Recent logs |
| Restart | `docker compose restart backend` | Service restarts |

---

**Last Updated**: 2024-12-01  
**Maintainer**: DevOps Team  
**Review Schedule**: Quarterly
