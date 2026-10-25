---
title: "Virtual Machines: Hyper-V vs Azure IaaS"
description: "A lot of times, during the Azure Foundation workshops session that I usually deliver, the difference between Azure virtual machines and Hyper-V virtual machines comes up. So I…"
pubDate: 2017-04-15
category: compute
tags: ["azure-virtual-machines", "hyper-v", "generation-2", "azure-site-recovery"]
translationKey: virtual-machines-hyper-v-vs-azure-iaas
legacy: true
legacyUrl: /2017/04/virtual-machines-hyper-v-vs-azure-iaas.html
---

A lot of times, during the Azure Foundation workshops session that I usually deliver, the difference between Azure virtual machines and Hyper-V virtual machines comes up. So I decide to write this post explaining what are the most important differences between them. Sometimes, depending on the workload, it doesn’t make sense to move to the cloud. I hope this post will clarify you on that.

Because Azure uses Hyper‑V as the virtualization platform, Azure virtual machines share the majority of their characteristics with the Hyper‑V virtual machines you deploy in your on-premises datacenter. However, several important differences exist between them:
  * Azure virtual machines that you can provision are available in specific sizes. You do not have the option of specifying arbitrary processing, memory, or storage parameters when deploying a virtual machine. Instead, you must select one of the predefined choices. At the present time, Microsoft offers virtual machines in two tiers: basic and standard. The basic tier, intended for development and test workloads, includes five virtual machine sizes, ranging from 1 core with 0.75 gigabytes (GB) of RAM to 8 cores with 14 GB of RAM. The standard tier has several series, including A, D, Dv2, DS, DSv2, F, Fs, G, GS, NV, and NC, for a total of 74 virtual machine sizes, with the largest one featuring 32 cores, 448 GB of RAM, and up to 64 disks.
  * There is a 1 TB size limit on a virtual disk that you can attach to an Azure virtual machine. This does not imply a limit on the size of operating system volumes. You can create multiple-disk volumes by using Storage Spaces in Windows Server or volume managers in Linux. By following this approach, you can create volumes of up to 64 TB. The maximum volume size depends on the size of the virtual machine, which determines the maximum number of disks you can attach to that virtual machine.
  * A limit also exists on the throughput and input/output operations per second (IOPS) that is supported by individual disks. With standard storage, you should expect about 60 megabytes per second (MBps) or 500 8-kilobyte (KB) IOPS. With Azure Premium Storage, performance depends on the disk size, with 1-TB disks supporting up to 200 MBps and 5,000 256-KB IOPS. You can increase the overall throughput and IOPS of Azure virtual machines by creating multiple-disk volumes.
  * At the present time, any virtual disks that you intend to attach to Azure virtual machines must be in the .vhd format. You do not have the option of Generation 2 Hyper‑V virtual machines in Azure. Additionally, no support exists for dynamically expanding or differencing virtual disks—they all must be fixed.
    **Note**: Azure Site Recovery helps you to protect on-premises Generation 2 virtual machines with virtual disks in the .vhdx format. You accomplish this by performing an automatic conversion to Generation 1 virtual machines with .vhd-formatted virtual disks when uploading the virtual disks to an Azure storage account (see the previous post about [ASR](/posts/how-to-build-a-disaster-recovery-solution-with-azure-site-recovery)). 	
  * Azure virtual machines place exclusive locks on attached virtual disk files. You cannot provide multiple virtual machines with shared access to the same virtual disk. As a result, you cannot implement clustering configurations that depend on shared storage to establish a quorum. You can, however, implement clustering configurations that use the node majority to establish a quorum. For example, you use this approach when deploying AlwaysOn Availability Groups in Microsoft SQL Server for failover clustering in Azure virtual machines.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
