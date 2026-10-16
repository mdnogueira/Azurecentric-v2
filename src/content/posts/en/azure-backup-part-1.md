---
title: "Azure Backup – Part 1"
description: "One of the first workloads that usually the majority the organizations wants to start to use in Azure is to replace the tape to Cloud Backup. Following the best practices for…"
pubDate: 2017-03-20
category: backup-dr
tags: [azure-backup, storage]
translationKey: azure-backup-part-1
legacy: true
legacyUrl: /2017/03/azure-backup-part-1.html
---

One of the first workloads that usually the majority the organizations wants to start to use in Azure is to replace the tape to Cloud Backup. Following the best practices for the backup strategy is Disk-Disk-Cloud. This strategy replaces the previous one, where we use the last place of the backup to a tape. With Cloud backup as the last resource we are leveraging the cloud storage capabilities and resilience.

The Azure Backup service uses Azure resources for short-term and long-term storage to minimize or even eliminate the need for maintaining physical backup media such as tapes, hard drives, and DVDs. Since its introduction, the service has evolved from its original form, which relied exclusively on a Windows Server backup agent that was downloadable on the Azure portal, into a much more diverse offering. The Azure Backup service includes:
  * A Windows 64-bit Server and Client file, folder-level backups with the Azure Site Recovery agent, and the Online Backup integration module for Windows Server 2012 R2 Essentials.
  * Long-term storage for Data Protection Manager with the Azure Site Recovery agent.
  * Long-term storage for Windows application-level backups with Microsoft Azure Backup Server.
  * Windows-based and Linux-based Azure IaaS VM-level backups with the Azure VM Backup extension.

## **Recovery Services vault**

Regardless of the backup functionality that you intend to implement, to use Azure Backup to protect your data, you must first create a Recovery Services vault in Azure. A _vault_ is the virtual destination of your backups, which also contains configuration information about the systems that Azure Backup protects. To protect a system, you must register it with a vault. The vault should reside in an Azure region that is close to the physical location of the data, and in the case of Azure IaaS virtual machines, in the same region.

Two resiliency options are available when creating an Azure Recovery Services vault: locally redundant and geo-redundant. The first option is based on locally redundant Azure Storage, consisting of three copies of backed-up content in the same Azure region. The second option is based on geo-redundant Azure Storage, including three additional copies in another Azure region, providing an additional level of protection.

  **Note:** You should set this option as soon as you create the vault, since will not be able to change it as soon as you register the first of your systems with the vault.

An Azure subscription can host up to 25 vaults. Each vault can protect up to 50 computers that run the Azure Site Recovery agent or the Online Backup integration module. Alternatively, if you back up Azure IaaS virtual machines by relying on the Azure IaaS VM Backup extension, the vault can protect up to 200 computers.

Note that there is no limit on the amount of data in the vault for each protected computer. There also is no limit on the maximum retention time of backed up content. However, there is a restriction on the size of each data source: about 54,000 GB for Windows 8, Windows Server 2012, and newer operating systems. The maximum backup frequency depends on the configuration, with up to three backups per day with Windows Server and Client Azure Site Recovery agent, up to two backups with Data Protection Manager or the Microsoft Azure Backup Server, and a single backup when using IaaS VM extension–based setup.

All backups are encrypted at the source with a passphrase that the customer chooses and maintains. There are no additional charges for the traffic generated during backup, both ingress, into Azure and during restore, egress, out of Azure.

  **Note:** Azure Backup relies on the same agent as Azure Site Recovery, which later topics in this module will discuss. This is the reason for the references to the Azure Site Recovery agent in this lesson. Both Azure Backup and Azure Site Recovery also store data from systems they protect by using an Azure Recovery Services vault. A single vault can simultaneously serve as the repository for Azure Backup and Azure Site Recovery.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
