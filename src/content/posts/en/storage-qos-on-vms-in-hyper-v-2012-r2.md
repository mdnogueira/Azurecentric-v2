---
title: "Storage QoS on VMs in Hyper-V 2012 R2"
description: "With Windows Server 2012 R2, Hyper-V includes the ability to set certain quality-of-service (QoS) parameters for storage on the virtual machines. Storage QoS provides storage…"
pubDate: 2013-09-09
category: hyper-v
tags: [storage-qos, storage]
translationKey: storage-qos-on-vms-in-hyper-v-2012-r2
legacy: true
legacyUrl: /2013/09/storage-qos-on-vms-in-hyper-v-2012-r2.html
---

With Windows Server 2012 R2, Hyper-V includes the ability to set certain quality-of-service (QoS) parameters for storage on the virtual machines. Storage QoS provides storage performance isolation in a multitenant environment and mechanisms to notify you when the storage I/O performance does not meet the defined threshold to efficiently run your virtual machine workloads.

Storage QoS allows you to plan for and gain acceptable performance from the investment in storage resources you can:	
  * Specify the maximum IOPS allowed for a virtual hard disk that is associated with a virtual machine.
  * Receive a notification when the specified minimum IOPS for a virtual hard disk is not met.
  * Monitor storage-related metrics through the virtual machine metrics interface.

##  **Benefits**

Storage QoS provides the ability to specify a maximum input/output operations per second (IOPS) value for your virtual hard disk. An administrator can throttle the storage I/O to stop a tenant from consuming excessive storage resources that may impact another tenant.

An administrator can also set a minimum IOPS value. They will be notified when the IOPS to a specified virtual hard disk is below a threshold that is needed for its optimal performance.

The virtual machine metrics infrastructure is also updated, with storage related parameters to allow the administrator to monitor the performance and chargeback related parameters.

Maximum and minimum values are specified in terms of normalized IOPS where every 8 K of data is counted as an I/O.

##  **Requirements**

Storage QoS requires that the Hyper-V role is installed. The Storage QoS feature cannot be installed separately. When you install Hyper-V, the infrastructure is enabled for defining QoS parameters associated with your virtual hard disks.
  **NOTE:** Storage QoS is not available if you are using shared virtual hard disks.

##  **How to use**

### **Virtual hard disk maximum IOPS**

Storage QoS provides the following features for setting maximum IOPS values (or limits) on virtual hard disks for virtual machines:
  * You can specify a maximum setting that is enforced on the virtual hard disks of your virtual machines. You can define a maximum setting for each virtual hard disk.
  * Virtual disk maximum IOPS settings are specified in terms of normalized IOPS. IOPS are measured in 8 KB increments.
  * You can use the WMI interface to control and query the maximum IOPS value you set on your virtual hard disks for each virtual machine.
  * Windows PowerShell enables you to control and query the maximum IOPS values you set for the virtual hard disks in your virtual machines.
  * Any virtual hard disk that does not have a maximum IOPS limit defined defaults to 0.
  * The Hyper-V Manager user interface is available to configure maximum IOPS values for Storage QoS.

### **Virtual hard disk minimum IOPS**

Storage QoS provides the following features for setting minimum values (or reserves) on virtual hard disks for virtual machines:	
  * You can define a minimum IOPS value for each virtual hard disk, and an event-based notification is generated when the minimum IOPS value is not met.
  * Virtual hard disk minimum values are specified in terms of normalized IOPS. IOPS are measured in 8 KB increments.
  * You can use the WMI interface to query the minimum IOPS value you set on your virtual hard disks for each virtual machine.
  * Windows PowerShell enables you to control and query the minimum IOPS values you set for the virtual hard disks in your virtual machines.
  * Any virtual hard disk that does not have a minimum IOPS value defined will default to 0.
  * The Hyper-V Manager user interface is available to configure minimum IOPS settings for Storage QoS.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
