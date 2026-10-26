---
title: "Restoring Hyper-V and Virtual Machines using Windows Server Backup"
description: "Cluster, Hyper-V Replica, Storage Migration, and other features makes for a higher availability for Hyper-V virtual machines, but it is impossible to provide 100 percent…"
pubDate: 2013-10-13
category: hyper-v
tags: ["hyper-v", "backup", "hyper-v-replica", "windows-server", "migration"]
translationKey: restoring-hyper-v-and-virtual-machines-using-windows-server-backup
legacy: true
legacyUrl: /2013/10/restoring-hyper-v-and-virtual-machines-using-windows-server-backup.html
---

Cluster, Hyper-V Replica, Storage Migration, and other features makes for a higher availability for Hyper-V virtual machines, but it is impossible to provide 100 percent assurance in any system.

When we lose a host computer, for example, not only is a single system offline, but also all the virtual machines that are running in there. It does not matter if it is only an application, a virtual machine, or the entire Hyper-V host that needs to be restored. In simple words, you have to be prepared to bring your systems online as soon as possible in case of a failure.

One of the benefits of Windows Server Backup is that it is easy to use and it is present in the OS already. With a couple of clicks, your hosts and its VMs are up and running.

## How to do it

In the following steps, you will see steps how to restore a backup containing virtual machines and the host components using Windows Server Backup:
1. If the computer on which you restore the data does not have Windows Server Backup installed, proceed with the following steps. In case it is already installed, go to _step 7_.
2. To install the **Windows Server Backup** feature, open Server Manager from the taskbar.
3. In the **Server Manager Dashboard**, click on **Manage** and select **Add Roles and Features**.
4. In the **Before you begin** page, click on **Next** four times.
5. In **Select features**, select **Windows Server Backup**:
6. Click on **Next** and then click on **Install**. Wait for the installation to be completed.
7. To open WSB, in the start menu, type **_wbadmin.msc_**.
8. In the **Windows Server Backup** console, in the pane on the right-hand side, click on **Restore**.
9. In the **Recovery Wizard** window, under **Getting Started**, select **This server** if the backup is stored locally, or select **A backup stored on another location** if the backup is in a storage or network folder. Then click on **Next**.
10. In the **Specify Location Type** window, you can select from the options **Local drives** or **Remote shared folder**. Select the option where your backup files are situated and click on Next.
11. In the **Select Backup Location** window, click on the drop-down list to select the backup location where the files are placed, and then click on **Next**.
12. In the **Select Server** window, select the server which you want to restore and click on **Next**.
13. In **Select Backup Date**, select the month, day, and time for restoring. If you want to check the content of the backup, click on the hyperlink in front of **Recoverable items**. Click on **Next** when done.
14. In the **Select Recovery Type** page, select what you want to recover. You can choose from the following options	
  * Files and folders	
  * Hyper-V	
  * Volumes, Applications
  * System State
To recover virtual machine and the host components, select **Hyper-V**, and click on **Next**:
15. On the **Select Items to Recover** page, select the virtual machine that you want to restore. If you need to recover the Hyper-V settings, check the **Host Component** option and click on **Next**.
16. In the **Specify Recovery Options**, you can select from the following options
  * Recover to original location
  * Recover to alternate location
  * Copy to folder
Select the options that suits your environment and click on **Next**.
17. In the **Confirmation** window, verify the recovery items that will be restored and click on **Recover**. Wait until the restore is complete and click on Close to close the Recovery Wizard.
18. To check the recovered items, in the **Windows Server Backup** console, under **Messages**, double click on the recovery event.
19. To check the recovered files, click on **View list of all recovered files** in the **Application recovery** window.
20. To check whether the restoration was successful, open the **Hyper-V Manager** and check whether the restored virtual machines are listed.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
