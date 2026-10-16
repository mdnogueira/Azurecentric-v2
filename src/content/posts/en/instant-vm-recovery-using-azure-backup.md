---
title: "Instant VM Recovery using Azure Backup"
description: "We all know that Azure is grow and evolving in a very fast pace. On a project that I’m working right now, I had the opportunity to work with big VMs (M Series), although…"
pubDate: 2018-05-22
category: backup-dr
tags: [azure-backup, managed-disks]
translationKey: instant-vm-recovery-using-azure-backup
legacy: true
legacyUrl: /2018/05/instant-vm-recovery-using-azure-backup.html
---

We all know that Azure is grow and evolving in a very fast pace. On a project that I’m working right now, I had the opportunity to work with big VMs (M Series), although working with those kinds of VMs is always a challenge, when it comes to the operations side, in this particular case, backups. How you will backup that **“Monster”** and how fast can you recovery the virtual machine when it’s necessary. Usually this window is always small.

On my previous experiences with Azure Recovery Vaults, when you enable the Azure VM backup, it will snapshot the VM, then copy over the network to the Recovery Vault. So far so good, although this became an issue when you need to restore these kinds of VMs, with multiple large disks (>1TiB), because Recovery Services stores the disk on a Standard Tier (HDD). This process of backup is based on a file copy, usually over the network to another low-cost storage system, specially to reduce the cost. 

## **Backup an Azure VM**

A virtual machine backup in Azure, has two steps:
1. A snapshot is created on the virtual machine disks
2. Then the snapshot is copied over the network to the recovery vault (where the backup is stored)

These virtual machines disk snapshots will be retained at the storage cluster for seven days. By retaining these snapshots will allow Azure more efficiently to compute the changes from the last backup and off course to reduce the time to complete the backup. 

At this present moment, the snapshots will still be copied to the Recovery Vault to secure that you have the retention that you define for a long-term backup.

## **Restore an Azure VM**

Typically, when you restore a VM from the Recovery Vault, the disks will be copied from the Recovery Vault (Standard tier (HDD) block blog storage) to the storage cluster where the VM is running, over the network. This process may take a long time then the desire, to complete. It always depends of the size of the disks. But for this example (with the M series VMs), with multiple disk of 4TiB (in total 12 disks), we are transferring 48TiB over the network.

What Azure Backup is now doing, is leverage the seven days of the snapshots retention on the storage cluster to restore it from there. Although this it will be only available, if you are restoring within the seven days. The process becomes way faster, because you don’t need to copy over the network from the lower tier storage system to the storage cluster.

## **Instant Recovery Point**

Now with Azure Backup, when the first step is finished, and while the Azure Backup is copying over the network the snapshot to the Recovery Vault, you can restore the virtual machine with that snapsht. This make your RTO way lower, specially for big VMs like the M Series.

Cheers,

**Marcos Nogueira**  
**_Azure MVP_**  
[azurecentric.com](http://azurecentric.com)  
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
