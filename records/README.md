# Result directories

Each directory contains one run of `scripts/run.mbtx`:

- `index.csv` lists platform, requested I/O backend, target, protocol, workload, request count, exit code, resource summaries and JSON path.
- `*.json` is raw `oha --output-format json` output.
- `logs/` contains captured server stdout/stderr for failed readiness or startup diagnostics.
- `resources/` contains the 250 ms server CPU/RSS samples. Windows also records Private Bytes; Linux leaves that metric unsupported.
- Concurrency scans append `connections` and `duration` to `index.csv`; a duration run uses `oha -z DURATION -c N`, so request totals are taken from the JSON summary rather than a fixed `-n` count.

Keep Windows and Linux in different directories. The 2026-10-24 Linux run has separate `linux-20261024-platform`, `linux-20261024-epoll`, and `linux-20261024-io_uring` directories. Compare rows with the same backend, target, protocol, workload and connection count; record toolchain, Node, CPU, kernel, filesystem, commit and load parameters in that directory's README. `20261024-comparison/` contains the combined baseline and concurrency CSV, Markdown table and filterable ECharts HTML report; `20261024-concurrency-comparison/` contains the concurrency-only view.
