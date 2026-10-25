---
title: "iSCSI connection issues with Hyper-V Server"
description: "If you have a Hyper-V Cluster connected through iSCSI to a storage solution and sometimes you get errors that your CSV volumes went offline. In some cases, the Windows Failover…"
pubDate: 2013-11-08
category: hyper-v
tags: ["hyper-v", "iscsi", "troubleshooting"]
translationKey: iscsi-connection-issues-with-hyper-v-server
legacy: true
legacyUrl: /2013/11/iscsi-connection-issues-with-hyper-v-server.html
---

If you have a Hyper-V Cluster connected through iSCSI to a storage solution and sometimes you get errors that your CSV volumes went offline. In some cases, the Windows Failover Cluster is able to recover and bring online automatically and your virtual machines will not stop. In other situation if your CSV volume is not been recovery you will have to bring online the volume and then start all the virtual machine manually.

If you see the following sequence of events on the event viewer or in the Failover Cluster Manager events:

### Error - iScsiPrt 20

>None Connection to the target was lost. The initiator will attempt to retry the connection.

This mean that the connection to the target was lost. The initiator will attempt to retry the connection

This event is logged when the initiator loses connection to the target when the connection was in iSCSI Full Feature Phase. This event typically happens when there are network problems, network cable is removed, network switch is shutdown, or target resets the connection. In all cases initiator will attempt to re-establish the TCP connection.

### Error - iScsiPrt 7

>None The initiator could not send an iSCSI PDU. Error status is given in the dump data.

This mean that the initiator could not send an iSCSI PDU. Error status is given in the dump data.

This event is logged when the initiator could not send an iSCSI PDU to the target.

### Information - iScsiPrt 34

>None A connection to the target was lost, but Initiator successfully reconnected to the target. Dump data contains the target name.

This mean that the iSCSI connectivity was restored

## How to solve it

The way that I found that solve this events stopping appearing at the event viewer and off course solving the iSCSI issues within my Hyper-V Cluster were:

### **1. Install following KBs**
  * [2870270](http://support.microsoft.com/kb/2870270)
  * [2796995](http://support.microsoft.com/kb/2796995)
  * [2799728](http://support.microsoft.com/kb/2799728)
  * [2813630](http://support.microsoft.com/kb/2813630)
  * [2824600](http://support.microsoft.com/kb/2824600)

### **2. Configuring Network Prioritization**

It is possible to customize NP if the cluster does not automatically assign networks to use the traffic pattern that you want, which will change the ranked order, and hence the function.  For example, you may want Cluster Network 3 to be used for “Live Migration Traffic” as it is the fastest, so you would change its Metric to a value between 1000 and 1100, such as 1050, so that it is ranked second on the list.  Once Cluster Network 3 has the second-lowest metric it will be used for Live Migration Traffic.

To change the value of a network metric, run:
```powershell
$n = Get-ClusterNetwork “Cluster Network 3”
$n.Metric = 1050
```

This will change the metric of Cluster Network 3 to 1050.

Now you get the following output from running
```powershell
Get-ClusterNetwork | ft Name, Metric, AutoMetric

Name                       Metric     AutoMetric
----                       ------     ----------
Cluster Network 1          1000       True
Cluster Network 3          1050       False
Cluster Network 2          1100       True
Cluster Network 4          10000      True
Cluster Network 5          10100      True
```
You may have noticed that is a property associated with each network called AutoMetric.  This indicates whether the Metric was set using the default values (True) or if it had been later adjusted by an admin (False).  This gives insight into whether NP has been configured on the cluster.  Using this flag, it is actually possible to change the value of a network back to its original and automatically assigned value, by running the cmdlet:
```powershell
$n = Get-ClusterNetwork “Cluster Network 3”
$n.AutoMetric = $true
```

### **3. Disabled the TRIM Feature**

The following command needs to be executed to Turn off Windows TRIM feature
```js
fsutil behavior set disabledeletenotify 1
```

### **4. Disabled ODX**

To disable ODX on the Hyper-V Server, just follow this steps:
  1. Open a Windows PowerShell session as an administrator.
  2. Check whether ODX is currently enabled (it is by default) by verifying that the FilterSupportedFeaturesMode value in the registry equals 0. To do so, type the following command:
```powershell
Get-ItemProperty hklm:systemcurrentcontrolsetcontrolfilesystem -Name "FilterSupportedFeaturesMode"
```
  3. Disable ODX support. To do so, type the following command:
```powershell
Set-ItemProperty hklm:systemcurrentcontrolsetcontrolfilesystem -Name "FilterSupportedFeaturesMode" -Value 1
```

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
