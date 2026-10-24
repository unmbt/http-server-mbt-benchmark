# Linux high-concurrency smoke scan — 2026-10-24

- Host: Fedora Linux 43 under WSL2, x86_64; `ulimit -n=65535`.
- Load: Full Native CLI, HTTP, 2048 small files, `oha -z 1s -c N`; N is 5000 and 10000.
- `platform`, `epoll` and `io_uring` each reached both connection points with `exit_code=0` and 100% successful requests in this one-second smoke window.

These are capacity checks rather than steady-state ranking runs. Do not infer that a full HTTPS or all-target matrix at 10000 connections is safe; extend one backend and one target at a time while watching WSL memory and file descriptors.
