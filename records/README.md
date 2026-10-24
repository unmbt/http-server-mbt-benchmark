# Result directories

Each directory contains one run of `scripts/run.mbtx`:

- `index.csv` lists platform, requested I/O backend, target, protocol, workload, request count, exit code, resource summaries and JSON path.
- `*.json` is raw `oha --output-format json` output.
- `logs/` contains captured server stdout/stderr for failed readiness or startup diagnostics.
- `resources/` contains the 250 ms server CPU/RSS samples. Windows also records Private Bytes; Linux leaves that metric unsupported.

Keep Windows and Linux in different directories. The 2026-10-24 Linux run has separate `linux-20261024-platform`, `linux-20261024-epoll`, and `linux-20261024-io_uring` directories. Compare rows with the same backend, target, protocol, and workload; record toolchain, Node, CPU, kernel, filesystem, commit and load parameters in that directory's README. `20261024-comparison/` contains the generated CSV, Markdown table and filterable HTML report.
