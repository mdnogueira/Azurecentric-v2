---
title: "Error code UserErrorFsFreezeFailed on Azure Backup"
description: "Another day a costumer of mine, call me saying the backups that we enabled previously was troughing the following error:"
pubDate: 2019-06-11
category: backup-dr
tags: ["azure-backup", "troubleshooting", "backup", "linux"]
translationKey: error-code-usererrorfsfreezefailed-on-azure-backup
legacy: true
legacyUrl: /2019/06/error-code-usererrorfsfreezefailed-on-azure-backup.html
---

Another day a costumer of mine, call me saying the backups that we enabled previously was troughing the following error:

<table class="" ><tbody ><tr >
<td >
  Error Code
  
</td>
<td >
  UserErrorFsFreezeFailed
  
</td></tr><tr >
<td >
  Error Message
  
</td>
<td >
  Failed to freeze one or more mount-points of the VM to take a file-system consistent snapshot
  
</td></tr><tr >
<td >
  Recommended Action
  
</td>
<td >
  Check for devices with dirty filesystem state and unmount them. Run file-consistency check for these devices using the fsck command and mount them again after successful consistency check. For more details, refer to [https://aka.ms/AB-UserErrorFsFreezeFailed](https://aka.ms/AB-UserErrorFsFreezeFailed)
  
</td></tr></tbody></table>

This error was on an instance of an application where are 7 Ubuntu 16.04 VMs deployed in Azure, all with VM backups are enabled. Backups has been running fine for a couple of weeks, until on that morning where it failed for the 3 VMs which are Kubernetes worker nodes. The worker nodes are also running the Ceph filesystem on one of the data disks.

This could have happened when the file system used in those VMs went into bad state and so ***fsfreeze*** didn’t return properly because one of the file systems is stuck. In most cases, it will be a temporary issue and cleaning up file systems should get back the backup state to healthy. 

If this is repeating frequently, open a ticket with Microsoft because they need to do a deeper investigation on that.

Cheers,

**Marcos Nogueira**  
**_Azure MVP_**  
[azurecentric.com](http://azurecentric.com)  
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
