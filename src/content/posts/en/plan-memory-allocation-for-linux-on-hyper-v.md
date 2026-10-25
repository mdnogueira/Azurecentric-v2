---
title: "Plan memory allocation for Linux on Hyper-V"
description: "Plan Linux VM memory on Hyper-V: verify distribution support, configure limits correctly, and avoid hot-add failures."
pubDate: 2025-01-18
category: hyper-v
tags: ["hyper-v", "linux", "memory", "virtual-machines", "windows-server"]
translationKey: plan-memory-allocation-for-linux-on-hyper-v
draft: false
---

How much memory should you allocate to a Linux virtual machine on Hyper-V? The answer depends on whether the workload benefits from dynamic memory management and whether the specific Linux distribution supports it. For many modern Linux distributions, static memory allocation is the simplest and most predictable approach. If you need the flexibility of dynamic memory, you must ensure the guest kernel supports ballooning and hot-add, and you must configure the limits correctly to avoid allocation failures.

## Static memory: the baseline choice

Static memory allocation assigns a fixed amount of RAM to the virtual machine at creation. The guest operating system sees this amount as its total available memory, regardless of the host's current load. This approach avoids the complexity of configuring minimum, maximum, and startup memory values, and eliminates the potential interactions with memory ballooning drivers.

For workloads where memory usage is predictable, such as database servers or application servers with defined capacity, static memory is often the preferred choice. It simplifies troubleshooting because the memory footprint of the VM is constant. You can set the memory using Hyper-V Manager or PowerShell:

```powershell
Set-VM -VMName "LinuxVM" -MemoryStartupBytes 4GB
```

This command sets both the startup and running memory to 4GB. The VM cannot use more or less than this amount unless you manually change the setting. This predictability is valuable for capacity planning and performance consistency.

## Dynamic memory: when and how to use it

Dynamic memory allows the Hyper-V host to adjust the amount of RAM assigned to a VM based on demand. This feature is useful for workloads with variable memory usage or when you want to overcommit host memory to improve density. However, dynamic memory requires specific support from the Linux guest.

Not all Linux distributions support dynamic memory features. According to the supported SUSE Linux Enterprise Server (SLES) virtual machines documentation, dynamic memory support varies by version. For example, SLES 12 SP1 and later support dynamic memory ballooning, while hot-add is available from SLES 12 SP3 onwards. Similarly, other distributions like RHEL and Ubuntu have their own support matrices. You must check the specific support page for your distribution to confirm which features are available.

If your distribution supports dynamic memory, you need to configure three key parameters: startup memory, minimum memory, and maximum memory. These parameters define the range within which the host can adjust the VM's memory.

* **Startup memory**: The amount of memory assigned to the VM when it starts. This should be sufficient for the OS and essential services to boot.
* **Minimum memory**: The lowest amount of memory the host can assign to the VM. This should be set high enough to prevent the guest from becoming unresponsive under pressure.
* **Maximum memory**: The highest amount of memory the host can assign to the VM. This should reflect the maximum memory the workload might need.

For Windows Server 2016 and Windows Server 2012, Microsoft recommends setting these values in multiples of 128MB to avoid hot-add failures. While this specific recommendation is for Windows Server 2016/2012 hosts or specific LIS versions, it is a good practice to follow for Linux as well to ensure compatibility with the Hyper-V memory management infrastructure.

```powershell
Set-VM -VMName "LinuxVM" -MemoryStartupBytes 2GB -MemoryMinimumBytes 1GB -MemoryMaximumBytes 8GB
```

This configuration allows the VM to start with 2GB, shrink to 1GB if the host is under memory pressure, and expand to 8GB if the workload demands it.

## Verifying support and monitoring

Before enabling dynamic memory, verify that your Linux distribution supports the required features. Check the supported virtual machines documentation for your specific distribution and version. Look for entries indicating support for "Dynamic Memory - Hot-Add" and "Dynamic Memory - Ballooning".

Once dynamic memory is enabled, monitor the VM's memory usage and the host's memory pressure. Use performance counters or guest tools to track memory consumption. If the VM frequently hits the minimum memory limit, consider increasing the minimum or the startup memory. If the VM frequently hits the maximum limit, consider increasing the maximum or evaluating whether the workload can be optimized.

Be aware that dynamic memory operations can fail if the guest operating system is running too low on memory. Ensure that the minimum memory is set high enough to prevent this scenario. Additionally, some applications that consume large amounts of memory may be limited to consuming up to 80% of available RAM when dynamic memory is enabled, depending on the guest OS configuration.


Reference: [Plan for Hyper-V on Windows Server 2016](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/plan/plan-hyper-v-on-windows-server).
