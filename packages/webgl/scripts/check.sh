#!/usr/bin/env sh
set -eu

pnpm run typecheck
pnpm run lint
pnpm run format:check
