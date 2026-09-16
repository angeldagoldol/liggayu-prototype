#!/bin/sh
# Core tests only: no Python, npm or external dependencies required.
set -eu
cd "$(dirname "$0")"
if ! command -v javac >/dev/null 2>&1 || ! command -v java >/dev/null 2>&1; then
  echo "Install a full JDK 17 or newer before running the tests." >&2
  exit 1
fi
mkdir -p build
javac --release 17 --add-modules jdk.httpserver -encoding UTF-8 -Xlint:all -d build src/StudentStore.java src/StudentServer.java tests/StudentStoreTest.java
java -cp build StudentStoreTest
