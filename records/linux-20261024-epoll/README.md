# Linux WSL benchmark — epoll backend — 2026-10-24

- Host: Fedora Linux 43 under WSL2, x86_64; kernel `6.6.87.2-microsoft-standard-WSL2`; 16 logical CPUs, AMD Ryzen 7 8845HS.
- Filesystem: `/mnt/d` (`9p`); loopback requests to `127.0.0.1`.
- Source: http-server-mbt `7a73818a9e0f010e288f4fa37286febc873388d0`; benchmark harness `0ace07c5545bc65c986462eacff521b0033e1701` plus the backend/report changes in the working tree.
- Runtime: Node `v22.22.1`; Moon `0.1.20261023`; moonc `v0.10.17+d971670cd`; clang `21.1.8`; `oha 1.14.0`.
- Load: 64 MiB large file, 2048 × 1 KiB small files, 4 connections; 4 large-file requests and 2048 small-file requests; HTTPS uses the local self-signed certificate with `oha --insecure`.
- Requested backend: `epoll`, passed explicitly to Full and Thin CLI and to the NAPI configuration. WasmGC and original remain Node host implementations.
- All 18 supported rows completed with readiness true and `exit_code=0`; Thin HTTPS is explicitly unsupported. Linux CPU is `ps %cpu`; memory is RSS from `ps`, and Private Bytes is unavailable.

The raw `oha` JSON files, per-case resource samples, and `index.csv` are in this directory. The benchmark root's `records/20261024-comparison/` contains the combined table and HTML charts.
