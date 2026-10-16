---
title: "Update Rollup 5 for System Center 2012 R2 Virtual Machine Manager"
description: "Microsoft just release the Update Rollup 5 for System Center 2012 R2 Virtual Machine Manager. From all the bug that this rollup is fixing, it’s also introducing some new features."
pubDate: 2015-02-11
category: windows-server
tags: [hybrid, scvmm]
translationKey: update-rollup-5-for-system-center-2012-r2-virtual-machine-manager
legacy: true
legacyUrl: /2015/02/update-rollup-5-for-system-center-2012-r2-virtual-machine-manager.html
---

Microsoft just release the Update Rollup 5 for System Center 2012 R2 Virtual Machine Manager. From all the bug that this rollup is fixing, it’s also introducing some new features.

Features that are added in this update rollup

## **Differencing disk as an option in the Windows Azure Pack VMRole deployment**

When a user deploys VMRoles, the user has no option to specify either "differencing disk" or "dedicated disk." By default, the current Virtual Machine Manager implementation for VMRole is to use differencing disk.

The current default of "differencing disk" is sufficient for users who require quick virtual machine deployments and for situations in which the virtual machine life span is small. However, users who do not care about deployment time but worry about performance and maintenance may find that "differencing disk" is not the most suitable option. Such users would benefit from dedicated disks. Therefore, Virtual Machine Manager offers this option to control behavior based on the user's requirements.

Details about the "differencing disk" option:
* To deploy Virtual Machine Roles with dedicated disks, create a custom property that is named **DifferencingDiskOptimizationSupported**, and set this property to **False**.
* This custom property must be defined on the cloud that is tied to the Virtual Machine Role plan.
* This change will affect only the Virtual Machine Roles that are authored after the custom property is set to **False**.
* Deployments with Virtual Machine Roles that were authored before the custom property was set to **False** will continue with original disk settings. This behavior keeps the experience similar to what we offer in the High Availability Virtual Machine Role option.

## **New operating system support**

Update Rollup 5 supports the following new Linux operating system:
* SUSE Linux Enterprise Server 12 (64 bit)

## **_New-ExplicitRevokeRequired_ parameter to control IP address management when Grant-SCIPAddress is used**

When the _ExplicitRevokeRequired_ parameter is enabled for an IP address that is allocated from Virtual Machine Manager's static IP address pool, the IP address will not be returned to the pool automatically by Virtual Machine Manager. The IP address can still move from one entity (such as a Virtual Machine Virtual Network Adapter) to another, wherever applicable. However, if no entity claims the IP address, Virtual Machine Manager will still keep it assigned. The IP address can be returned to the pool and made available for fresh use by another entity. It does this when the **Revoke-SCIPAddress** cmdlet is explicitly invoked by the user.

The importance of this flag is for Guest Clusters in highly overloaded environments. Without the flag, if the IP address is not available on a particular node (for example, the IP address is offline for a short time or is moving to a different node), Virtual Machine Manager would return it to the pool first and then allocate the IP address later when it comes back online. In the interim period, if any other entity appears and requests that IP address, it will be able to claim it successfully. And when the Guest Cluster node wants to claim the IP address back it, the request fails. With the help of this flag, the IP address will not be returned to the pool so that the new entity will be unable to request that IP address.

**Parameter syntax**
```powershell
PS C:\> Get-Help Grant-SCIPAddress
```

For more information about **_Grant-SCIPAddress_**, see the Cmdlet Reference for System Center 2012 R2 [ here](https://technet.microsoft.com/en-us/library/hh801502.aspx).

## **Support for SQL Server 2014**

Virtual Machine Manager now supports Microsoft SQL Server 2014 as the Virtual Machine Manager database. However, with Update Rollup 5, deploying service templates by using the SQL profile type for SQL Server 2014 as SQL Server 2014 hasn’t yet been tested with Guest deployments. For the latest information on SQL Server requirements for System Center 2012 R2, see the reference [here](https://technet.microsoft.com/en-us/library/dn281933.aspx).

## **Azure Site Recovery**

This update adds support for the following operations:
* Creating and managing replication groups on supported storage area network (SAN) devices.
* Enabling the protection of a storage volume or a group of storage volumes in a replication group.
* Deploying new virtual machines into protected storage by using placement.
* Migrating existing virtual machines into protected storage by using placement.

Coordinating planned, unplanned, and test failover of virtual machines and storage volumes between sites by using Microsoft Azure Site Recovery (ASR).

To see what is inside of this Rollup, click [here](http://support2.microsoft.com/kb/3023195/en-us).

Cheers,

**Marcos Nogueira**
**_MVP_**  
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
