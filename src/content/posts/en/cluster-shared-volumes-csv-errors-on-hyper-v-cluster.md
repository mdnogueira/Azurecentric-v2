---
title: "Cluster Shared Volumes (CSV) errors on Hyper-V Cluster"
description: "In a failover cluster, virtual machines can use Cluster Shared Volumes that are on the same LUN (disk), while still being able to fail over (or move from node to node)…"
pubDate: 2013-11-06
category: hyper-v
tags: ["cluster-shared-volumes", "hyper-v", "failover-clustering", "troubleshooting", "powershell"]
translationKey: cluster-shared-volumes-csv-errors-on-hyper-v-cluster
legacy: true
legacyUrl: /2013/11/cluster-shared-volumes-csv-errors-on-hyper-v-cluster.html
---

In a failover cluster, virtual machines can use Cluster Shared Volumes that are on the same LUN (disk), while still being able to fail over (or move from node to node) independently of one another. Virtual machines can use a Cluster Shared Volume only when communication between the cluster nodes and the volume is functioning correctly, including network connectivity, access, drivers, and other factors.

You probably didn’t notice any issues with your VMs, but If you are getting the following events on your Hyper-V Cluster nodes, regarding the CSV volume:

### **Warning - Disk 153**

>The description for Event ID 153 from source disk cannot be found. Either the component that raises this event is not installed on your local computer or the installation is corrupted. You can install or repair the component on the local computer.
>
>The following information was included with the event: 
>
>DeviceHarddisk5DR5
>
>the message resource is present but the message is not found in the string/message table

### **Information - Microsoft-Windows-FailoverClustering 5121**

>The description for Event ID 5121 from source Microsoft-Windows-FailoverClustering cannot be found. Either the component that raises this event is not installed on your local computer or the installation is corrupted. You can install or repair the component on the local computer.
>
>If the event originated on another computer, the display information had to be saved with the event.
>
>The following information was included with the event: 
>
>Volume2
>
>Cluster Disk 2 - Volume2

### Error - Microsoft-Windows-FailoverClustering 5120

>The description for Event ID 5120 from source Microsoft-Windows-FailoverClustering cannot be found. Either the component that raises this event is not installed on your local computer or the installation is corrupted. You can install or repair the component on the local computer.
>
>If the event originated on another computer, the display information had to be saved with the event.
>
>The following information was included with the event: 
>
>Volume1
>
>Cluster Disk 1 - Volume1
>
>STATUS_DEVICE_BUSY(80000011)

That means there has been an interruption to communication between a cluster node and a volume in Cluster Shared Volumes. This interruption may be short enough that it is not noticeable, or long enough that it interferes with services and applications using the volume

## How to resolve it

### CSV - Review events related to communication with the volume

To perform the following procedure, you must be a member of the local Administrators group on each clustered server, and the account you use must be a domain account, or you must have been delegated the equivalent authority.

To open Event Viewer and view events related to failover clustering:
  1. If Server Manager is not already open, click **Start**, click **Administrative Tools**, and then click **Server Manager**. If the **User Account Control** dialog box appears, confirm that the action it displays is what you want, and then click **Continue**.
  2. In the console tree, expand **Diagnostics**, expand **Event Viewer**, expand **Windows Logs**, and then click **System**.
  3. To filter the events so that only events with a **Source of FailoverClustering** are shown, in the **Actions** pane, click **Filter Current Log**. On the **Filter** tab, in the **Event sources** box, select **FailoverClustering**. Select other options as appropriate, and then click **OK**.
  4. To sort the displayed events by date and time, in the center pane, click the Date and Time column heading.

### CSV - Check storage and network configuration

To perform the following procedures, you must be a member of the local **Administrators** group on each clustered server, and the account you use must be a domain account, or you must have been delegated the equivalent authority.

#### Gathering information about the condition and configuration of a disk in Cluster Shared Volumes

To gather information about the condition and configuration of a disk in Cluster Shared Volumes:
  1. Scan appropriate event logs for errors that are related to the disk.
  2. Review information available in the interface for the storage and if needed, contact the vendor for information about the storage.
  3. To open the failover cluster snap-in, click **Start**, click **Administrative Tools**, and then click **Failover Cluster Manager**. If the **User Account Control** dialog box appears, confirm that the action it displays is what you want, and then click **Yes**.
  4. In the Failover Cluster Manager snap-in, expand the console tree and click **Cluster Shared Volumes**. In the center pane, expand the listing for the volume that you are gathering information about. View the status of the volume.
  5. Still in the center pane, to prepare for testing a disk in Cluster Shared Volumes, right-click the disk, click **Take this resource offline**, and then if prompted, confirm your choice. Repeat this action for any other disks that you want to test.
  6. Right-click the cluster containing the Cluster Shared Volumes, and then click **Validate This Cluster.**
  7. On the **Testing Options** page, select **Run only tests I select**.
  8. On the **Test Selection** page, clear the check boxes for **System Configuration** and **Network**. This leaves the tests for **Cluster Configuration**, **Inventory**, and **Storage**. You can run all these tests, or you can select only the specific tests that appear relevant to your situation.
    **NOTE:** If you run the Storage tests you will have downtime in your Cluster. Not recommend if you are troubleshooting on a production environment.
  9. Follow the instructions in the wizard to run the tests.
  10. On the **Summary** page, click **View Report**.
  11. Under **Results by Category**, click **Storage**, click any test that is not labelled as **Success**, and then view the results.
  12. Scroll back to the top of the report, and under **Results by Category**, click **Cluster Configuration**, and then click **List Cluster Network Information**. Confirm that any network that you intend for communication between nodes and Cluster Shared Volumes is labelled either **Internal use** or **Internal and client use**. Confirm that other networks (for example, networks used only for iSCSI and not for cluster network communication) do not have these labels.
  13. If the information in the report shows that one or more networks are not configured correctly, return to the Failover Cluster Manager snap-in and expand **Networks**. Right-click the network that you want to modify, click **Properties**, and then make sure that the settings for **Allow the cluster to use this network** and **Allow clients to connect through this network** are configured as intended.
  14. To bring disks back online, click **Cluster Shared Volumes** and, in the center pane, right-click a disk, and then click **Bring this resource online**. Repeat this action for any other disks that you want to bring online again.

#### Verifying settings for a network designated for network communication with Cluster Shared Volumes

To verify settings for a network designated for network communication with Cluster Shared Volumes:
  1. Click **Start**, click **Control Panel**, click **Network and Internet**, and then click **Network and Sharing Center**.
  2. In the Tasks pane, click **Change adapter settings**.
  3. Right-click the connection you want, and then click **Properties**.
  4. Make sure that the following check boxes are selected:	
    * **Client for Microsoft Networks**
    * **File and Printer Sharing for Microsoft Networks**

#### Verifying that the required NTLM authentication is allowed
  1. On a node in the cluster, to see the security policies that are in effect locally, click **Start**, click **Administrative Tools**, and then click **Local Security Policy**.
  2. Navigate to **Security SettingsLocal PoliciesSecurity Options**.
  3. In the center pane, click the **Policy** heading to sort the policies alphabetically.
  4. Review **Network security: Restrict NTLM: Add remote server exceptions for NTLM authentication** and the items that follow it. If items related to "server exceptions" are marked **Disabled**, or other items have specific settings, a policy may be in place that is interfering with NTLM authentication on this server. If this is the case, contact an appropriate administrator (for example, your administrator for Active Directory or security) to ensure that NTLM authentication is allowed for cluster nodes that are using Cluster Shared Volumes.

#### Opening Event Viewer and viewing events related to failover clustering

To open Event Viewer and view events related to failover clustering:
  1. If Server Manager is not already open, click **Start**, click **Administrative Tools**, and then click **Server Manager**. If the **User Account Control** dialog box appears, confirm that the action it displays is what you want, and then click **Yes**.
  2. In the console tree, expand **Diagnostics**, expand **Event Viewer**, expand **Windows Logs**, and then click **System**.
  3. To filter the events so that only events with a **Source** of **FailoverClustering** are shown, in the **Actions** pane, click **Filter Current Log**. On the **Filter** tab, in the **Event sources** box, select **FailoverClustering**. Select other options as appropriate, and then click **OK**.
  4. To sort the displayed events by date and time, in the center pane, click the **Date and Time** column heading.

#### Finding more information about the error codes that some event messages contain

To find more information about the error codes that some event messages contain:
  1. View the event, and note the error code.
  2. Look up more information about the error code in one of two ways:	
    * Search System Error Codes ([http://go.microsoft.com/fwlink/?LinkId=83027](http://go.microsoft.com/fwlink/?LinkId=83027)).
    * Click **Start**, point to **All Programs**, click **Accessories**, click **Command Prompt**, and then type:
```js
NET HELPMSG errorcode
```

## How to verify it

Confirm that the Cluster Shared Volume can come online. If there have been recent problems with writing to the volume, it can be appropriate to monitor event logs and monitor the function of the corresponding clustered virtual machine, to confirm that the problems have been resolved.

To perform the following procedures, you must be a member of the local **Administrators** group on each clustered server, and the account you use must be a domain account, or you must have been delegated the equivalent authority.

### Confirming that a Cluster Shared Volume can come online

To confirm that a Cluster Shared Volume can come online:
  1. To open the failover cluster snap-in, click **Start**, click **Administrative Tools**, and then click **Failover Cluster Manager**. If the **User Account Control** dialog box appears, confirm that the action it displays is what you want, and then click **Yes**.
  2. In the Failover Cluster Manager snap-in, if the cluster you want to manage is not displayed, in the console tree, right-click **Failover Cluster Manager,** click **Manage a Cluster**, and then select or specify the cluster that you want.
  3. If the console tree is collapsed, expand the tree under the cluster you want to manage, and then click **Cluster Shared Volumes**.
  4. In the center pane, expand the listing for the volume that you are verifying. View the status of the volume.
  5. If a volume is offline, to bring it online, right-click the volume and then click **Bring this resource online**.

### Using a Windows PowerShell command to check the status of a resource in a failover cluster

To use a Windows PowerShell command to check the status of a resource in a failover cluster:
  1. On a node in the cluster, click **Start**, point to **Administrative Tools**, and then click **Windows PowerShell Modules**. If the **User Account Control** dialog box appears, confirm that the action it displays is what you want, and then click **Yes**.
  2. Type: **Get-ClusterSharedVolume**

If you run the preceding command without specifying a resource name, status is displayed for all Cluster Shared Volumes in the cluster.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
