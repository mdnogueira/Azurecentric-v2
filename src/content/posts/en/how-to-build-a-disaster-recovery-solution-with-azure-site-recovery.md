---
title: "How to build a Disaster Recovery solution with Azure Site Recovery"
description: "Frequently I heard how to build a disaster recovery solution. When I heard that I always think about ASR. On my last post I talked about Azure Site Recover as an overview of…"
pubDate: 2017-04-04
category: backup-dr
tags: ["azure-site-recovery", "disaster-recovery", "capacity-planning", "azure-virtual-machines"]
translationKey: how-to-build-a-disaster-recovery-solution-with-azure-site-recovery
legacy: true
legacyUrl: /2017/04/how-to-build-a-disaster-recovery-solution-with-azure-site-recovery.html
---

Frequently I heard how to build a disaster recovery solution. When I heard that I always think about ASR. On my last post I talked about Azure Site Recover as an overview of the service (see here). On this post, I would like to explore what I take in consideration when I built an Disaster Recovery solution using ASR.

Planning for Azure Site Recovery is highly dependent on the location of the disaster recovery environment that you want to implement and on the type of systems that you intend to protect. You might need to consider developing your disaster recovery plan in numerous scenarios.

Some examples might include migrating Azure virtual machines between regions or migrating virtual machine instances from Amazon Web Services to Azure. In particular, you will need to consider different sets of criteria in each of the following scenarios:
  * **Replicating Hyper-V VMs to Azure with Virtual Machine Manager.** On-premises components to consider include the Virtual Machine Manager server, Hyper-V servers, and Hyper-V-hosted VMs. Azure components to consider include the Azure Site Recovery vault, Azure virtual networks, and Azure Storage.
  * **Replicating Hyper-V VMs to Azure without Virtual Machine Manager**. On-premises components to consider include Hyper-V servers and Hyper-V-hosted VMs. Azure components to consider include the Azure Site Recovery vault, Azure virtual networks, and Azure Storage.
  * **Replicating VMware virtual machines and physical servers to Azure.** On-premises components to consider include the Process server, a VMware vCenter Server, ESX servers, VMware-managed virtual machines, Mobility service, and several additional third-party components. Azure components that you must consider include Configuration server, Master target server, the Azure Site Recovery vault, Azure virtual networks, and Azure Storage.
  * **Replicating Hyper-V virtual machines to a secondary datacenter.** This requires Virtual Machine Manager.

On-premises components to consider include the Virtual Machine Manager server, Hyper-V servers, and Hyper-V-hosted VMs. The only Azure component to consider in this case is the Azure Site Recovery vault. 	
  * **Replicating Hyper-V VMs to a secondary datacenter with storage area network (SAN) replication.** On-premises components to consider in the primary datacenter include the Virtual Machine Manager server, the SAN array, Hyper-V servers, and Hyper-V-hosted VMs. On-premises components to include in the secondary datacenter include the Virtual Machine Manager server, the SAN array, and Hyper-V servers. The only Azure component to consider in this case is the Azure Site Recovery vault.
  * **Replicating between on-premises physical servers or VMware virtual machines in primary and secondary datacenters.** On-premises components in the primary datacenter to consider include the Process server, the VMware vCenter Server, ESX servers, VMware-managed virtual machines, and the Unified Agent. On-premises components in the secondary datacenter to consider include the Configuration server, the vContinuum server, and the Master target server. The only Azure component to consider in this case is the Azure Site Recovery vault.

For more information about various Azure Site Recovery architectural designs, refer to [How does Azure Site Recovery work?](https://docs.microsoft.com/en-us/azure/site-recovery/site-recovery-components)

The choice of architecture will drive additional network considerations. In general, you need to keep in mind that users of your applications and services must be able to connect and authenticate to them following a planned failover. Similarly, you typically need to facilitate client connectivity (for the testing purposes) and core infrastructure support following a test failover. This necessitates AD DS availability and DNS to provide authentication and name resolution in both planned and test failover scenarios.

For more information, refer to [Designing your network for disaster recovery](https://docs.microsoft.com/en-us/azure/site-recovery/site-recovery-network-design)

## **Capacity planning**

Capacity planning is a primary challenge, especially with Azure as the recovery site. Fortunately, Microsoft provides assistance with this task in the form of the [Azure Site Recovery Capacity Planner](https://gallery.technet.microsoft.com/Azure-Recovery-Capacity-d01dc40e). This Microsoft Excel–based tool evaluates the existing workloads that you intend to protect, and based on this analysis, it provides recommendations regarding compute, storage, and network resources that are required to implement their protection.

The tool operates in two modes:
  * **Quick Planner.** This mode requires you to provide general statistics representing the current capacity and utilization of your production site. These statistics could include the total number of virtual machines, average number of disks per virtual machine, average size of a virtual machine disk, average disk utilization, total amount of data that needs replication, and average daily data change rate.
  * **Detailed Planner.** This mode requires you to provide capacity and utilization data for each virtual machine that you intend to protect. This data could include the number of processors, memory allocation, number of network adapters, number of disks, total storage, disk utilization, and the operating system that is running in the virtual machine.
    **Note:** You are responsible for collecting relevant data; the tool simply handles the relevant calculations afterward. To determine the amount of changes, use the [Capacity Planner for Hyper-V Replica](https://www.microsoft.com/en-us/download/details.aspx?id=39057) tool, assuming that Hyper-V hosts your workloads. If you operate in a VMware environment, use the [vSphere Replication Capacity Planning Appliance](https://labs.vmware.com/flings/vsphere-replication-capacity-planning-appliance).

For more information, refer to Plan capacity for virtual machine and physical server protection in Azure Site Recovery: [What workloads can you protect with Azure Site Recovery?](https://docs.microsoft.com/en-us/azure/site-recovery/site-recovery-workload)

## **Supported workloads**

Azure Site Recovery can integrate with a number of Windows server applications, such as Exchange Server, database availability groups, SharePoint, SQL Server (including AlwaysOn Availability Groups), Microsoft Dynamics CRM, in addition to third-party server software from vendors such as Oracle, SAP, IBM, and Red Hat. This integration considerably simplifies building recovery plans, which protect the systems that host these products. Similarly, you can configure servers that host core infrastructure components, such as AD DS or DNS, to replicate from a primary site to a secondary site, either on-premises or in Azure.

## **Azure virtual machine requirements**

When hosting your production systems in a Hyper-V environment, you might want to keep in mind differences between on-premises Hyper-V and virtualization platform characteristics in Azure. Fortunately, because of continuous enhancements to Azure Site Recovery, these differences are much less significant than in the past. For example, Windows-based Generation 2 on-premises Hyper-V virtual machines automatically convert to Generation 1 when they replicate to Azure. Similarly, .vhdx files automatically convert to the .vhd format.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
