---
title: "Azure Site Recovery Planning Considerations – Part 1"
description: "I have been writing quite a bit about how Azure Site Recovery can help you build a Disaster Recovery solution, help you migrating workloads in to Azure, help you migrate…"
pubDate: 2017-06-14
category: backup-dr
tags: ["azure-site-recovery", "migration", "disaster-recovery", "azure-virtual-machines", "capacity-planning", "vhd"]
translationKey: azure-site-recovery-planning-considerations-part-1
legacy: true
legacyUrl: /2017/06/azure-site-recovery-planning-considerations-part-1.html
---

I have been writing quite a bit about how Azure Site Recovery can help you build a Disaster Recovery solution, help you migrating workloads in to Azure, help you migrate between VMware to Hyper-V and so many more others ways to use ASR. Although, I never cover what do you need to do and know, when you need to plan/design the ASR deployment/infrastructure to achieve your business requirements.

The first factor to consider when planning for ASR is whether the disaster recovery site will reside in an on-premises location or in Azure. In addition, you must also take into account the characteristics of your primary site, including:
* **The location.** You should ensure that the secondary site is far enough from the primary site so that it will remain operational if there is a region-wide disaster affecting the availability of the primary site. On the other hand, the secondary site should be relatively close to the primary site to minimize the latency of replication traffic and connectivity from the primary site. 	
* **The existing virtualization platform.** The architecture of the solution and its capabilities depend to some extent on whether you are using Hyper-V or vSphere and whether you rely on VMM or vCenter to manage virtualization hosts. 	
* **The virtual machines and workloads you intend to protect.** Your secondary site should provide a sufficient amount of compute and storage resources to accommodate production workloads following the failover.

## **Capacity planning**

As mention on the [How to build a Disaster Recovery solution with Azure Site Recovery](/posts/how-to-build-a-disaster-recovery-solution-with-azure-site-recovery) post, Microsoft offers the Site Recovery Capacity Planner, which is a Microsoft Excel macro-enabled workbook (see [here](https://gallery.technet.microsoft.com/Azure-Recovery-Capacity-d01dc40e)). It assists with estimating capacity requirements for the deployment of a disaster recovery site in Azure. The Site Recovery Capacity Planner also helps with analyzing the existing workloads that you intend to protect and provides recommendations regarding the compute, storage, and network resources that you will require to implement their protection.

### **Modes **

The workbook operates in two modes:
* **Quick Planner.** This mode requires you to provide general statistics representing the current capacity and utilization of your production site. These statistics could include the total number of virtual machines, average number of disks per virtual machine, average size of a virtual machine disk, average disk utilization, total amount of data to be replicated, and average daily data change rate.
* **Detailed Planner.** This mode requires you to provide capacity and utilization data for each virtual machine you intend to protect. This data could include the number of processors, memory allocation, number of network adapters, number of disks, total storage, disk utilization, and the operating system that is running in the virtual machine.

Note that you are responsible for collecting relevant data. The workbook simply handles the relevant calculations afterward. If you are using Hyper-V to host virtual machines, you can use the [Microsoft Assessment and Planning (MAP) Toolkit for Hyper-V](https://technet.microsoft.com/en-us/solutionaccelerators/dd537570.aspx) to determine the average daily data change rate. If you operate in a VMware environment, use the [vSphere Replication Capacity Planning appliance](https://labs.vmware.com/flings/vsphere-replication-capacity-planning-appliance) instead.

## **ASR Planning Considerations**

These are some of the most common considerations that I usually look for, when I’m planning/design an ASR implementation. Of course, that there are a lot of other aspects that you need to consider, although I always found these are always present.

### **Azure virtual machine-related requirements**

You must ensure that your on-premises virtual machines comply with a majority of the Azure virtual machine-specific requirements. These requirements include:
* The operating system running within each protected virtual machine must be supported by Azure.
* The virtual machine operating system and data disk size cannot exceed 1,023 gigabytes (GBs). 	
* The virtual machine data disk count cannot exceed 64.
* The virtual machine disks cannot be Internet Small Computer System Interface (iSCSI), Fibre Channel (FC), or shared virtual hard disks.

At the present time, Azure does not support the .vhdx disk type or the Generation 2 Hyper-V virtual machine type. Instead, Azure virtual machines must use the .vhd disk type and the Generation 1 Hyper-V virtual machine type. Fortunately, these limitations are not relevant when it comes to virtual machine protection. Site Recovery is capable of automatically converting the virtual disk type and the generation of Windows virtual machines when replicating virtual machine disks to Azure Storage.
  **Note:** At the present time, ASR does not support Generation 2 virtual machines that are running Linux.

### **Network-related requirements **

To facilitate different types of failover, you must consider the network requirements of the systems you intend to protect. In addition, you should keep in mind that customers of protected workloads must be able to connect and authenticate to these systems following a planned, unplanned or a test failover. To accommodate these requirements, you should take into account the following factors:
* IP address space of the Azure virtual network hosting protected virtual machines after the failover. You have two choices when deciding which IP address space to use:
  * **Use the same IP address space in the recovery site and the primary site.** The benefit of this approach is that virtual machines can retain their on-premises IP addresses. This eliminates the need to update DNS records associated with these virtual machines. Such updates typically introduce delay during recovery. The drawback of this approach is that you cannot establish direct connectivity via Site-to-Site VPN or ExpressRoute between your on-premises locations and the recovery virtual network in Azure.
  * **Use a non-overlapping IP address space in the recovery site and the primary site. **The benefit of this approach is the ability to set up direct connectivity via Site-to-Site VPN or ExpressRoute between your on-premises locations and the recovery virtual network in Azure. This allows you, for example, to provision Azure virtual machines that are hosting Active Directory domain controllers in the recovery site and keep the Azure virtual machines online during normal business operations. By having these domain controllers available, you will minimize the failover time. In addition, you can perform a partial failover, which involves provisioning only a subset of the protected virtual machines in Azure, rather than all of them. The drawback is the need to update DNS records associated with the protected virtual machines after the failover takes place. To minimize the delay resulting from the DNS changes, you can lower the Time-To-Live (TTL) value of the DNS records associated with the protected virtual machines.	
* Network connectivity between your on-premises locations and the Azure virtual network that is hosting the recovery site. You have three choices when deciding which cross-premises network connectivity method to use:
  * Point-to-Site VPN
  * Site-to-Site VPN
  * ExpressRoute

Point-to-Site VPN is of limited use in this case, because it allows connectivity from individual computers only. It might be suitable primarily for a test failover when connecting to the isolated Azure virtual network where Site Recovery provisions replicas of the protected virtual machines. For planned and unplanned failovers, you should consider ExpressRoute, because it offers several advantages over Site-to-Site VPN, including the following:

* All communication and replication traffic will flow via a private connection, rather than the Internet.
* The connection will be able to accommodate a high volume of replication traffic.
* Following a failover, on-premises users might be able to benefit from consistent, high-bandwidth, and low-latency connectivity to the Azure virtual network. This assumes that the ExpressRoute circuit will remain available even if the primary site fails.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
