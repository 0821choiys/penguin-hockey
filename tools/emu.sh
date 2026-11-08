#!/usr/bin/env bash
# Start the Firebase emulators (auth :9099, database :9000) for v31 / v35 tests and wait until both answer.
# usage: bash tools/emu.sh        (stop: pkill -f "firebase emulators")
set -e
cd "$(dirname "$0")/../firebase"
command -v java >/dev/null || { echo "emu.sh: java is missing — the online tests will report SKIPPED"; exit 1; }
command -v firebase >/dev/null || npm i -g firebase-tools@13 >/dev/null 2>&1
curl -s -o /dev/null http://127.0.0.1:9099/ && curl -s -o /dev/null http://127.0.0.1:9000/ && { echo "emulators already up"; exit 0; }
nohup firebase emulators:start --project demo-ph --only auth,database > "${TMPDIR:-/tmp}/emu.log" 2>&1 &
for i in $(seq 1 60); do
  curl -s -o /dev/null http://127.0.0.1:9099/ && curl -s -o /dev/null http://127.0.0.1:9000/ && { echo "emulators up"; exit 0; }
  sleep 3
done
echo "emu.sh: emulators did not start — see ${TMPDIR:-/tmp}/emu.log"; exit 1
