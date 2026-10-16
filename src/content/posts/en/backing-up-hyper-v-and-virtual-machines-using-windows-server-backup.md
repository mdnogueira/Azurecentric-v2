---
title: "Backing up Hyper-V and virtual machines using Windows Server Backup"
description: "Previous versions of Hyper-V (like 2008, 2008 R2 and 2008 R2 SP1) had complications and incompatibilities with the built-in backup tool, forcing the administrators to acquire…"
pubDate: 2013-10-13
category: hyper-v
tags: []
translationKey: backing-up-hyper-v-and-virtual-machines-using-windows-server-backup
legacy: true
legacyUrl: /2013/10/backing-up-hyper-v-and-virtual-machines-using-windows-server-backup.html
---

Previous versions of Hyper-V (like 2008, 2008 R2 and 2008 R2 SP1) had complications and incompatibilities with the built-in backup tool, forcing the administrators to acquire other solutions for backing up and restoring.

Since Windows Server 2012, Windows Server comes with a feature known as Windows Server Backup (WSB), which has full Hyper-V integration, allowing you to back up and restore your server, applications, Hyper-V, and virtual machines. WSB is easy and provides for a low cost scenario for small and medium companies.

## How to do it

The following steps will show you how to install the Windows Server Backup feature and how to schedule a task to back up your Hyper-V settings and virtual machines:
1. To install the **Windows Server Backup** feature, open **Server Manager** from the taskbar.
2. In the **Server Manager Dashboard**, click on **Manage** and select **Add Roles and Features**.
3. **On the Before you begin** page, click on **Next** four times.
4. Under the **Add Roles and Features Wizard**, select **Windows Server Backup** from the Features section:
5. Click on **Next** and then click on **Install**. Wait for the installation to be completed.
6. After the installation, open the Start menu and type **_wbadmin.msc_** to open the Windows Server Backup feature.
7. To change the backup performance options, click on **Configure Performance** from the pane on the right-hand side in the Windows Server Backup console.
8. In the **Optimize Backup Performance** window, we have three options to select from:
  * Normal backup performance
  * Faster backup performance
  * Custom
9. In the **Windows Server Backup** console, in the pane on the right-hand side, select the backup that you want to perform. The two available options are:
  * **Backup Schedule** to schedule an automatic backup
  * **Backup Once** for a single backup.
The next steps will show how to schedule an automatic backup.
10. In the **Backup Schedule Wizard**, in the **Getting Started** page, click on **Next**.
11. In the **Select Backup Configuration** page, select **Full Server** to back up all the server data or click on **Custom** to select specific items to back up. If you want to backup only Hyper-V and virtual machines, click on **Custom** and then **Next**.
12. In **Select Items for Backup**, click on **Add Items**.
13. In the **Select Items** window, select **Hyper-V** to back up all the virtual machines and the host component. You can also expand Hyper-V and select the virtual machines that you want to back up. When finished, click on **OK**.
14. Back to the Select Items for Backup, click on **Advanced Settings** to change Exclusions and VSS Settings.
15. In the **Advanced Settings** window, in the Exclusions tab, click on **Add Exclusion** to add any necessary exclusions.
16. Click on the **VSS Settings** tab to select either **VSS full Backup** or **VSS copy Backup**. Click on OK.
17. In the **Select Items for Backup** window, confirm the items that will be backed up and click on **Next**.
18. In the **Specify Backup Time** page, select **Once a day** and the time for a daily backup or select **More than once a day** and the time and click on **Next**.
19. In the **Specify Destination Type** page, select the one of the options **Back up to a hard disk that is dedicated for backups (recommended)**, **Back up to a volume**, or **Back up to a shared network folder**, and click on **Next**.
  **NOTE:** If you select the first option, the disk you choose will be formatted and dedicated to storing the backup data only.
20. In **Select Destination Disk**, click on **Show All Available Disks** to list the disks, select the one you want to use to store your backup, and click on **OK**. Click on **Next** twice.
21. If you have selected the **Back up to a hard disk that is dedicated for backups (recommended)** option, you will see a warning message saying that the disk will be formatted. Click on **Yes** to confirm.
22. In the **Confirmation** window, double-check the options you selected and click on **Finish**.
23. After that, the schedule will be created. Wait until the scheduled time to begin and check whether the backup has been finished successfully.

## Tips and Tricks

The Windows Server Backup feature, introduced in Windows Server 2008, has many limitations such as no tape support, no advanced schedule options, fewer backup options, and so on. When we talk about Hyper-V in this regards, the problem is even worse. Windows Server 2008 has minimal support and features for it.

Since Windows Server 2012, the same feature is available with some limitations; however, it provides at least the core components to back up, schedule, and restore Hyper-V and your virtual machines.

By default, WSB is not installed. The feature installation is made by Server Manager. After its installation, the feature can be accessed via console or command lines. Before you start the backup of your servers, it is good to configure the backup performance options you want to use.

### Faster Backup

By default, all the backups are created as normal. It creates a full backup of all the selected data. This is an interesting option when low amounts of data are backed up. You can also select the Faster backup performance option. This backs up the changes between the last and the current backup, increasing the backup time and decreasing the stored data. This is a good option to save storage space and backup time for large amounts of data, especially large virtual machines.

### Backup Schedule

A backup schedule can be created to automate your backup operations. In the Backup Schedule Wizard, you can back up your entire server or a custom selection of volumes, applications, or files. For backing up Hyper-V and its virtual machines, the best option is the customized backup, so that you don't have to back up the whole physical server.

When Hyper-V is present on the host, the system shows Hyper-V, and you will be able to select all the virtual machines and the host component configuration to be backed up. During the wizard, you can also change the advanced options such as exclusions and Volume Shadow Copy Services (VSS) settings.

WSB has two VSS backup options, VSS full backup and VSS copy backup. When you opt for VSS full backup, everything is backed up and after that, the application may truncate log files. If you are using other backup solutions that integrate with WSB, these logs are essential to be used in future backups such as incremental ones. To preserve the log files you can use VSS copy backup so that other applications will not have problems with the incremental backups.

After selecting the items for backup, you have to select the backup time. This is another limitation from the previous version, only two schedule options, namely Once a day or More than once a day. If you prefer to create different backup schedule such as weekly backups, you can use the WSB command lets in PowerShell.

### Backup Destination

Moving forward, in the backup destination type, you can select between a dedicated hard disk, a volume, or a network folder to save your backups in. When confirming all the items, the backup schedule will be ready to back up your system. You can also use the option Backup once to create a single backup of your system.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
