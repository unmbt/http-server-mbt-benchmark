# Windows baseline — 2026-10-24

- Host: Windows x86_64 (loopback, 127.0.0.1)
- Source commit: `7a73818a9e0f010e288f4fa37286febc873388d0`
- Node runtime: `v24.10.0` (HS_NODE points to `http-server-mbt/target/node24/node.exe`)
- Original reference: `http-party/http-server` 14.1.2, installed with `npm ci --ignore-scripts`.
- Moon toolchain:
```
moon 0.1.20261021 (a4f8933 2026-10-21) D:\devenv\moonbit\bin\moon.exe
moonc v0.10.17+093cb8f9c (2026-10-21) \\?\D:\devenv\moonbit\bin\moonc.exe
moonrun 0.1.20261021 (a4f8933 2026-10-21) \\?\D:\devenv\moonbit\bin\moonrun.exe

Feature flags enabled: rr_moon_mod,rr_moon_pkg
```
- Fixture: large.bin = 64 MiB; small/ = 2048 files × 1 KiB; self-signed localhost certificate.
- Load: oha 1.14.0, HTTP keep-alive enabled, 4 requests for large, 2048 requests for small-files, concurrency 4; HTTPS uses --insecure only to trust the local certificate.
- All recorded cases had successRate=1 and exit code 0. cli-thin HTTPS is intentionally unsupported because Thin has no TLS connector.

The JSON files beside this document are raw oha --output-format json results. These are observational measurements from one Windows run, not acceptance thresholds; repeat several times before drawing conclusions.

| target | protocol | workload | requests/s | MiB/s | elapsed (s) |
| --- | --- | --- | ---: | ---: | ---: |
| cli-full | HTTP | large | 6.57 | 420.17 | 0.6093 |
| cli-full | HTTP | small-files | 805.54 | 0.79 | 2.5424 |
| cli-full | HTTPS | large | 0.36 | 23.02 | 11.1224 |
| cli-full | HTTPS | small-files | 570.96 | 0.56 | 3.5870 |
| cli-thin | HTTP | large | 7.00 | 448.23 | 0.5711 |
| cli-thin | HTTP | small-files | 839.95 | 0.82 | 2.4383 |
| napi | HTTP | large | 6.92 | 442.68 | 0.5783 |
| napi | HTTP | small-files | 787.73 | 0.77 | 2.5999 |
| napi | HTTPS | large | 0.33 | 20.98 | 12.2032 |
| napi | HTTPS | small-files | 564.12 | 0.55 | 3.6304 |
| wasmgc | HTTP | large | 2.32 | 148.60 | 1.7228 |
| wasmgc | HTTP | small-files | 346.35 | 0.34 | 5.9132 |
| wasmgc | HTTPS | large | 1.59 | 101.66 | 2.5182 |
| wasmgc | HTTPS | small-files | 333.86 | 0.33 | 6.1342 |
| original | HTTP | large | 3.32 | 212.45 | 1.2050 |
| original | HTTP | small-files | 711.04 | 0.69 | 2.8803 |
| original | HTTPS | large | 2.63 | 168.02 | 1.5236 |
| original | HTTPS | small-files | 687.25 | 0.67 | 2.9800 |

Note: the WasmGC HTTPS rows use the benchmark's Node https wrapper around the WasmGC static engine, so they measure that host path plus TLS rather than a native Wasm TLS implementation.
