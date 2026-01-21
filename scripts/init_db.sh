#!/usr/bin/env bash
set -euo pipefail

: "${DATABASE_URL:?Set DATABASE_URL, e.g. postgres://nlr:nlr@localhost:5432/nlr}"

psql "$DATABASE_URL" -f "$(dirname "$0")/../docs/schema.sql"
echo "DB initialized."
