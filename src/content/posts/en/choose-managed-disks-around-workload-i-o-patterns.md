---
title: "Choose managed disks around workload I/O patterns"
description: "Choose managed disk redundancy and sharing by matching write latency, cross-zone needs, and cluster requirements."
pubDate: 2026-07-04
category: storage
tags: ["managed-disks", "lrs", "zrs", "availability-zones", "shared-disks"]
translationKey: choose-managed-disks-around-workload-i-o-patterns
draft: false
---

You are deploying a virtual machine and need to decide between locally redundant storage (LRS) and zone-redundant storage (ZRS) for the managed disks. The choice is not about which is "better" in general, but which matches your workload's tolerance for latency and its ability to survive a zone outage.

LRS offers lower write latency because it synchronously writes data to three copies within a single data centre. ZRS synchronously replicates data across three availability zones, providing higher availability but introducing additional write latency. If your application cannot tolerate the latency of ZRS, or if it already handles synchronous writes across zones at the application layer, LRS may be the more appropriate choice.

## Understand the latency trade-off

The primary technical difference between LRS and ZRS for managed disks is where the synchronous writes occur. LRS replicates data three times within a single data centre in the selected region. This means writes are synchronously committed to three copies in the same physical location, resulting in lower latency. ZRS, on the other hand, synchronously replicates the disk across three separate availability zones. Each zone is a distinct physical location with independent power, cooling, and networking. The need to synchronously replicate across these zones introduces additional write latency compared to LRS.

For many workloads, this latency difference is negligible. For others, particularly those with strict I/O requirements, it can be significant. Microsoft recommends benchmarking your disks to simulate your application's workload and compare the latency between LRS and ZRS disks before making a final decision [Redundancy options for Azure managed disks](https://learn.microsoft.com/en-us/azure/virtual-machines/disks-redundancy).

## Evaluate your application's resilience strategy

Your choice of redundancy should align with how your application handles failures. If your application is designed to synchronously write data to two zones and automatically failover during a disaster, LRS disks can be a cost-effective and low-latency option. Examples include SQL Server Always On availability groups, which can manage data consistency across zones independently of the storage layer [Redundancy options for Azure managed disks](https://learn.microsoft.com/en-us/azure/virtual-machines/disks-redundancy).

If your application does not support synchronous cross-zone writes, or if you require the storage layer to handle zone-level failures, ZRS is the better choice. ZRS disks provide higher availability because they protect against zonal failures. If a zone goes down and your virtual machine is not affected, your workloads continue running. If your VM is affected, you can recover by taking a snapshot or copying the ZRS disk to another VM, or by using the force detach feature (preview) to forcibly detach ZRS data disks from failed VMs and attach them to another VM [Redundancy options for Azure managed disks](https://learn.microsoft.com/en-us/azure/virtual-machines/disks-redundancy).

For workloads that require zero Recovery Point Objective (RPO), ZRS disks are ideal because they synchronously replicate data across zones. LRS disks do not provide this level of protection against zonal failures. To protect an LRS disk from a zonal failure, you would need to take frequent backups with ZRS snapshots or enable cross-zone disaster recovery via Azure Site Recovery, but this does not provide zero RPO [Redundancy options for Azure managed disks](https://learn.microsoft.com/en-us/azure/virtual-machines/disks-redundancy).

## Consider shared disk requirements

If you are deploying clustered applications that require shared disks, such as SQL Failover Cluster Instances (FCI) or SAP ASCS/SCS, the choice of redundancy becomes more constrained. Shared disks can only be shared across availability zones if you use ZRS disks. LRS disks cannot be shared across zones [Enable shared disks for Azure managed disks](https://learn.microsoft.com/en-us/azure/virtual-machines/disks-shared-enable).

Additionally, shared disks have specific limitations. Host caching is not supported for shared disks, and disk bursting is not available for Premium SSD disks with `maxShares > 1` [Enable shared disks for Azure managed disks](https://learn.microsoft.com/en-us/azure/virtual-machines/disks-shared-enable). If you are using Premium SSD or Standard SSD disks, you can only enable shared disks on data disks, not OS disks [Enable shared disks for Azure managed disks](https://learn.microsoft.com/en-us/azure/virtual-machines/disks-shared-enable).

## Make the decision

To decide between LRS and ZRS, consider the following:

1. **Latency sensitivity:** If your application is sensitive to write latency, benchmark both options. LRS will generally offer lower latency.
2. **Resilience requirements:** If your application does not handle cross-zone failures, or if you require zero RPO, choose ZRS.
3. **Shared disk needs:** If you need to share the disk across zones, you must use ZRS.
4. **Cost:** ZRS may incur higher costs due to the additional replication across zones. Check the [Azure pricing page](https://azure.microsoft.com/pricing/details/managed-disks/) for details [Redundancy options for Azure managed disks](https://learn.microsoft.com/en-us/azure/virtual-machines/disks-redundancy).

If you are unsure, start with a pilot using a non-production subscription to benchmark the latency and test your application's resilience strategy. Record the results and compare them against your application's requirements.

For example, if you are deploying a SQL Server Always On availability group, you might choose LRS disks and let the application handle cross-zone replication. If you are deploying a SAP ASCS/SCS instance, you would likely choose ZRS disks to ensure the shared disk is available across zones.

Once you have made your decision, you can create the disk using the Azure portal, CLI, or PowerShell. For ZRS disks, you can also convert an existing LRS disk to ZRS if your requirements change [Redundancy options for Azure managed disks](https://learn.microsoft.com/en-us/azure/virtual-machines/disks-redundancy).

To verify your choice, check the disk's redundancy setting in the Azure portal or via CLI. For LRS, the redundancy should be set to `Locally-redundant storage`. For ZRS, it should be set to `Zone-redundant storage` [Redundancy options for Azure managed disks](https://learn.microsoft.com/en-us/azure/virtual-machines/disks-redundancy).

If you are using shared disks, ensure that the `maxShares` value is set correctly and that the disk is unmounted from all VMs before changing this value [Enable shared disks for Azure managed disks](https://learn.microsoft.com/en-us/azure/virtual-machines/disks-shared-enable).

Ultimately, the choice between LRS and ZRS depends on your specific workload requirements. There is no one-size-fits-all answer. Benchmark, test, and choose the option that best fits your application's needs.
