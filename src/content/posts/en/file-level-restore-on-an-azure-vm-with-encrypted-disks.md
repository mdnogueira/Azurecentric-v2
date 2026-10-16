---
title: "File Level restore on an Azure VM with encrypted disks"
description: "At one of my costumers, we were review the backup strategy for Azure VMs. We choose to use the Azure Backup Service to accomplish that. During the brainstorming about this…"
pubDate: 2019-10-04
category: backup-dr
tags: [architecture, azure-backup, disk-encryption]
translationKey: file-level-restore-on-an-azure-vm-with-encrypted-disks
legacy: true
legacyUrl: /2019/10/file-level-restore-on-an-azure-vm-with-encrypted-disks.html
---

At one of my costumers, we were review the backup strategy for Azure VMs. We choose to use the Azure Backup Service to accomplish that. During the brainstorming about this topic, come this point: What about file restore on an Azure VM with encrypted disks?

After a quick search, I come across with this article [Back up and restore encrypted Azure VM](https://docs.microsoft.com/en-us/azure/backup/backup-azure-vms-encryption). But inside on this article, one of the limitations is “Encrypted VMs can’t be recovered at the file/folder level. You need to recover the entire VM to restore files and folders.”

Right after that, come the discussion, what to do in case of large VM disks (>1TB) which requires frequent file restores (example: File Server). In this case, spending time to design a solution to attend all the requirements it’s important.

There are a few points that you need to consider:
  * Not enable encrypted disks on the Azure VM – This option allows you to be able to restore at files and folders level. Although you are not having the best practices when it comes to Azure VM security and you get a lower score at the Azure Security Center
  * Restore only the Azure VM Disk instead of the full Azure VM – This option just eliminates the Azure VM creation with all other disks. In this case, the Azure VM had 4 data disks, beside the OS disk. This allows us to reduce time on the recovery process, but we still need to recover a large disk.
  * Restore the full Azure VM – This option is the most common one and the default one. In this case the most time consuming and the most expensive one as well.
  * Change the organization policy to enable just restore file from the last 12 hours to 24 hours (this was only applicable on this scenario) – This allows the organization to have a daily task to restore the large disk with a bigger window.

What was the final solution for this scenario?

We use a hybrid approach. We decide to use the restore the Azure VM disk only, on an existing VM changing at the same time the restore policy. We use an automation process when the backup of the File Server is done, to restore the Azure VM Disks to a storage account and then attach to an existing Azure VM.

Cheers,

**Marcos Nogueira**  
**_Azure MVP_**  
[azurecentric.com](http://azurecentric.com)  
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
