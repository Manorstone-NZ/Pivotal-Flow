# Backup and Restore Scripts - Pivotal Flow Platform

This directory contains automated backup and restore scripts for the Pivotal Flow PostgreSQL database.

## Overview

The backup and restore system provides automated daily backups with point-in-time recovery capabilities using PostgreSQL's Write-Ahead Log (WAL) approach.

## Scripts

### Daily Backup Script
**File**: [daily-backup.sh](daily-backup.sh)  
**Purpose**: Automated daily database backups with retention management  
**Schedule**: Designed to run daily via cron or scheduler

**Features**:
- Automated PostgreSQL backups using `pg_dump`
- 7-day retention policy
- Backup verification and size reporting
- Automatic cleanup of old backups
- Latest backup symlink for easy access

**Usage**:
```bash
# Manual execution
./daily-backup.sh

# Add to crontab for daily execution at 2 AM
0 2 * * * /path/to/scripts/backup/daily-backup.sh
```

### Restore Script
**File**: [restore.sh](restore.sh)  
**Purpose**: Safe database restoration to fresh databases  
**Safety**: Prevents accidental overwriting of production data

**Features**:
- Safe restore to new database (never overwrites production)
- Comprehensive validation and verification
- Support for force restore and database dropping
- Detailed progress reporting
- Connection string generation for restored database

**Usage**:
```bash
# Basic restore
./restore.sh backups/pivotal_flow_backup_20241201_120000.sql

# Restore to specific database name
./restore.sh backups/latest_backup.sql -d my_test_db

# Force restore (drop existing database)
./restore.sh backups/latest_backup.sql -d my_test_db -D

# Force restore without confirmation
./restore.sh backups/latest_backup.sql -d my_test_db -D -f
```

## Configuration

### Environment Variables
The scripts read database connection details from your `.env` file:

```bash
# Required in .env file
DATABASE_URL=postgresql://username:password@host:port/database

# Optional overrides
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_NAME=pivotal_flow
```

### Backup Directory
Backups are stored in the `backups/` directory at the project root:

```
backups/
├── pivotal_flow_backup_20241201_020000.sql
├── pivotal_flow_backup_20241202_020000.sql
├── pivotal_flow_backup_20241203_020000.sql
├── latest_backup.sql -> pivotal_flow_backup_20241203_020000.sql
└── ...
```

## Backup Strategy

### Daily Backups
- **Frequency**: Daily at 2:00 AM (configurable)
- **Retention**: 7 days
- **Format**: SQL dump with `pg_dump`
- **Compression**: None (for easy inspection and restoration)

### WAL Archiving
PostgreSQL is configured with WAL archiving enabled for point-in-time recovery:

```sql
-- Check WAL configuration
SHOW wal_level;
SHOW archive_mode;
SHOW archive_command;
```

### Point-in-Time Recovery
To recover to a specific point in time:

1. **Restore the latest backup**:
   ```bash
   ./restore.sh backups/latest_backup.sql -d recovery_db
   ```

2. **Apply WAL files** to reach the desired recovery point:
   ```sql
   -- In the recovered database
   SELECT pg_wal_replay_resume();
   ```

## Security Considerations

### Credential Management
- **No hardcoded passwords**: All credentials come from environment variables
- **Secure extraction**: Database connection details parsed from DATABASE_URL
- **Environment isolation**: Different credentials for different environments

### File Permissions
- **Backup files**: Readable only by script owner
- **Scripts**: Executable only by authorized users
- **Directory access**: Restricted to necessary users only

### Network Security
- **Local backups**: Backups stored on local filesystem
- **Connection security**: Uses PostgreSQL's built-in security features
- **No external transmission**: Backups stay within the secure environment

## Monitoring and Maintenance

### Backup Monitoring
Monitor backup success and size:

```bash
# Check backup status
ls -la backups/

# Verify latest backup
./restore.sh backups/latest_backup.sql -d verify_db --dry-run

# Check backup sizes
du -sh backups/*
```

### Maintenance Tasks
- **Weekly**: Verify backup integrity
- **Monthly**: Test restore procedures
- **Quarterly**: Review retention policies
- **Annually**: Update backup strategies

## Troubleshooting

### Common Issues

**Backup Fails**:
```bash
# Check database connectivity
docker compose exec postgres pg_isready -U postgres

# Verify environment variables
docker compose exec backend env | grep DATABASE

# Check disk space
df -h
```

**Restore Fails**:
```bash
# Verify backup file integrity
head -10 backups/pivotal_flow_backup_*.sql

# Check target database permissions
docker compose exec postgres psql -U postgres -c "SELECT current_user;"

# Verify backup file format
file backups/pivotal_flow_backup_*.sql
```

**Permission Issues**:
```bash
# Fix script permissions
chmod +x scripts/backup/*.sh

# Fix backup directory permissions
chmod 750 backups/
chown $USER:$USER backups/
```

### Recovery Procedures

**Corrupted Backup**:
1. Delete the corrupted backup file
2. Restore from the previous backup
3. Investigate the cause of corruption
4. Implement preventive measures

**Failed Restore**:
1. Check error messages in the restore output
2. Verify database connectivity and permissions
3. Ensure sufficient disk space
4. Try restoring to a different database name

## Best Practices

### Backup Management
- **Test restores regularly**: Ensure backups are valid
- **Monitor backup sizes**: Watch for unusual growth
- **Verify backup content**: Check that all tables are included
- **Document procedures**: Keep runbooks updated

### Security
- **Limit access**: Only authorized users should run backup scripts
- **Audit logs**: Monitor backup and restore activities
- **Encrypt sensitive data**: Consider encryption for production backups
- **Secure storage**: Protect backup files from unauthorized access

### Performance
- **Schedule during low-traffic periods**: Minimize impact on production
- **Monitor backup duration**: Watch for performance degradation
- **Optimize retention**: Balance storage costs with recovery needs
- **Use appropriate compression**: Consider gzip for long-term storage

## Related Documentation

- [Database Schema](../../docs/06_DATABASE_SCHEMA.md) - Database structure and relationships
- [Infrastructure Plan](../../docs/04_INFRASTRUCTURE_PLAN.md) - Infrastructure and deployment details
- [Monitoring Setup](../../infra/docker/README.md) - Monitoring and alerting configuration
- [Runbooks](../../docs/runbooks/README.md) - Incident response procedures

## Support

### Getting Help
- **Documentation**: Check this README and related docs
- **Runbooks**: Use RB-02 for database-related issues
- **Team Lead**: Escalate complex backup/restore problems
- **Emergency**: Contact infrastructure team for critical issues

---

**Last Updated**: 2024-12-01  
**Maintainer**: DevOps Team  
**Review Schedule**: Quarterly
