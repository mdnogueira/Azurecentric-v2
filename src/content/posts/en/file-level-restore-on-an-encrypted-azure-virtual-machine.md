---
title: "File level restore on an encrypted Azure virtual machine"
description: "At the costumer site, I was delivering an Azure Workshop, on the topic of Azure Backup, comes the following questions: On a VM that have encrypted disks, how can we restore it?…"
pubDate: 2019-07-08
category: backup-dr
tags: [azure-backup]
translationKey: file-level-restore-on-an-encrypted-azure-virtual-machine
legacy: true
legacyUrl: /2019/07/file-level-restore-on-an-encrypted-azure-virtual-machine.html
---

At the costumer site, I was delivering an Azure Workshop, on the topic of Azure Backup, comes the following questions: 
  * On a VM that have encrypted disks, how can we restore it?
  * What is the solution to restore file level (files or folders) without restoring the entire VM?

On the Microsoft Azure Backup documentation – [Backup Azure VM Encryption](https://docs.microsoft.com/en-us/azure/backup/backup-azure-vms-encryption), the
limitation is documented:
“**_Encrypted VMs can’t be recovered at the file/folder level. You need to recover the entire VM to restore files and folders_**.” But this isn’t practical in cases of large VM disks which require frequent file restores. So, what is the solution?

In this particular case, after research, the solution available beside restoring the entire VM, is to restore the Disk only, and from there recovery the file or folders that you might need.

You need to reflect that Microsoft for security and privacy reasons doesn’t have access to our private keys, when encryption is enabled. We are responsible for those private keys. They might generate those for you, but beside that, it’s should be on a Key Vault.

In this case, when you encrypted the disks on a VM, you are limiting the restore functionality of Azure backup. So planning is always recommended when it comes to these features. Otherwise you might run into this kind of questions.

Cheers,

**Marcos Nogueira**  
**_Azure MVP_**  
[azurecentric.com](http://azurecentric.com)  
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
