---
title: "Enabling and disabling the graphical interface in Hyper-V Server Core"
description: "Server Core has many installation benefits, but there are a few situations where the GUI is better and provides more options; for example, when we need to troubleshoot a…"
pubDate: 2013-10-11
category: hyper-v
tags: [server-core]
translationKey: enabling-and-disabling-the-graphical-interface-in-hyper-v-server-core
legacy: true
legacyUrl: /2013/10/enabling-and-disabling-the-graphical-interface-in-hyper-v-server-core.html
---

Server Core has many installation benefits, but there are a few situations where the GUI is better and provides more options; for example, when we need to troubleshoot a problem on the server. Even with the handy tools from the previous task, nothing replaces the full server installation.

Since Windows Server 2012 it is allow to install and uninstall the GUI, making our job easier when the GUI is necessary and providing all the benefits of a Server Core installation when you need it. It also allows a third option that enables the graphical management tools.

The three options available since Windows Server 2012 are as follows:
  * Server Core: This option provides default installation with command line interface only
  * Minimal Server Interface: This option comes with the Server Manager, Microsoft Management Console (MMC) and some Control Panel options
  * Server Graphical Shell: This option allows for a full graphical interface server
    **NOTE:** By installing Windows Server 2012 (or R2) with Server Core, you can save up to 3 GB of disk space, when the necessary components for the graphical interface are not present.

## How to do it

The following steps will show you how to install the minimal server interface from a Server Core installation and how to enable the full graphical interface.
1. From the Server Core command line, type PowerShell to load PowerShell. To identify the index number that need to be used in order to enable the graphical interface, type the following command line, where D: is the path for the Windows Server installation DVD drive.
```powershell
Get-WindowsImage –ImagePath D:SourcesInstall.wim
```
2. A list with the index number will be displayed, as shown in the following screenshot. Make a note of the number of the type of Windows Installation you want to enable in the next step. In this example the index number 2 will be used.
3. Create a new temporary folder to mount the WIM file with the following command:
```powershell
New-Item C:Sources –Type Directory
```
4. To mount the image file in the directory created in the previous step, type the following command by specifying the index number obtained in _step 3_.
```powershell
Mount-WindowsImage –ImagePath D:SourcesInstall.wim –path C:Sources –Index 2 -ReadyOnly
```
5. With the mounted image, type the following command to enable the Server Graphical Management Tool and the Infrastructure option.
```powershell
Install-WindowsFeature Server-Gui-Mgmt-Infra –Source C:SourcesWindowsWinsxs
```
6. Restart the server and wait for the feature to be configured. It will take a couple of minutes.
7. To enable the full graphical interface, open Server Manager by typing **servermanager.exe**.
8. In the Server manager dashboard, click on **Add roles and features**.
9. In the Add Roles and Features Wizard, click on **Next** four times.
10. In Features, expand User Interfaces and Infrastructure, select the option Server Graphical Shell, and click on **Next**:
11. To complete the installation, in the Confirm installation selections page, click on Install.
  **NOTE:** You can also install the full graphical interface with the following PowerShell command:
```powershell
Install-WindowsFeature Server-Gui-Shell
```
12. After the setup, you need to restart the server. You can check the Restart each destination server automatically if required option to automatically restart the server.
13. Having enabled the GUI, we can now see how to uninstall the GUI from the full server installation. In the Server Manager window, click on Manage and then **Remove Roles and Features**.
14. In the Before You Begin screen, click on **Next** four times.
15. Then, in Features, clear the check box for the Server Graphical Shell option and click on Next.
16. Confirm the uninstallation by clicking on Remove and wait for the server to be restarted.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
