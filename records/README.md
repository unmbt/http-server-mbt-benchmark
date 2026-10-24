# Result directories

Each directory contains one run of `scripts/run.mbtx`:

- `index.csv` lists target, protocol, workload, request count, exit code and JSON path.
- `*.json` is raw `oha --output-format json` output.
- `logs/` contains captured server stdout/stderr for failed readiness or startup diagnostics.

Keep Windows and Linux in different directories. Compare rows with the same `target`, `protocol`, and `workload`; record toolchain, Node, CPU, kernel, filesystem, commit and load parameters in that directory's README.