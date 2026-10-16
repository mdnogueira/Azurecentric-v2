---
title: "Azure Backup – Part 2 – Azure Backup Agent"
description: "On the first post (see here), I explain how the Azure backup works. On this post, I’m explain how the files and folders are backup with the Azure Backup agent."
pubDate: 2017-03-22
category: backup-dr
tags: [azure-backup, azure-site-recovery, storage]
translationKey: azure-backup-part-2-azure-backup-agent
legacy: true
legacyUrl: /2017/03/azure-backup-part-2-azure-backup-agent.html
---

On the first post ([see here](/posts/azure-backup-part-1)), I explain how the Azure backup works. On this post, I’m explain how the files and folders are backup with the Azure Backup agent.

Azure Backup’s most basic functionality allows you to protect folders and files on 64-bit Windows Server and client operating systems, both on-premises and in Azure. This functionality relies on the Azure Site Recovery agent, which is available for download on the Azure Recovery Services vault interface in the Azure portal. You must install the agent on every system that you want to protect, and you must register it with the target vault.

To set up Azure Site Recovery agent–based protection from the Azure portal, perform the following steps:
  1. Create a Recovery Services vault.
  2. Configure the Backup Infrastructure storage replication type, by choosing either the **Locally-redundant** option or the **Geo-redundant** option on the **Backup Configuration**
  3. Specify Backup goal settings, including the:
    - Location of the workload: **On-premises**
    - Workload type: **Files and folders**
  4. Download the vault credentials from the **Prepare infrastructure **blade of the Azure Recovery Services vault. The Azure Site Recovery agent uses vault credentials to register with the vault during the installation process.
  5. Download and install the Azure Site Recovery agent from the **Prepare infrastructure ** Choose the appropriate option for the system that you want to protect. In this case, you need to select the **Download Agent for Windows Server or Windows Client **option. When registering the local computer with the vault, you designate a passphrase for encrypting backups.
  6. Use the Azure Backup console to configure and schedule backups. After installing the agent, the new console, whose interface closely matches the native Windows backup console, becomes available. This allows you to select files and folders to back up and to schedule a backup directly to the Azure Recovery Services vault. You can also use Azure PowerShell to configure and initiate backup operations. After you schedule a backup, you also have the option to run an on-demand backup.

  **Note:** If the computer that you want to protect contains a large amount of data and you have limited bandwidth in your Internet connection to Azure, consider using the Azure Import/Export service to perform the initial backup. In this approach, you copy the data to back up locally to a physical disk, encrypt it, and then ship the disk to the Azure datacenter where the vault is located. Azure then restores the content directly to the vault, which allows you to perform an incremental rather than full backup following the registration.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
