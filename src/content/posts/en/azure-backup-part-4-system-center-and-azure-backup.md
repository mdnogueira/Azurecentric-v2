---
title: "Azure Backup – Part 4 – System Center and Azure Backup"
description: "On the first post (see here), I explained how the Azure backup works. On this post, I’m explaining how to integrate Azure Backup with System Center Data Protection Manager."
pubDate: 2017-03-28
category: backup-dr
tags: ["azure-backup", "backup", "system-center"]
translationKey: azure-backup-part-4-system-center-and-azure-backup
legacy: true
legacyUrl: /2017/03/azure-backup-part-4-system-center-and-azure-backup.html
---

On the first post ([see here](/posts/azure-backup-part-1)), I explained how the Azure backup works. On this post, I’m explaining how to integrate Azure Backup with System Center Data Protection Manager.

If your environment contains a large number of systems that require protection, you might want to consider implementing Microsoft Azure Backup Server. Alternatively, if you have an existing implementation of System Center Data Protection Manager (DPM), you will likely benefit from integrating it with Azure Backup by installing the Azure Site Recovery agent on the DPM server.

These two methods generally yield equivalent results. Microsoft Azure Backup Server provides the same set of features as DPM except for tape backups and integration with other System Center products. Azure Backup Server also offers the same management interface as DPM. Effectively, by implementing Microsoft Azure Backup Server, you gain enterprise-grade protection without requiring System Center licenses.

With both of these products, you can provide recovery for Linux and Windows operating systems that run on-premises or in Azure, as long as an Azure Backup Server or DPM server resides in the same location. DPM and Azure Backup Server support consistent application backups of the most common Windows server workloads, including SQL Server, Office SharePoint Server 2013 or 2016, and Microsoft Exchange Server. They also deliver superior efficiency and disk space savings because of built-in deduplication capabilities.

It is important to remember that unlike the other Azure Site Recovery agent–based methods, neither DPM nor Azure Backup Server can back up data directly to an Azure Recovery Services vault. Instead, they operate as disk-to-disk-to-cloud solutions, using their local disks as the immediate backup target, and afterward, copying data to Azure from the newly created backup.

To integrate System Center DPM with Azure Backup, you must perform the following steps:
  1. If you do not already have an available Recovery Services vault, create a new one.
**Note: **You can use the same vault for protecting Azure virtual machines with the Azure Backup VM extension and systems that run an Azure Site Recovery agent, including System Center DPM.
  2. Specify the vault’s storage replication type.
  3. Specify Backup goal settings, including the:
    - Location of the workload: **On-premises**
    - Workload type: any combination of **Hyper-V Virtual Machines**, **VMware Virtual Machines**, **Microsoft SQL Server**, **Microsoft SharePoint**, **Microsoft Exchange**, **System State**, or **Bare Metal Recovery**
  4. On the **Prepare infrastructure **blade of the Azure Recovery Services vault, select the **Already using System Center Data Protection Manager or any other System Center product **check box.
  5. Download the vault credentials from the **Prepare infrastructure **blade. The Azure Site Recovery agent uses vault credentials to register with the vault during the installation process.
  6. Download and install the Azure Site Recovery agent from the **Prepare infrastructure **blade. Start by clicking the **Download **link. Once the download completes, run the installation and register the local computer running System Center Data Protection Manager with the vault. As part of the registration, designate a passphrase for encrypting backups.
  7. From the **Protection** workspace of the **DPM Administrator Console**, create a new protection group or modify an existing one. Within the protection group settings, enable the **Online Protection** option.
    **Note:** You must enable short-term protection by using local disks. While you cannot use tapes for this purpose, you can additionally enable long-term protection to tape. As part of the protection group configuration, specify an online backup schedule, online protection data, online retention policy, and initial online backup methodology. Similar to the Azure Backup consoles, you can choose between performing initial backup over the Internet and using the Azure Import/Export service to copy it offline.

Deploying Microsoft Azure Backup Server requires that you perform the following steps:
  1. If you do not already have an existing, available Recovery Services vault, create a new one.
    **Note:** You can use the same vault for protecting Azure virtual machines with the Azure Backup VM extension and systems that run an Azure Site Recovery agent, including System Center DPM.
  2. Specify the vault’s storage replication type.
  3. Specify Backup goal settings, including the:
    - Location of the workload: **On-premises**
    - Workload type: any combination of **Hyper-V Virtual Machines**, **VMware Virtual Machines**, **Microsoft SQL Server**, **Microsoft SharePoint**, **Microsoft Exchange**, **System State**, or **Bare Metal Recovery**
  4. On the **Prepare infrastructure** blade of the Azure Recovery Services vault, make sure that the **Already using System Center Data Protection Manager or any other System Center product** check box is cleared.
  5. Use the **Download** link on the **Prepare infrastructure **blade to download the Microsoft Azure Backup Server installation media, which are over 3 GB in size.
  6. Download the vault credentials from the **Prepare infrastructure** blade. The Microsoft Azure Backup Server setup uses vault credentials to register with the vault during the installation process.
  7. Once the download of the Microsoft Azure Backup Server installation media completes, extract the download package content by running **MicrosoftAzureBackupInstaller.exe**, and then start the setup process.
    **Note:** The product requires a local instance of SQL Server 2014 Standard. You have the option of using the SQL Server installation media in the package or deploying an instance prior to running the setup.
  8. When prompted, provide the path to the vault credentials that you downloaded earlier. When registering the Microsoft Azure Backup Server with the vault, you can designate a passphrase for encrypting backups.
  9. Because Microsoft Azure Backup Server has the same administrative interface as the System Center DPM, after the setup completes, the remainder of the configuration is equivalent to the one referencing a System Center DPM, with the exception of tape backup–related settings.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
