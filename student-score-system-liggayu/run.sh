#!/bin/sh
# macOS/Linux: sh run.sh [optional-port]
set -eu
cd "$(dirname "$0")"
for tool in java javac; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    echo "Missing $tool. Install a full Java Development Kit (JDK 17 or newer), then reopen this terminal." >&2
    exit 1
  fi
done
mkdir -p build
if ! javac --release 17 --add-modules jdk.httpserver -encoding UTF-8 -d build src/StudentStore.java src/StudentServer.java; then
  echo "Compilation failed. Check that javac is from JDK 17 or newer." >&2
  exit 1
fi
exec java --add-modules jdk.httpserver -cp build StudentServer "$@"
