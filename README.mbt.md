# http-server-mbt-benchmark

这个仓库用同一组夹具和 `oha` 请求参数比较 `http-server-mbt`、Node-API 原生模块、WasmGC Node 宿主和原版 `http-server`。记录覆盖 Windows x86_64、WSL Linux 的 `platform`、`epoll` 和 `io_uring`，按 `backend + target + protocol + workload` 对齐差异，并同时记录 server CPU 和内存。

## 覆盖的服务形态

- `cli-full`：当前项目 Full Native CLI；HTTP 和 HTTPS 都测，Windows 使用已构建的候选 CLI。
- `cli-thin`：当前项目 Thin Native CLI；只测 HTTP。Thin 没有 TLS 连接器，因此 HTTPS 明确记录为 `unsupported`。
- `napi`：Node 进程加载 `http-server-mbt` 的 Node-API 原生模块，直接启动 Native HTTP/HTTPS server。
- `wasmgc`：Node 加载 `target/wasm/engine.wasm`，文件和 HTTP 由 Node 宿主提供；HTTPS case 使用本仓库的 Node `https` 外层，因此包含宿主 TLS 成本，不代表 WasmGC 自带 TLS。
- `original`：本地被忽略的 `http-party/http-server` 参考仓库（当前为 14.1.2）。它只作为对比输入，不修改其源码。

Linux 的 backend 参数只对 Native CLI 和 Node-API 生效；WasmGC 使用 Node 宿主，原版使用 Node 自身事件循环，因此它们在 epoll/io_uring 目录中的 backend 是请求标签，不应解释为它们切换了内核后端。

## 负载

`prepare.mbtx` 默认生成：

- `data/public/large.bin`：64 MiB 顺序大文件；
- `data/public/small/`：2048 个、每个 1 KiB 的小文件；
- `state/certs/server.crt` 和 `server.key`：仅供本机 HTTPS 测试的自签名证书。

`run.mbtx` 使用 HTTP keep-alive、并发 4；大文件请求数默认 12，小文件 case 默认覆盖 2048 个 URL。Windows 基线记录使用 4 个大文件请求以缩短首轮耗时，具体参数写在对应记录 README。HTTPS 请求只对本地证书使用 `--insecure`。

## CPU 和内存记录

每个 server 进程启动后，`run.mbtx` 每 250 ms 采样一次，并在请求结束、终止 server 前再采样一次。采样器只查询被测进程的 PID，不把 `oha`、PowerShell 或 `ps` 的资源计入被测进程。每个 case 会生成 `resources/<case>.csv`，包含采样时间、原始 CPU 值、CPU 百分比、工作集/RSS 和 Private Bytes；`index.csv` 同时保存请求 backend、有效 CPU 样本数、平均/峰值 CPU 百分比，以及平均/峰值工作集。RSS 平均值使用增量算法，避免长小文件 case 的累计溢出。

Windows 的 CPU 使用 `Get-Process.TotalProcessorTime.Ticks` 与采样间隔计算，内存使用 Working Set 和 Private Bytes。Linux 使用 `ps %cpu` 与 RSS（KiB 转字节）；Linux 没有可直接对应的 Private Bytes，因此该两列为空并将 `private_bytes_supported` 设为 `false`。逐样本 CSV 的 `cpu_raw` 在 Windows 是累计 ticks，在 Linux 是 `ps` 百分比乘 100。CPU 平均值只包含有时间间隔的样本；短 case 可能只有最终的很短间隔，结果应结合 `resource_samples` 和逐样本 CSV 阅读。监控命令的开销不计入 server 指标，但会给主机增加少量负载。

## Windows 首次运行

在本仓库根目录执行：

```powershell
moon run scripts/prepare.mbtx

$env:HS_PROJECT_ROOT = 'D:/project/moonbit/http-server-mbt'
$env:HS_NODE = 'D:/project/moonbit/http-server-mbt/target/node24/node.exe'
$env:BENCH_PLATFORM = 'windows'
$env:BENCH_RESULT_DIR = 'records/windows-20261024-resources'
moon run scripts/run.mbtx -- --project-root $env:HS_PROJECT_ROOT --requests 4 --connections 4 --small-count 2048
```

Node-API 和 WasmGC 需要当前项目已经有 `target/node/http_server.win32-x64-msvc.node` 与 `target/wasm/engine.wasm`。Full/Thin CLI 默认查找 `target/candidate/cli/`；也可以显式指定 `$env:HS_CLI_FULL`、`$env:HS_CLI_THIN`。原版参考仓库缺少依赖时，在那个被忽略目录执行一次：

```powershell
npm ci --ignore-scripts
```

若只想试一个 case，可以增加 `--target cli-thin|cli-full|napi|wasmgc|original`、`--protocol http|https` 或 `--workload large|small-files`。默认结果写入被忽略的 `results/`；设置 `BENCH_RESULT_DIR` 后可把 JSON、日志、资源 CSV 和 `index.csv` 保存到可提交的记录目录。

## Linux 复跑

在 Linux 服务上使用同一份仓库和夹具命令；将路径改为 Linux 实际构建产物，并给出原版参考仓库位置。WSL 本次使用 Fedora 43、Node 22、`oha 1.14.0`；`oha` 通过 root 的 rsproxy Cargo 配置安装：

```toml
[source.crates-io]
replace-with = 'rsproxy-sparse'
[source.rsproxy]
registry = "https://rsproxy.cn/crates.io-index"
[source.rsproxy-sparse]
registry = "sparse+https://rsproxy.cn/index/"
[registries.rsproxy]
index = "https://rsproxy.cn/crates.io-index"
[net]
git-fetch-with-cli = true
```

然后执行：

```bash
moon run scripts/prepare.mbtx
export HS_PROJECT_ROOT=/srv/http-server-mbt
export HS_NODE=/usr/local/bin/node
export HS_CLI_FULL=/srv/http-server-mbt/target/candidate/cli/http-server-mbt-linux-x64
export HS_CLI_THIN=/srv/http-server-mbt/target/candidate/cli/http-server-mbt-thin-linux-x64
export HS_ORIGINAL_BIN=/srv/http-server-mbt/http-server/bin/http-server
export BENCH_PLATFORM=linux
export BENCH_RESULT_DIR=records/linux-YYYYMMDD
moon run scripts/run.mbtx -- --project-root "$HS_PROJECT_ROOT" --requests 4 --connections 4 --small-count 2048
```

在 Linux 上设置 `BENCH_LOAD_TOOL=oha`；`--io-backend platform|epoll|io_uring` 分别写入独立记录目录，避免不同 backend 覆盖文件。Linux 结果和环境说明见 `records/linux-20261024-*`。

Node 版本、CPU、内核、文件系统、`oha` 版本和提交号都要写进新的 `records/linux-YYYYMMDD/README.md`。不要把 Linux 结果覆盖 Windows 目录；比较时使用两个目录中的 `index.csv`，按相同的 target、protocol、workload 对齐 `requestsPerSec`、`sizePerSec`、`successRate`、`cpu_avg_percent`、`cpu_peak_percent`、`working_set_avg_bytes` 和 `working_set_peak_bytes`。CPU 和内存的采样来源不同，跨平台比较要保留 `resource_source` 和各自的主机信息。

## 报告和图表

在四个源记录目录都存在时运行：

```bash
moon run scripts/report.mbtx -- --out records/20261024-comparison
```

它生成 `summary.csv`、`comparison.md` 和自包含的 `report.html`。HTML 可以按平台、backend、target、协议和负载筛选，并绘制请求速率、MiB/s、CPU 平均值和 RSS 平均值。

## 记录和解释

[records/windows-20261024-resources](records/windows-20261024-resources/README.md) 是带 CPU/内存采样的本机首轮结果；[records/windows-20261024](records/windows-20261024/README.md) 保留不含资源列的早期结果。JSON 是 `oha --output-format json` 原始输出，`resources/` 保存逐样本资源数据。它们是一次观测，不是性能门槛；重复运行时应保留每次的目录。WasmGC HTTPS 和 Native HTTPS 的 TLS 终止位置不同，跨实现比较时需要单独标注。Windows 与 Linux 的差异应和工具链、Node 版本、CPU、内核及文件系统一起阅读，不能只比较单个数字。
