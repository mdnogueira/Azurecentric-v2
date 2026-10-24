---
title: "Choose VHDX settings around capacity and performance needs"
description: "Select VHDX settings by balancing capacity, resilience and storage protocol support against your workload requirements."
pubDate: 2025-03-15
category: hyper-v
tags: ["hyper-v", "vhdx", "windows-server", "storage", "best-practices"]
translationKey: choose-vhdx-settings-around-capacity-and-performance-needs
draft: false
---

You are planning a new virtual machine or refreshing an existing one. The first technical decision is rarely the operating system or the CPU count. It is how the virtual hard disk will be stored and formatted. The choice between VHD and VHDX, fixed and dynamic size, and the underlying storage protocol determines whether the workload performs predictably and survives a power failure.

The practical answer is to use the VHDX format for new server workloads, choose the size type that matches your performance tolerance, and ensure the storage protocol supports the features you need. This is not a matter of preference. It is a matter of architectural support and data integrity.

[![VHDX Configuration Decision Flow](/images/posts/2025/azc-157-checkpoints.svg)](/images/posts/2025/azc-157-checkpoints.svg)

## Why VHDX is the preferred format for new deployments

The VHD format is legacy. It supports a maximum virtual disk size of 2 terabytes and lacks built-in protection against corruption during unexpected power loss. The VHDX format, introduced with Windows Server 2012, supports up to 64 terabytes and includes reliability mechanisms that help protect the disk from corruptions due to power failures.

Microsoft’s Best Practices Analyzer flags the use of VHD-format differencing disks in production server workloads as a warning. The impact is clear: "VHD-format differencing virtual hard disks could experience consistency issues if a power failure occurs." The recommended resolution is to shut down the virtual machine and convert the chain to VHDX or merge it to a fixed virtual hard disk [Avoid using VHD-format differencing virtual hard disks on virtual machines that run server workloads in a production environment](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/best-practices-analyzer/avoid-using-vhd-format-differencing-virtual-hard-disks-on-virtual-machines).

There is one explicit exception. If the virtual disk must be attached to a host running Windows Server 2008 R2 or earlier, you cannot use VHDX. Those older releases do not support the format [Avoid using VHD-format differencing virtual hard disks on virtual machines that run server workloads in a production environment](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/best-practices-analyzer/avoid-using-vhd-format-differencing-virtual-hard-disks-on-virtual-machines). For any host running Windows Server 2012 or later, including Windows Server 2025, VHDX is the standard.

## Fixed versus dynamic size: performance versus capacity

VHDX supports two size types: fixed and dynamically expanding. The choice depends on whether you prioritise consistent performance or efficient space usage.

A fixed-size virtual hard disk allocates all storage space at creation time. This means the file grows to its maximum size immediately, but it never needs to expand later. This eliminates fragmentation and provides consistent I/O performance because the storage is pre-allocated. This is the preferred choice for databases and workloads with high I/O requirements where latency spikes are unacceptable.

A dynamically expanding virtual hard disk starts small and grows as data is written. This saves space on the underlying storage, but it can introduce performance overhead as the disk expands. The host must allocate new blocks on the physical storage as needed, which can cause latency spikes. Additionally, if the underlying storage runs out of space, the virtual machine may become unresponsive.

Consider a hypothetical scenario where you are deploying a SQL Server database. The database will grow by 100GB per month. If you choose a dynamically expanding disk, you must monitor the underlying storage closely. If the storage fills up, the database engine will fail. If you choose a fixed disk, you allocate 1TB immediately. The performance is consistent, but you use more storage space upfront. The decision depends on your storage capacity and your tolerance for potential I/O latency during expansion.

## Storage architecture and protocol requirements

The virtual hard disk format is only half the equation. How you store the VHDX files matters. Hyper-V supports several storage architectures, including standalone local disks, SAN, NAS, and hyperconverged setups using Storage Spaces Direct [Physical storage architectures for Hyper-V in Windows Server](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/hyper-v-storage-architecture).

If you are using network storage, the protocol is critical. Microsoft does not support using file shares that do not support at least SMB protocol version 3.0 for storing virtual machine files. The Best Practices Analyzer reports an error if you use an older version [Use at least SMB protocol version 3.0 for file shares that store files for virtual machines.](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/best-practices-analyzer/use-at-least-smb-protocol-version-3.0-for-file-shares-that-store-files-for-virtual-machines). SMB 3.0 provides features like transparent failover and multichannel support, which are essential for high availability and performance.

For hyperconverged architectures, Storage Spaces Direct replicates data across nodes, providing resilience without a separate SAN. In disaggregated architectures, compute and storage scale independently. The choice of architecture affects how you manage capacity and performance.

## Practical steps for implementation

1. **Verify host compatibility**: Ensure the Hyper-V host is running Windows Server 2012 or later to support VHDX. If you must support older guests, use VHD only for those specific disks.
2. **Select the size type**: Use fixed-size disks for high-performance workloads like databases. Use dynamically expanding disks for general-purpose workloads where storage efficiency is a priority.
3. **Check storage protocols**: If using network storage, confirm that the file share supports SMB 3.0 or later. For block storage, ensure the SAN or iSCSI target is configured correctly.
4. **Monitor capacity**: If using dynamically expanding disks, set up alerts for underlying storage capacity to prevent unexpected failures.
5. **Test failover**: If using a clustered configuration, test live migration and failover to ensure the virtual hard disks behave as expected under load.

The goal is to align the virtual hard disk settings with your workload’s performance and resilience requirements. There is no one-size-fits-all solution, but following these guidelines will help you avoid common pitfalls and ensure a stable virtualisation environment.

Verify your configuration by running the Best Practices Analyzer on your Hyper-V hosts. It will highlight any deviations from recommended settings, such as the use of VHD formats or unsupported SMB versions. Addressing these issues early prevents problems later.

Cheers

References for Choose VHDX settings around capacity and performance needs: [Physical storage architectures for Hyper-V in Windows Server](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/hyper-v-storage-architecture), [Use at least SMB protocol version 3.0 for file shares that store files for virtual machines.](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/best-practices-analyzer/use-at-least-smb-protocol-version-3.0-for-file-shares-that-store-files-for-virtual-machines), [Avoid using VHD-format differencing virtual hard disks on virtual machines that run server workloads in a production environment](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/best-practices-analyzer/avoid-using-vhd-format-differencing-virtual-hard-disks-on-virtual-machines).
