---
title: "Investigate slow disk access in a Linux VM"
description: "Troubleshoot slow Linux VM disk I/O on Windows Server 2025 Hyper-V by checking schedulers, VHDX config, and storage architecture."
pubDate: 2025-12-13
category: hyper-v
tags: ["hyper-v", "linux-vm", "disk-performance", "vhdx", "i-o-scheduler"]
translationKey: investigate-slow-disk-access-in-a-linux-vm
draft: true
---

The guest operating system reports high latency or low throughput on its virtual disks, but the host storage subsystem shows no obvious saturation. Before looking at application-level bottlenecks, check how the Linux kernel and the Hyper-V hypervisor are negotiating disk I/O. The interaction between the Linux I/O scheduler, the VHDX file configuration, and the underlying physical storage architecture often dictates performance more than raw disk speed.

## Check the Linux I/O scheduler first

[![Linux VM Disk I/O Troubleshooting Flow](/images/posts/2025/azc-255-checkpoints.svg)](/images/posts/2025/azc-255-checkpoints.svg)

The Linux kernel uses an I/O scheduler to reorder disk requests. On modern Linux distributions running on Hyper-V, the default scheduler may not be optimal for virtualised storage, particularly when the underlying physical media is solid-state. The [best practices for running Linux on Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/Best-Practices-for-running-Linux-on-Hyper-V) recommend using a scheduler that passes scheduling decisions to the underlying hypervisor.

For Linux kernels using the older 'blk' subsystem, the recommended scheduler is "noop". For kernels using the newer 'blk-mq' subsystem, the recommendation is "none". You can verify the current scheduler for a specific disk by reading the following file:

```
/sys/class/block/<diskname>/queue/scheduler
```

The currently selected scheduler appears in square brackets. If the output shows a scheduler like "cfq" or "deadline", this may be contributing to latency, especially on SSD-backed storage. You can change the scheduler by writing to this file system location. However, this change is not persistent across reboots unless you add it to an initialization script. Consult your Linux distribution documentation for the correct method to persist this change.

This step is critical because the hypervisor handles request ordering more efficiently than the guest OS when using modern storage stacks. Using a guest-side scheduler designed for physical spinning disks can introduce unnecessary overhead on solid-state media.

## Review VHDX block size and file system configuration

If the I/O scheduler is correctly configured, the next common cause of slow disk access is the configuration of the virtual hard disk (VHDX) file itself. Dynamic VHDX files can suffer from performance degradation if the block size is too large, particularly when the file system inside the guest is mostly empty.

The default block size for dynamic VHDX files is 32 MB. For Linux file systems, this can lead to significant real disk space consumption and potential performance issues. The [best practices for running Linux on Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/Best-Practices-for-running-Linux-on-Hyper-V) recommend using a 1 MB block size when creating the VHDX. You can specify this in PowerShell:

```powershell
# Illustrative example: creating a VHDX with 1 MB block size
New-VHD -Path C:\MyVHDs\test.vhd -SizeBytes 127GB -Dynamic -BlockSizeBytes 1MB
```

Inside the Linux guest, the file system format also matters. The ext4 format is recommended over ext3 because it is more space-efficient with dynamic VHDX files. When creating the ext4 file system, you can specify the number of groups to be 4096 to further optimise space usage. Note that this setting may increase metadata overhead, so validate it against your specific workload requirements:

```bash
# Illustrative example: creating an ext4 file system with 4096 groups
mkfs.ext4 -G 4096 /dev/sdX1
```

If your VHDX was created with the default 32 MB block size, changing the block size now requires recreating the disk. However, ensuring the file system is ext4 and properly configured can still yield improvements.

## Consider the physical storage architecture

The performance of the virtual disk is ultimately constrained by the physical storage architecture hosting the VHDX files. [Physical storage architectures for Hyper-V in Windows Server](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/hyper-v-storage-architecture) outlines several configurations, each with different performance characteristics.

If you are using standalone Hyper-V with local disks, note that this configuration does not support automatic failover. Local disk resiliency depends on hardware or software RAID solutions. Performance here is limited by the local controller and disk speed.

If you are using SAN or NAS storage, the VMs access storage over the network. SAN and NAS systems provide their own availability guarantees, but network latency and throughput become critical factors. The compute and storage scale independently, so ensure the network infrastructure can handle the I/O load.

In a hyperconverged configuration using Storage Spaces Direct, data is replicated to other nodes in the cluster. This replication adds overhead. While it increases resilience, it can impact write performance. The [best practices for running Linux on Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/Best-Practices-for-running-Linux-on-Hyper-V) note that TRIM support is available for SLES 11 SP4 and later, which can help maintain performance on thin-provisioned storage by informing the underlying storage of unused blocks.

If you are using disaggregated Storage Spaces Direct, compute and storage scale independently. This can be beneficial if storage requirements grow faster than compute, but it also means network latency between the compute and storage clusters can impact disk performance.

## Verify storage protocol and driver support

Ensure that the Linux guest is using the correct drivers. For SUSE Linux Enterprise Server (SLES), the built-in drivers are certified by SUSE. Installing the Microsoft-provided LIS download package is not recommended for SLES versions that include built-in drivers, as the version numbers may differ and could cause conflicts. Check the [supported SUSE Linux Enterprise Server virtual machines on Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/supported-suse-virtual-machines-on-hyper-v) article for details on built-in drivers for your specific SLES version.

For other Linux distributions, ensure that the Linux Integration Services (LIS) are up to date. Outdated drivers can lead to suboptimal I/O performance.

Also, check if the virtual disk is using SCSI or IDE. SCSI is generally preferred for performance. If you are using Virtual Fibre Channel, ensure that the host and guest are configured correctly, as this can provide high-performance block storage.

## Verify partition integrity after resizing

A common cause of sudden disk performance issues or errors is improper resizing of virtual disks. Hyper-V allows shrinking virtual disk (VHDX) files without regard for any partition, volume, or file system data structures that may exist on the disk. If the VHDX is shrunk to where the end of the VHDX comes before the end of a partition, data is lost, that partition can become corrupt, or invalid data is returned when the partition is read.

After resizing a VHD or VHDX, administrators should use a utility like fdisk or parted to update the partition, volume, and file system structures to reflect the change in the size of the disk. Shrinking or expanding the size of a VHD or VHDX that has a GUID Partition Table (GPT) causes a warning when a partition management tool is used to check the partition layout, and the administrator is warned to fix the first and secondary GPT headers. This manual step is safe to perform without data loss.

Use the `lsvmbus` command in the guest to inspect the Hyper-V bus devices and ensure that the storage vmbus is functioning correctly. This can help identify if there are any issues with the virtualised storage layer.
