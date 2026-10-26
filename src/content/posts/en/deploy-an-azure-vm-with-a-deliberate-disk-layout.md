---
title: "Deploy an Azure VM with a deliberate disk layout"
description: "Plan the operating-system and data disks before creating an Azure VM, then verify the new volume inside Windows and record its recovery requirements."
pubDate: 2024-01-13
category: compute
tags: ["azure-virtual-machines", "managed-disks", "windows-server"]
translationKey: deploy-an-azure-vm-with-a-deliberate-disk-layout
draft: false
---

The disk configuration deserves a decision before the virtual machine is deployed. Accepting the defaults may produce a working server, but it does not tell us where the application should store its data, what performance it needs or how that data will be recovered.

For an illustrative Windows Server 2022 application VM, start with a simple separation: an operating-system disk for Windows and installed software, and a managed data disk for persistent application files. This is an example layout, rather than a requirement to give every workload the same number of disks.

## Write down what belongs on each disk

Ask the application owner which paths contain durable data, which contain temporary work and which can be rebuilt. Record the required capacity and the expected I/O pattern. A large archive and a busy transaction log can have similar capacity requirements while needing very different performance.

| Disk purpose | Design question |
|---|---|
| Operating system | Which image, supported disk type and capacity will Windows and its installed components need? |
| Application data | Which files must survive server replacement, and what performance does the application require? |
| Additional data disk | Is there a workload-specific reason to separate another set of files? |
| Temporary workspace | Can the application recreate this content, and is the chosen storage suitable for that purpose? |

A separate data disk is still part of the workload's protection requirements. It does not provide a backup or establish an application-consistent recovery process by itself.

Microsoft's [managed disk comparison](https://learn.microsoft.com/en-us/azure/virtual-machines/disks-types) is a useful starting point for choosing storage. Standard SSD, Premium SSD, Premium SSD v2 and Ultra Disk have different performance characteristics and restrictions. In particular, Premium SSD v2 and Ultra Disk are data-disk options, not OS-disk choices. Check the supported VM size, region and relevant disk restrictions before selecting them.

## Create the VM with the layout in mind

Confirm that you can create the VM and disks in the intended resource group and use the required network resources. Establish an administrative access route before deployment; an application disk exercise does not require opening an administrative port to the internet.

In the Azure portal, create the VM with the chosen subscription, resource group, region, Windows Server image and supported size. On the **Disks** page, review the OS disk selection and create the managed data disk required by the layout. Give the disk a name that makes its purpose recognisable.

Before creating the VM, compare the disk and VM performance limits. Selecting a faster disk will not remove a throughput or IOPS limit imposed by the VM. Capacity, IOPS and throughput are separate measurements, so avoid selecting a disk solely because its capacity looks sufficient.

If you are working with an existing VM instead, Microsoft's [portal attachment procedure](https://learn.microsoft.com/en-us/azure/virtual-machines/windows/attach-managed-disk-portal) uses **Disks → Create and attach a new disk**. Review the new disk's type, size and name, then save the change. The VM size determines how many data disks you can attach.

## Make the new disk usable inside Windows

Creating and attaching a managed disk does not create a formatted Windows volume. Connect through your established administrative route and open Disk Management with `diskmgmt.msc`.

1. Identify the newly attached disk by its expected capacity and uninitialised state. Do not assume a disk number from someone else's example.
2. Confirm that it is the new, empty disk intended for this task. Initialising or formatting the wrong disk can destroy existing data.
3. Initialise that disk using the partition style appropriate for the workload.
4. Create a simple volume in its unallocated space. Choose the file system, allocation settings and drive letter required by the application, and give the volume a useful label.
5. Confirm that the volume appears in Windows and that the application identity has the intended access.

For a new empty data disk, a small file written to the intended path can confirm basic access. That check does not measure sustained storage performance or demonstrate recoverability. Keep those as separate validation tasks.

## Finish with the operating record

Record the managed disk name, its purpose, the guest volume or mount path, the application owner and the protection method. Check that backup and recovery procedures include the new data location before the application depends on it.

For a disposable lab, remove the resources when the exercise is finished and inspect what remains. Provisioned managed disks incur charges even when little data has been written to them. Review the disks and any snapshots explicitly instead of assuming that stopping or removing the VM has completed every part of the cleanup.
