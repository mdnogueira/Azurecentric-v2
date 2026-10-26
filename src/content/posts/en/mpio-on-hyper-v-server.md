---
title: "MPIO on Hyper-V Server"
description: "On the previous version of Windows Server (prior Windows Server 2012) you have to download and install MultiPath I/O (MPIO). Since Windows Server 2012 MPIO is a feature that…"
pubDate: 2013-10-28
category: hyper-v
tags: ["hyper-v", "mpio", "windows-server", "powershell"]
translationKey: mpio-on-hyper-v-server
legacy: true
legacyUrl: /2013/10/mpio-on-hyper-v-server.html
---

On the previous version of Windows Server (prior Windows Server 2012) you have to download and install MultiPath I/O (MPIO). Since Windows Server 2012 MPIO is a feature that you can enable. Because it’s a feature that comes with the server, means that you will have the PowerShell cmdlets available.

Use of the MPIO module in Windows PowerShell requires an “elevated” PowerShell window, opened with Administrator privileges.

### How to do it

#### Installing MPIO using the GUI

If you have Hyper-V Servers, you don’t have GUI on the server, but you can do it remotely from other server or from you RSAT installed on Windows 8.1, using the Server Manager Console. Just follow the steps.
1. Open Server Manager Console
2. Browse the Hyper-V Server that you want to enable the MPIO. To do that click on All Servers and then click on the Hyper-V Server.
3. Right-Click on the Hyper-V Server and click on Add Roles and Features
4. Click 4 times Next (to go to features windows)
5. On the Select features window, select Multipath I/O and click next.
6. Click Install to enable the feature.

#### Installing and Managing MPIO using PowerShell

**Enable or Disable the MPIO Feature**

If the MPIO feature is not currently installed, use the following command to enable the MPIO feature:
```powershell
Enable-WindowsOptionalFeature –Online –FeatureName MultiPathIO
```

**To disable the MPIO feature, use the following command**
```powershell
Disable-WindowsOptionalFeature –Online –FeatureName MultiPathIO
```

### Tips and Tricks

**Configuring MPIO using PowerShell**

If these steps are performed prior to connecting devices of the desired BusType, you can typically avoid the need for a restart.
  * Install the MPIO feature on a new Windows Server 2012 installation.
  * Configure MPIO to automatically claim all iSCSI devices.
  * Configure the default Load Balance policy for Round Robin.
  * Set the Windows Disk timeout to 60 seconds.

Here is what this script would look like:
```powershell
## Enable the MPIO Feature
Enable-WindowsOptionalFeature –Online –FeatureName MultiPathIO

## Enable automatic claiming of ISCSI devices for MPIO
Enable-MSDSMAutomaticClaim -BusType iSCSI

## Set the default load balance policy of all newly claimed devices to Round Robin
Set-MSDSMGlobalLoadBalancePolicy -Policy RR

## Set the Windows Disk timeout to 60 seconds
Set-MPIOSetting -NewDiskTimeout 60
```

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
