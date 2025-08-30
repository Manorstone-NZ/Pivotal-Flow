# Runbook: Cache Issues

**Service**: Redis Cache  
**Severity**: Medium-High  
**Alerts**: `RedisHighEvictions`, `RedisConnectionFailure`, `CacheLowHitRate`, `RedisHighMemoryUsage`  
**Runbook ID**: RB-03

## Overview

This runbook provides procedures for responding to Redis cache issues in the Pivotal Flow platform, including connection failures, performance degradation, and memory problems.

## Prerequisites

- Access to the Redis instance
- Access to monitoring dashboards
- Knowledge of Redis administration
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

### 3. Check Redis Status
```bash
# Check if Redis is running
docker compose ps redis

# Check Redis connectivity
docker compose exec redis redis-cli ping

# Check Redis info
docker compose exec redis redis-cli info
```

### 4. Check Connection Status
```bash
# Check active connections
docker compose exec redis redis-cli info clients

# Check connection errors
docker compose exec redis redis-cli info stats | grep rejected_connections

# Check memory usage
docker compose exec redis redis-cli info memory
```

### 5. Check Performance Metrics
```bash
# Check operations per second
docker compose exec redis redis-cli info stats | grep ops

# Check hit rate
docker compose exec redis redis-cli info stats | grep keyspace

# Check eviction statistics
docker compose exec redis redis-cli info stats | grep evicted
```

## Common Issues and Solutions

### Issue: Redis Connection Failure
**Symptoms**:
- `RedisConnectionFailure` alert
- Application errors
- Cache miss rate increases

**Investigation**:
```bash
# Check Redis logs
docker compose logs redis

# Check network connectivity
docker compose exec redis redis-cli --raw CLIENT LIST | wc -l

# Check Redis configuration
docker compose exec redis redis-cli CONFIG GET maxclients
docker compose exec redis redis-cli CONFIG GET timeout
```

**Solutions**:
1. **Restart Redis**:
```bash
docker compose restart redis
```

2. **Check for memory issues**:
```bash
# Check if Redis is out of memory
docker compose exec redis redis-cli info memory | grep used_memory_human
docker compose exec redis redis-cli info memory | grep maxmemory_human
```

3. **Check for disk space issues**:
```bash
docker compose exec redis df -h
```

### Issue: High Eviction Rate
**Symptoms**:
- `RedisHighEvictions` alert
- Cache miss rate increases
- Performance degradation

**Investigation**:
```bash
# Check eviction policy
docker compose exec redis redis-cli CONFIG GET maxmemory-policy

# Check memory usage
docker compose exec redis redis-cli info memory | grep -E "(used_memory|maxmemory|evicted_keys)"

# Check key count
docker compose exec redis redis-cli dbsize

# Check key distribution
docker compose exec redis redis-cli info keyspace
```

**Solutions**:
1. **Increase memory limit**:
```bash
# Check current memory limit
docker compose exec redis redis-cli CONFIG GET maxmemory

# Set new memory limit (example: 2GB)
docker compose exec redis redis-cli CONFIG SET maxmemory 2gb
```

2. **Optimize eviction policy**:
```bash
# Set to allkeys-lru for better performance
docker compose exec redis redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

3. **Review key TTLs**:
```bash
# Check keys without expiration
docker compose exec redis redis-cli --scan --pattern "*" | while read key; do
    ttl=$(docker compose exec redis redis-cli ttl "$key")
    if [ "$ttl" -eq -1 ]; then
        echo "Key without TTL: $key"
    fi
done
```

### Issue: Low Cache Hit Rate
**Symptoms**:
- `CacheLowHitRate` alert
- Increased database load
- Slow response times

**Investigation**:
```bash
# Check cache statistics
docker compose exec redis redis-cli info stats | grep -E "(keyspace_hits|keyspace_misses)"

# Calculate hit rate
HITS=$(docker compose exec redis redis-cli info stats | grep keyspace_hits | cut -d: -f2)
MISSES=$(docker compose exec redis redis-cli info stats | grep keyspace_misses | cut -d: -f2)
TOTAL=$((HITS + MISSES))
if [ $TOTAL -gt 0 ]; then
    HIT_RATE=$((HITS * 100 / TOTAL))
    echo "Cache hit rate: ${HIT_RATE}%"
fi

# Check key expiration patterns
docker compose exec redis redis-cli --scan --pattern "*" | head -100 | while read key; do
    ttl=$(docker compose exec redis redis-cli ttl "$key")
    echo "$key: $ttl seconds"
done
```

**Solutions**:
1. **Review cache key strategy**:
```bash
# Check for cache key patterns
docker compose exec redis redis-cli --scan --pattern "*" | head -50 | sort

# Analyze key sizes
docker compose exec redis redis-cli --scan --pattern "*" | head -50 | while read key; do
    size=$(docker compose exec redis redis-cli memory usage "$key" 2>/dev/null || echo "N/A")
    echo "$key: $size bytes"
done
```

2. **Optimize TTL settings**:
```bash
# Set appropriate TTLs for different data types
# Example: Set user data TTL to 15 minutes
docker compose exec redis redis-cli expire "user:123" 900
```

### Issue: High Memory Usage
**Symptoms**:
- `RedisHighMemoryUsage` alert
- Slow performance
- Connection failures

**Investigation**:
```bash
# Check memory breakdown
docker compose exec redis redis-cli info memory

# Check memory usage by key
docker compose exec redis redis-cli --scan --pattern "*" | head -100 | while read key; do
    size=$(docker compose exec redis redis-cli memory usage "$key" 2>/dev/null || echo "0")
    if [ "$size" -gt 10000 ]; then
        echo "Large key: $key ($size bytes)"
    fi
done

# Check for memory fragmentation
docker compose exec redis redis-cli info memory | grep mem_fragmentation_ratio
```

**Solutions**:
1. **Optimize data structures**:
```bash
# Use appropriate data types
# Example: Use hash instead of string for user data
docker compose exec redis redis-cli hset "user:123" "name" "John" "email" "john@example.com"
```

2. **Implement data compression**:
```bash
# Enable compression for large values
docker compose exec redis redis-cli CONFIG SET rdbcompression yes
```

## Recovery Procedures

### 6. Immediate Actions
```bash
# Flush cache if necessary (use with caution)
docker compose exec redis redis-cli FLUSHDB

# Restart Redis if needed
docker compose restart redis

# Check application reconnection
docker compose logs backend | grep -i redis
```

### 7. Performance Optimization
```bash
# Enable persistence if not enabled
docker compose exec redis redis-cli CONFIG SET save "900 1 300 10 60 10000"

# Optimize memory settings
docker compose exec redis redis-cli CONFIG SET maxmemory-policy allkeys-lru
docker compose exec redis redis-cli CONFIG SET maxmemory 2gb

# Enable slow log for debugging
docker compose exec redis redis-cli CONFIG SET slowlog-log-slower-than 10000
docker compose exec redis redis-cli CONFIG SET slowlog-max-len 128
```

### 8. Verify Recovery
- [ ] Redis responds to ping
- [ ] Cache hit rate improves
- [ ] No more eviction alerts
- [ ] Application performance restored

## Monitoring and Prevention

### 9. Set Up Monitoring
```bash
# Enable Redis slow log
docker compose exec redis redis-cli CONFIG SET slowlog-log-slower-than 10000

# Check Redis configuration
docker compose exec redis redis-cli CONFIG GET "*"
```

### 10. Regular Maintenance
```bash
# Monitor memory usage
docker compose exec redis redis-cli info memory

# Check for memory leaks
docker compose exec redis redis-cli --scan --pattern "*" | wc -l

# Review key patterns
docker compose exec redis redis-cli --scan --pattern "*" | head -100 | sort
```

## Escalation

### 11. When to Escalate
Escalate if:
- Redis remains unresponsive after restart
- Memory issues persist after optimization
- Performance degradation affects business
- Root cause is unclear after 1 hour

### 12. Escalation Contacts
- **DevOps Lead**: [Contact Information]
- **Infrastructure Team**: [Contact Information]
- **Application Team**: [Contact Information]

## Post-Incident

### 13. Documentation
- [ ] Document root cause
- [ ] Update monitoring thresholds
- [ ] Review cache key strategy
- [ ] Schedule performance review

### 14. Prevention
- [ ] Implement cache warming
- [ ] Set up automated monitoring
- [ ] Review cache invalidation strategy
- [ ] Update alerting rules

## Related Documentation

- [Infrastructure Plan](../04_INFRASTRUCTURE_PLAN.md)
- [Performance Monitoring](../infra/docker/README.md)
- [Cache Implementation](../packages/shared/src/cache/README.md)
- [Redis Configuration](../infra/docker/README.md)

## Quick Reference

| Issue | Check Command | Solution |
|-------|---------------|----------|
| Connection Failure | `redis-cli ping` | Restart Redis |
| High Evictions | `redis-cli info stats \| grep evicted` | Increase memory, optimize policy |
| Low Hit Rate | `redis-cli info stats \| grep keyspace` | Review TTLs, optimize keys |
| High Memory | `redis-cli info memory` | Optimize data structures, increase limit |

---

**Last Updated**: 2024-12-01  
**Maintainer**: DevOps Team  
**Review Schedule**: Quarterly
