---
title: "Azure Site Recovery"
description: "Azure Site Recovery (ASR) is by far one of the Azure features that I always like to play with. The improvement along the time is above extraordinaire! When I’m talking about…"
pubDate: 2017-04-01
category: backup-dr
tags: [azure-site-recovery, hyper-v, linux, scvmm, system-center]
translationKey: azure-site-recovery-2017
legacy: true
legacyUrl: /2017/04/azure-site-recovery-2.html
---

Azure Site Recovery (ASR) is by far one of the Azure features that I always like to play with. The improvement along the time is above extraordinaire! When I’m talking about Azure and Cloud to costumers I always ask what is their disaster recovery plan. I got a lot of different options. So far, as my best knowledge, I didn’t find any compelling solution then ASR. So what is ASR?

Azure Site Recovery is a disaster recovery and business continuity service that provides two types of functionality: _replication_ and _orchestration_. Replication handles synchronization of designated systems between a primary site that hosts your production workloads and a secondary site that activates if a disaster occurs. Orchestration provides orderly failover and failback between these two locations.

Most commonly, the primary site is an on-premises location. The secondary site can be another on-premises location or you can implement it in Azure. If you implement the secondary site in Azure, you will use Azure Storage to host disks with content that replicates from computers in the primary site. You also have the option of using Site Recovery in scenarios in which each site represents a cloud-based location, although this applies to migration, not recovery scenarios.

For example, you can migrate virtual machines from a non-Microsoft cloud-hosting provider by setting up Site Recovery with the secondary site in Azure. After you establish the replication between virtual machines in both clouds, you perform a failover. At that point, all the virtual machines will be running in Azure.

In general, Site Recovery allows you to implement solutions that provide protection of both physical and virtual machines, including support for Hyper-V and VMware virtualization platforms. The details of these solutions depend on several factors, including the: 	
  * Location of the recovery site (on-premises versus Azure).
  * Type of computer to protect (physical versus virtual).
  * Virtualization platform (Microsoft Hyper-V versus VMware vSphere).
  * Virtualization management software (Microsoft System Center Virtual Machine Manager [VMM] versus VMware vCenter).
  * Replication mechanism (Site Recovery–based versus storage area network [SAN]–based replication).

In particular, with Site Recovery, it is possible to implement the following scenarios: 	
  * Disaster recovery of Hyper-V virtual machines managed by VMM from one on-premises location to another with Site Recovery–based replication.
  * Disaster recovery of Hyper-V virtual machines managed by VMM from one on-premises location to another with SAN-based replication.
  * Disaster recovery of Hyper-V virtual machines managed by VMM from an on-premises location to Azure with Site Recovery–based replication.
  * Disaster recovery of Hyper-V virtual machines not managed by VMM from an on-premises location to Azure with Site Recovery–based replication.
  * Disaster recovery of VMware virtual machines from one on-premises location to another with Site Recovery–based replication.
  * Disaster recovery of VMware virtual machines from an on-premises location to Azure with Site Recovery–based replication.
  * Disaster recovery of physical servers running the Windows and Linux operating systems from an on-premises location to Azure with Site Recovery–based replication.
  * Disaster recovery of physical servers running the Windows and Linux operating systems from one on-premises location to another with Site Recovery–based replication.
  * Migration of virtual machines from one Azure region to another with Site Recovery–based replication.
  * Migration of virtual machines from a non-Microsoft cloud-hosting provider to Azure with Site Recovery–based replication.

Site Recovery–based replication of Hyper-V virtual machines across two on-premises sites takes advantage of Hyper-V Replica, which is a component of the Windows Server operating system that runs on Hyper-V hosts. When replicating Hyper-V virtual machines in cross-premises scenarios, Site Recovery utilizes the Azure Site Recovery Services agent. The agent is a Site Recovery component that you must install on Hyper-V servers that are hosting protected virtual machines.

For replication of physical servers and VMware virtual machines, Site Recovery relies on InMage Scout Unified Agent, which is a Site Recovery component that you must install directly on computers that you want to protect. SAN-based replication is the option that requires non-Microsoft SAN arrays that integrate with the VMM infrastructure. After you implement this integration, you can use SAN-specific capabilities to replicate SAN-resident virtual machine disks between the primary and the secondary sites.

Site Recovery provides a number of capabilities that help you reach your business continuity goals. These capabilities include support for: 	
  * Storage replication. As the “Overview of Site Recovery scenarios” topic explained briefly, storage replication maintains the synchronization of disks between your production and disaster recovery computers. Hyper-V Replica and the Azure Site Recovery Services agent offer replication frequency in 30-second, 15-minute, or 30-minute intervals. With the VMware InMage Scout agent, replication is continuous. SAN-based replication is also continuous, but you can also to configure it as asynchronous or synchronous. As part of storage replication, it is also possible to generate application-consistent snapshots for single-tier apps or multiple-tier apps.
  * Orchestration of planned failover and failback. With planned failover and failback, orchestration delivers an orderly transition process between your production and disaster recovery environments without any data loss.
  * Orchestration of unplanned failover and failback. In this case, orchestration also allows you to enforce the sequence of individual steps during failover and failback. However, with unplanned failover and failback, there is a potential for data loss.
  * Orchestration of test failover. Test failover typically takes place in an isolated network, making it possible to evaluate your disaster recovery approach without affecting the production environment.

## **Recovery plan**

To implement failover and failback, you must create a recovery plan. A recovery plan identifies protected physical machines and virtual machines, and dictates the order in which Site Recovery performs individual steps during failover and failback. Recovery plans support Azure Automation scripts and workflows in addition to manual steps. This provides a sufficient level of flexibility for more complex disaster recovery scenarios and also helps you achieve your RTO.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
