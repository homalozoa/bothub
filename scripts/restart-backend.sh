#!/bin/sh
set -eu

if [ "$#" -ne 0 ]; then
  printf 'Usage: %s\n' "$0" >&2
  exit 1
fi

CDPATH= cd -- "$(dirname -- "$0")/.."

if [ ! -f .env ]; then
  printf 'Missing .env in the project root.\n' >&2
  exit 1
fi

compose() {
  docker compose --env-file .env -f deploy/production.compose.yml "$@"
}

# Validate without printing credentials, then reload the backend environment.
# Keep Compose's worker shutdown grace period for requests already in flight.
compose config --quiet
compose up -d --no-deps --no-build --pull never --force-recreate api worker
compose ps api worker
