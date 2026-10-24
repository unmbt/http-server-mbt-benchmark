# Windows/Linux comparison — 2026-10-24

`summary.csv` joins the Windows resource-enabled baseline with Linux WSL `platform`, `epoll`, and `io_uring` runs. `comparison.md` is a complete Markdown table. `report.html` is a self-contained filterable report with bars for requests/s, MiB/s, CPU average, and RSS average.

The Windows run used Node `v24.10.0` and `oha 1.14.0`; Linux used Node `v22.22.1`, Fedora 43 WSL2 kernel `6.6.87.2-microsoft-standard-WSL2`, and the same `oha 1.14.0`. Windows resource values are Working Set/Private Bytes from PowerShell; Linux values are RSS from `ps`, so Private Bytes is blank on Linux. The Linux benchmark filesystem is WSL's `/mnt/d` 9p mount, which is part of the observed environment.

The comparison is observational: one run per case, 64 MiB large file, 2048 small files × 1 KiB, concurrency 4, 4 large requests and 2048 small-file requests. Readiness and exit status are recorded in each source directory; Thin HTTPS remains unsupported by design.
