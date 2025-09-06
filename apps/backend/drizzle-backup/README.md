# Drizzle Database Migrations

## Local databases disabled

All local databases are removed and blocked by default. Engineers must connect to the production database or explicitly opt in using `ALLOW_LOCAL_DB_CREATION=yes` and by enabling the docker profile.

### Policy

- Local database creation is blocked by default
- All migration commands are guarded against local database URLs
- Docker Compose services require explicit profile activation
- Non-production databases are automatically dropped

### Usage

To enable local database development:

1. Set environment variable: `export ALLOW_LOCAL_DB_CREATION=yes`
2. Enable local database profile: `docker compose --profile local_db up postgres`
3. Run migrations: `pnpm drizzle:migrate`

### Drop non-production databases

Dry run to see what would be dropped:
```bash
USE_DOCKER=yes PRODUCTION_DATABASE_NAME=pivotal_prod pnpm db:drop:nonprod:dry
```

Actually drop databases:
```bash
USE_DOCKER=yes PRODUCTION_DATABASE_NAME=pivotal_prod pnpm db:drop:nonprod
```

### Notes

- If the production database name is not known locally, leave `PRODUCTION_DATABASE_NAME` empty
- The script will only keep system databases (postgres, template0, template1)
- All migration and reset commands must go through `scripts/db/guard_migrations.sh`
- Local recreation is blocked unless explicitly allowed
