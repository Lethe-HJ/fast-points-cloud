#!/usr/bin/env sh
set -eu

pnpm -r --filter "./packages/*" --filter "./apps/*" run lint
