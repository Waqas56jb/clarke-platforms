#!/bin/sh
# Run from the server directory after configuring .env. Store backups encrypted off-host.
set -eu
stamp="$(date -u +%Y%m%dT%H%M%SZ)"
docker compose exec -T db pg_dump -U clarke -d clarke_coin --format=custom > "clarke_coin_${stamp}.dump"
echo "Created clarke_coin_${stamp}.dump; encrypt it and move it to secure off-site storage."
