---
title: "Azure Backup – Part 3 – Backup Virtual Machines"
description: "On the first post (see here), I explained how the Azure backup works. On this post, I’m explaining how to backup Virtual Machines with Azure Backup."
pubDate: 2017-03-24
category: backup-dr
tags: [azure-backup, azure-site-recovery, storage]
translationKey: azure-backup-part-3-backup-virtual-machines
legacy: true
legacyUrl: /2017/03/azure-backup-part-3-backup-virtual-machines.html
---

On the first post ([see here](/posts/azure-backup-part-1)), I explained how the Azure backup works. On this post, I’m explaining how to backup Virtual Machines with Azure Backup.

If the systems that you want to protect are running the Windows or Linux operating systems on Azure virtual machines, then in addition to running Azure Site Recovery agent–based backups (as explained on the previous posts), you also have the option to perform a VM-level backup.

This process uses the Azure Backup VM extension and offers some additional benefits, including application consistency for Windows virtual machines, support for Linux, and a higher limit for the number of protected systems per vault, which is 200 Azure VMs versus 50 protected systems with the Azure Site Recovery agent. On the other hand, the backup frequency in this case is limited to once per day.

You should also keep in mind that the restore process creates a new virtual machine. As a result, an Azure VM–level backup does not provide a convenient option for restoring individual files or folders from a backup. In addition, the restore does not take into account such VM-level settings as network configuration, which means that you must recreate them after the restore. However, you can automate the restore process, by using Azure PowerShell or Azure CLI, for example. You must use scripting when recovering Azure virtual machines that host Active Directory domain controllers or that have complicated network configuration, including such characteristics as load balancing, multiple reserved IP addresses, or multiple network adapters.

Setting up an Azure IaaS VM-level backup by using the Azure portal involves the following steps:
  1. If you do not already have an available Recovery Services vault, create a new one.
    **Note** that the vault must reside in the same Azure region as the Azure IaaS virtual machines.
  2. Specify the vault’s storage replication type.
  3. Specify Backup goal settings, including the:
    - Location of the workload: **Azure**
    - Workload type: **Virtual machine**
  4. Choose the backup policy. The policy determines backup frequency and retention range. The default, predefined policy triggers the backup daily at 7:00 PM and has the 30-day retention period. You can create a custom policy to modify these values, by scheduling backup to take place on specific days and setting the retention period on a daily, weekly, monthly, and yearly basis.
  5. Specify the virtual machines to back up. The Azure portal will automatically detect the Azure virtual machines which satisfy Azure VM–level backup requirements. When you click **Items to backup** on the **Getting started with backup** blade, the Azure portal will display these virtual machines on the **Select virtual machines** blade. This will automatically deploy the Azure VM backup extension to the virtual machines you that select and register them with the vault.
  6. At this point, you can identify the Azure virtual machines that are backed up to the vault by viewing the content of the **Backup Items **blade.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
