#!/usr/bin/env bash
# Set BatchTimeout in the local fabric-samples channel profile BEFORE channel creation.
# Usage: FABRIC_SAMPLES=/path/to/fabric-samples bash scripts/fabric-batch-timeout.sh 100
set -euo pipefail
: "${FABRIC_SAMPLES:?FABRIC_SAMPLES must point to the extracted fabric-samples checkout}"
ms="${1:?BatchTimeout must be given in milliseconds}"
case "$ms" in 100|500|1000|2000|5000) ;; *) echo "Allowed BatchTimeout: 100, 500, 1000, 2000, 5000 milliseconds" >&2; exit 2;; esac
profile="${FABRIC_SAMPLES}/test-network/configtx/configtx.yaml"
[[ -f "$profile" ]] || { echo "Fabric channel profile missing: $profile" >&2; exit 1; }
node - "$profile" "$ms" <<'NODE'
const fs = require('node:fs');
const [path, millis] = process.argv.slice(2);
const source = fs.readFileSync(path, 'utf8');
const rule = /^(\s*BatchTimeout:\s*)(\S+)(\s*(?:#.*)?)$/gm;
const occurrences = [...source.matchAll(rule)];
if (occurrences.length !== 1) throw new Error('Expected exactly one BatchTimeout entry in official test-network profile');
const timeout = Number(millis) < 1000 ? millis + 'ms' : Number(millis) / 1000 + 's';
const updated = source.replace(rule, (_, prefix, previous, suffix) => prefix + timeout + suffix);
fs.writeFileSync(path, updated);
console.log(JSON.stringify({profile:path,before:occurrences[0][2],configured:timeout}));
NODE
