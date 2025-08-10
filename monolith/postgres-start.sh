#!/bin/bash
set -e

# Clean up any stale files
rm -f /var/run/postgresql/.s.PGSQL.5432.lock
rm -f /var/lib/postgresql/14/main/postmaster.pid

# Start PostgreSQL in foreground mode
exec sudo -u postgres /usr/lib/postgresql/14/bin/postgres -D /var/lib/postgresql/14/main -c config_file=/etc/postgresql/14/main/postgresql.conf
