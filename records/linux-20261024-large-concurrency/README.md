# Linux large-file concurrency scan — 2026-10-24

- Host: Fedora Linux 43 under WSL2, x86_64; benchmark filesystem `/mnt/d` (9p); `ulimit -n=65535`.
- Load: Full Native CLI, HTTP, 64 MiB file, `oha -z 10s -c N`; connections 4, 100, 500 and 1000.
- The 10-second window avoids treating a partially completed 64 MiB response as a zero-byte result. CPU and RSS are sampled from the server process.

This is a scaling sample for the Native CLI. The baseline matrix remains the source for cross-target TLS and Node/WasmGC large-file comparisons.
