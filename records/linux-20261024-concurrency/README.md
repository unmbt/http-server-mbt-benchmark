# Linux small-file concurrency scan — 2026-10-24

- Host: Fedora Linux 43 under WSL2, x86_64; 16 logical CPUs, AMD Ryzen 7 8845HS; benchmark filesystem `/mnt/d` (9p).
- Load: `oha -z 2s -c N`, 2048 one-KiB files, HTTP and HTTPS, all five targets. `ulimit -n` was set to `65535` for the scan.
- Connection points: 4, 100, 200, 500, 1000 and 2000. Each `backend-cN` directory has its own port and `index.csv`; `duration` is recorded in the last column.
- `platform` and `epoll` completed all supported target/protocol rows at every connection point. `io_uring` completed the full matrix through 1000; its 2000 directory contains the stable Full CLI HTTP sample after the all-target 2000 run made WSL unresponsive.

The 2000 all-target io_uring attempt is retained as an operational boundary: it was stopped after WSL stopped responding, so it is not represented as a successful matrix row. Use the Full CLI-only high-concurrency samples before attempting larger matrices.
