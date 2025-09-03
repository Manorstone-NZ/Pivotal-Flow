#!/usr/bin/env bash
set -euo pipefail

# Required env
# PRODUCTION_DATABASE_NAME  name to keep if it exists locally
# DB_DRY_RUN                yes or no  default yes
# REQUIRE_EXPLICIT_CONFIRM  must equal YES to proceed
# USE_DOCKER                yes or no  default yes
# POSTGRES_SERVICE          docker compose service name  default postgres
# PGUSER PGPASSWORD PGHOST PGPORT as needed for non docker

DB_DRY_RUN="${DB_DRY_RUN:-yes}"
REQUIRE_EXPLICIT_CONFIRM="${REQUIRE_EXPLICIT_CONFIRM:-NO}"
USE_DOCKER="${USE_DOCKER:-yes}"
POSTGRES_SERVICE="${POSTGRES_SERVICE:-postgres}"
PRODUCTION_DATABASE_NAME="${PRODUCTION_DATABASE_NAME:-}"

if [[ "${REQUIRE_EXPLICIT_CONFIRM}" != "YES" ]]; then
  echo "Refusing to proceed. Set REQUIRE_EXPLICIT_CONFIRM=YES to allow destructive action."
  exit 1
fi

# psql wrapper
psql_cmd() {
  if [[ "${USE_DOCKER}" == "yes" ]]; then
    docker compose -f infra/docker/docker-compose.yml exec -T "${POSTGRES_SERVICE}" psql -U postgres -d postgres -At -c "$1"
  else
    psql -U "${PGUSER:-postgres}" -d postgres -At -c "$1"
  fi
}

# List candidate databases
keep_list="'postgres','template0','template1'"
if [[ -n "${PRODUCTION_DATABASE_NAME}" ]]; then
  keep_list="${keep_list},'${PRODUCTION_DATABASE_NAME}'"
fi

echo "Gathering databases to drop..."
DBS=$(psql_cmd "select datname from pg_database where datistemplate = false and datname not in (${keep_list});")
if [[ -z "${DBS}" ]]; then
  echo "No non production databases found."
  exit 0
fi

echo "Databases that would be dropped:"
echo "${DBS}"

if [[ "${DB_DRY_RUN}" == "yes" ]]; then
  echo "Dry run only. Set DB_DRY_RUN=no to actually drop."
  exit 0
fi

while IFS= read -r db; do
  [[ -z "${db}" ]] && continue
  echo "Dropping database ${db}..."
  # Terminate active connections
  if [[ "${USE_DOCKER}" == "yes" ]]; then
    docker compose -f infra/docker/docker-compose.yml exec -T "${POSTGRES_SERVICE}" psql -U postgres -d postgres -c "select pg_terminate_backend(pid) from pg_stat_activity where datname='${db}' and pid <> pg_backend_pid();" >/dev/null
    docker compose -f infra/docker/docker-compose.yml exec -T "${POSTGRES_SERVICE}" psql -U postgres -d postgres -c "drop database if exists \"${db}\";" >/dev/null
  else
    psql -U "${PGUSER:-postgres}" -d postgres -c "select pg_terminate_backend(pid) from pg_stat_activity where datname='${db}' and pid <> pg_backend_pid();" >/dev/null
    psql -U "${PGUSER:-postgres}" -d postgres -c "drop database if exists \"${db}\";" >/dev/null
  fi
  echo "Dropped ${db}"
done <<< "${DBS}"

echo "Completed."
