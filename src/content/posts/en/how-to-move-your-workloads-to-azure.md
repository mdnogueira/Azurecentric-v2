---
title: "How to move your workloads to Azure"
description: "When integrating your on-premises environment with Azure, you might want to use the lift-and-shift approach to migrate some of your existing workloads. There are several ways…"
pubDate: 2017-04-10
category: hybrid-migration
tags: ["hybrid-cloud", "migration", "vm-sizing", "hyper-v", "azure-site-recovery"]
translationKey: how-to-move-your-workloads-to-azure
legacy: true
legacyUrl: /2017/04/how-to-move-your-workloads-to-azure.html
---

When integrating your on-premises environment with Azure, you might want to use the lift-and-shift approach to migrate some of your existing workloads. There are several ways to do it. You can use Azure Site Recovery to accomplish that ([see here](/posts/azure-site-recovery-2017)) or use one of common way to implement this approach, by capture the content of disks of physical or virtual machines residing in your datacenter, upload them to Azure storage, and provision new Azure virtual machines based on the captured disks.

This last option is used when your hypervisor is Hyper-V, otherwise you must convert those workloads from the hypervisor that is running to Hyper-V. There are several tools that you can use to convert those workloads.

When you migrate your on-premises workloads to Azure virtual machines, you can select from a wide range of available sizes and configuration options to match performance characteristics between the two environments. You must also consider deployment factors that are specific to Azure during the transition.

## **Virtual machine sizes in Azure**

Microsoft organizes virtual machine sizes into several categories to help you select the option best matching your deployment workload. First, you must choose one of the following two tiers: 	
  * Use only for test and development workloads. This is because of its limited disk throughput of 300 IOPS and lack of support for load balancing or auto-scaling. The basic tier has five virtual machine sizes.
  * Use for any production workload. By selecting the standard tier, you can choose from over 70 virtual machine sizes and use features such as Premium Storage, virtual machine scale sets, and Azure Load Balancer.

The standard tier has several subcategories, or _series_, including the following: 	
  * **A-series with general-purpose compute instances.** This series contains eight virtual machine sizes, ranging from A0 through A7. It is an economical option for simple production workloads.
  * **A-series with compute-intensive instances.** This series contains four virtual machine sizes, ranging from A8 through A11. It supports compute-intensive and network-intensive workloads, such as simulation and modeling tasks running on HPC clusters.
  * **D-series.** The series consists of eight virtual machine sizes, ranging from D1 through D4 and from D11 through D14. Their primary benefit is the local solid-state drive (SSD) storage on the Hyper‑V hosts where the virtual machines are running. Azure allocates this storage to the temporary volume on each virtual machine, which you can use, for example, to store an operating system swap file or a SQL Server tempdb.
  * **Dv2-series.** This virtual machine series matches the disk and memory characteristics of the D-series virtual machines but offers processors that are roughly 35 percent faster. The series consists of 10 virtual machine sizes, ranging from D1v2 through D5v2 and from D11v2 through D15v2.
  * **F-series.** The series consists of five virtual machine sizes, including F1, F2, F4, F8, and F16. It provides optimized performance for compute-intensive workloads, matching the CPU characteristics of the Dv2-series virtual machines but with less memory and smaller disks, which translate into a lower price.
  * **G-series.** This series consists of five virtual machine sizes, ranging from G1 through G5. These virtual machines offer the highest memory-per-CPU ratio, with G5 containing 448 GB of RAM, which makes it the largest virtual machine size currently offered by any major cloud provider.
  * **DS-series, DSv2-series, Fs-series, and GS-series.** Virtual machine sizes in these series match their respective D, Dv2, F, and G-series virtual machine sizes with one significant exception—they all support Premium Storage. This allows you to implement virtual machines hosting workloads that require high-performance, low-latency access to their disks.
  * **N-series.** This series is in preview at the time of this writing. It consists of three NV virtual machine sizes, including NV6, NV12, and NV24 and three NC virtual machine sizes, including NC6, NC12, and NC24. The _N_ in their names designates the NVIDIA graphics processing unit (GPU), which enhances the performance of graphics-intensive workloads that this series of virtual machines is intended for.

For more information about virtual machine sizes, refer to [Sizes for virtual machines in Azure](https://docs.microsoft.com/en-us/azure/virtual-machines/virtual-machines-windows-sizes?toc=%2fazure%2fvirtual-machines%2fwindows%2ftoc.json).

## **Azure Pricing Calculator**

To better understand the usage of your existing on-premises infrastructure and estimate the cost of running it on Azure, you can use the [Azure Pricing Calculator](https://azure.microsoft.com/en-us/pricing/calculator/). The tool scans the hardware and resource utilization with the duration and frequency you specify, and based on the collected data, it recommends the Azure virtual machine sizes you should choose and the corresponding estimated cost of running your workloads in Azure over 30 days.

The tool can scan any of the following machine types: 	
  * Microsoft virtualization technologies (System Center Virtual Machine Manager, Hyper‑V)
  * VMware virtualization technologies (vCenter, ESXi)
  * Physical infrastructure (Windows, Linux)

You can install the tool on any of the following operating systems: 	
  * Windows Server 2012 or later
  * Windows Server 2008 R2 SP1
  * Windows Server 2008 with Service Pack 2 (SP2)
  * Windows 10
  * Windows 8.1
  * Windows 8
  * Windows 7 SP1
  * Windows Vista SP2

**Note**: When planning to move virtual machine workloads to Azure, consider using Azure Site Recovery. Azure Site Recovery automatically converts Generation 2 Hyper‑V virtual machines to Generation 1 when uploading them to Azure Storage. For more information, refer to the post, [How to implement Azure Site Recovery](/posts/how-to-implement-azure-site-recovery)

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
