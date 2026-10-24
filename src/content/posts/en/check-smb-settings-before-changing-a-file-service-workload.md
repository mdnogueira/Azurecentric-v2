---
title: "Check SMB settings before changing a file-service workload"
description: "Verify SMB dialect and baseline configuration before applying performance tuning to prevent regressions."
pubDate: 2026-01-27
category: windows-server
tags: []
translationKey: check-smb-settings-before-changing-a-file-service-workload
draft: true
---

You are planning to change a file-service workload, perhaps to improve throughput or reduce latency. The first thing to check is not the registry key you intend to modify, but the SMB dialect currently in use and the baseline configuration of the server. Tuning parameters without this context often leads to regressions or misdiagnosed symptoms.

SMB is a negotiation-based protocol. The client and server agree on the highest dialect version both support. In Windows Server 2025, the highest available dialect is SMB 3.1.1, which includes features like encryption, multichannel, and direct storage access (RDMA) support [What is SMB File Sharing for Windows and Windows Server?](https://learn.microsoft.com/en-us/windows-server/storage/file-server/file-server-smb-overview). If your workload is still negotiating SMB 2.1 or lower, you are missing critical performance features such as multichannel, which allows the file server to use multiple network connections simultaneously [Performance Tuning for SMB File Servers](https://learn.microsoft.com/en-us/windows-server/administration/performance-tuning/role/file-server/smb-file-server).

## Confirm the active dialect

Before applying any tuning, verify the dialect version. This tells you whether the workload is using the modern protocol stack or falling back to legacy behaviour.

On the client side, use PowerShell:

```powershell
Get-SMBConnection
```

On the server side, use:

```powershell
Get-SMBSession | FL
```

These commands show the negotiated dialect for each active session. If you see versions older than SMB 3.0, investigate why the client cannot negotiate a higher version. This might be due to legacy application requirements, firewall restrictions, or misconfigured network interfaces.

## Check baseline server configuration

Windows Server 2025 includes a set of default SMB settings optimised for general file serving. Microsoft recommends ensuring that BIOS and OS power management are set to High Performance or appropriate C-State settings before tuning [Performance Tuning for SMB File Servers](https://learn.microsoft.com/en-us/windows-server/administration/performance-tuning/role/file-server/smb-file-server). You should also verify that the latest storage and networking drivers are installed, as outdated drivers can bottleneck SMB performance regardless of protocol settings [Performance Tuning for SMB File Servers](https://learn.microsoft.com/en-us/windows-server/administration/performance-tuning/role/file-server/smb-file-server).

Consider disabling unnecessary services or features that your file server and clients do not require. These include:

- Client-side caching
- File system mini-filters
- Firewall filters
- IPSEC
- NTFS compression
- NTFS encryption
- Scheduled tasks
- Search service
- SMB encryption
- SMB signing
- Teredo

Disabling these can reduce overhead, but you must assess the impact on your specific workload. For example, disabling SMB encryption might improve throughput but exposes data in transit to eavesdropping [What is SMB File Sharing for Windows and Windows Server?](https://learn.microsoft.com/en-us/windows-server/storage/file-server/file-server-smb-overview).

## Identify performance bottlenecks

Use performance counters to identify where the bottleneck lies. SMB 3.0 introduced a set of performance counters that match disk counters, allowing you to reuse existing disk performance tuning guidance [Performance Tuning for SMB File Servers](https://learn.microsoft.com/en-us/windows-server/administration/performance-tuning/role/file-server/smb-file-server). Key counters include:

- **SMB Client Shares**: Information about file shares accessed by clients using SMB 2.0 or higher.
- **SMB Server Shares**: Information about SMB 2.0 or higher file shares on the server.
- **SMB Server Sessions**: Information about SMB server sessions using SMB 2.0 or higher. Note that turning on these counters might have a significant performance impact for high IO workloads [Performance Tuning for SMB File Servers](https://learn.microsoft.com/en-us/windows-server/administration/performance-tuning/role/file-server/smb-file-server).

Log these counters to a local, raw (.blg) performance counter log. It is less expensive to collect all instances using the wildcard character (*) and then extract particular instances during post-processing using Relog.exe [Performance Tuning for SMB File Servers](https://learn.microsoft.com/en-us/windows-server/administration/performance-tuning/role/file-server/smb-file-server).

## Apply tuning parameters cautiously

If you have identified a specific bottleneck, you can adjust registry settings. However, these settings are not universally optimal. Microsoft provides a table of recommended settings for general file server performance, but emphasises that you should evaluate the impact of individual settings before applying them [Performance Tuning for SMB File Servers](https://learn.microsoft.com/en-us/windows-server/administration/performance-tuning/role/file-server/smb-file-server).

For example, the `AdditionalCriticalWorkerThreads` setting affects the number of threads the file system cache uses for read-ahead and write-behind requests. The default is 0, which means no additional critical kernel worker threads are added. Raising this value can improve I/O performance, particularly on systems with many logical processors and powerful storage hardware [Performance Tuning for SMB File Servers](https://learn.microsoft.com/en-us/windows-server/administration/performance-tuning/role/file-server/smb-file-server).

| Parameter | Value | Default |
|---|---|---|
| AdditionalCriticalWorkerThreads | 64 | 0 |

Another setting is `MaxThreadsPerNumaNode`, which controls the number of threads the file server uses to service concurrent requests. The default is 20. Increasing this value might improve performance when inefficient third-party filter drivers are affecting IO. However, Microsoft recommends installing updated third-party filter drivers instead of altering this setting [Performance Tuning for SMB File Servers](https://learn.microsoft.com/en-us/windows-server/administration/performance-tuning/role/file-server/smb-file-server).

## Verify the changes

After applying any tuning, verify the impact using the same performance counters and network traces you used for baseline measurement. Use `netsh trace` to collect network traces on both the client and server sides to analyse the traffic [Advanced Troubleshooting Server Message Block (SMB)](https://learn.microsoft.com/en-us/windows-server/storage/file-server/troubleshoot/troubleshooting-smb).

```cmd
netsh trace start capture=yes report=yes scenario=NetConnection level=5 maxsize=1024 tracefile=c:\Temp\netTrace.etl
```

Reproduce the workload, then stop the trace:

```cmd
netsh trace stop
```

Analyse the ETL file using Wireshark to check for TCP retransmits, resets, or other anomalies [Advanced Troubleshooting Server Message Block (SMB)](https://learn.microsoft.com/en-us/windows-server/storage/file-server/troubleshoot/troubleshooting-smb). If the workload performance has not improved, or has degraded, revert the changes and re-evaluate the baseline configuration.

tags: [smb, windows-server-2025, file-sharing, performance-tuning, troubleshooting]
diagram: {title:
